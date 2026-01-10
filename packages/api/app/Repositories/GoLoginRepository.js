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

class GoLoginRepository {

  static get inject() {
    return []
  }

  constructor() {
    this.servers = Config.get('army.goLoginServers')
  }

  async status (data) {
    const path = '/status'
    const server = 'gologin'

    const response = await this.request(server, { path })

    return this.response(response)
  }

  async fetchUser (data) {
    const path = '/api/v1/user/list'
    const server = 'gologin'
    
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
    const path = '/browser'
    const method = 'POST'

    const server = 'gologin'
    
    const response = await this.request(server, {
      path,
      method,
      body: _.pick(data, [
				'name',
				'browserType',
				'os',
				'navigator',
				'proxyEnabled',
				'proxy',
				'timezone',
				'fonts',
				'updateExtensions',
        'chromeExtensions'
      ])
    })

    return this.response(response)
  }
  
  async updateUser (data) {
    const path = `/browser/${data.id}`
    const method = 'PUT'
    
    const server = 'gologin'

    const response = await this.request(server, {
      path,
      method,
      body: _.pick(data, [
				'name',
				'browserType',
				'os',
				'navigator',
				'proxyEnabled',
				'proxy',
				'fonts',
        'extensions',
        'chromeExtensions',
      ])
    })

    return this.response(response)
  }

  async deleteUser (data) {
    const path = `/browser/${data.id}`
    const method = 'DELETE'
    
    const server = 'gologin'

    const response = await this.request(server, {
      path,
      method,
    })

    return this.response(response)
  }

  async addProfileToFolder (data) {
    const path = '/folders/folder'
    const method = 'PATCH'

    const server = 'gologin'

    const body = {
      name: _.get(data, 'folder_id'),
      profiles: [_.get(data, 'profile_id')],
      action: 'add'
    }
    
    const response = await this.request(server, {
      path,
      method,
      body
    })

    return this.response(response)
  }

  async addTagToProfile (data) {
    const path = '/tags/addToProfiles'
    const method = 'POST'

    const server = 'gologin'

    const body = {
      title: _.get(data, 'title'),
      color: _.get(data, 'color'),
      browserIds: [_.get(data, 'profile_id')],
    }
    
    const response = await this.request(server, {
      path,
      method,
      body
    })

    return this.response(response)
  }

  async addCookieToProfile (data) {
    const path = `/browser/${data.profile_id}/cookies`
    const method = 'POST'

    const server = 'gologin'

    const body = data.cookie
    
    const response = await this.request(server, {
      path,
      method,
      body
    })

    return this.response(response)
  }

  async runOnCloud (data) {
    const path = `/browser/${data.profile_id}/web`
    const method = 'POST'

    const server = 'gologin'

    const response = await this.request(server, {
      path,
      method
    })

    return this.response(response)
  }

  async openBrowser (data) {
    const path = '/browser/start-profile'
    const server = this.getServer(data)
    const method = 'POST'
    
    data.sync = true
    
    const response = await this.request(server, {
      path,
      method,
      body: _.pick(data, [
        'profileId',
        'sync',
      ])
    })

    return this.response(response)
  }

  async closeBrowser (data) {
    const path = '/browser/stop-profile'
    const server = this.getServer(data)
    const method = 'POST'
    
    const response = await this.request(server, {
      path,
      method,
      body: _.pick(data, [
        'profileId',
      ])
    })

    return this.response(response)
  }

  async statusBrowser (data) {
    const path = '/api/v1/browser/active'
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
    // console.log(serverName)
    // console.log(this.servers)

    if(!serverName) {
      const servers = _.filter(this.servers, (s) => s.name !== 'gologin')
      // console.log(servers)
      const server = _.sample(servers)
      serverName = server.name
    }

    // console.log(serverName)
    return serverName
  }

  response (response) {
    return response
  }

  async request(serverName, options = {}) {
    if(Helper.isDevMode()) console.log(`Server Name: ${serverName}`)
    if(Helper.isDevMode()) console.log(options)
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

    // console.log(server)
    if(server.token) {
      requestOptions.headers['Authorization'] = `Bearer ${server.token}`
    }

    // console.log(requestOptions)

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

module.exports = GoLoginRepository
