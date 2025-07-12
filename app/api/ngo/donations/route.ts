import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Item } from '@/lib/schemas/item';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/auth';

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'available';
    const category = searchParams.get('category');
    const location = searchParams.get('location');

    const db = await getDatabase();
    const itemsCollection = db.collection<Item>('items');

    // Build query for available donations
    let query: any = {
      destination: 'donate',
    };

    if (status === 'available') {
      query.status = { $in: ['submitted', 'reviewed', 'approved'] };
    } else if (status === 'assigned') {
      query.destinationId = new ObjectId(user.userId);
      query.status = { $in: ['approved', 'processing', 'completed'] };
    } else if (status === 'processing') {
      query.destinationId = new ObjectId(user.userId);
      query.status = 'processing';
    } else if (status === 'completed') {
      query.destinationId = new ObjectId(user.userId);
      query.status = 'completed';
    } else if (status && status !== 'all') {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (location) {
      query['pickupAddress.city'] = { $regex: location, $options: 'i' };
    }

    const total = await itemsCollection.countDocuments(query);
    const items = await itemsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Populate submitter information
    const usersCollection = db.collection('users');
    const itemsWithSubmitters = await Promise.all(
      items.map(async (item) => {
        const submitter = await usersCollection.findOne(
          { _id: item.submitterId },
          { projection: { firstName: 1, lastName: 1, phone: 1 } }
        );
        return {
          ...item,
          submitter: submitter ? {
            name: `${submitter.firstName} ${submitter.lastName}`,
            phone: submitter.phone,
          } : null,
        };
      })
    );

    return NextResponse.json({
      items: itemsWithSubmitters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Get NGO donations error:', error);
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
    }

    const db = await getDatabase();
    const itemsCollection = db.collection<Item>('items');

    let updateData: any = {
      updatedAt: new Date(),
    };

    switch (action) {
      case 'claim':
        updateData.destinationId = new ObjectId(user.userId);
        updateData.status = 'approved';
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
        updateData.status = 'processing';
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
        destination: 'donate'
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'No items found or not available for donation' },
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