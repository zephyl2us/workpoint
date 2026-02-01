'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = use('App/Helper')
const BrowserRepository = make('App/Repositories/BrowserRepository')
const Decimal = require('decimal.js')

class ResultCryptoRepository {

  static get inject() {
    return []
  }

  constructor() {
    // Binance API endpoints
    this.binanceBaseUrl = 'https://api.binance.com'
    
    // กำหนด decimal precision สำหรับแต่ละเหรียญ
    // สูตรใหม่:
    // - 3 ตัวบน และ 2 ตัวบน: QuoteVolume ทศนิยม 3 ตำแหน่ง
    // - 2 ตัวล่าง: Close Price ทศนิยม 2 ตำแหน่ง
    this.coinConfigs = {
      BTCUSDT: { priceDecimals: 2, volumeDecimals: 3 },
      ETHUSDT: { priceDecimals: 2, volumeDecimals: 3 },
      SOLUSDT: { priceDecimals: 2, volumeDecimals: 3 },
      AVAXUSDT: { priceDecimals: 2, volumeDecimals: 3 },
      DOTUSDT: { priceDecimals: 2, volumeDecimals: 3 },
      ADAUSDT: { priceDecimals: 2, volumeDecimals: 3 },
      BNBUSDT: { priceDecimals: 2, volumeDecimals: 3 },
      XRPUSDT: { priceDecimals: 2, volumeDecimals: 3 },
      TRXUSDT: { priceDecimals: 2, volumeDecimals: 3 },
    }
  }

  /**
   * ดึงผลทั้งวัน (264 รอบ) จาก Binance
   * @param {string} symbol - BTCUSDT, ETHUSDT, etc.
   * @param {string} date - YYYY-MM-DD
   * @returns {Object} - { slug: [ { round: 1, three_top, two_top, two_under }, ... ] }
   */
  async getCryptoResultByDate(symbol, date) {
    try {
      // คำนวณเวลาเริ่มต้นและสิ้นสุดของวัน
      // รอบที่ 1: 06:00, รอบที่ 264: 04:55 (วันถัดไป)
      const startTime = moment(`${date} 06:00:00`).valueOf()
      const endTime = moment(`${date} 06:00:00`).add(264 * 5, 'minutes').valueOf()

      const startTimeFormatted = moment(startTime).format('YYYY-MM-DD HH:mm')
      const endTimeFormatted = moment(endTime).format('YYYY-MM-DD HH:mm')
      console.log(`📡 [ResultCrypto] Requesting ${symbol}: ${startTimeFormatted} - ${endTimeFormatted}`)
      console.log(`   StartTime: ${startTime}, EndTime: ${endTime}`)

      const url = `${this.binanceBaseUrl}/api/v3/klines`
      const options = {
        method: 'GET',
        uri: url,
        qs: {
          symbol: symbol,
          interval: '5m',
          startTime: startTime,
          endTime: endTime,
          limit: 264  // ดึง 264 รอบ
        },
        json: true
      }

      console.log(`🌐 [ResultCrypto] Request URL: ${url}?symbol=${symbol}&interval=5m&startTime=${startTime}&endTime=${endTime}&limit=264`)

      const results = await BrowserRepository.request(options)
      
      console.log(`📥 [ResultCrypto] Response type: ${typeof results}, isArray: ${_.isArray(results)}`)
      console.log(`📥 [ResultCrypto] Binance response for ${symbol}: ${_.isArray(results) ? results.length : 'invalid'} rounds`)
      
      if (results && _.isArray(results) && results.length > 0) {
        console.log(`   First round sample: close=${results[0][4]}, quoteVolume=${results[0][7]}`)
      }
      
      // Binance klines format: [[openTime, open, high, low, close, volume, closeTime, quoteVolume, trades, ...], ...]
      // [0] openTime
      // [1] open
      // [2] high
      // [3] low
      // [4] close
      // [5] volume
      // [6] closeTime
      // [7] quoteAssetVolume
      // [8] numberOfTrades

      if (_.isEmpty(results) || !_.isArray(results)) {
        console.log(`❌ [ResultCrypto] Invalid or empty response for ${symbol}`)
        console.log(`   Response:`, JSON.stringify(results).substring(0, 200))
        return {}
      }

      // แปลงเป็น format ที่ใช้งาน
      const cryptoResults = []
      
      console.log(`🔄 [ResultCrypto] Converting ${results.length} rounds...`)
      
      // รอบที่ 1 เริ่มเวลา 06:00:00 ของวันนั้น
      const dayStartTime = moment(`${date} 06:00:00`).valueOf()
      
      _.forEach(results, (kline, index) => {
        const openTime = _.get(kline, '0')         // Open timestamp
        const closePrice = _.get(kline, '4')       // Close price
        const quoteVolume = _.get(kline, '7')      // QuoteAssetVolume (มูลค่าซื้อขาย)
        
        if (closePrice && quoteVolume && openTime) {
          // คำนวณ round จาก openTime แทนการใช้ index
          // round = (openTime - 06:00) / 5 นาที + 1
          const minutesDiff = (openTime - dayStartTime) / (1000 * 60)
          const round = Math.floor(minutesDiff / 5) + 1
          
          // Skip ถ้า round ไม่อยู่ในช่วง 1-264
          if (round < 1 || round > 264) {
            console.log(`⚠️  [ResultCrypto] Skipping out-of-range round ${round} (openTime: ${moment(openTime).format('HH:mm:ss')})`)
            return
          }
          
          // แสดง log ละเอียดสำหรับ 3 รอบแรกและรอบ 167
          const showDebug = (index < 3) || (round === 167)
          const result = this.convertPriceToResult(closePrice, quoteVolume, symbol, showDebug)
          
          if (showDebug) {
            console.log(`   🕐 Round ${round}: openTime=${moment(openTime).format('HH:mm:ss')}, index=${index}`)
          }
          
          cryptoResults.push({
            round: round,
            three_top: result.three_top,
            two_top: result.two_top,
            two_under: result.two_under,
            raw_close_price: result.raw_close_price,
            raw_quote_volume: result.raw_quote_volume,
            symbol: result.symbol
          })
        }
      })

      // สร้าง slug name
      const coin = symbol.replace('USDT', '').toLowerCase()
      const slug = `${coin}_5min`

      console.log(`✅ [ResultCrypto] Converted ${cryptoResults.length} rounds for ${symbol}`)
      if (cryptoResults.length > 0) {
        console.log(`   📝 Sample results (first 3):`)
        cryptoResults.slice(0, 3).forEach(r => {
          console.log(`      Round ${r.round}: ${r.three_top}/${r.two_under} (Close:${r.raw_close_price}, QuoteVol:${r.raw_quote_volume})`)
        })
        
        // แสดงรอบ 167 ถ้ามี
        const round167 = _.find(cryptoResults, { round: 167 })
        if (round167) {
          console.log(`   📌 Round 167 result:`)
          console.log(`      Round ${round167.round}: ${round167.three_top}/${round167.two_under} (Close:${round167.raw_close_price}, QuoteVol:${round167.raw_quote_volume})`)
        }
      }

      // Return format เหมือน yeekee: { slug: [results] }
      return {
        [slug]: cryptoResults
      }

    } catch (error) {
      console.error(`❌ [ResultCrypto] Error fetching ${symbol} for ${date}:`, error.message)
      if (error.response) {
        console.error(`   Response status:`, error.response.statusCode)
        console.error(`   Response body:`, JSON.stringify(error.response.body).substring(0, 200))
      }
      if (error.options) {
        console.error(`   Request options:`, error.options)
      }
      console.error(`   Stack:`, error.stack)
      return {}
    }
  }

