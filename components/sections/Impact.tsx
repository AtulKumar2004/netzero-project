'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf,
  Package2,
  Users,
  TrendingUp,
  Recycle,
  DollarSign
} from 'lucide-react';
import { useEffect, useState } from 'react';

const impactStats = [
  {
    icon: Package2,
    label: 'Items Diverted',
    value: 1248392,
    unit: 'items',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  {
    icon: Leaf,
    label: 'CO2 Saved',
    value: 3847,
    unit: 'tons',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    icon: Users,
    label: 'Active Partners',
    value: 2847,
    unit: 'partners',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    icon: DollarSign,
    label: 'Revenue Generated',
    value: 18947382,
    unit: 'USD',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
];

export default function Impact() {
  const [animatedValues, setAnimatedValues] = useState(impactStats.map(() => 0));

  useEffect(() => {
    const timers = impactStats.map((stat, index) => {
      const increment = stat.value / 100;
      let current = 0;
      
      return setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(timers[index]);
        }
        setAnimatedValues(prev => {
          const newValues = [...prev];
          newValues[index] = Math.floor(current);
          return newValues;
        });
      }, 20);
    });

    return () => timers.forEach(clearInterval);
  }, []);

  const formatValue = (value: number, unit: string) => {
    if (unit === 'USD') {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString();
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <TrendingUp className="h-4 w-4 mr-2" />
            Live Impact Dashboard
          </Badge>
          <h2 className="text-4xl font-bold mb-4">Real-Time Impact</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See the tangible difference we're making together in creating a more sustainable world
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {impactStats.map((stat, index) => (
            <Card key={index} className="impact-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className={`text-2xl font-bold ${stat.color} animate-counter`}>
                    {formatValue(animatedValues[index], stat.unit)}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <Progress 
                    value={(animatedValues[index] / stat.value) * 100} 
                    className="h-1"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Recycle className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Circular Economy</h3>
                <p className="text-muted-foreground">
                  Every item gets a second chance through our network
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Community Impact</h3>
                <p className="text-muted-foreground">
                  Supporting local NGOs and creating social value
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Leaf className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Environmental Care</h3>
                <p className="text-muted-foreground">
                  Reducing waste and carbon footprint globally
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}