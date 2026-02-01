'use strict'

console.log('🧪 Testing String-Based Calculation (New Method)\n')

// Test cases
const testCases = [
  { price: '78560.01000000', volume: '33.22921000', round: 169 },
  { price: '78414.20000000', volume: '25.74182000', round: 167 },
  { price: '78219.85000000', volume: '95.94979000', round: 1 },
  { price: '0.82800000', volume: '7368294.00000000', round: 'ADA' },
]

console.log('📊 String-Based vs Float-Based Calculation:\n')

testCases.forEach((test) => {
  console.log(`🔹 Test Round ${test.round}: Price="${test.price}", Volume="${test.volume}"`)
  console.log('')
  
  // ===== CLOSE PRICE =====
  // วิธีเก่า (Float)
  const oldCloseFloat = parseFloat(test.price)
  const oldCloseInt = Math.floor(oldCloseFloat * 100)
  const oldThreeTop = (oldCloseInt % 1000).toString().padStart(3, '0')
  
  // วิธีใหม่ (String)
  const [closePriceIntPart, closePriceDecPart] = test.price.split('.')
  const closePriceDecPadded = (closePriceDecPart || '').padEnd(2, '0').substring(0, 2)
  const newCloseInt = parseInt(closePriceIntPart + closePriceDecPadded)
  const newThreeTop = (newCloseInt % 1000).toString().padStart(3, '0')
  
  console.log(`   💰 Close Price: "${test.price}"`)
  console.log(`      OLD (Float):  ${oldCloseFloat} × 100 = ${oldCloseFloat * 100} → floor = ${oldCloseInt} → 3ตัวบน: "${oldThreeTop}"`)
  console.log(`      NEW (String): "${closePriceIntPart}" + "${closePriceDecPadded}" = ${newCloseInt} → 3ตัวบน: "${newThreeTop}"`)
  
  if (oldThreeTop !== newThreeTop) {
    console.log(`      ⚠️  FIXED! "${oldThreeTop}" → "${newThreeTop}"`)
  } else {
    console.log(`      ✅ Same result`)
  }
  console.log('')
  
  // ===== VOLUME =====
  // วิธีเก่า (Float)
  const oldVolFloat = parseFloat(test.volume)
  const oldVolInt = Math.floor(oldVolFloat * 1000)
  const oldTwoUnder = (oldVolInt % 100).toString().padStart(2, '0')
  
  // วิธีใหม่ (String)
  const [volumeIntPart, volumeDecPart] = test.volume.split('.')
  const volumeDecPadded = (volumeDecPart || '').padEnd(3, '0').substring(0, 3)
  const newVolInt = parseInt(volumeIntPart + volumeDecPadded)
  const newTwoUnder = (newVolInt % 100).toString().padStart(2, '0')
  
  console.log(`   📦 Volume: "${test.volume}"`)
  console.log(`      OLD (Float):  ${oldVolFloat} × 1000 = ${oldVolFloat * 1000} → floor = ${oldVolInt} → 2ตัวล่าง: "${oldTwoUnder}"`)
  console.log(`      NEW (String): "${volumeIntPart}" + "${volumeDecPadded}" = ${newVolInt} → 2ตัวล่าง: "${newTwoUnder}"`)
  
  if (oldTwoUnder !== newTwoUnder) {
    console.log(`      ⚠️  FIXED! "${oldTwoUnder}" → "${newTwoUnder}"`)
  } else {
    console.log(`      ✅ Same result`)
  }
  
  console.log('')
  console.log(`   🎯 FINAL: ${newThreeTop}/${newTwoUnder}`)
  console.log('\n' + '='.repeat(70) + '\n')
})

console.log('✅ Testing completed!')
