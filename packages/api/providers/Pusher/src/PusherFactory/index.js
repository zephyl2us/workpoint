'use strict'

const _ = require('lodash')
const Pusher = require('pusher')

const proxyHandler = require('./proxyHandler')

class PusherFactory {
  constructor (config) {
    this._config = config

    /**
     * The main pusher connection.
     *
     * @attribute connection
     *
     * @type {Object}
     */
    this.connection = null

    /**
     * Connect to redis
     */
    this.connect()

    return new Proxy(this, proxyHandler)
  }

  /**
   * Connect to pusher
   */
  _newConnection () {
    return new Pusher(this._config)
  }

  /**
   * Create poll connection
   */
  connect () {
    this.connection = this._newConnection()
  }
}

module.exports = PusherFactory
