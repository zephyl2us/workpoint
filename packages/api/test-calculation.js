'use strict'

console.log('🧪 Testing Floating Point Precision Fix\n')

// Test cases
const testCases = [
  { price: '78560.01000000', volume: '33.22921000', round: 169 },
  { price: '78414.20000000', volume: '25.74182000', round: 167 },
  { price: '78219.85000000', volume: '95.94979000', round: 1 },
  { price: '0.82800000', volume: '7368294.00000000', round: 'ADA' },
]

console.log('📊 Testing Math.floor() vs Math.round():\n')

testCases.forEach((test) => {
  const price = parseFloat(test.price)
  const volume = parseFloat(test.volume)
  
  console.log(`🔹 Test: ${test.price} (Round ${test.round})`)
  console.log(`   Raw calculation: ${price} × 100 = ${price * 100}`)
  
  // เก่า: Math.floor()
  const oldInt = Math.floor(price * 100)
  const oldResult = (oldInt % 1000).toString().padStart(3, '0')
  
  // ใหม่: Math.round()
  const newInt = Math.round(price * 100)
  const newResult = (newInt % 1000).toString().padStart(3, '0')
  
  console.log(`   Math.floor(${price * 100}): ${oldInt} → 3ตัวบน: "${oldResult}"`)
  console.log(`   Math.round(${price * 100}): ${newInt} → 3ตัวบน: "${newResult}"`)
  
  if (oldResult !== newResult) {
    console.log(`   ⚠️  DIFFERENT! "${oldResult}" → "${newResult}"`)
  } else {
    console.log(`   ✅ Same result`)
  }
  console.log('')
  
  // Volume test
  console.log(`   Volume: ${volume} × 1000 = ${volume * 1000}`)
  const oldVolInt = Math.floor(volume * 1000)
  const newVolInt = Math.round(volume * 1000)
  const oldVolResult = (oldVolInt % 100).toString().padStart(2, '0')
  const newVolResult = (newVolInt % 100).toString().padStart(2, '0')
  
  console.log(`   Math.floor(${volume * 1000}): ${oldVolInt} → 2ตัวล่าง: "${oldVolResult}"`)
  console.log(`   Math.round(${volume * 1000}): ${newVolInt} → 2ตัวล่าง: "${newVolResult}"`)
  
  if (oldVolResult !== newVolResult) {
    console.log(`   ⚠️  DIFFERENT! "${oldVolResult}" → "${newVolResult}"`)
  } else {
    console.log(`   ✅ Same result`)
  }
  console.log('\n' + '='.repeat(70) + '\n')
})

console.log('✅ Testing completed!')
