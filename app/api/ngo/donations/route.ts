import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Item } from '@/lib/schemas/item';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/auth';
import User from '@/lib/models/User'; // Import User model to populate submitter info

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    const user = await verifyToken(token);

    if (!user || user.role !== 'ngo') {
      return NextResponse.json(
        { error: 'Unauthorized - NGO access required' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const itemsCollection = db.collection<Item>('items');

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const categoryFilter = searchParams.get('category');
    const locationFilter = searchParams.get('location'); // Assuming this is city or zipCode

    const query: any = {
      destination: 'donate', // Only show items intended for donation
    };

    if (statusFilter && statusFilter !== 'all') {
      // Allow NGOs to see submitted, reviewed, approved, processing items for their dashboard
      const validNgoStatuses = ['submitted', 'reviewed', 'approved', 'collected', 'processing'];
      if (validNgoStatuses.includes(statusFilter)) {
        query.status = statusFilter;
      } else if (statusFilter === 'available') {
        // 'available' could mean submitted or approved, not yet claimed/processed by THIS NGO
        query.status = { $in: ['submitted', 'reviewed', 'approved'] };
      } else if (statusFilter === 'assigned') {
        query.status = { $in: ['approved', 'processing', 'collected'] };
        query.destinationId = new ObjectId(user.userId);
      } else if (statusFilter === 'completed') {
        query.status = 'completed';
        query.destinationId = new ObjectId(user.userId);
      }
    } else {
      // Default to showing items that are ready for pickup or review by any NGO
      query.status = { $in: ['submitted', 'reviewed', 'approved'] };
    }

    if (categoryFilter && categoryFilter !== 'all') {
      query.category = categoryFilter;
    }

    if (locationFilter) {
      // This is a simplified location filter, might need more robust geo-query for production
      query['pickupAddress.city'] = new RegExp(locationFilter, 'i'); // Case-insensitive city match
    }

    const items = await itemsCollection.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } }, // Latest items first
      { $limit: 20 }, // Limit to 20 items for now
      {
        $lookup: {
          from: 'users',
          localField: 'submitterId',
          foreignField: '_id',
          as: 'submitterInfo',
        },
      },
      { $unwind: { path: '$submitterInfo', preserveNullAndEmptyArrays: true } },
      { 
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          brand: 1,
          category: 1,
          condition: 1,
          images: 1,
          status: 1,
          pickupAddress: 1,
          impactMetrics: 1,
          createdAt: 1,
          submitter: {
            name: '$submitterInfo.name',
            phone: '$submitterInfo.phone',
            email: '$submitterInfo.email',
          },
        },
      },
    ]).toArray();

    // If no items match, ensure an empty array is returned, not an object with count
    if (items.length === 0) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    return NextResponse.json({ items: items }, { status: 200 });

  } catch (error) {
    console.error('NGO donation fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    const user = await verifyToken(token);

    if (!user || user.role !== 'ngo') {
      return NextResponse.json(
        { error: 'Unauthorized - NGO access required' },
        { status: 401 }
      );
    }

    const { itemIds, action, pickupDate, notes } = await request.json();

    if (!itemIds || !Array.isArray(itemIds) || !action) {
      return NextResponse.json(
        { error: 'Item IDs and action are required' },
        { status: 400 }
      );
    };

    const db = await getDatabase();
    const itemsCollection = db.collection<Item>('items');

    let updateData: any = {
      updatedAt: new Date(),
    };

    switch (action) {
      case 'claim':
        // When an NGO claims an item, set its destinationId to the NGO's ID
        // and change the status to 'approved' or similar, indicating it's taken.
        updateData.destinationId = new ObjectId(user.userId);
        updateData.status = 'approved'; // Or 'assigned', depending on workflow
        updateData.internalNotes = notes;
        break;

      case 'schedule-pickup':
        if (!pickupDate) {
          return NextResponse.json(
            { error: 'Pickup date is required' },
            { status: 400 }
          );
        }
        updateData.pickupDate = new Date(pickupDate);
        updateData.status = 'processing'; // Indicates pickup is being arranged
        // Ensure the item is assigned to this NGO if it wasn't already
        updateData.destinationId = new ObjectId(user.userId);
        break;

      case 'complete':
        updateData.status = 'completed';
        updateData.deliveryDate = new Date();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const result = await itemsCollection.updateMany(
      {
        _id: { $in: itemIds.map(id => new ObjectId(id)) },
        // Only allow claiming/scheduling for items still intended for donation
        destination: 'donate',
        // And only if they are not already completed or claimed by another NGO (unless specific flow allows reassignment)
        status: { $in: ['submitted', 'reviewed', 'approved', 'processing'] },
        $or: [
          { destinationId: { $exists: false } }, // Not yet assigned
          { destinationId: new ObjectId(user.userId) } // Already assigned to this NGO
        ]
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'No eligible items found for the requested action, or they are already processed.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: `${action} completed for ${result.modifiedCount} items`,
        modifiedCount: result.modifiedCount
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('NGO donation action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}