'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function SettingsPage() {
  const [publicProfile, setPublicProfile] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleSaveSettings = () => {
    // Implement save settings functionality here
    alert('Settings Saved!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile Visibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="public-profile"
              checked={publicProfile}
              onCheckedChange={(checked) => {
                setPublicProfile(checked === true); // Ensure boolean value
              }}
            />
            <Label htmlFor="public-profile">Make my profile public</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            When your profile is public, anyone can find and view your information.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={(checked) => {
                setEmailNotifications(checked === true); // Ensure boolean value
              }}
            />
            <Label htmlFor="email-notifications">Receive email notifications</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Get updates on new features, important announcements, and activity related to your account.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Export your account data for personal use.</p>
          <Button>Download Data</Button>
        </CardContent>
      </Card>

      <Button onClick={handleSaveSettings}>Save all settings</Button>
    </div>
  );
}