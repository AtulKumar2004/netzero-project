import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Recycle, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-muted/50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary rounded-lg">
                <Recycle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">ReLoop</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Transforming retail returns into sustainable opportunities through our circular marketplace.
            </p>
            <div className="flex gap-4">
              <Button size="sm" variant="outline">
                Get Started
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <div className="space-y-2 text-sm">
              <div className="text-muted-foreground hover:text-foreground cursor-pointer">
                Customer Portal
              </div>
              <div className="text-muted-foreground hover:text-foreground cursor-pointer">
                Retailer Dashboard
              </div>
              <div className="text-muted-foreground hover:text-foreground cursor-pointer">
                NGO Portal
              </div>
              <div className="text-muted-foreground hover:text-foreground cursor-pointer">
                Marketplace
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <div className="space-y-2 text-sm">
              <div className="text-muted-foreground hover:text-foreground cursor-pointer">
                Impact Reports
              </div>
              <div className="text-muted-foreground hover:text-foreground cursor-pointer">
                Best Practices
              </div>
              <div className="text-muted-foreground hover:text-foreground cursor-pointer">
                API Documentation
              </div>
              <div className="text-muted-foreground hover:text-foreground cursor-pointer">
                Support Center
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                hello@reloop.com
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                +1 (555) 123-4567
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                San Francisco, CA
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div>
            © 2024 ReLoop. All rights reserved.
          </div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
            <span className="hover:text-foreground cursor-pointer">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}