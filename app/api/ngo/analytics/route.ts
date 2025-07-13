import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
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
    const timeframe = searchParams.get('timeframe') || '30d';

    // Calculate date range
    let dateFilter = {};
    if (timeframe !== 'all') {
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      dateFilter = { createdAt: { $gte: startDate } };
    }

    const db = await getDatabase();
    const itemsCollection = db.collection('items');

    // Get NGO's donation analytics for items they have claimed
    const donationAnalytics = await itemsCollection.aggregate([
      {
        $match: {
          destinationId: new ObjectId(user.userId),
          destination: 'donate',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalDonations: { $sum: 1 },
          completedDonations: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pendingDonations: {
            $sum: { $cond: [{ $in: ['$status', ['approved', 'processing']] }, 1, 0] }
          },
          totalImpact: { $sum: '$impactMetrics.co2Saved' },
          totalWeight: { $sum: '$impactMetrics.wasteAverted' },
        }
      }
    ]).toArray();

    // Get available donations (not yet claimed by any NGO)
    const availableDonations = await itemsCollection.countDocuments({
      destination: 'donate',
      status: { $in: ['submitted', 'reviewed', 'approved'] },
      destinationId: { $exists: false },
      ...dateFilter
    });

    // Get monthly trends for claimed items
    const monthlyTrends = await itemsCollection.aggregate([
      {
        $match: {
          destinationId: new ObjectId(user.userId),
          destination: 'donate',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          donations: { $sum: 1 },
          impact: { $sum: '$impactMetrics.co2Saved' },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Get category breakdown for claimed items
    const categoryBreakdown = await itemsCollection.aggregate([
      {
        $match: {
          destinationId: new ObjectId(user.userId),
          destination: 'donate',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          impact: { $sum: '$impactMetrics.co2Saved' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    // Get pickup requests for this NGO
    const pickupCollection = db.collection('pickupRequests');
    const pickupStats = await pickupCollection.aggregate([
      {
        $match: {
          ngoId: new ObjectId(user.userId),
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalPickups: { $sum: 1 },
          completedPickups: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pendingPickups: {
            $sum: { $cond: [{ $in: ['$status', ['scheduled', 'en-route']] }, 1, 0] }
          }
        }
      }
    ]).toArray();

    const analyticsData = donationAnalytics[0] || {};
    const totalClaimedDonations = analyticsData.totalDonations || 0;
    const completedDonations = analyticsData.completedDonations || 0;

    const analytics = {
      overview: {
        totalDonations: totalClaimedDonations,
        completedDonations: completedDonations,
        pendingDonations: analyticsData.pendingDonations || 0,
        availableDonations: availableDonations,
        totalImpact: Math.round((analyticsData.totalImpact || 0) * 100) / 100,
        totalWeight: Math.round((analyticsData.totalWeight || 0) * 100) / 100,
        completionRate: totalClaimedDonations > 0 
          ? ((completedDonations / totalClaimedDonations) * 100).toFixed(1)
          : '0.0'
      },
      pickups: pickupStats[0] || {
        totalPickups: 0,
        completedPickups: 0,
        pendingPickups: 0
      },
      trends: monthlyTrends,
      categories: categoryBreakdown,
      timeframe
    };

    return NextResponse.json(analytics, { status: 200 });
  } catch (error) {
    console.error('NGO analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
