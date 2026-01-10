'use strict'

const _ = use('lodash')
const moment = use('moment')
// const Cache = use('Cache')
const Redis = use('Redis')
// const Config = use('Config')
// const Event = use('Event')
const Helper = use('App/Helper')
const Database = use('Database')
const Pusher = use('Pusher')
const CryptoJS = use("crypto-js")
// const LogRepository = make('App/Repositories/LogRepository')

class ArmyAntSecurityRepository {

  static get inject() {
    return [
      'App/Models/ArmyAntSecurity',
    ]
  }

  constructor(ArmyAntSecurity) {
		this.passphrase = "84269713"
    this.ArmyAntSecurity = ArmyAntSecurity
  }

	async find(id) {
		return await Cache.model(this.ArmyAntSecurity, `army_ant_security:${id}`, 60, async () => {
			return await this.ArmyAntSecurity.findOrFail(id)
		})
	}

	async findBy(field, value) {
		return await this.ArmyAntSecurity.findByOrFail(field, value)
	}

  async create(data) {
    let armyAntSecurity = new this.ArmyAntSecurity()

    armyAntSecurity = _.assign(armyAntSecurity, _.pick(data, [
      'army_ant_id',
      'social',
      'hash',
      'created_user_id',
    ]))


    if(await armyAntSecurity.save()) {
      return armyAntSecurity
    }
    return false
  }

  async createOrUpdate (data) {
    const security = await this.ArmyAntSecurity.query()
      .where('army_ant_id', data.army_ant_id)
      .where('social', data.social)
      .where('status', 'active')
      .first()

    if(security) {
      // console.log(security)
      const bytes = CryptoJS.AES.decrypt(security.hash, this.passphrase)
      const passwordDecrypted = bytes.toString(CryptoJS.enc.Utf8)
      // console.log(`passwordDecrypted`, passwordDecrypted)

      if(passwordDecrypted === data.password) {
        return false
      } else {
        await this.ArmyAntSecurity.query()
          .where('army_ant_id', data.army_ant_id)
          .where('social', data.social)
          .update({
            status: 'deleted'
          })
      }
    }

    data.hash = CryptoJS.AES.encrypt(data.password, this.passphrase).toString()

		const created = await this.create(data)
    return created

  }

  async update(armyAntSecurity, data) {

    armyAntSecurity = _.assign(armyAntSecurity, _.pick(data, [
      // 'army_ant_id',
      // 'social',
      // 'hash',
      // 'created_user_id',
    ]))
    
    if (await armyAntSecurity.save()) {
      return armyAntSecurity
    }

    return false
  }
}

module.exports = ArmyAntSecurityRepository
