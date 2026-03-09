export const getExchangeRate = async (): Promise<number> => {
  try {
    // Note: Due to CORS and server-side fetching in Vite, 
    // we use a proxy or a common API for blue rate if scraping fails.
    // For this environment, we'll try to fetch from an API or provide a robust fallback.
    const response = await fetch('https://dolarapi.com/v1/dolares/blue')
    const data = await response.json()
    // blue sale (venta) + 10 as requested
    return (data.venta || 1000) + 10 
  } catch (error) {
    console.error('Error fetching exchange rate:', error)
    return 1010 // Fallback
  }
}
