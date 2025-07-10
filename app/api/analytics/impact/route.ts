import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeframe = searchParams.get('timeframe') || '30d'; // 7d, 30d, 90d, 1y, all
    
    const token = request.cookies.get('auth-token')?.value;
    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    
    // Calculate date range
    let dateFilter = {};
    if (timeframe !== 'all') {
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      dateFilter = { createdAt: { $gte: startDate } };
    }

    // Build query
    let query = dateFilter;
    if (userId && (user.userId === userId || user.role === 'admin')) {
      query = { ...query, submitterId: new ObjectId(userId) };
    }

    // Aggregate impact data
    const itemsCollection = db.collection('items');
    const impactData = await itemsCollection.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalCO2Saved: { $sum: '$impactMetrics.co2Saved' },
          totalWasteAverted: { $sum: '$impactMetrics.wasteAverted' },
          itemsByDestination: {
            $push: '$destination'
          },
          itemsByCategory: {
            $push: '$category'
          },
          itemsByStatus: {
            $push: '$status'
          },
        }
      },
      {
        $project: {
          _id: 0,
          totalItems: 1,
          totalCO2Saved: { $round: ['$totalCO2Saved', 2] },
          totalWasteAverted: { $round: ['$totalWasteAverted', 2] },
          destinationBreakdown: {
            $arrayToObject: {
              $map: {
                input: { $setUnion: ['$itemsByDestination'] },
                as: 'destination',
                in: {
                  k: '$$destination',
                  v: {
                    $size: {
                      $filter: {
                        input: '$itemsByDestination',
                        cond: { $eq: ['$$this', '$$destination'] }
                      }
                    }
                  }
                }
              }
            }
          },
          categoryBreakdown: {
            $arrayToObject: {
              $map: {
                input: { $setUnion: ['$itemsByCategory'] },
                as: 'category',
                in: {
                  k: '$$category',
                  v: {
                    $size: {
                      $filter: {
                        input: '$itemsByCategory',
                        cond: { $eq: ['$$this', '$$category'] }
                      }
                    }
                  }
                }
              }
            }
          },
          statusBreakdown: {
            $arrayToObject: {
              $map: {
                input: { $setUnion: ['$itemsByStatus'] },
                as: 'status',
                in: {
                  k: '$$status',
                  v: {
                    $size: {
                      $filter: {
                        input: '$itemsByStatus',
                        cond: { $eq: ['$$this', '$$status'] }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]).toArray();

    // Get time series data for charts
    const timeSeriesData = await itemsCollection.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: {
              format: timeframe === '7d' ? '%Y-%m-%d' : '%Y-%m',
              date: '$createdAt'
            }
          },
          items: { $sum: 1 },
          co2Saved: { $sum: '$impactMetrics.co2Saved' },
          wasteAverted: { $sum: '$impactMetrics.wasteAverted' },
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Calculate revenue data if user is retailer
    let revenueData = null;
    if (user.role === 'retailer' || user.role === 'admin') {
      const transactionsCollection = db.collection('transactions');
      const revenue = await transactionsCollection.aggregate([
        { 
          $match: { 
            ...dateFilter,
            status: 'completed',
            type: 'purchase',
            ...(userId ? { sellerId: new ObjectId(userId) } : {})
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$netAmount' },
            totalTransactions: { $sum: 1 },
            averageOrderValue: { $avg: '$amount' },
          }
        }
      ]).toArray();

      revenueData = revenue[0] || {
        totalRevenue: 0,
        totalTransactions: 0,
        averageOrderValue: 0,
      };
    }

    const result = {
      impact: impactData[0] || {
        totalItems: 0,
        totalCO2Saved: 0,
        totalWasteAverted: 0,
        destinationBreakdown: {},
        categoryBreakdown: {},
        statusBreakdown: {},
      },
      timeSeries: timeSeriesData,
      revenue: revenueData,
      timeframe,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}