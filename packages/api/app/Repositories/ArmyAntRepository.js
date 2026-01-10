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
// const LogRepository = make('App/Repositories/LogRepository')

class ArmyAntRepository {

  static get inject() {
    return [
      'App/Models/ArmyAnt',
      'App/Repositories/ArmyAntSecurityRepository',
      'App/Repositories/AdsPowerRepository',
      'App/Repositories/GoLoginRepository',
    ]
  }

  constructor(ArmyAnt, ArmyAntSecurityRepository, AdsPowerRepository, GoLoginRepository) {
    this.ArmyAnt = ArmyAnt
    this.ArmyAntSecurityRepository = ArmyAntSecurityRepository
    this.AdsPowerRepository = AdsPowerRepository
    this.GoLoginRepository = GoLoginRepository
  }

	browse({ filter = {}, sort = 'id|desc', options = { db: 'write' } } = {}) {
		const sorter = Helper.convertSplitterToObject(sort)
		const CurrentModel = Helper.clusterDb('ArmyAnt', {
			mode: options.db
		})

		return CurrentModel.query().filter(filter).sorter(sorter)
	}

	async find(id) {
		return await Cache.model(this.ArmyAnt, `army_ant:${id}`, 60, async () => {
			return await this.ArmyAnt.findOrFail(id)
		})
	}

	async findBy(field, value) {
		return await this.ArmyAnt.findByOrFail(field, value)
	}

  async create(data) {
    let ant = new this.ArmyAnt()

    ant = _.assign(ant, _.pick(data, [
      'adspower_id',
      // 'gologin_id',
      'email',
      'national_id',
      'first_name',
      'last_name',
      'nickname',
      'first_name_en',
      'last_name_en',
      'nickname_en',
      'gender',
      'birthday',
      'phone',
      'address',
      'tambon_id',
      'district_id',
      'province_id',
      'profile_path',
      'created_user_id',
    ]))

    // console.log(ant)

    if(await ant.save()) {
      return ant
    }
    return false
  }

  async update(ant, data) {

    ant = _.assign(ant, _.pick(data, [
      'adspower_id',
      // 'gologin_id',
      'type',
      'email',
      'national_id',
      'first_name',
      'last_name',
      'nickname',
      'first_name_en',
      'last_name_en',
      'nickname_en',
      'gender',
      'birthday',
      'phone',
      'address',
      'tambon_id',
      'district_id',
      'province_id',
      'profile_path',
      'gmail_status',
      'youtube_id',
      'youtube_status',
      'facebook_id',
      'facebook_status',
      'instagram_id',
      'instagram_status',
      'tiktok_id',
      'tiktok_status',
      // 'created_user_id',
      'deploy',
    ]))
    
    if (await ant.save()) {
      return ant
    }

    return false
  }

  async delete(ant) {
    if (await ant.delete()) {
      return ant
    }

    return false
  }

  async farmUserCreate (ant, groupId = '0') {
    const id = _.get(ant, 'id')
    const firstName = _.get(ant, 'first_name_en')
    const lastName = _.get(ant, 'last_name_en')

    const data = {
      name: `${firstName} ${lastName}`,
			group_id: groupId,
			user_proxy_config: {
				proxy_soft: 'no_proxy'
			},
      fingerprint_config: {
        automatic_timezone: '1',
        language: ['en-US','en','th-TH','th'],
        ua: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
        screen_resolution: '1440_3088'
      }
    }

    const createUser = await this.AdsPowerRepository.createUser(data)

    // console.log(createUser)
    const farmId = _.get(createUser, 'data.id')
    if(!farmId) {
      return false
    }

    return createUser

    // const data = {
    //   name: `[${id}] ${firstName} ${lastName}`,
    //   browserType: 'chrome',
    //   os: 'lin',
    //   navigator: {
    //     userAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
    //     resolution: '384x857',
    //     language: 'en-GB,en-US;q=0.9,en;q=0.8',
    //     platform: 'Android OS',
    //     doNotTrack: true
    //   },
    //   proxyEnabled: false,
    //   proxy: {
    //     mode: 'http',
    //     host: '',
    //     port: 0,
    //     username: '',
    //     password: ''
    //   },
    //   timezone: {
    //     enabled: true,
    //     fillBasedOnIp: true,
    //     timezone: 'Asia/Bangkok'
    //   },
    //   fonts: {
    //     families: [
    //       'Roboto'
    //     ]
    //   },
    //   updateExtensions: true,
    // }
    
    // const goLoginUser = await this.GoLoginRepository.createUser(data)

    // const goLoginId = _.get(goLoginUser, 'id')
    // if(!goLoginId) {
    //   return false
    // }

    // const addToFolder = await this.GoLoginRepository.addProfileToFolder({
    //   folder_id: 'NEW',
    //   profile_id: goLoginId
    // })

    // return goLoginUser
  }

  async farmUserDelete (ant) {
    const farmId = _.get(ant, 'adspower_id')

    if(!farmId) {
      return true
    }

    const data = {
      user_ids: [farmId]
    }
    
    const deleteUser = await this.AdsPowerRepository.deleteUser(data)

    if(_.get(deleteUser, 'code') != 0) {
      return false
    }
    
    return true
  }
}

module.exports = ArmyAntRepository
