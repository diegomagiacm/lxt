import { Product } from '../../types';
import { fallbackImg } from '../../constants';

// Robust CSV Line Parser
export const parseCSVLine = (line: string): string[] => {
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

export const fetchProductsFromSheet = async (sheetId: string, gid: string = '0', isUsed: boolean = false): Promise<Product[]> => {
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
    
    const response = await fetch(csvUrl);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/^"|"$/g, '').trim());
    const products: Product[] = [];

    const getIdx = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k)));

    // Common columns
    const idxId = getIdx(['id', 'codigo', 'sku']); // Optional for new products
    const idxModel = getIdx(['modelo', 'equipo', 'nombre', 'producto']);
    const idxPrice = getIdx(['precio', 'valor', 'usd', 'precio usd']);
    const idxCategory = getIdx(['categoria', 'category', 'tipo']);
    const idxDescription = getIdx(['descripcion', 'descripción', 'detalle']);
    const idxImage = getIdx(['imagen', 'image', 'img', 'foto']);
    const idxStock = getIdx(['stock', 'disponible']);
    
    // Used specific columns
    const idxBattery = getIdx(['bateria', 'batería', 'bat', '%']);
    const idxCondition = getIdx(['condicion', 'condición']);
    const idxStatus = getIdx(['estado', 'disponibilidad', 'status']);
    const idxColor = getIdx(['color']);
    const idxStorage = getIdx(['capacidad', 'memoria', 'gb', 'almacenamiento']);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const cols = parseCSVLine(line);
      const getValue = (idx: number) => (idx >= 0 && idx < cols.length) ? cols[idx].replace(/^"|"$/g, '') : '';

      // Availability Check - DISABLED to show all products
      /*
      if (isUsed && idxStatus > -1) {
        const statusVal = getValue(idxStatus).toLowerCase();
        if (!statusVal.includes('disponible')) continue; 
      } else if (!isUsed && idxStock > -1) {
         const stockVal = getValue(idxStock).toLowerCase();
         if (stockVal === 'no' || stockVal === 'false' || stockVal === '0') continue;
      }
      */

      const rawName = getValue(idxModel);
      if (!rawName) continue;

      const priceStr = getValue(idxPrice);
      const priceClean = priceStr.replace(/[^\d.]/g, '');
      let price = parseFloat(priceClean) || 0;

      if (price <= 0 && !priceStr.includes('Consultar')) continue;

      if (isUsed) {
        price += 50; // Rule for used products
      }

      const image = getValue(idxImage) || fallbackImg;
      const category = getValue(idxCategory) || (isUsed ? 'Usados' : 'Varios');
      
      let finalName = rawName;
      let description = getValue(idxDescription);
      let id = getValue(idxId);

      // Specific logic for Used Products
      if (isUsed) {
        const battery = getValue(idxBattery);
        const condition = getValue(idxCondition);
        const color = getValue(idxColor);
        const details = getValue(idxDescription); // In used logic, description comes from details
        const storage = getValue(idxStorage);

        const modelClean = rawName.replace(/^iphone\s+/i, '').trim();
        const storageSuffix = storage.toLowerCase().includes('gb') ? storage : `${storage}Gb`;
        finalName = `iPhone ${modelClean} ${storageSuffix}`.trim();

        let descParts = [];
        if (condition) descParts.push(condition);
        if (details) descParts.push(details);
        description = descParts.length > 0 ? descParts.join(' - ') : 'Usado Seleccionado';

        // ID generation for used products
        id = `used-${i}-${rawName.replace(/\s+/g, '-').toLowerCase()}`;
        
        products.push({
          id,
          name: finalName,
          price,
          category: 'Usados',
          description,
          stock: true,
          image, 
          batteryHealth: battery ? (battery.includes('%') ? battery : `${battery}%`) : undefined,
          warranty: '1 Mes', 
          condition,
          colors: color ? [color] : []
        });
      } else {
        // Logic for New Products
        if (!id) {
            id = `new-${i}-${rawName.replace(/\s+/g, '-').toLowerCase()}`;
        }
        
        // If description is empty, try to generate one or leave empty
        if (!description) description = '';

        products.push({
          id,
          name: finalName,
          price,
          category,
          description,
          stock: true,
          image,
          colors: [] // Could parse colors if needed
        });
      }
    }
    return products;
  } catch (error) {
    console.error("Error loading spreadsheet:", error);
    return [];
  }
};