  /**
   * คำนวณเวลาของแต่ละรอบ
   * @param {string} date - YYYY-MM-DD
   * @param {number} round - 1-264
   */
  calculateRoundTime(date, round) {
    // รอบที่ 1 เริ่มเวลา 06:00 (05:00 + 1 ชม. เหมือน yeekee)
    const baseTime = moment(`${date} 06:00:00`)
    const minutesToAdd = (round - 1) * 5
    return baseTime.add(minutesToAdd, 'minutes').format('YYYY-MM-DD HH:mm:ss')
  }

  /**
   * แปลงราคาเป็นผลหวย
   * สูตรใหม่:
   * - 3 ตัวบน และ 2 ตัวบน: QuoteVolume ทศนิยม 3 ตำแหน่ง
   * - 2 ตัวล่าง: Close Price ทศนิยม 2 ตำแหน่ง
   * 
   * @param {string} closePrice - ราคาปิด (เช่น "78414.20")
   * @param {string} quoteVolume - มูลค่าการซื้อขาย (เช่น "7499626.66137750")
   * @param {string} symbol - BTCUSDT, ETHUSDT, etc.
   * 
   * ใช้การแยก string แทนการคูณ float เพื่อหลีกเลี่ยง floating point precision error
   */
  convertPriceToResult(closePrice, quoteVolume, symbol, debug = false) {
    // ดึง config ของเหรียญ (ทุกเหรียญใช้ priceDecimals: 2, volumeDecimals: 3)
    const config = this.coinConfigs[symbol] || { priceDecimals: 2, volumeDecimals: 3 }
    
    // 1. แปลง QuoteVolume เป็น Integer (ทศนิยม 3 ตำแหน่ง) - x1000
    // เช่น "7499626.66137750" → "7499626" + "661" → "7499626661"
    const [volumeIntPart, volumeDecPart] = quoteVolume.split('.')
    const volumeDecPadded = (volumeDecPart || '').padEnd(config.volumeDecimals, '0').substring(0, config.volumeDecimals)
    const volumeStr = volumeIntPart + volumeDecPadded
    
    // จิ้มเลือกหลักจาก QuoteVolume สำหรับ 3 ตัวบน และ 2 ตัวบน
    // 3 ตัวบน: หลักร้อย, สิบ, หน่วย (3 หลักสุดท้าย)
    // ตัวอย่าง: "7499626661" → จิ้มหลัก -3,-2,-1 → "661"
    const three_top = volumeStr.slice(-3).padStart(3, '0')
    
    // 2 ตัวบน: หลักสิบ, หน่วย (2 หลักสุดท้าย)
    // ตัวอย่าง: "7499626661" → จิ้มหลัก -2,-1 → "61"
    const two_top = volumeStr.slice(-2).padStart(2, '0')
    
    // 2. แปลง Close Price เป็น Integer (ทศนิยม 2 ตำแหน่ง) - x100
    // เช่น "78414.20" → "78414" + "20" → "7841420"
    const [priceIntPart, priceDecPart] = closePrice.split('.')
    const priceDecPadded = (priceDecPart || '').padEnd(config.priceDecimals, '0').substring(0, config.priceDecimals)
    const priceStr = priceIntPart + priceDecPadded
    
    // จิ้มเลือกหลักจาก Close Price สำหรับ 2 ตัวล่าง
    // 2 ตัวล่าง: หลักสิบ, หน่วย (2 หลักสุดท้าย)
    // ตัวอย่าง: "7841420" → จิ้มหลัก -2,-1 → "20"
    const two_under = priceStr.slice(-2).padStart(2, '0')

    if (debug) {
      console.log(`🧮 [Convert] ${symbol}:`)
      console.log(`   📊 QuoteVolume: "${quoteVolume}"`)
      console.log(`      → × 1000 (${config.volumeDecimals} decimals): "${volumeStr}"`)
      console.log(`      → 3ตัวบน (ร้อย,สิบ,หน่วย): "${three_top}"`)
      console.log(`      → 2ตัวบน (สิบ,หน่วย): "${two_top}"`)
      console.log(`   💰 Close Price: "${closePrice}"`)
      console.log(`      → × 100 (${config.priceDecimals} decimals): "${priceStr}"`)
      console.log(`      → 2ตัวล่าง (สิบ,หน่วย): "${two_under}"`)
      console.log(`   ✅ Final: ${three_top}/${two_under} (2บน: ${two_top})`)
    }

    return {
      three_top: three_top,
      two_top: two_top,
      two_under: two_under,
      // เพิ่มข้อมูลเพิ่มเติมสำหรับ audit/ตรวจสอบ
      raw_close_price: closePrice,
      raw_quote_volume: quoteVolume,
      symbol: symbol,
    }
  }

