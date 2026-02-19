
export interface Product {
  id: string;
  name: string;
  price: number; // In USD
  category: string;
  description: string;
  image: string;
  stock: boolean;
  colors?: string[];
  // New fields for Used items
  batteryHealth?: string;
  warranty?: string;
  condition?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  username: string;
  code: string;
  role: 'admin' | 'seller';
  salesCount: number;
  extraHours: number;
}

export enum PaymentMethod {
  CASH_USD = 'Efectivo USD',
  CASH_ARS = 'Efectivo Pesos (Cotiz)',
  USDT = 'USDT',
  TRANSFER = 'Transferencia (+5%)',
  CREDIT_1 = 'Crédito 1 Cuota (+19%)',
  CREDIT_3 = 'Crédito 3 Cuotas (+45%)',
  CREDIT_6 = 'Crédito 6 Cuotas (+70%)',
  CREDIT_9 = 'Crédito 9 Cuotas (+85%)',
  CREDIT_12 = 'Crédito 12 Cuotas (+110%)',
}

export interface Branch {
  name: string;
  address: string;
  hours: string;
}