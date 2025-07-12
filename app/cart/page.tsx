"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingCart, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import useCart from '@/hooks/use-cart';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Safely get the Stripe key
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
let stripePromise: Promise<Stripe | null>;

if (stripePublishableKey) {
  stripePromise = loadStripe(stripePublishableKey);
} else {
  // Log a warning if the key is missing
  console.warn("Stripe publishable key is not set. Checkout will be disabled.");
  // Assign a resolved promise with null to prevent breaking the Elements provider
  stripePromise = Promise.resolve(null);
}

export default function CartPage() {
  const { cartItems, updateQuantity, removeItem, isMounted } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.discountedPrice || 0;
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0);
  };

  const handleCheckout = async () => {
    if (!stripePublishableKey) {
        toast({
            title: "Configuration Error",
            description: "Stripe is not configured. Cannot proceed to checkout.",
            variant: "destructive"
        });
        return;
    }
    // ... rest of the checkout logic
    try {
        const response = await fetch('/api/checkout_sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cartItems }),
        });
  
        if (response.ok) {
          const { sessionId } = await response.json();
          const stripe = await stripePromise;
          if (stripe) {
            await stripe.redirectToCheckout({ sessionId });
          }
        } else {
          const errorData = await response.json();
          toast({
            title: "Checkout Failed",
            description: errorData.message || 'Failed to initiate checkout.',
          });
        }
      } catch (error: any) {
        console.error("Error during checkout:", error);
        toast({
          title: "Checkout Error",
          description: error.message || 'An unexpected error occurred during checkout.',
        });
      }
  };

  if (!isMounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold">Loading Cart...</h3>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
              <ShoppingCart className="h-10 w-10" /> Your Shopping Cart
            </h1>
            <p className="text-xl text-muted-foreground">
              Review your selected items before proceeding to checkout.
            </p>
          </div>

          {cartItems.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground">
                  Looks like you haven't added anything to your cart yet.
                </p>
                <Button onClick={() => router.push('/marketplace')} className="mt-4">
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.brand}</p>
                        <p className="text-primary font-bold">${item.discountedPrice.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, -1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-medium text-lg">{item.quantity || 1}</span>
                        <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="destructive" size="icon" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total ({cartItems.length} items):</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleCheckout} 
                      disabled={!stripePublishableKey || cartItems.length === 0}
                    >
                      <DollarSign className="h-5 w-5 mr-2" />
                      {stripePublishableKey ? 'Proceed to Checkout' : 'Checkout Disabled'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </Elements>
  );
}
