import { useState, useEffect, useCallback } from 'react';

// Define the type for a cart item for better type safety
interface CartItem {
  id: number;
  name: string;
  discountedPrice: number;
  images: string[];
  quantity: number;
  [key: string]: any; // Allow other properties
}

const useCart = () => {
  // Initialize state with an empty array. The server and initial client render will both start with this.
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  // Add a state to track when the component has mounted on the client
  const [isMounted, setIsMounted] = useState(false);

  // This effect runs ONLY on the client, after the initial render.
  useEffect(() => {
    setIsMounted(true); // Signal that we are now on the client.
    try {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        const parsed = JSON.parse(storedCart) as CartItem[];
        // Sanitize the data to ensure every item has a quantity.
        const cartWithQuantities = parsed.map(item => ({
          ...item,
          quantity: item.quantity || 1,
        }));
        setCartItems(cartWithQuantities);
      }
    } catch (error) {
      console.error("Failed to parse cart items from localStorage", error);
    }
  }, []); // The empty dependency array ensures this runs only once on mount.

  // This effect saves to localStorage whenever cartItems changes, but only after mounting.
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      window.dispatchEvent(new Event('storage'));
    }
  }, [cartItems, isMounted]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((id: number, delta: number) => {
    setCartItems(prevItems => {
      return prevItems
        .map(item =>
          item.id === id ? { ...item, quantity: (item.quantity || 1) + delta } : item
        )
        .filter(item => item.quantity > 0);
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  return {
    cartItems,
    addToCart,
    updateQuantity,
    removeItem,
    isMounted, // Expose the mounted state to components
  };
};

export default useCart;
