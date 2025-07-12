'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import {
  Search,
  Filter,
  Heart,
  ShoppingCart,
  Star,
  Leaf,
  Package,
  MapPin
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import useCart from '@/hooks/use-cart';

interface CartItem {
    id: number;
    name: string;
    brand: string;
    originalPrice: number;
    discountedPrice: number;
    condition: string;
    category: string;
    seller: string;
    location: string;
    latitude: number;
    longitude: number;
    images: string[];
    rating: number;
    reviews: number;
    sustainability: string;
  
}
  const marketplaceItems = [
    {
      id: 1,
      name: 'Vintage Denim Jacket',
      brand: 'Levis',
      originalPrice: 89.99,
      discountedPrice: 34.99,
      condition: 'Like New',
      category: 'Clothing',
      seller: 'EcoRetail',
      location: 'San Francisco, CA',
      latitude: 37.7749,
      longitude: -122.4194,
      images: ['https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg'],
      rating: 4.8,
      reviews: 24,
      sustainability: 'Saves 2.3kg CO2'
    },
    {
      id: 2,
      name: 'Wireless Bluetooth Headphones',
      brand: 'Sony',
      originalPrice: 199.99,
      discountedPrice: 89.99,
      condition: 'Good',
      category: 'Electronics',
      seller: 'TechReturns',
      location: 'New York, NY',
      latitude: 40.7128,
      longitude: -74.0060,
      images: ['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg'],
      rating: 4.6,
      reviews: 18,
      sustainability: 'Saves 5.7kg CO2'
    },
    {
      id: 3,
      name: 'Leather Ankle Boots',
      brand: 'Dr. Martens',
      originalPrice: 159.99,
      discountedPrice: 79.99,
      condition: 'Very Good',
      category: 'Shoes',
      seller: 'Fashion Forward',
      location: 'Los Angeles, CA',
      latitude: 34.0522,
      longitude: -118.2437,
      images: ['https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg'],
      rating: 4.9,
      reviews: 31,
      sustainability: 'Saves 3.2kg CO2'
    },
    {
      id: 4,
      name: 'Ceramic Coffee Maker',
      brand: 'Breville',
      originalPrice: 299.99,
      discountedPrice: 149.99,
      condition: 'Like New',
      category: 'Home',
      seller: 'HomeGoods Plus',
      location: 'Chicago, IL',
      latitude: 41.8781,
      longitude: -87.6298,
      images: ['https://images.pexels.com/photos/6507626/pexels-photo-6507626.jpeg'],
      rating: 4.7,
      reviews: 12,
      sustainability: 'Saves 8.4kg CO2'
    },
    {
      id: 5,
      name: 'Yoga Mat & Block Set',
      brand: 'Manduka',
      originalPrice: 79.99,
      discountedPrice: 39.99,
      condition: 'Good',
      category: 'Sports',
      seller: 'Wellness Hub',
      location: 'Austin, TX',
      latitude: 30.2672,
      longitude: -97.7431,
      images: ['https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg'],
      rating: 4.5,
      reviews: 8,
      sustainability: 'Saves 1.8kg CO2'
    },
    {
      id: 6,
      name: 'Designer Handbag',
      brand: 'Coach',
      originalPrice: 349.99,
      discountedPrice: 179.99,
      condition: 'Very Good',
      category: 'Accessories',
      seller: 'Luxury Resale',
      location: 'Miami, FL',
      latitude: 25.7617,
      longitude: -80.1918,
      images: ['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'],
      rating: 4.8,
      reviews: 22,
      sustainability: 'Saves 4.1kg CO2'
    }
  ];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  marginBottom: '24px'
};

const defaultCenter = {
  lat: 34.052235,
  lng: -118.243683
};

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [filteredItems, setFilteredItems] = useState(marketplaceItems);
  const { cartItems, addToCart } = useCart();
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const categories = ['all', 'Clothing', 'Electronics', 'Shoes', 'Home', 'Sports', 'Accessories'];
  const conditions = ['all', 'Like New', 'Very Good', 'Good', 'Fair'];

  const handleSearch = () => {
    let filtered = marketplaceItems;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedCondition !== 'all') {
      filtered = filtered.filter(item => item.condition === selectedCondition);
    }

    filtered = filtered.filter(item =>
      item.discountedPrice >= priceRange[0] && item.discountedPrice <= priceRange[1]
    );

    setFilteredItems(filtered);
  };

  const handleAddToCart = (item: CartItem) => {
    addToCart(item);
    toast.success("Item Added to Cart", {
      description: `${item.name} has been added to your cart.`,
    });
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Like New': return 'bg-green-100 text-green-800';
      case 'Very Good': return 'bg-blue-100 text-blue-800';
      case 'Good': return 'bg-yellow-100 text-yellow-800';
      case 'Fair': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSavingsPercentage = (original: number, discounted: number) => {
    return Math.round(((original - discounted) / original) * 100);
  };

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    toast.message(item.name, {
      description: `More details for ${item.name} will be shown here.`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Sustainable Marketplace</h1>
          <p className="text-xl text-muted-foreground">
            Discover quality pre-loved items and contribute to the circular economy
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-5 gap-4 mb-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map(condition => (
                    <SelectItem key={condition} value={condition}>
                      {condition === 'all' ? 'All Conditions' : condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range: ${priceRange[0]} - ${priceRange[1]}</label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={300}
                step={10}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Google Map Integration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Item Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={defaultCenter}
                zoom={10}
              >
                {filteredItems.map(item => (
                  <Marker
                    key={item.id}
                    position={{ lat: item.latitude, lng: item.longitude }}
                    title={item.name}
                  />
                ))}
              </GoogleMap>
            </LoadScript>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredItems.length} items
          </p>
        </div>



        {/* Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-3 right-3">
                  <Button size="sm" variant="outline" className="bg-white/80 backdrop-blur-sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-green-600 text-white">
                    {getSavingsPercentage(item.originalPrice, item.discountedPrice)}% OFF
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.brand}</p>
                  </div>
                  <Badge className={getConditionColor(item.condition)}>
                    {item.condition}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Price and Rating */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary">
                        ${item.discountedPrice}
                      </span>
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        ${item.originalPrice}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{item.rating}</span>
                      <span className="text-sm text-muted-foreground">({item.reviews})</span>
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>{item.seller}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{item.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Leaf className="h-4 w-4" />
                    <span>{item.sustainability}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" onClick={() => handleAddToCart(item)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(item)}>
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
