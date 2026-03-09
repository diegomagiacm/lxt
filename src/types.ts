export interface Product {
  id: string
  model: string
  storage: number
  color: string
  price_usd: number
  categoria?: string | null
  marca?: string | null
  image_url?: string | null
  created_at: string
}

export interface CartItem extends Product {
  quantity: number
}

export interface Warehouse {
  id: string
  name: string
}

export interface StockItem {
  id: string
  product_id: string
  warehouse_id: string
  quantity: number
  products?: {
    model: string
    storage: number
    color: string
    marca: string
    categoria: string
  }
  warehouses?: {
    name: string
  }
}
