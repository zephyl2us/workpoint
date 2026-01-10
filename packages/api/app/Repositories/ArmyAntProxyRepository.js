'use strict'

const _ = use('lodash')
const moment = use('moment')
const rp = use('request-promise')
const Cache = use('Cache')
const Config = use('Config')
const Redis = use('Redis')
// const Config = use('Config')
// const Event = use('Event')
const Helper = use('App/Helper')
const Database = use('Database')
const Pusher = use('Pusher')
const CryptoJS = use("crypto-js")
// const LogRepository = make('App/Repositories/LogRepository')

class ArmyAntProxyRepository {

  static get inject() {
    return [
      'App/Models/ArmyAnt',
      'App/Models/ArmyAntProxy',
      'App/Repositories/AdsPowerRepository',
    ]
  }

  constructor(ArmyAnt, ArmyAntProxy, AdsPowerRepository) {
    this.ArmyAnt = ArmyAnt
    this.ArmyAntProxy = ArmyAntProxy
    this.AdsPowerRepository = AdsPowerRepository

		this.Redis = Redis.connection('army')

    this.isDebugResult = true

    this.proxies = Config.get('adsPower.proxies')
  }

	browse({ filter = {}, sort = 'id|desc', options = { db: 'write' } } = {}) {
		const sorter = Helper.convertSplitterToObject(sort)
		const CurrentModel = Helper.clusterDb('ArmyAntProxy', {
			mode: options.db
		})

		return CurrentModel.query().filter(filter).sorter(sorter)
	}

	async find(id) {
		return await Cache.model(this.ArmyAntProxy, `army_ant_proxy:${id}`, 60, async () => {
			return await this.ArmyAntProxy.findOrFail(id)
		})
	}

	async findBy(field, value) {
		return await this.ArmyAntProxy.findByOrFail(field, value)
	}

  async update(record, data) {
    record = _.assign(record, _.pick(data, [
      'server',
      // 'ip',
      // 'port',
      'public_ipv4',
      'payload',
      'available_at',
      'is_enable'
    ]))
    
    if (await record.save()) {
      return record
    }

    return false
  }
  
  async getAvailableProxy () {
    let proxies = await this.ArmyAntProxy.query()
      .where('is_enable', 1)
      // .where('available_at', '<', moment().format('YYYY-MM-DD HH:mm:ss'))
      // .orWhereNull('available_at')
      .where(function() {
        this.where('available_at', '<', moment().format('YYYY-MM-DD HH:mm:ss'))
          .orWhereNull('available_at');
      })
      .whereNotNull('public_ipv4')
      .fetch()

    proxies = proxies.toJSON()

    if(!_.size(proxies)) {
      return false
    }



    return _.sample(proxies)
  }

  async statusProxy (proxyName) {
    const path = '/v2/proxy_list'
    
    const response = await this.request(proxyName, {
      path,
      params: {
        limit: 100
      }
    })

    return this.response(response)
  }

  async rotationProxy (proxy) {
    const proxyName = _.get(proxy, 'server')
    let payload = _.get(proxy, 'payload')

    if(!_.isObject(payload)) {
      payload = JSON.parse(payload)
    }

    const position = _.get(payload, 'position')

    if(!position) {
      return false
    }

    const path = `/api/v1/rotate_ip/position/${position}`
    
    const response = await this.request(proxyName, {
      path
    })

    return this.response(response)
  }

  response (response) {
    // const code = _.get(response, 'code') === 0
    // if(code) {
    //   return response
    // }

    return response
  }

  async request(proxyName, options = {}) {
    // console.log(`Proxy Name: ${proxyName}`)
    // console.log(options)
    const index = _.findIndex(this.proxies, ['name', proxyName])
    if(index === -1) {
      return false
    }

    const server = _.get(this.proxies, index)
    const endpoint = server.endpoint

    const requestUrl = `${endpoint}${options.path}`
    // console.log(requestUrl)
    let requestOptions = {
      method: _.get(options, 'method') || 'GET',
      uri: requestUrl,
      headers: {
        accept: 'application/json',
      },
      qs: _.assign({}, _.get(options, 'params') || {}),
      body: _.get(options, 'body') || {},
      json: true,
      timeout: 5000
    }

    let result = null

    result = await rp(requestOptions)
    .then(res => {
      return res
    }).error(e => {
      return false
    })
    // console.log(result)

    if(Helper.isDevMode()) {
      console.log(result)
    }
    return result
  }
}

module.exports = ArmyAntProxyRepository
