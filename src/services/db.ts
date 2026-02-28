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
  // Always use Server API to avoid "Forbidden use of secret API key in browser"
  try {
    const response = await fetch('/api/products', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (error) {
    console.error('Error fetching from API, falling back to constants:', error);
  }
  return [...PRODUCTS];
};

export const saveProduct = async (product: Product): Promise<boolean> => {
  // Always use Server API for writes to avoid "Forbidden use of secret API key in browser"
  // The server will handle the Supabase connection using the Service Role Key if available.
  try {
    console.log('Saving product to API:', product);
    const response = await fetch(`/api/products/${product.id}?t=${Date.now()}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('API Error Details:', errData);
      alert(`Error del servidor: ${errData.error || response.statusText}`);
    }
    
    return response.ok;
  } catch (error) {
    console.error('Error saving to API:', error);
    alert(`Error de conexión: ${error}`);
    return false;
  }
};

export const recordSale = async (sale: { userId: string, products: any[], total: number, date: string }): Promise<boolean> => {
  // Always use Server API for writes
  try {
    const response = await fetch('/api/sales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sale)
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('API Error Details:', errData);
      alert(`Error del servidor: ${errData.error || response.statusText}`);
    }

    return response.ok;
  } catch (error) {
    console.error('Error recording sale to API:', error);
    alert(`Error de conexión: ${error}`);
    return false;
  }
};

export const getSales = async (): Promise<any[]> => {
  // Always use Server API
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
