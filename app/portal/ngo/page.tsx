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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Heart, 
  Package, 
  TrendingUp, 
  Leaf,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  ArrowLeft,
  Truck,
  Users,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

interface Item {
  _id: string;
  title: string;
  description: string;
  brand?: string;
  category: string;
  condition: string;
  images: string[];
  status: string;
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string
  };
  submitter?: {
    name: string;
    phone: string;
  };
  impactMetrics: {
    co2Saved: number;
    wasteAverted: number
  };
  createdAt: string;
}

interface Analytics {
  overview: {
    totalDonations: number;
    completedDonations: number;
    pendingDonations: number;
    availableDonations: number;
    totalImpact: number;
    totalWeight: number;
    completionRate: string
  };
  pickups: {
    totalPickups: number;
    completedPickups: number;
    pendingPickups: number
  };
  categories: Array<{
    _id: string;
    count: number;
    impact: number
  }>
}

export default function NGOPortal() {
  const [items, setItems] = useState<Item[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("available");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [notes, setNotes] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchItems();
    fetchAnalytics();
  }, [statusFilter, categoryFilter, locationFilter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (locationFilter) params.append("location", locationFilter);
      
      const response = await fetch(`/api/ngo/donations?${params}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();

      if (Array.isArray(data.items)) {
        setItems(data.items);
      } else {
        console.error("API did not return an array of items:", data);
        setItems([]);
        toast.error("Received invalid data from server.");
      }
    } catch (error) {
      console.error("Failed to fetch donations:", error);
      toast.error("Failed to fetch donations. Please try again.");
      setItems([]); // Ensure items is an array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/ngo/analytics");
      const data = await response.json();
  
      if (response.ok) {
        setAnalytics(data);
      } else {
        console.error("Failed to fetch analytics:", data.error || data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };
  

  const handleItemAction = async (action: string) => {
    if (selectedItems.length === 0) {
      toast.error("Please select items first");
      return;
    }

    try {
      const response = await fetch("/api/ngo/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemIds: selectedItems,
          action,
          pickupDate: action === "schedule-pickup" ? pickupDate : undefined,
          notes
        }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchItems();
        fetchAnalytics();
        setSelectedItems([]);
        setPickupDate("");
        setNotes("");
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-yellow-100 text-yellow-800";
      case "reviewed": return "bg-blue-100 text-blue-800";
      case "approved": return "bg-green-100 text-green-800";
      case "processing": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-emerald-100 text-emerald-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading NGO dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/portal">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Link>
            </Button>
            <Badge variant="outline">NGO Portal</Badge>
          </div>
          <h1 className="text-3xl font-bold">NGO Dashboard</h1>
          <p className="text-muted-foreground">
            Manage donations and track your community impact
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

        <TabsContent value="overview">
          {analytics && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Heart className="h-5 w-5 text-purple-600" />
                    </div>
                    <Badge variant="secondary">Total</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.overview.totalDonations}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Donations</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.overview.completedDonations}
                  </div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Leaf className="h-5 w-5 text-blue-600" />
                    </div>
                    <Badge variant="secondary">Impact</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.overview.totalImpact} kg
                  </div>
                  <p className="text-sm text-muted-foreground">CO2 Saved</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Package className="h-5 w-5 text-orange-600" />
                    </div>
                    <Badge variant="secondary">Available</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {analytics.overview.availableDonations}
                  </div>
                  <p className="text-sm text-muted-foreground">Available</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Pickup Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics && (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Pickups</span>
                      <span className="font-semibold">
                        {analytics.pickups.totalPickups}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed</span>
                      <span className="font-semibold text-green-600">
                        {analytics.pickups.completedPickups}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending</span>
                      <span className="font-semibold text-yellow-600">
                        {analytics.pickups.pendingPickups}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Impact Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {analytics.overview.totalImpact} kg
                      </div>
                      <p className="text-sm text-muted-foreground">Total CO2 Saved</p>
                    </div>

                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {analytics.overview.totalWeight} kg
                      </div>
                      <p className="text-sm text-muted-foreground">Waste Diverted</p>
                    </div>

                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {analytics.overview.completionRate}%
                      </div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="donations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Available Donations
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedItems.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">
                      {selectedItems.length} items selected
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedItems([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Heart className="h-4 w-4 mr-2" />
                          Claim Items
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Claim Selected Items</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                              id="notes"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Add any notes about claiming these items"
                              rows={3}
                            />
                          </div>
                          <Button
                            onClick={() => handleItemAction("claim")}
                            className="w-full"
                          >
                            Claim {selectedItems.length} Items
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Pickup
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Schedule Pickup</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="pickupDate">Pickup Date</Label>
                            <Input
                              id="pickupDate"
                              type="date"
                              value={pickupDate}
                              onChange={(e) => setPickupDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="pickupNotes">Notes</Label>
                            <Textarea
                              id="pickupNotes"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Special instructions for pickup"
                              rows={3}
                            />
                          </div>
                          <Button
                            onClick={() => handleItemAction("schedule-pickup")}
                            className="w-full"
                          >
                            Schedule Pickup
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}

                <div className="space-y-4">
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  items.length > 0 ? (
                    items.map((item) => (
                      <div key={item._id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={selectedItems.includes(item._id)}
                            onCheckedChange={() => toggleItemSelection(item._id)}
                          />

                          {item.images[0] && (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.brand}</p>
                                <p className="text-sm text-muted-foreground">{item.category}</p>
                              </div>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                            </div>

                            <p className="text-sm mb-2">{item.description}</p>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Condition:</span> {item.condition}
                              </div>
                            <div>
                              <span className="text-muted-foreground">Impact:</span> {item.impactMetrics.co2Saved} kg CO2
                            </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{item.pickupAddress.city}, {item.pickupAddress.state}</span>
                              </div>
                              {item.submitter && (
                                <div>
                                  <span className="text-muted-foreground">Contact:</span> {item.submitter.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No donations found</h3>
                      <p className="text-muted-foreground">
                        No donations match your current filter criteria
                      </p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics && analytics.categories.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.categories.map((category) => (
                        <div key={category._id} className="flex justify-between items-center">
                          <span className="capitalize">{category._id}</span>
                          <div className="text-right">
                            <div className="font-semibold">{category.count} items</div>
                            <div className="text-sm text-muted-foreground">
                              {category.impact.toFixed(1)} kg CO2
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Impact Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {analytics.overview.totalImpact} kg
                        </div>
                        <p className="text-sm text-muted-foreground">Total CO2 Saved</p>
                      </div>

                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {analytics.overview.totalWeight} kg
                        </div>
                        <p className="text-sm text-muted-foreground">Waste Diverted</p>
                      </div>

                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                          {analytics.overview.completionRate}%
                        </div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
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
                <CardTitle>NGO Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label>Organization Information</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Input placeholder="Organization Name" />
                      <Input placeholder="Registration Number" />
                    </div>
                  </div>

                  <div>
                    <Label>Mission Statement</Label>
                    <Textarea
                      placeholder="Describe your organization's mission and goals"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Service Areas</Label>
                    <Input placeholder="Enter zip codes or cities you serve" />
                  </div>

                  <div>
                    <Label>Accepted Categories</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {['Clothing', 'Electronics', 'Home', 'Books', 'Toys', 'Sports'].map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox id={category} />
                          <Label htmlFor={category}>{category}</Label>
                        </div>
                      ))}
                    </div>
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
