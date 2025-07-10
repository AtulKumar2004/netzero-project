import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  RotateCcw, 
  Store, 
  Heart, 
  BarChart3, 
  MapPin, 
  CreditCard,
  Package,
  Globe
} from 'lucide-react';

const features = [
  {
    icon: RotateCcw,
    title: 'Easy Returns Portal',
    description: 'Customers can easily return or donate items with our intuitive portal system.',
  },
  {
    icon: Store,
    title: 'Retailer Dashboard',
    description: 'Retailers can list returned goods as discounted resale items and track inventory.',
  },
  {
    icon: Heart,
    title: 'NGO Partnerships',
    description: 'Connect with verified NGOs and recyclers for sustainable collection services.',
  },
  {
    icon: BarChart3,
    title: 'Impact Tracking',
    description: 'Monitor waste reduction, CO2 savings, and environmental impact in real-time.',
  },
  {
    icon: MapPin,
    title: 'Pickup Logistics',
    description: 'Smart routing and mapping for efficient item collection and delivery.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Integrated payment processing for all marketplace transactions.',
  },
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Advanced tracking and categorization of returned and donated items.',
  },
  {
    icon: Globe,
    title: 'Global Network',
    description: 'Access to a worldwide network of retailers, customers, and recyclers.',
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Platform Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to participate in the circular economy and create sustainable impact
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}