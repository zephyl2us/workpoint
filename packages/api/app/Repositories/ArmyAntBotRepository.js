'use strict'

const _ = use('lodash')
const moment = use('moment')
const rp = use('request-promise')
const Cache = use('Cache')
const Redis = use('Redis')
// const Config = use('Config')
// const Event = use('Event')
const Helper = use('App/Helper')
const Database = use('Database')
const Pusher = use('Pusher')
const CryptoJS = use("crypto-js")
// const LogRepository = make('App/Repositories/LogRepository')

class ArmyAntBotRepository {

  static get inject() {
    return [
      'App/Models/ArmyAnt',
      'App/Models/ArmyAntBot',
      'App/Repositories/AdsPowerRepository',
      'App/Repositories/GoLoginRepository',
    ]
  }

  constructor(ArmyAnt, ArmyAntBot, AdsPowerRepository, GoLoginRepository) {
    this.ArmyAnt = ArmyAnt
    this.ArmyAntBot = ArmyAntBot
    this.AdsPowerRepository = AdsPowerRepository
    this.GoLoginRepository = GoLoginRepository

		this.Redis = Redis.connection('army')
    this.RedisTemp = Redis.connection('temp')

    this.defaultConfig = {
      automation: false,
    }
  }

	browse({ filter = {}, sort = 'id|desc', options = { db: 'write' } } = {}) {
		const sorter = Helper.convertSplitterToObject(sort)
		const CurrentModel = Helper.clusterDb('ArmyAntBot', {
			mode: options.db
		})

		return CurrentModel.query().filter(filter).sorter(sorter)
	}

	async find(id) {
		return await Cache.model(this.ArmyAntBot, `army_ant_bot:${id}`, 60, async () => {
			return await this.ArmyAntBot.findOrFail(id)
		})
	}

	async findBy(field, value) {
		return await this.ArmyAntBot.findByOrFail(field, value)
	}

  async update(record, data) {
    record = _.assign(record, _.pick(data, [
      'server',
      'army_ant_proxy_id',
      'proxy',
      'payload',
      'status',
      'checkpoint',
      'screenshot',
      'start_at',
      'stopped_at'
    ]))

    if (await record.save()) {
      _.unset(data, 'payload')
      Pusher.trigger(`ant_bot`, 'bot-update', _.assign({}, data, { id: record.id }))
      
      return record
    }

    return false
  }
  
  async getStatsByDate (date) {

    const total = await this.browse({ filter: {
      date: date
    }}).getCount()

    const running = await this.browse({ filter: {
      date: date,
      status: 'running'
    }}).getCount()
    
    const checkpoint = await this.browse({ filter: {
      date: date,
      status: 'checkpoint'
    }}).getCount()
    
    const success = await this.browse({ filter: {
      date: date,
      status: 'stopped'
    }}).getCount()

    const stats = {
      total: total,
      running: running,
      checkpoint: checkpoint,
      success: success
    }

    return stats
  }

  async getConfig () {
    const defaultConfig = _.cloneDeep(this.defaultConfig)

		const cacheKey = `bot:config`
		let cached = await this.Redis.get(cacheKey)

    if(!cached) {
			cached = JSON.stringify(defaultConfig)
      await this.Redis.set(cacheKey, cached)
    }
		const result = JSON.parse(cached)
    let config = _.assign(defaultConfig, result)

    return config
  }

  async updateConfig (data) {
		const cacheKey = `bot:config`
    const defaultConfig = _.cloneDeep(this.defaultConfig)
    let config = await this.getConfig()

    _.each(data, (value, key) => {
      if(_.has(defaultConfig, key)) {
        config[key] = value
      }
    })

    const cached = JSON.stringify(config)
    await this.Redis.set(cacheKey, cached)

    return true
  }

  async getStatusServers () {
    const serverLists = _.clone(this.AdsPowerRepository.servers)
    
    const hostServers = []
    _.each(serverLists, (server, index) => {
      // console.log(server)
      if(!_.get(server, 'limit')) {
        // _.pullAt(serverLists, index)
        return true
      }

      // serverLists[index] = _.assign(server, {
      //   running: 0,
      //   available: server.limit
      // })
      hostServers.push(_.assign(server, {
        running: 0,
        available: server.limit
      }))
    })

    // console.log(hostServers)

    let ants = await this.ArmyAntBot.query()
      .where('status', 'running')
      // .orWhere('status', 'ready')
      .fetch()

    ants = ants.toJSON()

    _.each(ants, (ant) => {
      const s = ant.server

      const index = _.findIndex(hostServers, ['name', s])

      if(index === -1) {
        return true
      }

      let server = hostServers[index]
      
      server.running++
      server.available--

      hostServers[index] = server
    })

    let servers = _.filter(hostServers, (server) => server.available > 0)
    servers = _.orderBy(servers, ['running'], ['asc'])

    return servers
  }

  async getAvailableServer () {
    let servers = await this.getStatusServers()
    
    servers = _.orderBy(servers, (s) => s.running)

    return _.size(servers) ? _.first(servers) : null
  }

  // async getAvailableProxy () {

  // }

