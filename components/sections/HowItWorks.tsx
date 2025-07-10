import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight,
  Upload,
  Search,
  Truck,
  RefreshCw
} from 'lucide-react';

const steps = [
  {
    step: 1,
    icon: Upload,
    title: 'Submit Returns',
    description: 'Customers easily upload photos and details of items they want to return or donate.',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    step: 2,
    icon: Search,
    title: 'Smart Matching',
    description: 'Our AI matches items with the best destination: resale, donation, or recycling.',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    step: 3,
    icon: Truck,
    title: 'Logistics & Pickup',
    description: 'Optimized routing connects items with NGOs, recyclers, or resale channels.',
    color: 'bg-orange-50 text-orange-600'
  },
  {
    step: 4,
    icon: RefreshCw,
    title: 'Circular Impact',
    description: 'Items get new life while everyone tracks their environmental impact.',
    color: 'bg-green-50 text-green-600'
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How ReLoop Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our seamless process transforms returns into sustainable opportunities
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-4 rounded-full ${step.color}`}>
                      <step.icon className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                      Step {step.step}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button size="lg" className="mr-4">
            Start Your Journey
          </Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}