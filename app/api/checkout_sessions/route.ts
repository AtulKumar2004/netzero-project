import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10', // Use a recent, stable version
});

interface CartItem {
  id: number;
  name: string;
  discountedPrice: number;
  quantity: number;
  images: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { cartItems } = (await req.json()) as { cartItems: CartItem[] };

    if (!cartItems || !Array.isArray(cartItems)) {
      return new NextResponse('Invalid cart items data', { status: 400 });
    }

    const line_items = cartItems.map((item) => {
      // Ensure price is a whole number (cents)
      const unit_amount = Math.round(item.discountedPrice * 100);
      const quantity = item.quantity || 1; // Default to 1 if quantity is missing

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.images,
          },
          unit_amount,
        },
        quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/cart`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error('Stripe session creation failed:', err);
    return new NextResponse(err.message, { status: 500 });
  }
}