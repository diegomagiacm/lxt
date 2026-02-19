import { Product, User, Branch } from './types';

// ID de la Hoja de Cálculo de Google (Base de Datos de Usados)
// Este ID define "directamente" a qué planilla se conecta la app para leer el stock.
export const USED_PRODUCTS_SHEET_ID = '1RL2L2MX3cYBcVliO6XPdQErmMRinR50xeO5TtgtrvLs';

// URL del Google Apps Script para sincronización con Calendar y Actualización de Stock
// Este script actúa como API directa entre la web y la cuenta de Google.
// Al usar este script, la web no necesita intermediarios adicionales, habla directo con la API de Google.
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwNPIYOyvOkPvxdMfTqCbR6ZsXewK-d4g30OjYdUp3x1ocyv-iDwzES2cBQltXvY1rtTQ/exec";

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

export const INITIAL_USERS: User[] = [
  { username: 'aracelit', code: 'A955118', role: 'admin', salesCount: 0, extraHours: 0 },
  { username: 'diegou', code: 'D1455', role: 'admin', salesCount: 0, extraHours: 0 },
  { username: 'joacor', code: 'J955602', role: 'seller', salesCount: 0, extraHours: 0 },
];

// Helper to construct image URL
const getImg = (filename: string) => `${IMAGE_BASE_URL}${filename}`;
const getJblImg = (filename: string) => `${JBL_IMAGE_BASE_URL}${filename}`;

// Fallback image for items without specific files
export const fallbackImg = LOGO_URL; 

