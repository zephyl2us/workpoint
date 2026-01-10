'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ExtOneUserSchema extends Schema {
  up () {
    this.create('ext_one_users', (table) => {
      table.bigIncrements()
      table.bigInteger('one_user_id').unsigned().index()
      table.integer('master_user_id').unsigned().nullable().index()
      table.integer('agent_user_id').unsigned().nullable().index()
      table.string('username', 30).notNullable().unique()
      table.enu('role', ['admin', 'subadmin', 'master', 'submaster', 'agent', 'subagent', 'member']).defaultTo('member').index()
      table.string('first_name', 255).nullable()
      table.string('last_name', 255).nullable()
      table.date('date_of_birth').nullable()
      table.string('mobile', 20).nullable()
      table.integer('login_count').unsigned().nullable()
      table.dateTime('last_login_at').nullable()

      const decimals = [
        'deposit', 'withdraw', 'bet_credit', 'bet_rolling', 'result_bet_credit',
        'bet_lotto_government', 'bet_lotto_stock', 'bet_lotto_yeekee',
        'bet_game_paoyingchub', 'bet_game_huakoi',
        'af_bet_lotto_government', 'af_bet_lotto_stock', 'af_bet_lotto_yeekee',
        'af_bet_game_paoyingchub', 'af_bet_game_huakoi',
        'af_bet_credit', 'af_bet_rolling', 'settlement', 'betall',
        'revenue_income', 'revenue_outcome', 'revenue_settlement',
        'rolling', 'revenue_commission', 'revenue_af'
      ]

      decimals.forEach((col) => {
        table.decimal(col, 15, 2).defaultTo(0.00)
      })

      table.bigInteger('click').defaultTo(0)
      table.integer('deposit_times').defaultTo(0)
      table.integer('withdraw_times').defaultTo(0)

      table.dateTime('latest_update_bet').nullable()
      table.dateTime('latest_deposit').nullable()
      table.dateTime('latest_withdraw').nullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('ext_one_users')
  }
}

module.exports = ExtOneUserSchema