  async getAntAutomation () {
    const date = moment().format('YYYY-MM-DD')

    // const testIds = [2, 3]

    let ant = await Database.select('army_ants.*')
      .from('army_ants')
      .leftJoin('army_ant_bots', function () {
        this.on('army_ants.id', 'army_ant_bots.army_ant_id')
        .andOn('army_ant_bots.date', Database.raw('?', date))
        .andOn('army_ant_bots.type', Database.raw('?', 'farm'))
      }) 
      .whereNull('army_ants.deleted_at')
      .where('army_ants.facebook_status', 1)
      .whereNull('army_ant_bots.id')
      // .whereIn('army_ants.id', testIds)
      .orderByRaw('RAND()')
      .first()

    // console.log(ant)

    if(!ant) {
      return false
    }

    // Check limit ready ant
    let readyAnts = await this.ArmyAntBot.query()
      .where('date', date)
      .where('status', '=', 'ready')
      .count('* as total')

    const count = _.get(readyAnts, '0.total')

    if(count >= 1) {
      return false
    }

    return ant
    
    // await this.startAutomationById(antId)
  }

  async createAutomationByAntId (antId) {
    const date = moment().format('YYYY-MM-DD')
    const rand = _.random(8, 10)
    const randSecond = _.random(0, 59)
    const stoppedAt = moment().add(rand, 'minutes').add(randSecond, 'seconds').format('YYYY-MM-DD HH:mm:ss')

    let antBot = await this.ArmyAntBot.query()
      .where('date', date)
      .where('type', 'farm')
      .where('army_ant_id', antId)
      .first()

    if(antBot) {
      // console.log('No Ant bot')
      return false
    }

    let ant = await this.ArmyAnt.find(antId)

    if(!ant) {
      // console.log('No Ant', id)
      return false
    }

    const sites = [
      "https://master.movie",
      // "https://thairath.co.th",
      // "https://khaosod.co.th",
      // "https://wongnai.com",
      // "https://majorcineplex.com",
      // "https://one31.net",
    ]

    const payload = {
      sites: sites
    }

    const props = {
      army_ant_id: antId,
      date: date,
      type: 'farm',
      payload: payload,
      status: 'ready',
      stopped_at: stoppedAt
    }
		const created = await this.ArmyAntBot.create(props)

    const bot = created.toJSON()

    const data = {
      ant,
      ...bot,
    }
		Pusher.trigger(`ant_bot`, 'bot-update', data)

    return created
  }

  async createActivityById (id, data) {

    // id = _.random(1, 30)
    // data.action = _.sample(['facebook_like', 'facebook_watch', 'facebook_comment'])

    const action = _.get(data, 'action')
    if(_.includes(['facebook_checkpoint'], action)) {
      let antBot = await this.findBy('id', id)

      if(antBot) {
        let platform = _.replace(action, '_checkpoint', '')
  
        await this.update(antBot, {
          checkpoint: platform
        })
  
        const antId = _.get(antBot, 'army_ant_id')
        let ant = await this.ArmyAnt.find(antId)
  
        if(ant) {
          if(_.eq('facebook', platform)) {
            ant.facebook_status = 2
          }
          if(_.eq('instagram', platform)) {
            ant.instagram_status = 2
          }
          if(_.eq('tiktok', platform)) {
            ant.tiktok_status = 2
          }
          if(_.eq('youtube', platform)) {
            ant.youtube_status = 2
          }
          await ant.save()
        }
      }
    }

    const timestamp = moment().valueOf()
    const cacheKey = `bot:activity:${id}:${timestamp}`

    data.army_ant_bot_id = id
    data.timestamp = timestamp

    const cached = JSON.stringify(data)
    const pipeline = this.Redis.pipeline()
    pipeline.set(cacheKey, cached)
    pipeline.expire(cacheKey, 60 * 60)
    await pipeline.exec()

    
		Pusher.trigger(`ant_bot`, 'activity-update', data)
  }

  async getActivityById (id) {
    const cacheKey = `mega:bot:activity:${id}:*`

    const keys = await this.Redis.keys(cacheKey)
    const pipeline = this.Redis.pipeline()

    // ใส่คำสั่ง GET ข้อมูลจากทุกคีย์ใน pipeline
    keys.forEach(key => {
      key = _.replace(key, 'mega:', '')
      pipeline.get(key)
    })

    // ดึงข้อมูลจาก Redis โดยใช้ pipeline
    const data = await pipeline.exec()

    // ข้อมูลที่ได้จะอยู่ในรูปแบบของอาร์เรย์ของ [null, value] โดย value คือข้อมูลที่ดึงมา
    const result = data.map(([error, value]) => JSON.parse(value))

    return result
  }

  async hasRequestCache (cacheKey) {
		let cached = await this.RedisTemp.get(cacheKey)

		if (cached) {
      return true
    }

    const pipeline = this.RedisTemp.pipeline()
    pipeline.set(cacheKey, true)
    pipeline.expire(cacheKey, 30)
    await pipeline.exec()

    return false
  }

  async clearRequestCache (cacheKey) {
    // console.log(`clearRequestCache`, cacheKey)
    await this.RedisTemp.del(cacheKey)
  }

}

module.exports = ArmyAntBotRepository
