'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Store, 
  Package, 
  TrendingUp, 
  DollarSign,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  ShoppingCart,
  BarChart3,
  Users,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Item {
  _id: string;
  title: string;
  description: string;
  brand?: string;
  category: string;
  condition: string;
  originalPrice?: number;
  resalePrice?: number;
  images: string[];
  status: string;
  submitter?: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
}

interface Analytics {
  overview: {
    totalItems: number;
    listedItems: number;
    soldItems: number;
    pendingItems: number;
    totalRevenue: number;
    averagePrice: number;
    conversionRate: string;
  };
  transactions: {
    totalTransactions: number;
    totalGrossRevenue: number;
    totalNetRevenue: number;
    totalFees: number;
    averageOrderValue: number;
  };
  trends: Array<{
    _id: string;
    items: number;
    revenue: number;
    sold: number;
  }>;
}

export default function RetailerPortal() {
  const [items, setItems] = useState<Item[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [resalePrice, setResalePrice] = useState('');
  const [notes, setNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchItems();
    fetchAnalytics();
  }, [statusFilter]);

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/retailer/items?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setItems(data.items);
      } else {
        toast.error(data.error || 'Failed to fetch items');
      }
    } catch (error) {
      toast.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/retailer/analytics');
      const data = await response.json();
      
      if (response.ok) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const handleItemAction = async (itemId: string, action: string) => {
    try {
      const response = await fetch('/api/retailer/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          action,
          resalePrice: action === 'list' || action === 'approve' ? resalePrice : undefined,
          notes
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        fetchItems();
        fetchAnalytics();
        setSelectedItem(null);
        setResalePrice('');
        setNotes('');
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading retailer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/portal">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Link>
            </Button>
            <Badge variant="outline">Retailer Dashboard</Badge>
          </div>
          <h1 className="text-3xl font-bold">Retailer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage returned items and track your resale performance
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {analytics && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <Badge variant="secondary">Total</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.overview.totalItems}
                    </div>
                    <p className="text-sm text-muted-foreground">Items Processed</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <ShoppingCart className="h-5 w-5 text-green-600" />
                      </div>
                      <Badge variant="secondary">Listed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.overview.listedItems}
                    </div>
                    <p className="text-sm text-muted-foreground">Items Listed</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                      </div>
                      <Badge variant="secondary">Revenue</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(analytics.overview.totalRevenue)}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                      </div>
                      <Badge variant="secondary">Rate</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {analytics.overview.conversionRate}%
                    </div>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pending Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {analytics?.overview.pendingItems || 0}
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Items awaiting your review
                    </p>
                    <Button onClick={() => setStatusFilter('submitted')}>
                      Review Items
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average Price</span>
                      <span className="font-semibold">
                        {formatCurrency(analytics?.overview.averagePrice || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Items Sold</span>
                      <span className="font-semibold">{analytics?.overview.soldItems || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Success Rate</span>
                      <span className="font-semibold">{analytics?.overview.conversionRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="items">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Item Management
                  </CardTitle>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4">
                          {item.images[0] && (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.brand}</p>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                            {item.originalPrice && (
                              <p className="text-sm">
                                Original: {formatCurrency(item.originalPrice / 100)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedItem(item)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Review Item: {item.title}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Description</Label>
                                    <p className="text-sm text-muted-foreground">
                                      {item.description}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Condition</Label>
                                    <p className="text-sm">{item.condition}</p>
                                  </div>
                                </div>
                                
                                {item.submitter && (
                                  <div>
                                    <Label>Submitted by</Label>
                                    <p className="text-sm">{item.submitter.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {item.submitter.phone}
                                    </p>
                                  </div>
                                )}

                                <div>
                                  <Label htmlFor="resalePrice">Resale Price ($)</Label>
                                  <Input
                                    id="resalePrice"
                                    type="number"
                                    value={resalePrice}
                                    onChange={(e) => setResalePrice(e.target.value)}
                                    placeholder="Enter resale price"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="notes">Notes</Label>
                                  <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add any notes about this item"
                                    rows={3}
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleItemAction(item._id, 'approve')}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve & List
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleItemAction(item._id, 'reject')}
                                    className="flex-1"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Submitted: {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No items found</h3>
                      <p className="text-muted-foreground">
                        No items match your current filter criteria
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics && (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Gross Revenue</span>
                        <span className="font-semibold">
                          {formatCurrency(analytics.transactions.totalGrossRevenue / 100)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fees</span>
                        <span className="font-semibold text-red-600">
                          -{formatCurrency(analytics.transactions.totalFees / 100)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Net Revenue</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(analytics.transactions.totalNetRevenue / 100)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics && (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Transactions</span>
                        <span className="font-semibold">
                          {analytics.transactions.totalTransactions}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Order Value</span>
                        <span className="font-semibold">
                          {formatCurrency(analytics.transactions.averageOrderValue / 100)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conversion Rate</span>
                        <span className="font-semibold">
                          {analytics.overview.conversionRate}%
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Retailer Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label>Business Information</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Input placeholder="Business Name" />
                      <Input placeholder="Business Type" />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Return Policies</Label>
                    <Textarea 
                      placeholder="Describe your return policies and accepted item conditions"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label>Service Areas</Label>
                    <Input placeholder="Enter zip codes or cities you serve" />
                  </div>
                  
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}