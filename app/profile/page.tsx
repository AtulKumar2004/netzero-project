'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Bell, 
  Shield, 
  Leaf,
  Camera,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from '@/components/ui/file-upload';

interface UserProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  profileImage?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    sustainability: {
      preferredDestination: string;
      impactGoals: string[];
    };
  };
  stats: {
    itemsSubmitted: number;
    itemsDonated: number;
    itemsResold: number;
    co2Saved: number;
    revenueGenerated: number;
    ecoPoints: number;
  };
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setFormData(data.user);
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof UserProfile],
        [field]: value
      }
    }));
  };

  const handleProfileUpdate = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        toast.success('Profile updated successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Update failed');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const data = await response.json();
        toast.error(data.error || 'Password change failed');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleProfileImageUpload = (files: any[]) => {
    if (files.length > 0) {
      handleInputChange('profileImage', files[0].url);
      toast.success('Profile image updated');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center">
        <Alert>
          <AlertDescription>Please log in to view your profile.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="stats">My Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {formData.profileImage ? (
                        <img
                          src={formData.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <FileUpload
                        onFilesUploaded={handleProfileImageUpload}
                        maxFiles={1}
                        maxFileSize={5}
                        acceptedTypes={['image/*']}
                        folder="profiles"
                      >
                        <Button size="sm" className="rounded-full p-2">
                          <Camera className="h-4 w-4" />
                        </Button>
                      </FileUpload>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{user.firstName} {user.lastName}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <Badge className={getRoleColor(user.role)} variant="secondary">
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName || ''}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName || ''}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Address</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Input
                        placeholder="Street Address"
                        value={formData.address?.street || ''}
                        onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                      />
                    </div>
                    <Input
                      placeholder="City"
                      value={formData.address?.city || ''}
                      onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                    />
                    <Input
                      placeholder="State"
                      value={formData.address?.state || ''}
                      onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                    />
                    <Input
                      placeholder="ZIP Code"
                      value={formData.address?.zipCode || ''}
                      onChange={(e) => handleNestedChange('address', 'zipCode', e.target.value)}
                    />
                    <Input
                      placeholder="Country"
                      value={formData.address?.country || 'US'}
                      onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleProfileUpdate} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about your items and transactions
                      </p>
                    </div>
                    <Switch
                      checked={formData.preferences?.notifications?.email ?? true}
                      onCheckedChange={(checked) => 
                        handleNestedChange('preferences', 'notifications', {
                          ...formData.preferences?.notifications,
                          email: checked
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get text messages for pickup updates
                      </p>
                    </div>
                    <Switch
                      checked={formData.preferences?.notifications?.sms ?? false}
                      onCheckedChange={(checked) => 
                        handleNestedChange('preferences', 'notifications', {
                          ...formData.preferences?.notifications,
                          sms: checked
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5" />
                    Sustainability Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Preferred Destination</Label>
                    <Select
                      value={formData.preferences?.sustainability?.preferredDestination || 'any'}
                      onValueChange={(value) => 
                        handleNestedChange('preferences', 'sustainability', {
                          ...formData.preferences?.sustainability,
                          preferredDestination: value
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any (Let ReLoop decide)</SelectItem>
                        <SelectItem value="donate">Prefer Donation</SelectItem>
                        <SelectItem value="resale">Prefer Resale</SelectItem>
                        <SelectItem value="recycle">Prefer Recycling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleProfileUpdate} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      currentPassword: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      newPassword: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                  />
                </div>
                <Button onClick={handlePasswordChange}>
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Items Submitted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {user.stats.itemsSubmitted}
                  </div>
                  <p className="text-sm text-muted-foreground">Total items processed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>CO2 Saved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {user.stats.co2Saved} kg
                  </div>
                  <p className="text-sm text-muted-foreground">Environmental impact</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Eco Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {user.stats.ecoPoints}
                  </div>
                  <p className="text-sm text-muted-foreground">Sustainability score</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Items Donated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-pink-600">
                    {user.stats.itemsDonated}
                  </div>
                  <p className="text-sm text-muted-foreground">Community impact</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Items Resold</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {user.stats.itemsResold}
                  </div>
                  <p className="text-sm text-muted-foreground">Circular economy</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Generated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600">
                    ${(user.stats.revenueGenerated / 100).toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">From resales</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}