export const PRODUCTS: Product[] = [
  // ==========================================
  // IPHONES NUEVOS
  // ==========================================
  { id: 'ip14-128', name: 'iPhone 14 128GB', price: 590, category: 'iPhone', description: 'Apple iPhone 14', stock: true, image: getImg('iphone_14_128gb.webp') },
  { id: 'ip15-128', name: 'iPhone 15 128GB', price: 670, category: 'iPhone', description: 'Dynamic Island', stock: true, image: getImg('iphone_15_128gb.webp') },
  { id: 'ip15-256', name: 'iPhone 15 256GB', price: 800, category: 'iPhone', description: 'Dynamic Island', stock: true, image: getImg('iphone_15_128gb.webp') },
  { id: 'ip15p-128', name: 'iPhone 15 Plus 128GB', price: 780, category: 'iPhone', description: 'Pantalla Grande', stock: true, image: getImg('iphone_15_plus_512gb.webp') },
  { id: 'ip15p-512', name: 'iPhone 15 Plus 512GB', price: 880, category: 'iPhone', description: 'Máxima capacidad', stock: true, image: getImg('iphone_15_plus_512gb.webp') },

  // iPhone 16
  { id: 'ip16e-128', name: 'iPhone 16E 128GB', price: 640, category: 'iPhone', description: 'Nueva Edición', stock: true, image: getImg('iphone_16e_128gb.webp') },
  { id: 'ip16e-256', name: 'iPhone 16E 256GB', price: 750, category: 'iPhone', description: 'Nueva Edición', stock: true, image: getImg('iphone_16e_256gb.webp') },
  { id: 'ip16-128', name: 'iPhone 16 128GB', price: 790, category: 'iPhone', description: 'A18 Chip', stock: true, image: getImg('iphone_16_128gb.webp') },
  { id: 'ip16-256', name: 'iPhone 16 256GB', price: 880, category: 'iPhone', description: 'A18 Chip', stock: true, image: getImg('iphone_16_256gb.webp') },
  { id: 'ip16pl-128', name: 'iPhone 16 Plus 128GB', price: 880, category: 'iPhone', description: 'Gran Pantalla', stock: true, image: getImg('iphone_16_plus_128gb.webp') },
  { id: 'ip16pl-256', name: 'iPhone 16 Plus 256GB', price: 1000, category: 'iPhone', description: 'Gran Pantalla', stock: true, image: getImg('iphone_16_plus_256gb.webp') },
  { id: 'ip16pro-128', name: 'iPhone 16 Pro 128GB', price: 1080, category: 'iPhone', description: 'Titanium', stock: true, image: getImg('iphone_16_pro_128gb.webp') },
  { id: 'ip16promax-256', name: 'iPhone 16 Pro Max 256GB', price: 1330, category: 'iPhone', description: 'Solo Desert Titanium', stock: true, image: getImg('iphone_16_pro_max_256gb_desert.webp') },

  // iPhone 17
  { id: 'ip17-256', name: 'iPhone 17 256GB', price: 990, category: 'iPhone', description: 'White, Blue, Lavender, Sage', stock: true, colors: ['White', 'Blue', 'Lavender', 'Sage'], image: getImg('iphone_17_256gb_blue.webp') },
  { id: 'ip17air-256', name: 'iPhone 17 Air 256GB', price: 980, category: 'iPhone', description: 'Ultra Thin. Black, White, Blue, Gold', stock: true, colors: ['Black', 'White', 'Blue', 'Gold'], image: getImg('iphone_17_air_256gb_black.webp') },
  { id: 'ip17pro-256-og', name: 'iPhone 17 Pro 256GB (Orange)', price: 1330, category: 'iPhone', description: 'Titanium Orange', stock: true, image: getImg('iphone_17_pro_256gb_orange.webp') },
  { id: 'ip17pro-256-bl', name: 'iPhone 17 Pro 256GB (Blue)', price: 1340, category: 'iPhone', description: 'Titanium Blue', stock: true, image: getImg('iphone_17_pro_256gb_blue.webp') },
  { id: 'ip17pro-256-sl', name: 'iPhone 17 Pro 256GB (Silver)', price: 1350, category: 'iPhone', description: 'Titanium Silver', stock: true, image: getImg('iphone_17_pro_256gb_silver.webp') },
  { id: 'ip17pro-512-og', name: 'iPhone 17 Pro 512GB (Orange)', price: 1530, category: 'iPhone', description: 'Titanium Orange', stock: true, image: getImg('iphone_17_pro_512gb_orange.webp') },
  { id: 'ip17pro-512-bl', name: 'iPhone 17 Pro 512GB (Blue)', price: 1540, category: 'iPhone', description: 'Titanium Blue', stock: true, image: getImg('iphone_17_pro_512gb_blue.webp') },
  { id: 'ip17pro-512-sl', name: 'iPhone 17 Pro 512GB (Silver)', price: 1540, category: 'iPhone 17', description: 'Titanium Silver', stock: true, image: getImg('iphone_17_pro_512gb_silver.webp') },
  { id: 'ip17pro-1tb', name: 'iPhone 17 Pro 1TB', price: 1760, category: 'iPhone', description: 'Orange, Blue, Silver', stock: true, colors: ['Orange', 'Blue', 'Silver'], image: getImg('iphone_17_pro_1tb_silver.webp') },
  { id: 'ip17pm-256-og', name: 'iPhone 17 Pro Max 256GB (Orange)', price: 1420, category: 'iPhone', description: 'Max Orange', stock: true, image: getImg('iphone_17_pro_max_256gb_orange.webp') },
  { id: 'ip17pm-256-bl', name: 'iPhone 17 Pro Max 256GB (Blue)', price: 1430, category: 'iPhone', description: 'Max Blue', stock: true, image: getImg('iphone_17_pro_max_256gb_blue.webp') },
  { id: 'ip17pm-256-sl', name: 'iPhone 17 Pro Max 256GB (Silver)', price: 1430, category: 'iPhone', description: 'Max Silver', stock: true, image: getImg('iphone_17_pro_max_256gb_silver.webp') },
  { id: 'ip17pm-512-og', name: 'iPhone 17 Pro Max 512GB (Orange)', price: 1640, category: 'iPhone', description: 'Max Orange', stock: true, image: getImg('iphone_17_pro_max_512gb_orange.webp') },
  { id: 'ip17pm-512-bl', name: 'iPhone 17 Pro Max 512GB (Blue)', price: 1670, category: 'iPhone 17', description: 'Max Blue', stock: true, image: getImg('iphone_17_pro_max_512gb_blue.webp') },
  { id: 'ip17pm-512-sl', name: 'iPhone 17 Pro Max 512GB (Silver)', price: 1670, category: 'iPhone 17', description: 'Max Silver', stock: true, image: getImg('iphone_17_pro_max_512gb_silver.webp') },
  { id: 'ip17pm-1tb', name: 'iPhone 17 Pro Max 1TB', price: 1910, category: 'iPhone', description: 'Orange, Blue, Silver', stock: true, colors: ['Orange', 'Blue', 'Silver'], image: getImg('iphone_17_pro_max_1tb_silver.webp') },
  { id: 'ip17pm-2tb', name: 'iPhone 17 Pro Max 2TB', price: 2300, category: 'iPhone', description: 'Orange, Blue, Silver', stock: true, colors: ['Orange', 'Blue', 'Silver'], image: getImg('iphone_17_pro_max_2tb_silver.webp') },

  // ==========================================
  // MACBOOKS (Precio Ref. Lista + 13%)
  // NO M1 - SOLO M2 / M3 / PRO
  // ==========================================
  { id: 'mac-air-m2-13', name: 'MacBook Air M2 13"', price: Math.ceil(920 * 1.13), category: 'MacBook', description: '256GB - Midnight', stock: true, image: fallbackImg },
  { id: 'mac-air-m2-15', name: 'MacBook Air M2 15"', price: Math.ceil(1150 * 1.13), category: 'MacBook', description: '256GB - Midnight', stock: true, image: fallbackImg },
  
  { id: 'mac-air-m3-13', name: 'MacBook Air M3 13"', price: Math.ceil(1090 * 1.13), category: 'MacBook', description: '256GB - Starlight', stock: true, image: fallbackImg },
  { id: 'mac-air-m3-15', name: 'MacBook Air M3 15"', price: Math.ceil(1290 * 1.13), category: 'MacBook', description: '256GB - Midnight', stock: true, image: fallbackImg },

  { id: 'mac-pro-m3-14', name: 'MacBook Pro 14" M3', price: Math.ceil(1590 * 1.13), category: 'MacBook', description: '512GB - Space Gray', stock: true, image: fallbackImg },
  { id: 'mac-pro-m3pro-14', name: 'MacBook Pro 14" M3 Pro', price: Math.ceil(1990 * 1.13), category: 'MacBook', description: '512GB - Space Black', stock: true, image: fallbackImg },
  { id: 'mac-pro-m3pro-16', name: 'MacBook Pro 16" M3 Pro', price: Math.ceil(2490 * 1.13), category: 'MacBook', description: '512GB - Space Black', stock: true, image: fallbackImg },

  // ==========================================
  // IMACS (Precio Ref. Lista + 13%)
  // ==========================================
  { id: 'imac-m3', name: 'iMac 24" M3', price: Math.ceil(1290 * 1.13), category: 'MacBook', description: '8-Core GPU, 256GB Green', stock: true, image: fallbackImg },
  
  // ==========================================
  // IPADS (Precio Ref. Lista + 13%)
  // ==========================================
  { id: 'ipad-9', name: 'iPad 9na Gen 64GB', price: Math.ceil(300 * 1.13), category: 'iPad', description: 'Space Gray', stock: true, image: fallbackImg },
  { id: 'ipad-10', name: 'iPad 10ma Gen 64GB', price: Math.ceil(390 * 1.13), category: 'iPad', description: 'Blue / Pink / Yellow', stock: true, image: fallbackImg },
  
  { id: 'ipad-air-m2-11', name: 'iPad Air 11" M2 64GB', price: Math.ceil(590 * 1.13), category: 'iPad', description: 'Blue / Purple', stock: true, image: fallbackImg },
  { id: 'ipad-air-m2-13', name: 'iPad Air 13" M2 128GB', price: Math.ceil(790 * 1.13), category: 'iPad', description: 'Starlight', stock: true, image: fallbackImg },

  { id: 'ipad-pro-m4-11', name: 'iPad Pro 11" M4 256GB', price: Math.ceil(990 * 1.13), category: 'iPad', description: 'Standard Glass', stock: true, image: fallbackImg },
  { id: 'ipad-pro-m4-13', name: 'iPad Pro 13" M4 256GB', price: Math.ceil(1290 * 1.13), category: 'iPad', description: 'Standard Glass', stock: true, image: fallbackImg },

  // ==========================================
  // APPLE WATCH (Precio Ref. Lista + 13%)
  // ==========================================
  { id: 'aw-se2-40', name: 'Apple Watch SE 2 40mm', price: Math.ceil(249 * 1.13), category: 'Watch', description: 'GPS - Starlight', stock: true, image: fallbackImg },
  { id: 'aw-se2-44', name: 'Apple Watch SE 2 44mm', price: Math.ceil(279 * 1.13), category: 'Watch', description: 'GPS - Midnight', stock: true, image: fallbackImg },
  
  { id: 'aw-s9-41', name: 'Apple Watch S9 41mm', price: Math.ceil(399 * 1.13), category: 'Watch', description: 'GPS - Varios Colores', stock: true, image: fallbackImg },
  { id: 'aw-s9-45', name: 'Apple Watch S9 45mm', price: Math.ceil(429 * 1.13), category: 'Watch', description: 'GPS - Varios Colores', stock: true, image: fallbackImg },
  
  { id: 'aw-u2', name: 'Apple Watch Ultra 2', price: Math.ceil(799 * 1.13), category: 'Watch', description: 'Titanium', stock: true, image: fallbackImg },

  // ==========================================
  // SAMSUNG
  // ==========================================
  { id: 'sam-a07', name: 'Samsung A07 64GB', price: 130, category: 'Samsung', description: 'Entry Level', stock: true, image: fallbackImg },
  { id: 'sam-a16', name: 'Samsung A16 128GB', price: 185, category: 'Samsung', description: 'Básico Potente', stock: true, image: fallbackImg },
  { id: 'sam-a17', name: 'Samsung A17 256GB', price: 280, category: 'Samsung', description: '5G', stock: true, image: fallbackImg },
  { id: 'sam-a26', name: 'Samsung A26 256GB', price: 280, category: 'Samsung', description: '5G', stock: true, image: fallbackImg },
  { id: 'sam-a36-128', name: 'Samsung A36 128GB', price: 320, category: 'Samsung', description: 'Mid Range', stock: true, image: fallbackImg },
  { id: 'sam-a36-256', name: 'Samsung A36 256GB', price: 350, category: 'Samsung', description: 'Mid Range+', stock: true, image: fallbackImg },
  { id: 'sam-a56-128', name: 'Samsung A56 128GB', price: 420, category: 'Samsung', description: 'Premium Mid', stock: true, image: fallbackImg },
  { id: 'sam-a56-256', name: 'Samsung A56 256GB', price: 430, category: 'Samsung', description: 'Premium Mid+', stock: true, image: fallbackImg },
  { id: 'sam-s25', name: 'Samsung S25 256GB', price: 740, category: 'Samsung', description: 'Flagship Compact', stock: true, image: fallbackImg },
  { id: 'sam-s25fe', name: 'Samsung S25 FE 256GB', price: 700, category: 'Samsung', description: 'Fan Edition', stock: true, image: fallbackImg },
  { id: 'sam-s25p-256', name: 'Samsung S25+ 256GB', price: 870, category: 'Samsung', description: 'Plus Size', stock: true, image: fallbackImg },
  { id: 'sam-s25p-512', name: 'Samsung S25+ 512GB', price: 910, category: 'Samsung', description: 'Plus Size Max', stock: true, image: fallbackImg },
  { id: 'sam-s25u-256', name: 'Samsung S25 Ultra 256GB', price: 1050, category: 'Samsung', description: 'S-Pen Titanio', stock: true, image: fallbackImg },
  { id: 'sam-s25u-512', name: 'Samsung S25 Ultra 512GB', price: 1140, category: 'Samsung', description: 'S-Pen Titanio', stock: true, image: fallbackImg },
  { id: 'sam-s25u-1tb', name: 'Samsung S25 Ultra 1TB', price: 1290, category: 'Samsung', description: 'S-Pen Titanio', stock: true, image: fallbackImg },

  // ==========================================
  // XIAOMI
  // ==========================================
  { id: 'xiao-rn13', name: 'Xiaomi Redmi Note 13 256GB', price: 230, category: 'Xiaomi', description: '108MP Camera', stock: true, image: fallbackImg },
  { id: 'xiao-rn13p', name: 'Xiaomi Redmi Note 13 Pro', price: 320, category: 'Xiaomi', description: '200MP OIS', stock: true, image: fallbackImg },
  { id: 'xiao-rn13p-plus', name: 'Xiaomi Redmi Note 13 Pro+', price: 450, category: 'Xiaomi', description: 'Curved Screen, IP68', stock: true, image: fallbackImg },
  { id: 'xiao-poco-x6', name: 'Xiaomi Poco X6 256GB', price: 320, category: 'Xiaomi', description: 'Snapdragon 7s Gen 2', stock: true, image: fallbackImg },
  { id: 'xiao-poco-x6p', name: 'Xiaomi Poco X6 Pro 512GB', price: 395, category: 'Xiaomi', description: 'Dimensity 8300 Ultra', stock: true, image: fallbackImg },

  // ==========================================
  // GAMING
  // ==========================================
  { id: 'ps5-dig-noj', name: 'PS5 Digital (Sin Juegos)', price: 540, category: 'Gaming', description: 'Sony PlayStation 5 Slim', stock: true, image: getImg('ps5_digital__sin_juegos_.webp') },
  { id: 'ps5-dig-j', name: 'PS5 Digital (Con Juegos)', price: 560, category: 'Gaming', description: 'Returnal + Ratchet Clank', stock: true, image: getImg('ps5_digital__con_juegos_.webp') },
  { id: 'ps5-fis-j1', name: 'PS5 Física (Con Juegos 1)', price: 620, category: 'Gaming', description: 'Returnal + Ratchet Clank', stock: true, image: getImg('ps5_f_sica__con_juegos_.webp') },
  { id: 'ps5-fis-j2', name: 'PS5 Física (Con Juegos 2)', price: 660, category: 'Gaming', description: 'Gran Turismo 7 + Astrobot', stock: true, image: getImg('ps5_f_sica__con_juegos_.webp') },
  { id: 'ps5-pro', name: 'PS5 Pro Digital 2TB', price: 895, category: 'Gaming', description: 'La más potente', stock: true, image: getImg('ps5_pro_digital_2tb__sin_juego_.webp') },
  { id: 'sw2', name: 'Nintendo Switch 2', price: 670, category: 'Gaming', description: 'Nueva Generación', stock: true, image: getImg('nintendo_switch_2.webp') },
  { id: 'sw2-mk', name: 'Nintendo Switch 2 + Mario Kart', price: 690, category: 'Gaming', description: 'Bundle Mario Kart', stock: true, image: getImg('nintendo_switch_2___juego_mario_kart.webp') },
  { id: 'xbox-x', name: 'Xbox Series X 1TB', price: 850, category: 'Gaming', description: 'Microsoft 4K', stock: true, image: getImg('xbox_x_1tb.webp') },
  { id: 'xbox-s-1tb', name: 'Xbox Series S 1TB', price: 660, category: 'Gaming', description: 'Carbon Black', stock: true, image: getImg('xbox_s_1tb.webp') },
  { id: 'xbox-s-512', name: 'Xbox Series S 512GB', price: 560, category: 'Gaming', description: 'Robot White', stock: true, image: fallbackImg },
  { id: 'mq3s-128', name: 'Meta Quest 3S 128GB', price: 495, category: 'Gaming', description: 'VR Accesible', stock: true, image: getImg('ps5_vr2___horizon.webp') },
  { id: 'mq3s-256', name: 'Meta Quest 3S 256GB', price: 560, category: 'Gaming', description: 'Mayor capacidad', stock: true, image: getImg('ps5_vr2___horizon.webp') },
  { id: 'mq3-512', name: 'Meta Quest 3 512GB', price: 750, category: 'Gaming', description: 'Mixed Reality Pro', stock: true, image: getImg('ps5_vr2___horizon.webp') },

  // Juegos
  { id: 'gm-cod', name: 'Call of Duty: Black Ops 6', price: 50, category: 'Gaming', description: 'Primaria PS5', stock: true, image: fallbackImg },
  { id: 'gm-gta', name: 'GTA V', price: 45, category: 'Gaming', description: 'Primaria PS5', stock: true, image: fallbackImg },
  { id: 'gm-f1', name: 'F1 24', price: 45, category: 'Gaming', description: 'Primaria PS5', stock: true, image: fallbackImg },
  { id: 'gm-rdr2', name: 'Red Dead Redemption 2', price: 40, category: 'Gaming', description: 'Primaria PS4/PS5', stock: true, image: fallbackImg },
  { id: 'gm-tlou', name: 'The Last of Us Remastered', price: 25, category: 'Gaming', description: 'Primaria PS4/PS5', stock: true, image: fallbackImg },
  { id: 'gm-mc', name: 'Minecraft', price: 30, category: 'Gaming', description: 'Primaria PS5', stock: true, image: fallbackImg },
  { id: 'gm-db', name: 'Dragon Ball Sparking! Zero', price: 60, category: 'Gaming', description: 'Primaria PS5', stock: true, image: fallbackImg },
  { id: 'gm-nba', name: 'NBA 2K25', price: 50, category: 'Gaming', description: 'Primaria PS5', stock: true, image: fallbackImg },

  // ==========================================
  // NOTEBOOKS / LAPTOPS (Precio Ref + 13%)
  // ==========================================
  { id: 'lap-asus-zen', name: 'Asus Zenbook 14 OLED', price: Math.ceil(960 * 1.13), category: 'Laptops', description: 'i5 / 8GB / 512GB', stock: true, image: fallbackImg },
  { id: 'lap-hp-pav', name: 'HP Pavilion 15', price: Math.ceil(790 * 1.13), category: 'Laptops', description: 'Ryzen 5 / 16GB / 512GB', stock: true, image: fallbackImg },

  // ==========================================
  // LENTES (Precio Ref + 13%)
  // ==========================================
  { id: 'lens-canon-50', name: 'Canon EF 50mm f/1.8', price: Math.ceil(170 * 1.13), category: 'Accesorios', description: 'STM Lens', stock: true, image: fallbackImg },
  { id: 'lens-sony-85', name: 'Sony FE 85mm f/1.8', price: Math.ceil(620 * 1.13), category: 'Accesorios', description: 'Portrait Lens', stock: true, image: fallbackImg },

  // ==========================================
  // AUDIO & OTROS ACCESORIOS (Precio Ref + 13%)
  // ==========================================
  { id: 'dji-mini-3', name: 'DJI Mini 3', price: Math.ceil(510 * 1.13), category: 'Accesorios', description: 'Drone con control RC-N1', stock: true, image: fallbackImg },
  { id: 'dji-mini-3-fly', name: 'DJI Mini 3 Fly More', price: Math.ceil(735 * 1.13), category: 'Accesorios', description: 'Combo 3 Baterías', stock: true, image: fallbackImg },
  
  { id: 'dual-sense', name: 'Joystick Dual Sense', price: 100, category: 'Accesorios', description: 'Original PS5', stock: true, image: getImg('joystick_dual_sense.webp') },
  { id: 'g29', name: 'Volante Logitech G29', price: 360, category: 'Accesorios', description: 'PC/PS', stock: true, image: getImg('volante_logitech_g29.webp') },
  { id: 'vr2', name: 'PS5 VR2 + Horizon', price: 630, category: 'Accesorios', description: 'Realidad Virtual PS5', stock: true, image: getImg('ps5_vr2___horizon.webp') },

  { id: 'ap4', name: 'AirPods 4', price: Math.ceil(170 * 1.13), category: 'Accesorios', description: 'Sin cancelación', stock: true, image: fallbackImg },
  { id: 'ap4-anc', name: 'AirPods 4 ANC', price: Math.ceil(220 * 1.13), category: 'Accesorios', description: 'Con cancelación activa', stock: true, image: fallbackImg },
  { id: 'app2', name: 'AirPods Pro 2 USB-C', price: Math.ceil(230 * 1.13), category: 'Accesorios', description: 'USB-C MagSafe', stock: true, image: fallbackImg },
  { id: 'app3', name: 'AirPods Pro 3', price: Math.ceil(300 * 1.13), category: 'Accesorios', description: 'Nuevo modelo', stock: true, image: fallbackImg },

  { id: 'jbl-go4', name: 'JBL GO 4', price: 50, category: 'Accesorios', description: 'Portable', stock: true, image: getJblImg('jbl_go4.jpg') },
  { id: 'jbl-flip7', name: 'JBL FLIP 7', price: 140, category: 'Accesorios', description: 'Waterproof', stock: true, image: getJblImg('jbl_flip_7.jpg') },
  { id: 'jbl-ch6', name: 'JBL CHARGE 6', price: 200, category: 'Accesorios', description: 'Powerbank', stock: true, image: getJblImg('jbl_charge_6.jpg') },
  { id: 'jbl-bb4', name: 'JBL BOOMBOX 4', price: 600, category: 'Accesorios', description: 'Massive Sound', stock: true, image: fallbackImg },
  { id: 'jbl-pb710', name: 'JBL PARTYBOX 710', price: 800, category: 'Accesorios', description: 'Fiesta Total', stock: true, image: getJblImg('jbl_partybox_710.jpg') },
  { id: 'jbl-tour', name: 'JBL Tour Pro 2', price: 190, category: 'Accesorios', description: 'Smart Case', stock: true, image: getJblImg('jbl_tour_pro_2.jpg') },
  { id: 'jbl-520', name: 'JBL TUNE 520BT', price: 65, category: 'Accesorios', description: 'Purple, Black', stock: true, image: getJblImg('jbl_tune_520bt.jpg') },
];