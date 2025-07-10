import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Item } from '@/lib/schemas/item';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const condition = searchParams.get('condition');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const db = await getDatabase();
    const itemsCollection = db.collection<Item>('items');

    // Build query
    const query: any = {
      destination: 'resale',
      status: { $in: ['approved', 'processing'] },
      'marketplaceData.isListed': true,
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (condition && condition !== 'all') {
      query.condition = condition;
    }

    if (minPrice || maxPrice) {
      query.resalePrice = {};
      if (minPrice) query.resalePrice.$gte = parseInt(minPrice) * 100; // convert to cents
      if (maxPrice) query.resalePrice.$lte = parseInt(maxPrice) * 100;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await itemsCollection.countDocuments(query);

    // Get items with pagination
    const items = await itemsCollection
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Populate seller information
    const usersCollection = db.collection('users');
    const itemsWithSellers = await Promise.all(
      items.map(async (item) => {
        const seller = await usersCollection.findOne(
          { _id: item.submitterId },
          { projection: { firstName: 1, lastName: 1, profileImage: 1 } }
        );
        return {
          ...item,
          seller: seller ? {
            name: `${seller.firstName} ${seller.lastName}`,
            profileImage: seller.profileImage,
          } : null,
        };
      })
    );

    return NextResponse.json({
      items: itemsWithSellers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Get marketplace items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}