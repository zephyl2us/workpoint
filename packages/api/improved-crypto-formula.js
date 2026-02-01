// ตัวอย่าง Formula ที่ดีกว่า สำหรับแต่ละเหรียญ

const formulas = {
  // BTC, ETH, SOL: ราคาสูง ใช้ทศนิยม 2 ตำแหน่ง (เหมือนเดิม) ✅
  BTC: { closeMultiplier: 1000, volumeMultiplier: 1000, decimals: 3 },
  ETH: { closeMultiplier: 1000, volumeMultiplier: 1000, decimals: 3 },
  SOL: { closeMultiplier: 1000, volumeMultiplier: 1000, decimals: 3 },
  
  // AVAX: ราคา $10 ใช้ทศนิยม 3 ตำแหน่ง
  AVAX: { closeMultiplier: 10000, volumeMultiplier: 10000, decimals: 4 },
  
  // DOT: ราคา $1.5 ใช้ทศนิยม 4 ตำแหน่ง
  DOT: { closeMultiplier: 100000, volumeMultiplier: 10000, decimals: 5 },
  
  // ADA: ราคา $0.29 ใช้ทศนิยม 5 ตำแหน่ง
  ADA: { closeMultiplier: 1000000, volumeMultiplier: 100000, decimals: 6 },
}

function convertPriceToResult(closePrice, volume, symbol) {
  const coinSymbol = symbol.replace('USDT', '')
  const config = formulas[coinSymbol] || formulas.BTC
  
  // Close Price
  const [closePriceIntPart, closePriceDecPart] = closePrice.split('.')
  const closePriceDecPadded = (closePriceDecPart || '').padEnd(config.decimals, '0').substring(0, config.decimals)
  const closePriceStr = closePriceIntPart + closePriceDecPadded
  
  // 3 ตัวบน และ 2 ตัวบน
  const three_top = closePriceStr.slice(-4, -1).padStart(3, '0')
  const two_top = closePriceStr.slice(-3, -1).padStart(2, '0')
  
  // Volume
  const [volumeIntPart, volumeDecPart] = volume.split('.')
  const volumeDecPadded = (volumeDecPart || '').padEnd(config.decimals, '0').substring(0, config.decimals)
  const volumeStr = volumeIntPart + volumeDecPadded
  
  // 2 ตัวล่าง
  const two_under = volumeStr.slice(-2).padStart(2, '0')
  
  return {
    three_top,
    two_top,
    two_under,
    raw_close_price: closePrice,
    raw_volume: volume,
    symbol: symbol
  }
}

// ===== ตัวอย่างการใช้งาน =====

console.log('🧪 Testing Improved Formula\n')

const testData = [
  { coin: 'BTC', price: '78560.01', volume: '33.22921' },
  { coin: 'ETH', price: '2421.49', volume: '1120.24620' },
  { coin: 'ADA', price: '0.28890', volume: '540996.90' },
  { coin: 'SOL', price: '104.11', volume: '15526.73600' },
  { coin: 'DOT', price: '1.52400', volume: '5702.81' },
  { coin: 'AVAX', price: '9.97', volume: '7006.93' },
]

testData.forEach(({ coin, price, volume }) => {
  const result = convertPriceToResult(price, volume, `${coin}USDT`)
  const config = formulas[coin]
  
  console.log(`\n${coin}:`)
  console.log(`  Price: $${price} (×${config.closeMultiplier} → ${config.decimals} decimals)`)
  console.log(`  Volume: ${volume} (×${config.volumeMultiplier})`)
  console.log(`  ✅ Result: ${result.three_top}/${result.two_under} (2บน: ${result.two_top})`)
})

console.log('\n\n💡 Summary:')
console.log('- BTC, ETH, SOL: ใช้ทศนิยม 3 ตำแหน่ง (เหมือนเดิม)')
console.log('- AVAX: ใช้ทศนิยม 4 ตำแหน่ง')
console.log('- DOT: ใช้ทศนิยม 5 ตำแหน่ง')
console.log('- ADA: ใช้ทศนิยม 6 ตำแหน่ง')
console.log('\nจะทำให้ทุกเหรียญมี entropy ที่ดี และคาดเดาได้ยาก!')
