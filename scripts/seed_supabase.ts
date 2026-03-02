import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_FILE = path.resolve(__dirname, '../products.json');
const USER_PRODUCTS_FILE = path.resolve(__dirname, '../user_products.txt');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const existingProducts = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
const userProductsText = fs.readFileSync(USER_PRODUCTS_FILE, 'utf-8');

const lines = userProductsText.split('\n');
let currentCategory = '';
const newProducts: any[] = [];

function findPrice(name: string, category: string) {
    const match = existingProducts.find((p: any) => 
        p.category === category && 
        name.toLowerCase().includes(p.name.toLowerCase().split('GB')[0].trim().toLowerCase())
    );
    return match ? match.price : 0;
}

function findImage(name: string, category: string) {
    const match = existingProducts.find((p: any) => 
        p.category === category && 
        name.toLowerCase().includes(p.name.toLowerCase().split('GB')[0].trim().toLowerCase())
    );
    return match ? match.image : 'https://jecxqmertgnogjetodao.supabase.co/storage/v1/object/public/LXT2/lxtlogo.png';
}

for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    const lowerLine = line.toLowerCase();
    if (lowerLine === 'iphone' || lowerLine === 'samsung' || lowerLine === 'xiaomi' || lowerLine === 'gaming' || lowerLine === 'nintendo' || lowerLine === 'xbox' || lowerLine === 'meta quest' || lowerLine === 'accesorios') {
        currentCategory = line.charAt(0).toUpperCase() + line.slice(1).toLowerCase();
        if (currentCategory === 'Iphone') currentCategory = 'iPhone';
        if (currentCategory === 'Meta quest') currentCategory = 'Gaming'; // Group Meta Quest in Gaming
        continue;
    }

    const cleanName = line.replace(/🕹️/g, '').trim();
    
    let name = '';
    if (currentCategory === 'iPhone' && !cleanName.toLowerCase().startsWith('iphone')) {
        name = `iPhone ${cleanName}`;
    } else if (currentCategory === 'Samsung' && !cleanName.toLowerCase().startsWith('samsung') && !cleanName.toLowerCase().startsWith('galaxy')) {
        name = `Samsung ${cleanName}`;
    } else if (currentCategory === 'Xiaomi' && !cleanName.toLowerCase().startsWith('xi')) {
        name = `Xiaomi ${cleanName}`;
    } else {
        name = cleanName;
    }

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const price = findPrice(name, currentCategory);
    const image = findImage(name, currentCategory);

    newProducts.push({
        id,
        name,
        price: price || 0,
        category: currentCategory,
        description: `${name} - Nuevo ingreso. Incluye: Funda, Glass, Cargador y Auriculares de regalo!`,
        stock: true,
        image
    });
}

// Add existing products that are not in the new list
existingProducts.forEach((p: any) => {
    if (!newProducts.some(np => np.id === p.id)) {
        newProducts.push(p);
    }
});

async function seed() {
  console.log(`Seeding ${newProducts.length} products to Supabase...`);
  
  const { error } = await supabase.from('products').upsert(newProducts);
  
  if (error) {
    console.error('Error seeding products:', error);
  } else {
    console.log('Successfully seeded products to Supabase!');
  }
}

seed();
