'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddCryptoTypeLotterySchema extends Schema {
  up () {
    this.table('lottery_categories', (table) => {
      // แก้ enum type ให้รองรับ 'crypto' (ไม่ต้อง add index ใหม่เพราะมีอยู่แล้ว)
      table.enu('type', ['government', 'stock', 'yeekee', 'crypto'])
        .notNullable()
        .alter()
    })

    this.table('lotteries', (table) => {
      // แก้ enum type ให้รองรับ 'crypto' (ไม่ต้อง add index ใหม่เพราะมีอยู่แล้ว)
      table.enu('type', ['government', 'stock', 'yeekee', 'crypto'])
        .notNullable()
        .alter()
    })
  }

  down () {
    this.table('lottery_categories', (table) => {
      table.enu('type', ['government', 'stock', 'yeekee'])
        .notNullable()
        .alter()
    })

    this.table('lotteries', (table) => {
      table.enu('type', ['government', 'stock', 'yeekee'])
        .notNullable()
        .alter()
    })
  }
}

module.exports = AddCryptoTypeLotterySchema
