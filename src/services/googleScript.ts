import { GOOGLE_SCRIPT_URL, BRANCHES, USED_PRODUCTS_SHEET_ID, USED_PRODUCTS_SHEET_GID } from '../../constants';
import { CartItem, PaymentMethod, Product } from '../../types';
import { fetchProductsFromSheet } from './sheet';

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

export const getUsedProducts = async (): Promise<Product[]> => {
  return fetchProductsFromSheet(USED_PRODUCTS_SHEET_ID, USED_PRODUCTS_SHEET_GID, true);
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
