'use strict'

const _ = use('lodash')
const moment = use('moment')
const rp = use('request-promise')
const Cache = use('Cache')
const Config = use('Config')
const Helper = use('App/Helper')
const Redis = use('Redis')
// const Config = use('Config')
// const Event = use('Event')

class AdsPowerRepository {

  static get inject() {
    return []
  }

  constructor() {
    this.servers = Config.get('adsPower.servers')
  }

  async status (data) {
    const path = '/status'
    const server = this.getServer(data)

    const response = await this.request(server, { path })

    return this.response(response)
  }

  async fetchUser (data) {
    const path = '/api/v1/user/list'
    const server = this.getServer(data)
    
    const response = await this.request(server, {
      path,
      params: _.pick(data, [
        'group_id',
        'user_id',
        'serial_number',
        'page',
        'page_size'
      ])
    })

    return this.response(response)
  }

  async createUser (data) {
    const path = '/api/v1/user/create'
    const method = 'POST'

    const server = this.getServer(data)
    
    const response = await this.request(server, {
      path,
      method,
      body: _.pick(data, [
        'name',
        'domain_name',
        'open_urls',
        'repeat_config',
        'username',
        'password',
        'cookie',
        'ignore_cookie_error',
        'group_id',
        'ip',
        'country',
        'region',
        'city',
        'remark',
        'proxyid',
        'user_proxy_config',
        'fingerprint_config'
      ])
    })

    return this.response(response)
  }
  
  async updateUser (data) {
    const path = '/api/v1/user/update'
    const method = 'POST'
    
    const server = this.getServer(data)

    const response = await this.request(server, {
      path,
      method,
      body: _.pick(data, [
        'user_id',
        'name',
        'domain_name',
        'open_urls',
        'username',
        'password',
        'cookie',
        'ignore_cookie_error',
        'ip',
        'country',
        'region',
        'city',
        'remark',
        'user_proxy_config',
        'fingerprint_config'
      ])
    })

    return this.response(response)
  }

  async deleteUser (data) {
    const path = '/api/v1/user/delete'
    const method = 'POST'
    
    const server = this.getServer(data)

    const response = await this.request(server, {
      path,
      method,
      body: _.pick(data, [
        'user_ids'
      ])
    })

    return this.response(response)
  }

  async openBrowser (data) {
    const path = '/api/v1/browser/start'
    const server = this.getServer(data)
    
    const response = await this.request(server, {
      path,
      params: _.pick(data, [
        'user_id',
        'serial_number',
        'open_tabs',
        'ip_tab',
        'launch_args',
        'headless',
        'disable_password_filling',
        'clear_cache_after_closing',
        'enable_password_saving'
      ])
    })

    return this.response(response)
  }

  async closeBrowser (data) {
    const path = '/api/v1/browser/stop'
    const server = this.getServer(data)
    
    const response = await this.request(server, {
      path,
      params: _.pick(data, [
        'user_id',
        'serial_number'
      ])
    })

    return this.response(response)
  }

  async statusBrowser (data) {
    const path = '/api/v1/browser/active'
    console.log(data)
    const server = this.getServer(data)
    
    const response = await this.request(server, {
      path,
      params: _.pick(data, [
        'user_id',
        'serial_number'
      ])
    })

    return this.response(response)
  }

  getServer (data) {
    let serverName = _.get(data, 'server') || null

    if(!serverName) {
      const server = _.sample(this.servers)
      serverName = server.name
    }

    return serverName
  }

  response (response) {
    const code = _.get(response, 'code') === 0
    if(code) {
      return response
    }

    return false
  }

  async request(serverName, options = {}) {
    if(Helper.isDevMode()) console.log(`Server Name: ${serverName}`)
    // if(Helper.isDevMode()) console.log(options)
    const index = _.findIndex(this.servers, ['name', serverName])
    if(index === -1) {
      return false
    }

    const server = _.get(this.servers, index)
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
      json: true
    }

    let result = null
    let isManyRequest = false
    do {
      result = await rp(requestOptions)
      .then(res => {
        return res
      }).error(e => {
        return false
      })
      // console.log(result)

      isManyRequest = _.get(result, 'msg') === "Too many request per second, please check"

      if(isManyRequest) {
        await new Promise(r => setTimeout(r, 500))
      }
    } while (isManyRequest)
    // console.log(result)

    if(Helper.isDevMode()) console.log(result)
    return result
  }
}

module.exports = AdsPowerRepository
