import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Item from '@/lib/models/Item';
import User from '@/lib/models/User';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  await connectDB();

  try {
    const token = request.cookies.get('auth-token')?.value;
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!ObjectId.isValid(user.userId)) return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });

    const formData = await request.formData();

    // Parse fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const brand = formData.get('brand') as string;
    const category = formData.get('category') as string;
    const condition = formData.get('condition') as string;
    const destination = formData.get('destination') as string;
    const originalPrice = formData.get('originalPrice') as string;

    const pickupAddress = {
      street: formData.get('street') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zipCode: formData.get('zipCode') as string,
      country: formData.get('country') as string || 'US',
    };

    const pickupPreferences = {
      preferredDate: formData.get('preferredDate') ? new Date(formData.get('preferredDate') as string) : undefined,
      preferredTimeSlot: formData.get('preferredTimeSlot') as string,
      specialInstructions: formData.get('specialInstructions') as string,
      contactPhone: formData.get('contactPhone') as string,
    };

    // ✅ Parse pre-uploaded image metadata
    const imagesField = formData.get('images') as string;
    const uploadedImages = JSON.parse(imagesField);

    if (!Array.isArray(uploadedImages) || uploadedImages.length < 1 || uploadedImages.length > 10) {
      return NextResponse.json({ error: 'Must include 1–10 uploaded images.' }, { status: 400 });
    }

    // ✅ Calculate impact
    const impactMetrics = calculateImpactMetrics(category, condition);

    // ✅ Create item
    const item = new Item({
      submitterId: new ObjectId(user.userId),
      title,
      description,
      brand: brand || undefined,
      category,
      condition,
      originalPrice: originalPrice ? parseInt(originalPrice) * 100 : undefined,
      images: uploadedImages,
      status: 'submitted',
      destination,
      pickupAddress,
      pickupPreferences,
      impactMetrics,
      marketplaceData: destination === 'resale' ? { isListed: false, views: 0, favorites: 0 } : undefined,
    });

    await item.save();

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      {
        $inc: {
          'stats.itemsSubmitted': 1,
          'stats.co2Saved': impactMetrics.co2Saved,
          'stats.ecoPoints': Math.floor(impactMetrics.co2Saved * 10),
        },
      },
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Item submitted successfully',
        item,
        updatedUserStats: updatedUser?.stats,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Item submission error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error?.message || error }, { status: 500 });
  }
}

function calculateImpactMetrics(category: string, condition: string) {
  const baseCO2Savings: Record<string, number> = {
    clothing: 2.5,
    electronics: 5.7,
    shoes: 3.2,
    home: 8.4,
    sports: 1.8,
    accessories: 4.1,
  };

  const conditionMultipliers: Record<string, number> = {
    'like-new': 1.0,
    'very-good': 0.9,
    good: 0.8,
    fair: 0.6,
    poor: 0.4,
  };

  const baseCO2 = baseCO2Savings[category.toLowerCase()] || 2.0;
  const multiplier = conditionMultipliers[condition] || 0.8;
  const co2Saved = baseCO2 * multiplier;

  return {
    co2Saved: Math.round(co2Saved * 100) / 100,
    wasteAverted: co2Saved * 0.8,
  };
}
