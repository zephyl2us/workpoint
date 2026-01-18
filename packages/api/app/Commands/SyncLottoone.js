'use strict'

const { Command } = require('@adonisjs/ace')
const _ = use('lodash')
const moment = use('moment')
const rp = use('request-promise')
const Bull = use('Bull')
const Config = use('Config')
const Database = use('Database')

class SyncLottoone extends Command {
  static get signature () {
    return 'sync:lottoone'
  }

  static get description () {
    return 'Tell something helpful about this command'
  }

  async handle (args, options) {
    this.info(`[SYNC] Start`)

    const pageSize = 5000
    let page = 1
    let totalProcessed = 0

    while (true) {
      const stats = await Database
        .connection('mysql_one')
        .select('*')
        .from('user_stats')
        .forPage(page, pageSize)

      // if (page > 1) break

      if (stats.length === 0) break

			// if (page > 1) break

      // ดึง user ที่เกี่ยวข้องทั้งหมดในรอบนี้
      const userIds = stats.map(s => s.user_id)
      const users = await Database
        .connection('mysql_one')
        .select('*')
        .from('users')
        .whereIn('id', userIds)

      const userCredits = await Database
        .connection('mysql_one')
        .select('*')
        .from('user_credits')
        .whereIn('user_id', userIds)

      // รวมข้อมูล
      const merged = stats.map(stat => {
        const user = users.find(u => u.id === stat.user_id)
        const credit = userCredits.find(c => c.user_id === user.id)
        return {
          one_user_id: stat.user_id,
					master_user_id: user.master_user_id,
					agent_user_id: user.agent_user_id,
          trans_username: user ? user.trans_username : null,
          username: user ? user.username : null,
					role: user.role,
					first_name: user.first_name,
					last_name: user.last_name,
					date_of_birth: user.date_of_birth,
					mobile: user.mobile,
					status: user.status,
					login_count: user.login_count,
					last_login_at: user.last_login_at,

          credit: credit.credit_chip,
          revenue: credit.revenue,

					deposit: stat.deposit,
					withdraw: stat.withdraw,
					bet_credit: stat.bet_credit,
					bet_rolling: stat.bet_rolling,
					result_bet_credit: stat.result_bet_credit,
					bet_lotto_government: stat.bet_lotto_government,
					bet_lotto_stock: stat.bet_lotto_stock,
					bet_lotto_yeekee: stat.bet_lotto_yeekee,
					bet_game_paoyingchub: stat.bet_game_paoyingchub,
					bet_game_huakoi: stat.bet_game_huakoi,
					af_bet_lotto_government: stat.af_bet_lotto_government,
					af_bet_lotto_stock: stat.af_bet_lotto_stock,
					af_bet_lotto_yeekee: stat.af_bet_lotto_yeekee,
					af_bet_game_paoyingchub: stat.af_bet_game_paoyingchub,
					af_bet_game_huakoi: stat.af_bet_game_huakoi,
					af_bet_credit: stat.af_bet_credit,
					af_bet_rolling: stat.af_bet_rolling,
					settlement: stat.settlement,
					betall: stat.betall,
					revenue_income: stat.revenue_income,
					revenue_outcome: stat.revenue_outcome,
					revenue_settlement: stat.revenue_settlement,
					rolling: stat.rolling,
					revenue_commission: stat.revenue_commission,
					revenue_af: stat.revenue_af,
					
					deposit_times: stat.deposit_times,
					withdraw_times: stat.withdraw_times,
					latest_update_bet: stat.latest_update_bet,
					latest_deposit: stat.latest_deposit,
					latest_withdraw: stat.latest_withdraw,

          // user_id: stat.user_id,
          // username: user ? user.username : null,
          // deposit: stat.deposit,
          // withdraw: stat.withdraw,
          // betall: stat.betall
        }
      }).filter(r => r.username) // ตัดที่ไม่มี user

      // insert ทีละ batch (หรือจะใช้ insertMany ก็ได้)
      // console.log(`[SYNC] Syncing page ${page}`)
      process.stdout.write(`[SYNC] Page ${page} processing... 0/${merged.length} (0%)\r`);
      let i = 1;
      for (const row of merged) {
        // console.log(row.group)

        if (row.role == 'member' && row.mobile) {
          const user = await Database
            .connection('mysql')
            .table('ext_one_users')
            .where('one_user_id', row.one_user_id)
            .orWhere('mobile', row.mobile)
            .first()

          if (!user && row.credit >= 0 && row.status != 'suspended') {
            // console.log(user)

            // console.log(row)
            
            await Database
              .connection('mysql')
              .table('ext_one_users')
              .insert(row)
          }
        }

        const percent = parseInt(i * 100 / merged.length)
        process.stdout.write(`[SYNC] Page ${page} processing... ${i}/${merged.length} (${percent}%)\r`)
        i++;
      }

      totalProcessed += merged.length
      console.log(`Synced page ${page}, total ${totalProcessed}`)

      page++
    }

    this.info(`[SYNC] Completed`)
    // return response.send({ status: 'done', totalProcessed })
  }

}

module.exports = SyncLottoone
