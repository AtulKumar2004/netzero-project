import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { PickupRequest } from '@/lib/schemas/logistics';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      itemIds,
      pickupAddress,
      requestedDate,
      requestedTimeSlot,
      contactPerson,
      specialInstructions,
    } = await request.json();

    // Validation
    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: 'Item IDs are required' },
        { status: 400 }
      );
    }

    if (!pickupAddress || !requestedDate || !requestedTimeSlot || !contactPerson) {
      return NextResponse.json(
        { error: 'Missing required pickup details' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const pickupCollection = db.collection<PickupRequest>('pickupRequests');
    const itemsCollection = db.collection('items');

    // Verify all items belong to the user
    const items = await itemsCollection.find({
      _id: { $in: itemIds.map(id => new ObjectId(id)) },
      submitterId: new ObjectId(user.userId),
    }).toArray();

    if (items.length !== itemIds.length) {
      return NextResponse.json(
        { error: 'Some items not found or not owned by user' },
        { status: 400 }
      );
    }

    // Calculate estimated weight
    const estimatedWeight = items.reduce((total, item) => {
      return total + (item.weight || 1000); // Default 1kg if weight not specified
    }, 0) / 1000; // Convert to kg

    // Geocode address (in production, use Google Maps API)
    const coordinates = await geocodeAddress(pickupAddress);

    const newPickupRequest: Omit<PickupRequest, '_id'> = {
      requesterId: new ObjectId(user.userId),
      itemIds: itemIds.map(id => new ObjectId(id)),
      totalItems: itemIds.length,
      estimatedWeight,
      pickupAddress: {
        ...pickupAddress,
        coordinates,
      },
      requestedDate: new Date(requestedDate),
      requestedTimeSlot,
      status: 'requested',
      priority: 'medium',
      contactPerson,
      specialInstructions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await pickupCollection.insertOne(newPickupRequest);

    // Update items status
    await itemsCollection.updateMany(
      { _id: { $in: itemIds.map(id => new ObjectId(id)) } },
      { 
        $set: { 
          status: 'reviewed',
          updatedAt: new Date(),
        }
      }
    );

    return NextResponse.json(
      {
        message: 'Pickup request created successfully',
        pickupRequest: { ...newPickupRequest, _id: result.insertedId },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Pickup request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock geocoding function - in production, use Google Maps API
async function geocodeAddress(address: any) {
  // This is a mock implementation
  // In production, you would call Google Maps Geocoding API
  return {
    lat: 37.7749 + (Math.random() - 0.5) * 0.1,
    lng: -122.4194 + (Math.random() - 0.5) * 0.1,
  };
}