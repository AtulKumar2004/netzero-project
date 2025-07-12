'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Recycle, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  profileImage?: string;
  stats: {
    itemsSubmitted: number;
    co2Saved: number;
    ecoPoints: number;
  };
}

export default function Hero() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth check failed in Hero:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div className="hero-gradient">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Turn Returns Into
                <span className="block text-emerald-200">Revenue & Impact</span>
              </h1>
              <p className="text-xl mb-8 text-emerald-100">
                Join the circular economy revolution. ReLoop transforms retail returns into sustainable opportunities, 
                connecting retailers, customers, and recyclers in a closed-loop ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {loading ? (
                  // Optionally show a skeleton or nothing while loading
                  <div className="w-32 h-12 rounded-lg bg-emerald-700 animate-pulse" />
                ) : !user ? ( // Only show "Get Started" if user is NOT logged in
                  <Button size="lg" asChild>
                    <Link href="/auth/register">Get Started</Link>
                  </Button>
                ) : null // Do not render anything if user is logged in
                }
                <Button size="lg" variant="outline" className="border-white text-primary" asChild>
                  <Link href="/marketplace">Browse Marketplace</Link>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Recycle className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Circular Economy</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Transform waste into valuable resources through sustainable practices
                  </p>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ShoppingBag className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Smart Returns</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Intelligent routing of returned items to maximize value and minimize waste
                  </p>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Community Impact</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Connect with NGOs and recyclers for meaningful social impact
                  </p>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Data Insights</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track your environmental impact with real-time analytics
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}