import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Item } from '@/lib/schemas/item';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    const user = await verifyToken(token);
    
    if (!user || user.role !== 'retailer') {
      return NextResponse.json(
        { error: 'Unauthorized - Retailer access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const db = await getDatabase();
    const itemsCollection = db.collection<Item>('items');

    // Build query for items that need retailer attention
    const query: any = {
      $or: [
        { retailerId: new ObjectId(user.userId) },
        { status: 'submitted', destination: 'resale' },
        { status: 'reviewed', destination: 'resale' }
      ]
    };

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
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
          { projection: { firstName: 1, lastName: 1, email: 1, phone: 1 } }
        );
        return {
          ...item,
          submitter: submitter ? {
            name: `${submitter.firstName} ${submitter.lastName}`,
            email: submitter.email,
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
    console.error('Get retailer items error:', error);
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
    
    if (!user || user.role !== 'retailer') {
      return NextResponse.json(
        { error: 'Unauthorized - Retailer access required' },
        { status: 401 }
      );
    }

    const { itemId, action, resalePrice, notes } = await request.json();

    if (!itemId || !action) {
      return NextResponse.json(
        { error: 'Item ID and action are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const itemsCollection = db.collection<Item>('items');

    const item = await itemsCollection.findOne({ _id: new ObjectId(itemId) });
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    let updateData: any = {
      updatedAt: new Date(),
      internalNotes: notes,
    };

    switch (action) {
      case 'approve':
        updateData.status = 'approved';
        updateData.retailerId = new ObjectId(user.userId);
        if (resalePrice) {
          updateData.resalePrice = parseInt(resalePrice) * 100; // convert to cents
          updateData['marketplaceData.isListed'] = true;
          updateData['marketplaceData.listingDate'] = new Date();
        }
        break;
      
      case 'reject':
        updateData.status = 'rejected';
        break;
      
      case 'list':
        if (!resalePrice) {
          return NextResponse.json(
            { error: 'Resale price is required for listing' },
            { status: 400 }
          );
        }
        updateData.resalePrice = parseInt(resalePrice) * 100;
        updateData['marketplaceData.isListed'] = true;
        updateData['marketplaceData.listingDate'] = new Date();
        updateData.status = 'approved';
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    await itemsCollection.updateOne(
      { _id: new ObjectId(itemId) },
      { $set: updateData }
    );

    return NextResponse.json(
      { message: `Item ${action}ed successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Retailer item action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}