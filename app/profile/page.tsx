'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Lock,
  Camera,
  Recycle,
  ClipboardList,
  History,
  Info,
} from 'lucide-react';
import FileUpload from '@/components/ui/file-upload';

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

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
}

// Define UploadedFile interface as it's used by the FileUpload component
interface UploadedFile {
  url: string;
  name: string;
  size: number;
  // Add other properties if they are part of the UploadedFile structure
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    profileImage: '',
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // State to manage active tab
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  // New useEffect to save profile image changes to backend
  useEffect(() => {
    // Only save if profileImage has a value and it's different from the initial user.profileImage
    // This prevents saving on initial load if user already has a profile image
    if (formData.profileImage && user && formData.profileImage !== user.profileImage) {
      saveProfileChanges({ profileImage: formData.profileImage });
    }
  }, [formData.profileImage, user]); // Depend on formData.profileImage and user

  // New useEffect to re-fetch data when 'Items Submitted' tab is active
  useEffect(() => {
    if (activeTab === 'items-submitted') {
      console.log('Fetching user data due to tab change to items-submitted'); // Debug log
      fetchUserData();
    }
  }, [activeTab]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        console.log('User data fetched:', data); // Debug log: Inspect full data
        console.log('Items Submitted from fetched data:', data.user.stats.itemsSubmitted); // Debug log
        setUser(data.user);
        setFormData({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          profileImage: data.user.profileImage || '',
        });
      } else {
        toast.error('Failed to fetch user data. Please log in again.');
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('An error occurred while fetching user data.');
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Updated: Accept UploadedFile[] and extract the url
  const handleProfileImageUpload = (files: UploadedFile[]) => {
    if (files.length > 0) {
      const newProfileImageUrl = files[0].url; // Access the 'url' property of the UploadedFile object
      // Just update local state. The useEffect will handle saving to backend.
      setFormData((prev) => ({ ...prev, profileImage: newProfileImageUrl }));
    }
  };

  const saveProfileChanges = async (
    updates: Partial<FormData> = formData,
  ) => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedUserData = await response.json(); // Assuming your /api/auth/me PUT returns the updated user object
        setUser(updatedUserData.user); // Update local user state directly with the new data from the API response
        toast.success('Profile updated successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating profile.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('An error occurred while changing password.');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      case 'retailer':
        return 'bg-green-100 text-green-800';
      case 'ngo':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Or redirect to login
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}> {/* Added onValueChange prop */}
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5 h-auto">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="password">
            <Lock className="h-4 w-4 mr-2" /> Password
          </TabsTrigger>
          {user.role === 'customer' && (
            <TabsTrigger value="items-submitted">
              <Recycle className="h-4 w-4 mr-2" /> Items Submitted
            </TabsTrigger>
          )}
          {(user.role === 'retailer' || user.role === 'ngo') && (
            <TabsTrigger value="pickup-requests">
              <ClipboardList className="h-4 w-4 mr-2" /> Pickup Requests
            </TabsTrigger>
          )}
          <TabsTrigger value="transaction-history">
            <History className="h-4 w-4 mr-2" /> Transaction History
          </TabsTrigger>
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
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Section for Profile Picture & Upload */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
                    {formData.profileImage ? (
                      <img
                        src={formData.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                  {/* Removed the Button children from FileUpload as it's not expected */}
                  <FileUpload
                    onFilesUploaded={handleProfileImageUpload}
                    maxFiles={1}
                    maxFileSize={5}
                    acceptedTypes={['image/*']}
                    folder="profiles"
                  />
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    Maximum 1 file, 5MB each. Supported formats: image/*.
                  </p>
                </div>

                {/* Section for User Details (Name, Email, Role) */}
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-semibold mb-1">
                    {user.fullName}
                  </h3>
                  <p className="text-muted-foreground mb-2">{user.email}</p>
                  <Badge className={getRoleColor(user.role)} variant="secondary">
                    {user.role}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  readOnly // Email is often read-only for security or changed via separate process
                />
              </div>
              <Button onClick={() => saveProfileChanges()}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password for enhanced security.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit">Change Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {user.role === 'customer' && (
          <TabsContent value="items-submitted">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Recycle className="h-5 w-5" />
                  Items Submitted
                </CardTitle>
                <CardDescription>
                  Overview of items you have submitted for recycling or donation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  You have submitted{' '}
                  <span className="font-semibold">
                    {user.stats.itemsSubmitted}
                  </span>{' '}
                  items.
                </p>
                {/* You can add a list or table of submitted items here */}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {(user.role === 'retailer' || user.role === 'ngo') && (
          <TabsContent value="pickup-requests">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Pickup Requests
                </CardTitle>
                <CardDescription>
                  Manage and view details of your pickup requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Pickup request management goes here.</p>
                {/* Add tables or lists for pickup requests */}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="transaction-history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>
                View your past transactions and eco-points earned.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Transaction history details will be displayed here.</p>
              {/* Add transaction history table/list */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}