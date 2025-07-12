'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  Camera,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Leaf,
  Heart,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import FileUpload, { UploadedFile } from '@/components/ui/file-upload';

const recentReturns = [
  {
    id: 'RT001',
    item: 'Blue Denim Jacket',
    status: 'Collected',
    date: '2024-01-15',
    destination: 'Donation',
    impact: '2.5 kg CO2 saved'
  },
  {
    id: 'RT002',
    item: 'Leather Boots',
    status: 'Processing',
    date: '2024-01-12',
    destination: 'Resale',
    impact: 'Pending'
  },
  {
    id: 'RT003',
    item: 'Cotton T-Shirt',
    status: 'Delivered',
    date: '2024-01-10',
    destination: 'Recycling',
    impact: '1.2 kg CO2 saved'
  }
];

export default function CustomerPortal() {
  const [step, setStep] = useState(1);
  const [itemType, setItemType] = useState('');
  const [destination, setDestination] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('US');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  const handleSubmit = async () => {
    // Validate that at least 1 and at most 10 images are uploaded
    if (uploadedFiles.length < 1 || uploadedFiles.length > 10) {
      toast.error('Please upload between 1 and 10 images for the item.');
      return; // Stop the submission process
    }

    try {
      const formData = new FormData();

      formData.append('title', `${itemType} item`);
      formData.append('brand', brand);
      formData.append('description', description);
      formData.append('category', itemType);
      formData.append('condition', 'good'); // you can collect this from the user too
      formData.append('destination', destination);
      formData.append('originalPrice', '0'); // Optional

      // Address
      formData.append('street', street);
      formData.append('city', city);
      formData.append('state', state);
      formData.append('zipCode', zipCode);
      formData.append('country', country);

      // Preferences
      formData.append('preferredDate', preferredDate);
      formData.append('preferredTimeSlot', preferredTime);
      formData.append('specialInstructions', notes);
      formData.append('contactPhone', ''); // optional

      // Attach image files
      uploadedFiles.forEach((file) => {
        formData.append('images', JSON.stringify(uploadedFiles)); // image metadata only
      });

      const res = await fetch('/api/items/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Item submitted successfully!');
        setStep(1);
      } else {
        toast.error(data.error || 'Failed to submit item.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Something went wrong.');
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Collected': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Delivered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/portal">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Link>
            </Button>
            <Badge variant="outline">Customer Portal</Badge>
          </div>
          <h1 className="text-3xl font-bold">Return & Donate Items</h1>
          <p className="text-muted-foreground">
            Give your items a second life and track your environmental impact
          </p>
        </div>

        <Tabs defaultValue="new-return" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new-return">New Return</TabsTrigger>
            <TabsTrigger value="my-returns">My Returns</TabsTrigger>
            <TabsTrigger value="impact">My Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="new-return">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Submit New Return
                </CardTitle>
                <Progress value={(step / 4) * 100} className="w-full" />
              </CardHeader>
              <CardContent className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="item-type">Item Category</Label>
                      <Select value={itemType} onValueChange={setItemType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="shoes">Shoes</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                          <SelectItem value="home">Home & Garden</SelectItem>
                          <SelectItem value="books">Books</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        placeholder="Enter brand name"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the item's condition, size, color, etc."
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    <Button onClick={() => setStep(2)} disabled={!itemType} className="w-full">
                      Next: Upload Photos
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Upload Photos</Label>
                      <FileUpload
                        onFilesUploaded={handleFilesUploaded}
                        maxFiles={5}
                        maxFileSize={10}
                        acceptedTypes={['image/*']}
                        folder="items"
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                        Back
                      </Button>
                      <Button onClick={() => setStep(3)} className="flex-1">
                        Next: Choose Destination
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label>What would you like to do with this item?</Label>
                      <RadioGroup value={destination} onValueChange={setDestination}>
                        <div className="flex items-center space-x-2 p-4 border rounded-lg">
                          <RadioGroupItem value="donate" id="donate" />
                          <Label htmlFor="donate" className="flex items-center gap-2 cursor-pointer">
                            <Heart className="h-4 w-4 text-pink-500" />
                            Donate to NGO
                            <Badge variant="secondary">Free</Badge>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-4 border rounded-lg">
                          <RadioGroupItem value="resale" id="resale" />
                          <Label htmlFor="resale" className="flex items-center gap-2 cursor-pointer">
                            <Package className="h-4 w-4 text-green-500" />
                            List for Resale
                            <Badge variant="secondary">Earn Credits</Badge>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-4 border rounded-lg">
                          <RadioGroupItem value="recycle" id="recycle" />
                          <Label htmlFor="recycle" className="flex items-center gap-2 cursor-pointer">
                            <Leaf className="h-4 w-4 text-blue-500" />
                            Recycle Materials
                            <Badge variant="secondary">Eco Points</Badge>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                        Back
                      </Button>
                      <Button onClick={() => setStep(4)} disabled={!destination} className="flex-1">
                        Next: Pickup Details
                      </Button>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address">Pickup Address</Label>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="street">Street Address</Label>
                          <Input
                            id="street"
                            placeholder="123 Main St"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              placeholder="Bhubaneswar"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              placeholder="Odisha"
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="zip">Zip Code</Label>
                            <Input
                              id="zip"
                              placeholder="751024"
                              value={zipCode}
                              onChange={(e) => setZipCode(e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            placeholder="US"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="date">Preferred Date</Label>
                            <Input
                              id="date"
                              type="date"
                              value={preferredDate}
                              onChange={(e) => setPreferredDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="time">Preferred Time</Label>
                            <Select value={preferredTime} onValueChange={setPreferredTime}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (12PM - 6PM)</SelectItem>
                                <SelectItem value="evening">Evening (6PM - 9PM)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="notes">Special Instructions</Label>
                          <Textarea
                            id="notes"
                            placeholder="Any special instructions for pickup"
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </div>

                        <div className="flex gap-4">
                          <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                            Back
                          </Button>
                          <Button onClick={handleSubmit} className="flex-1">
                            Submit Return
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-returns">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  My Returns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReturns.map((return_item) => (
                    <div key={return_item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{return_item.item}</h4>
                          <p className="text-sm text-muted-foreground">ID: {return_item.id}</p>
                        </div>
                        <Badge className={getStatusColor(return_item.status)}>
                          {return_item.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Date:</span> {return_item.date}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Destination:</span> {return_item.destination}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Impact:</span> {return_item.impact}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impact">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5" />
                    Environmental Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">12.7 kg</div>
                      <p className="text-sm text-muted-foreground">CO2 Saved</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">24</div>
                      <p className="text-sm text-muted-foreground">Items Diverted</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">847</div>
                      <p className="text-sm text-muted-foreground">Eco Points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Community Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Items Donated</span>
                      <span className="font-semibold">18</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">NGOs Helped</span>
                      <span className="font-semibold">5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Revenue Generated</span>
                      <span className="font-semibold">$127.50</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}