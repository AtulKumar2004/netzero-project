import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
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
    const transactionsCollection = db.collection('transactions');

    // Get retailer's items analytics
    const itemsAnalytics = await itemsCollection.aggregate([
      {
        $match: {
          retailerId: new ObjectId(user.userId),
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          listedItems: {
            $sum: { $cond: [{ $eq: ['$marketplaceData.isListed', true] }, 1, 0] }
          },
          soldItems: {
            $sum: { $cond: [{ $ne: ['$marketplaceData.soldDate', null] }, 1, 0] }
          },
          totalRevenue: { $sum: '$resalePrice' },
          averagePrice: { $avg: '$resalePrice' },
          itemsByCategory: { $push: '$category' },
          itemsByStatus: { $push: '$status' }
        }
      }
    ]).toArray();

    // Get transaction analytics
    const transactionAnalytics = await transactionsCollection.aggregate([
      {
        $match: {
          sellerId: new ObjectId(user.userId),
          status: 'completed',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalGrossRevenue: { $sum: '$amount' },
          totalNetRevenue: { $sum: '$netAmount' },
          totalFees: { $sum: '$fees.platformFee' },
          averageOrderValue: { $avg: '$amount' }
        }
      }
    ]).toArray();

    // Get monthly trends
    const monthlyTrends = await itemsCollection.aggregate([
      {
        $match: {
          retailerId: new ObjectId(user.userId),
          ...dateFilter
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$createdAt'
            }
          },
          items: { $sum: 1 },
          revenue: { $sum: '$resalePrice' },
          sold: {
            $sum: { $cond: [{ $ne: ['$marketplaceData.soldDate', null] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Get pending items count
    const pendingItems = await itemsCollection.countDocuments({
      $or: [
        { status: 'submitted', destination: 'resale' },
        { status: 'reviewed', destination: 'resale' }
      ]
    });

    const analytics = {
      overview: {
        totalItems: itemsAnalytics[0]?.totalItems || 0,
        listedItems: itemsAnalytics[0]?.listedItems || 0,
        soldItems: itemsAnalytics[0]?.soldItems || 0,
        pendingItems,
        totalRevenue: (itemsAnalytics[0]?.totalRevenue || 0) / 100, // convert from cents
        averagePrice: (itemsAnalytics[0]?.averagePrice || 0) / 100,
        conversionRate: itemsAnalytics[0]?.listedItems > 0 
          ? ((itemsAnalytics[0]?.soldItems || 0) / itemsAnalytics[0].listedItems * 100).toFixed(1)
          : '0.0'
      },
      transactions: transactionAnalytics[0] || {
        totalTransactions: 0,
        totalGrossRevenue: 0,
        totalNetRevenue: 0,
        totalFees: 0,
        averageOrderValue: 0
      },
      trends: monthlyTrends,
      timeframe
    };

    return NextResponse.json(analytics, { status: 200 });
  } catch (error) {
    console.error('Retailer analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}