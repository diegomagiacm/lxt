import { supabase, isSupabaseConfigured } from '../../supabaseClient';
import { Product } from '../../types';
import { PRODUCTS } from '../../constants';

const STORAGE_KEYS = {
  PRODUCTS: 'app_products_v2', // Versioned to force refresh from constants
  SALES: 'app_sales'
};

// Helper to get from storage
const getFromStorage = <T>(key: string, defaultVal: T): T => {
  if (typeof window === 'undefined') return defaultVal;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

// Helper to save to storage
const saveToStorage = (key: string, val: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(val));
  // Dispatch event for same-tab updates
  window.dispatchEvent(new Event('local-storage-update'));
};

export const uploadImage = async (file: File): Promise<string | null> => {
  if (isSupabaseConfigured() && supabase) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('products').getPublicUrl(filePath);
    return data.publicUrl;
  }
  
  // Local: Convert to Base64 for storage
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
};

export const getProducts = async (): Promise<Product[]> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data && data.length > 0) {
      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        category: p.category,
        description: p.description,
        image: p.image_url,
        stock: p.stock,
        colors: p.colors,
        variants: p.variants || [],
        location: p.location
      }));
    }
    return []; 
  }
  
  // Local API (Server-side JSON)
  try {
    const response = await fetch('/api/products');
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Error fetching from API, falling back to constants:', error);
  }
  return [...PRODUCTS];
};

export const saveProduct = async (product: Product): Promise<boolean> => {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase.from('products').select('id').eq('id', product.id).single();
    
    const payload = {
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      image_url: product.image,
      stock: product.stock,
      colors: product.colors,
      variants: product.variants,
      location: product.location
    };

    if (data) {
      const { error } = await supabase.from('products').update(payload).eq('id', product.id);
      return !error;
    } else {
      const { error } = await supabase.from('products').insert([{ ...payload, id: product.id }]);
      return !error;
    }
  } else {
    // Local API (Server-side JSON)
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });
      return response.ok;
    } catch (error) {
      console.error('Error saving to API:', error);
      return false;
    }
  }
};

export const recordSale = async (sale: { userId: string, products: any[], total: number, date: string }): Promise<boolean> => {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('sales').insert([{
      user_id: sale.userId, 
      product_details: sale.products,
      total_amount: sale.total,
      created_at: sale.date
    }]);
    return !error;
  } else {
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sale)
      });
      return response.ok;
    } catch (error) {
      console.error('Error recording sale to API:', error);
      return false;
    }
  }
};

export const getSales = async (): Promise<any[]> => {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
    return data || [];
  }
  
  try {
    const response = await fetch('/api/sales');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching sales from API:', error);
  }
  return [];
};

export const calculateDailyCommissions = (sales: any[]) => {
  const salesByDate: Record<string, number> = {};
  
  sales.forEach(sale => {
    const date = new Date(sale.created_at || sale.date).toISOString().split('T')[0];
    salesByDate[date] = (salesByDate[date] || 0) + 1;
  });

  let totalCommission = 0;
  const breakdown: any[] = [];

  Object.entries(salesByDate).forEach(([date, count]) => {
    let bonus = 0;
    if (count > 30) bonus = 10;
    else if (count > 20) bonus = 5;
    
    if (bonus > 0) {
      totalCommission += bonus;
      breakdown.push({ date, count, bonus });
    }
  });

  return { totalCommission, breakdown };
};
