'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Recycle, User, LogOut, Settings, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        setUser(null);
        toast.success('Logged out successfully');
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'customer': return 'bg-blue-100 text-blue-800';
      case 'retailer': return 'bg-green-100 text-green-800';
      case 'ngo': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPortalLink = (role: string) => {
    switch (role) {
      case 'customer': return '/portal/customer';
      case 'retailer': return '/portal/retailer';
      case 'ngo': return '/portal/ngo';
      default: return '/portal';
    }
  };

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <Recycle className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">ReLoop</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors">
              Marketplace
            </Link>
            <Link href="/portal" className="text-muted-foreground hover:text-foreground transition-colors">
              Portal
            </Link>
            <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="/#impact" className="text-muted-foreground hover:text-foreground transition-colors">
              Impact
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImage} alt={user.fullName} />
                      <AvatarFallback>
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">{user.fullName}</p>
                        <Badge className={getRoleColor(user.role)} variant="secondary">
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="text-center">
                          <div className="text-sm font-semibold">{user.stats.itemsSubmitted}</div>
                          <div className="text-xs text-muted-foreground">Items</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold">{user.stats.co2Saved}kg</div>
                          <div className="text-xs text-muted-foreground">CO2 Saved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold">{user.stats.ecoPoints}</div>
                          <div className="text-xs text-muted-foreground">Eco Points</div>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getPortalLink(user.role)}>
                      <User className="mr-2 h-4 w-4" />
                      <span>My Portal</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/analytics">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>My Impact</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}