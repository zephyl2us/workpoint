'use strict'

const Repository = require('./Repository')
const NexmoStore = require('./NexmoStore')
const ThsmsStore = require('./ThsmsStore')

class MessageManager {
  constructor (app) {
    this._app = app
    this._stores = []

    return new Proxy(this, {
      get: function (target, name) {
        if (target[name] !== undefined) {
          return target[name]
        }
        // Dynamically call the default store instance
        const store = target.store()
        if (typeof store[name] === 'function') {
          return store[name].bind(store)
        }
      }
    })
  }

  /**
   * Store name depends on config
   */
  store (name = null) {
    name = name || this.getDefaultDriver()
    this._stores[name] = this._get(name)
    return this._stores[name]
  }

  /**
   * Direct call to the driver
   *
   * @param driver [nexmo|thsms]
   */
  driver (driver = null) {
    return this.store(driver)
  }

  /**
   * Get store driver
   */
  _get (name) {
    return this._stores[name] != null ? this._stores[name] : this._resolve(name)
  }

  /**
   * Resolve the store creator
   */
  _resolve (name) {
    const config = this._getConfig(name)

    if (config == null) {
      throw new Error(`InvalidArgumentException: Message store [${name}] is not defined.`)
    }

    const driverName = config['driver'].charAt(0).toUpperCase() + config['driver'].substr(1).toLowerCase()
    const driverMethod = '_create' + driverName + 'Driver'

    if (typeof this[driverMethod] === 'function') {
      return this[driverMethod](config)
    } else {
      throw new Error(`InvalidArgumentException: Driver [${config['driver']}] is not supported.`)
    }
  }

  /**
   * Get the default message driver name.
   */
  getDefaultDriver () {
    return this._app.use('Adonis/Src/Config').get('message.default')
  }

  /**
   * Get default sender
   */
  getDefaultSender () {
    return this._app.use('Adonis/Src/Config').get('message.sender')
  }

  /**
   * Create Nemo driver
   */
  _createNexmoDriver (config) {
    return this.repository(new NexmoStore(config))
  }

  /**
   * Create THSMS driver
   */
  _createThsmsDriver (config) {
    const redis = this._app.use('Adonis/Addons/Redis')
    const connection = config['redisConnection'] ? config['redisConnection'] : 'local'
    return this.repository(new ThsmsStore(config, redis, connection))
  }

  /**
   * The repository wrapper
   */
  repository (store) {
    const sender = this.getDefaultSender()
    return new Repository({ store, sender })
  }

  /**
   * Get the message connection configuration.
   *
   * @param  {string}  name
   * @return {object}
   * @private
   */
  _getConfig (name) {
    return this._app.use('Adonis/Src/Config').get(`message.stores.${name}`)
  }

}

module.exports = MessageManager
