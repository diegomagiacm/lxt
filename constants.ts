import { Product, User, Branch } from './types';

// ID de la Hoja de Cálculo de Google (Base de Datos de Usados)
// Este ID define "directamente" a qué planilla se conecta la app para leer el stock.
export const USED_PRODUCTS_SHEET_ID = '1RL2L2MX3cYBcVliO6XPdQErmMRinR50xeO5TtgtrvLs';
export const USED_PRODUCTS_SHEET_GID = '0'; // Default tab

// URL del Google Apps Script para sincronización con Calendar y Actualización de Stock
// Este script actúa como API directa entre la web y la cuenta de Google.
// Al usar este script, la web no necesita intermediarios adicionales, habla directo con la API de Google.
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwNPIYOyvOkPvxdMfTqCbR6ZsXewK-d4g30OjYdUp3x1ocyv-iDwzES2cBQltXvY1rtTQ/exec";

// ID de la Hoja de Cálculo de Google (Base de Datos de Nuevos)
// Si está vacío, usa los productos hardcodeados en este archivo.
export const NEW_PRODUCTS_SHEET_ID = ''; 
export const NEW_PRODUCTS_SHEET_GID = '0'; // Default tab for new products

export const LOGO_URL = "https://jecxqmertgnogjetodao.supabase.co/storage/v1/object/public/LXT2/lxtlogo.png";
export const IMAGE_BASE_URL = "https://jecxqmertgnogjetodao.supabase.co/storage/v1/object/public/LXT2/Prod2/";
export const JBL_IMAGE_BASE_URL = "https://jecxqmertgnogjetodao.supabase.co/storage/v1/object/public/LXT2/jbl/";

export const BRANCHES: Branch[] = [
  {
    name: "Centro",
    address: "Corrientes 1464",
    hours: "Lun-Vie 10-19hs, Sáb/Fer 11-16hs"
  },
  {
    name: "Belgrano",
    address: "Olazabal 1515",
    hours: "Lun-Vie 11-20hs, Sáb/Fer 11-16hs"
  }
];

export const INITIAL_USERS: User[] = [];

// Helper to construct image URL
const getImg = (filename: string) => `${IMAGE_BASE_URL}${filename}`;
const getJblImg = (filename: string) => `${JBL_IMAGE_BASE_URL}${filename}`;

// Fallback image for items without specific files
export const fallbackImg = LOGO_URL; 

export const PRODUCTS: Product[] = [
  {
    "id": "ip14-128",
    "name": "iPhone 14 128GB",
    "price": 590,
    "category": "iPhone",
    "description": "Apple iPhone 14. Incluye: Funda, Glass, Cargador y Auriculares de regalo!",
    "stock": true,
    "image": "https://jecxqmertgnogjetodao.supabase.co/storage/v1/object/public/LXT2/Prod2/iphone_14_128gb.png"
  },
  {
    "id": "ip15-128",
    "name": "iPhone 15 128GB",
    "price": 670,
    "category": "iPhone",
    "description": "Dynamic Island. Incluye: Funda, Glass, Cargador y Auriculares de regalo!",
    "stock": true,
    "image": "https://jecxqmertgnogjetodao.supabase.co/storage/v1/object/public/LXT2/Prod2/iphone_15_128gb.png"
  },
  {
    "id": "sam-s25u-256",
    "name": "Samsung S25 Ultra 256GB",
    "price": 1050,
    "category": "Samsung",
    "description": "S-Pen Titanio",
    "stock": true,
    "image": "https://jecxqmertgnogjetodao.supabase.co/storage/v1/object/public/LXT2/lxtlogo.png"
  },
  {
    "id": "xiao-rn13p-plus",
    "name": "Xiaomi Redmi Note 13 Pro+",
    "price": 450,
    "category": "Xiaomi",
    "description": "Curved Screen, IP68",
    "stock": true,
    "image": "https://jecxqmertgnogjetodao.supabase.co/storage/v1/object/public/LXT2/lxtlogo.png"
  },
  {
    "id": "ps5-pro",
    "name": "PS5 Pro Digital 2TB",
    "price": 895,
    "category": "Gaming",
    "description": "La más potente",
    "stock": true,
    "image": "https://jecxqmertgnogjetodao.supabase.co/storage/v1/object/public/LXT2/Prod2/ps5_pro_digital_2tb__sin_juego_.png"
  }
];