'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Store, 
  Heart, 
  ArrowRight,
  ShoppingBag,
  Users,
  Recycle
} from 'lucide-react';
import Link from 'next/link';

const portals = [
  {
    id: 'customer',
    title: 'Customer Portal',
    description: 'Return or donate items easily',
    icon: User,
    features: [
      'Upload item photos',
      'Choose return or donation',
      'Track pickup status',
      'View impact metrics'
    ],
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    href: '/portal/customer'
  },
  {
    id: 'retailer',
    title: 'Retailer Dashboard',
    description: 'Manage returns and resale inventory',
    icon: Store,
    features: [
      'Process returned items',
      'List items for resale',
      'Inventory management',
      'Analytics & reporting'
    ],
    color: 'bg-green-50 text-green-600 border-green-200',
    href: '/portal/retailer'
  },
  {
    id: 'ngo',
    title: 'NGO & Recycler Portal',
    description: 'Receive donations and manage collections',
    icon: Heart,
    features: [
      'View available donations',
      'Schedule pickups',
      'Track collections',
      'Impact reporting'
    ],
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    href: '/portal/ngo'
  }
];

export default function PortalSelection() {
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Recycle className="h-4 w-4 mr-2" />
            ReLoop Platform
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Choose Your Portal</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the portal that matches your role in the circular economy
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {portals.map((portal) => (
            <Card 
              key={portal.id}
              className={`hover:shadow-lg transition-all cursor-pointer ${
                selectedPortal === portal.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedPortal(portal.id)}
            >
              <CardHeader className="text-center pb-4">
                <div className={`p-4 rounded-full ${portal.color} w-fit mx-auto mb-4`}>
                  <portal.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">{portal.title}</CardTitle>
                <p className="text-muted-foreground">{portal.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  {portal.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  asChild 
                  className="w-full"
                  variant={selectedPortal === portal.id ? "default" : "outline"}
                >
                  <Link href={portal.href}>
                    Enter Portal
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="retailers">Retailers</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="p-3 bg-blue-50 rounded-lg w-fit mx-auto mb-3">
                      <ShoppingBag className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Easy Returns</h3>
                    <p className="text-sm text-muted-foreground">
                      Simple process for customers to return or donate items
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="p-3 bg-green-50 rounded-lg w-fit mx-auto mb-3">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Smart Matching</h3>
                    <p className="text-sm text-muted-foreground">
                      AI-powered routing to the best destination for each item
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="p-3 bg-purple-50 rounded-lg w-fit mx-auto mb-3">
                      <Recycle className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Impact Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      Real-time monitoring of environmental and social impact
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>For Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Easy Returns Process</h4>
                      <p className="text-sm text-muted-foreground">
                        Upload photos, describe items, and choose between return or donation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Recycle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Environmental Impact</h4>
                      <p className="text-sm text-muted-foreground">
                        Track your personal contribution to waste reduction and sustainability
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retailers" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>For Retailers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Store className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Returns Management</h4>
                      <p className="text-sm text-muted-foreground">
                        Process returned items efficiently and list them for resale
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <ShoppingBag className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Revenue Recovery</h4>
                      <p className="text-sm text-muted-foreground">
                        Turn returns into revenue through discounted resale marketplace
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>For NGOs & Recyclers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Heart className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Donation Management</h4>
                      <p className="text-sm text-muted-foreground">
                        Access donated items and coordinate collection logistics
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Community Impact</h4>
                      <p className="text-sm text-muted-foreground">
                        Maximize social impact through efficient distribution networks
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}