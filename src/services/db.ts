import { supabase, isSupabaseConfigured } from '../../supabaseClient';
import { Product } from '../../types';
import { PRODUCTS } from '../../constants';

// Mock storage
let MOCK_PRODUCTS = [...PRODUCTS];
let MOCK_SALES: any[] = [];

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
  // Mock upload (return a fake URL or base64 if we wanted, but for now just null or original)
  return URL.createObjectURL(file);
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
    // If DB is empty, return constants but maybe we should seed?
    // For now, if DB empty, return empty or constants? 
    // Let's assume if connected, we use DB. If empty, it's empty.
    return []; 
  }
  return MOCK_PRODUCTS;
};

export const saveProduct = async (product: Product): Promise<boolean> => {
  if (isSupabaseConfigured() && supabase) {
    // Check if exists
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
    const idx = MOCK_PRODUCTS.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      MOCK_PRODUCTS[idx] = product;
    } else {
      MOCK_PRODUCTS.push(product);
    }
    return true;
  }
};

export const recordSale = async (sale: { userId: string, products: any[], total: number, date: string }): Promise<boolean> => {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('sales').insert([{
      user_id: sale.userId, // Assuming UUID if real DB, but might be username if mock
      product_details: sale.products,
      total_amount: sale.total,
      created_at: sale.date
    }]);
    
    // Also update user sales count
    // This is a bit complex without a proper backend trigger, but we'll try
    // We need to find the user by ID (or username if we stored that)
    // For simplicity in this hybrid mode, we might skip the count update in DB if strict relational integrity isn't set up
    // But let's try to update the 'sales_count' column in users table
    
    return !error;
  } else {
    MOCK_SALES.push({ ...sale, id: Math.random().toString() });
    return true;
  }
};

export const getSales = async (): Promise<any[]> => {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
    return data || [];
  }
  return MOCK_SALES;
};

// Helper to calculate commissions
export const calculateDailyCommissions = (sales: any[]) => {
  // Group by date (YYYY-MM-DD)
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
