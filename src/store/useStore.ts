import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface StoreState {
  user: User | null;
  profile: any | null;
  cart: CartItem[];
  dolarBlue: number;
  setUser: (user: User | null) => void;
  setProfile: (profile: any | null) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setDolarBlue: (rate: number) => void;
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  profile: null,
  cart: [],
  dolarBlue: 1200, // Default fallback
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  addToCart: (item) =>
    set((state) => {
      const existing = state.cart.find((i) => i.id === item.id);
      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        };
      }
      return { cart: [...state.cart, item] };
    }),
  removeFromCart: (id) =>
    set((state) => ({ cart: state.cart.filter((i) => i.id !== id) })),
  updateQuantity: (id, quantity) =>
    set((state) => ({
      cart: state.cart.map((i) => (i.id === id ? { ...i, quantity } : i)),
    })),
  clearCart: () => set({ cart: [] }),
  setDolarBlue: (rate) => set({ dolarBlue: rate }),
}));
