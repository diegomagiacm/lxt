import { GOOGLE_SCRIPT_URL, BRANCHES, USED_PRODUCTS_SHEET_ID, fallbackImg } from '../../constants';
import { CartItem, PaymentMethod, Product } from '../../types';

interface SaleData {
  name: string;
  phone: string;
  branch: string;
  paymentMethod: PaymentMethod;
  date: string;
  time: string;
  cart: CartItem[];
  totalUsd: number;
  dolarRate: number;
  finalPrice: { value: number, currency: string };
}

// Robust CSV Line Parser
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; 
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

export const getUsedProducts = async (): Promise<Product[]> => {
  try {
    const sheetId = USED_PRODUCTS_SHEET_ID;
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=0`;
    
    const response = await fetch(csvUrl);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/^"|"$/g, '').trim());
    const usedProducts: Product[] = [];

    const getIdx = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k)));

    const idxModel = getIdx(['modelo', 'equipo', 'nombre', 'producto']);
    const idxPrice = getIdx(['precio', 'valor', 'usd', 'precio usd']);
    const idxBattery = getIdx(['bateria', 'batería', 'bat', '%']);
    const idxCondition = getIdx(['condicion', 'condición']);
    const idxStatus = getIdx(['estado', 'disponibilidad', 'status']);
    const idxColor = getIdx(['color']);
    const idxDetails = getIdx(['detalle', 'detalles', 'obs', 'notas']);
    const idxStorage = getIdx(['capacidad', 'memoria', 'gb', 'almacenamiento']);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const cols = parseCSVLine(line);
      const getValue = (idx: number) => (idx >= 0 && idx < cols.length) ? cols[idx].replace(/^"|"$/g, '') : '';

      if (idxStatus > -1) {
        const statusVal = getValue(idxStatus).toLowerCase();
        if (!statusVal.includes('disponible')) continue; 
      }

      const rawName = getValue(idxModel);
      if (!rawName) continue;

      const priceStr = getValue(idxPrice);
      const priceClean = priceStr.replace(/[^\d.]/g, '');
      let price = parseFloat(priceClean) || 0;

      if (price <= 0 && !priceStr.includes('Consultar')) continue;

      price += 50; // Rule: Add 50

      const battery = getValue(idxBattery);
      const condition = getValue(idxCondition);
      const color = getValue(idxColor);
      const details = getValue(idxDetails);
      const storage = getValue(idxStorage);

      const modelClean = rawName.replace(/^iphone\s+/i, '').trim();
      const storageSuffix = storage.toLowerCase().includes('gb') ? storage : `${storage}Gb`;
      const finalName = `iPhone ${modelClean} ${storageSuffix}`.trim();

      let descParts = [];
      if (condition) descParts.push(condition);
      if (details) descParts.push(details);
      const desc = descParts.length > 0 ? descParts.join(' - ') : 'Usado Seleccionado';

      usedProducts.push({
        id: `used-${i}-${rawName.replace(/\s+/g, '-').toLowerCase()}`,
        name: finalName,
        price: price,
        category: 'Usados',
        description: desc,
        stock: true,
        image: fallbackImg, 
        batteryHealth: battery ? (battery.includes('%') ? battery : `${battery}%`) : undefined,
        warranty: '1 Mes', 
        condition: condition,
        colors: color ? [color] : []
      });
    }
    return usedProducts;
  } catch (error) {
    console.error("Error loading spreadsheet:", error);
    return [];
  }
};

export const sendSaleToGoogleScript = async (data: SaleData) => {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PEGAR_TU_URL")) {
    throw new Error("Error de Configuración: Falta configurar el Google Apps Script.");
  }

  // Generate Product Summary for Title
  const productSummary = data.cart.map(c => c.name).join(', ');
  
  // Title: NOMBRE - EQUIPOS
  const title = `${data.name} - ${productSummary}`;
  
  const productList = data.cart.map(c => `• ${c.quantity}x ${c.name}`).join('\n');
  const branchInfo = BRANCHES.find(b => b.name === data.branch);

  // Color Logic: Belgrano = Red (11), Others = Blue (9)
  const colorId = data.branch === 'Belgrano' ? '11' : '9';
  
  // Identify Used Items to Update Status
  const usedItemsRows = data.cart
    .filter(item => item.id.startsWith('used-'))
    .map(item => {
      const parts = item.id.split('-');
      const i = parseInt(parts[1], 10);
      return i + 1;
    });

  const description = `
CLIENTE: ${data.name}
TELÉFONO: ${data.phone}
------------------
PEDIDO:
${productList}
------------------
PAGO: ${data.paymentMethod}
TOTAL APROX: ${data.finalPrice.currency} ${Math.ceil(data.finalPrice.value).toLocaleString()}
(Cotiz Ref: $${data.dolarRate})
  `.trim();

  // Create Start and End times
  const startDateTime = new Date(`${data.date}T${data.time}`).toISOString();
  // Default 1 hour duration
  const endDateTime = new Date(new Date(`${data.date}T${data.time}`).getTime() + 60 * 60 * 1000).toISOString();

  const payload = {
    title,
    description,
    location: branchInfo?.address || 'Locos x la Tecnología',
    startTime: startDateTime,
    endTime: endDateTime,
    colorId: colorId,
    usedRowsToUpdate: usedItemsRows
  };

  await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });
};

export const calculateFinalPrice = (totalUsd: number, paymentMethod: PaymentMethod, dolarRate: number) => {
  const rate = dolarRate || 1200;
  const baseArs = totalUsd * rate;

  switch (paymentMethod) {
    case PaymentMethod.CASH_USD:
    case PaymentMethod.USDT:
      return { value: totalUsd, currency: 'USD' };
    case PaymentMethod.CASH_ARS:
      return { value: baseArs, currency: 'ARS' };
    case PaymentMethod.TRANSFER:
      return { value: baseArs * 1.05, currency: 'ARS' };
    case PaymentMethod.CREDIT_1:
      return { value: baseArs * 1.19, currency: 'ARS' };
    case PaymentMethod.CREDIT_3:
      return { value: baseArs * 1.45, currency: 'ARS' };
    case PaymentMethod.CREDIT_6:
      return { value: baseArs * 1.70, currency: 'ARS' };
    case PaymentMethod.CREDIT_9:
      return { value: baseArs * 1.85, currency: 'ARS' };
    case PaymentMethod.CREDIT_12:
      return { value: baseArs * 2.10, currency: 'ARS' };
    default:
      return { value: totalUsd, currency: 'USD' };
  }
};