  /**
   * Bitcoin (BTC) - ดึงผลทั้งวัน
   */
  async btc(date) {
    return await this.getCryptoResultByDate('BTCUSDT', date)
  }

  /**
   * Ethereum (ETH) - ดึงผลทั้งวัน
   */
  async eth(date) {
    return await this.getCryptoResultByDate('ETHUSDT', date)
  }

  /**
   * Cardano (ADA) - ดึงผลทั้งวัน
   */
  async ada(date) {
    return await this.getCryptoResultByDate('ADAUSDT', date)
  }

  /**
   * Solana (SOL) - ดึงผลทั้งวัน
   */
  async sol(date) {
    return await this.getCryptoResultByDate('SOLUSDT', date)
  }

  /**
   * Polkadot (DOT) - ดึงผลทั้งวัน
   */
  async dot(date) {
    return await this.getCryptoResultByDate('DOTUSDT', date)
  }

  /**
   * Avalanche (AVAX) - ดึงผลทั้งวัน
   */
  async avax(date) {
    return await this.getCryptoResultByDate('AVAXUSDT', date)
  }

  /**
   * Binance Coin (BNB) - ดึงผลทั้งวัน
   */
  async bnb(date) {
    return await this.getCryptoResultByDate('BNBUSDT', date)
  }

  /**
   * Ripple (XRP) - ดึงผลทั้งวัน
   */
  async xrp(date) {
    return await this.getCryptoResultByDate('XRPUSDT', date)
  }

  /**
   * Tron (TRX) - ดึงผลทั้งวัน
   */
  async trx(date) {
    return await this.getCryptoResultByDate('TRXUSDT', date)
  }
}

module.exports = ResultCryptoRepository
