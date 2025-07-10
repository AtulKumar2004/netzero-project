import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Item } from '@/lib/schemas/item';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

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

    const formData = await request.formData();
    
    // Extract form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const brand = formData.get('brand') as string;
    const category = formData.get('category') as string;
    const condition = formData.get('condition') as string;
    const destination = formData.get('destination') as string;
    const originalPrice = formData.get('originalPrice') as string;
    
    // Pickup address
    const pickupAddress = {
      street: formData.get('street') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zipCode: formData.get('zipCode') as string,
      country: formData.get('country') as string || 'US',
    };

    // Pickup preferences
    const pickupPreferences = {
      preferredDate: formData.get('preferredDate') ? new Date(formData.get('preferredDate') as string) : undefined,
      preferredTimeSlot: formData.get('preferredTimeSlot') as string,
      specialInstructions: formData.get('specialInstructions') as string,
      contactPhone: formData.get('contactPhone') as string,
    };

    // Handle image uploads to Cloudinary
    const images: { url: string; publicId: string }[] = [];
    const imageFiles = formData.getAll('images') as File[];
    
    for (const file of imageFiles) {
      if (file.size > 0) {
        try {
          // Convert file to buffer
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const dataUrl = `data:${file.type};base64,${buffer.toString('base64')}`;

          // Upload to Cloudinary
          const result = await uploadToCloudinary(dataUrl, {
            folder: 'reloop/items',
            public_id: `item_${user.userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          });

          images.push({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          // Continue with other images if one fails
        }
      }
    }

    // Validation
    if (!title || !description || !category || !condition || !destination) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const itemsCollection = db.collection<Item>('items');

    // Calculate impact metrics based on category and condition
    const impactMetrics = calculateImpactMetrics(category, condition);

    const newItem: Omit<Item, '_id'> = {
      submitterId: new ObjectId(user.userId),
      title,
      description,
      brand: brand || undefined,
      category,
      condition: condition as Item['condition'],
      originalPrice: originalPrice ? parseInt(originalPrice) * 100 : undefined, // convert to cents
      images: images.map(img => img.url),
      imagePublicIds: images.map(img => img.publicId),
      status: 'submitted',
      destination: destination as Item['destination'],
      pickupAddress,
      pickupPreferences,
      impactMetrics,
      marketplaceData: destination === 'resale' ? {
        isListed: false,
        views: 0,
        favorites: 0,
      } : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await itemsCollection.insertOne(newItem);

    // Update user stats
    const usersCollection = db.collection('users');
    await usersCollection.updateOne(
      { _id: new ObjectId(user.userId) },
      { 
        $inc: { 
          'stats.itemsSubmitted': 1,
          'stats.co2Saved': impactMetrics.co2Saved,
          'stats.ecoPoints': Math.floor(impactMetrics.co2Saved * 10), // 10 points per kg CO2
        }
      }
    );

    return NextResponse.json(
      {
        message: 'Item submitted successfully',
        item: { ...newItem, _id: result.insertedId },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Item submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateImpactMetrics(category: string, condition: string) {
  // Base CO2 savings by category (in kg)
  const baseCO2Savings: Record<string, number> = {
    'clothing': 2.5,
    'electronics': 5.7,
    'shoes': 3.2,
    'home': 8.4,
    'sports': 1.8,
    'accessories': 4.1,
  };

  // Condition multipliers
  const conditionMultipliers: Record<string, number> = {
    'like-new': 1.0,
    'very-good': 0.9,
    'good': 0.8,
    'fair': 0.6,
    'poor': 0.4,
  };

  const baseCO2 = baseCO2Savings[category.toLowerCase()] || 2.0;
  const multiplier = conditionMultipliers[condition] || 0.8;
  const co2Saved = baseCO2 * multiplier;

  return {
    co2Saved: Math.round(co2Saved * 100) / 100, // Round to 2 decimal places
    wasteAverted: co2Saved * 0.8, // Estimate waste based on CO2
  };
}