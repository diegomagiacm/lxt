export const PAYMENT_METHODS = {
  CASH: 'cash',
  CASH_ARS: 'cash_ars',
  TRANSFER_ARS: 'transfer_ars',
  TRANSFER_USD: 'transfer_usd',
  USDT: 'usdt',
  CARD: 'card'
} as const

export const CARD_INSTALLMENTS = [
  { quotes: 1, surcharge: 1.19 },
  { quotes: 3, surcharge: 1.45 },
  { quotes: 6, surcharge: 1.70 },
  { quotes: 9, surcharge: 1.85 },
  { quotes: 12, surcharge: 2.10 }
]

export const calculateTotal = (subtotalUSD: number, method: string, rate: number, installments: number = 1) => {
  let baseUSD = subtotalUSD

  if (method === PAYMENT_METHODS.TRANSFER_USD) baseUSD *= 1.05
  if (method === PAYMENT_METHODS.TRANSFER_ARS) baseUSD *= 1.05
  
  if (method === PAYMENT_METHODS.CARD) {
    const config = CARD_INSTALLMENTS.find(c => c.quotes === installments)
    baseUSD *= (config?.surcharge || 1.19)
  }

  const finalUSD = Math.round(baseUSD)
  const isARS = method === PAYMENT_METHODS.TRANSFER_ARS || method === PAYMENT_METHODS.CARD || method === PAYMENT_METHODS.CASH_ARS
  
  return {
    usd: finalUSD,
    ars: isARS ? Math.round(finalUSD * rate) : null,
    isARS
  }
}
