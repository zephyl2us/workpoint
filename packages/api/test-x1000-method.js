'use strict'

console.log('🧪 Testing x1000 Method (Option A)\n')

// Test cases จากข้อมูลจริง
const testCases = [
  { price: '78560.01000000', volume: '33.22921000', round: 169, desc: 'ปัญหาเดิม' },
  { price: '78414.20000000', volume: '25.74182000', round: 167 },
  { price: '78219.85000000', volume: '95.94979000', round: 1 },
  { price: '78337.50000000', volume: '90.55650000', round: 2 },
  { price: '78227.88000000', volume: '103.74281000', round: 3 },
]

console.log('📊 x1000 Method Results:\n')
console.log('='*80)

const uniqueResults = new Set()

testCases.forEach((test) => {
  console.log(`\n🔹 Round ${test.round}${test.desc ? ` (${test.desc})` : ''}:`)
  
  // Close Price × 1000
  const [closePriceIntPart, closePriceDecPart] = test.price.split('.')
  const closePriceDecPadded = (closePriceDecPart || '').padEnd(3, '0').substring(0, 3)
  const closePriceStr = closePriceIntPart + closePriceDecPadded
  
  // จิ้มเลือกหลักจาก string โดยตรง (ไม่ใช้การหารหรือ modulo)
  const three_top = closePriceStr.slice(-4, -1).padStart(3, '0')
  const two_top = closePriceStr.slice(-3, -1).padStart(2, '0')
  
  // Volume × 1000
  const [volumeIntPart, volumeDecPart] = test.volume.split('.')
  const volumeDecPadded = (volumeDecPart || '').padEnd(3, '0').substring(0, 3)
  const volumeStr = volumeIntPart + volumeDecPadded
  
  // จิ้มเลือกหลักจาก string โดยตรง
  const two_under = volumeStr.slice(-2).padStart(2, '0')
  
  console.log(`   Close Price: "${test.price}"`)
  console.log(`   → x1000 String: "${closePriceStr}"`)
  console.log(`   → จิ้มหลัก -4,-3,-2 (พัน,ร้อย,สิบ): "${closePriceStr}".slice(-4,-1) = "${three_top}"`)
  console.log(`   → จิ้มหลัก -3,-2 (ร้อย,สิบ): "${closePriceStr}".slice(-3,-1) = "${two_top}"`)
  console.log(``)
  console.log(`   Volume: "${test.volume}"`)
  console.log(`   → x1000 String: "${volumeStr}"`)
  console.log(`   → จิ้มหลัก -2,-1 (สิบ,หน่วย): "${volumeStr}".slice(-2) = "${two_under}"`)
  console.log(``)
  console.log(`   🎯 ผลลัพธ์: ${three_top}/${two_under} (2บน: ${two_top})`)
  
  uniqueResults.add(`${three_top}/${two_under}`)
})

console.log('\n' + '='.repeat(80))
console.log(`\n📈 สรุป:`)
console.log(`   จำนวนรอบทดสอบ: ${testCases.length}`)
console.log(`   Unique Results: ${uniqueResults.size}`)
console.log(`   ผลลัพธ์ที่ได้: ${Array.from(uniqueResults).join(', ')}`)

console.log(`\n⚠️  หมายเหตุ:`)
console.log(`   - BTC มีทศนิยม 2 ตำแหน่ง จาก Binance`)
console.log(`   - เมื่อ x1000 แล้วจิ้มเลือกหลักโดยตรงด้วย .slice()`)
console.log(`   - 3ตัวบน: slice(-4,-1) → หลักพัน, ร้อย, สิบ (ไม่รวมหลักหน่วย)`)
console.log(`   - 2ตัวบน: slice(-3,-1) → หลักร้อย, สิบ`)
console.log(`   - 2ตัวล่าง: slice(-2) → หลักสิบ, หน่วย`)
console.log(`   - ตัวอย่าง: "78560010".slice(-4,-1) = "001"`)

console.log('\n✅ Testing completed!')
