'use strict'

const GE = require('@adonisjs/generic-exceptions')
const _ = require('lodash')
const proxyHandler = require('./proxyHandler')

class Pusher {
  constructor (Config, Factory) {
    this.Config = Config
    this.Factory = Factory
    this.connectionPools = {}
    return new Proxy(this, proxyHandler)
  }

  /**
   * Closes a given redis connection by quitting
   * and removing it from the connectionsPool.
   *
   * @param   {String} connection
   *
   * @private
   */
  _closeConnection (connection) {
    const pusherConnection = this.connectionPools[connection]
    if (!pusherConnection) {
      return
    }
    _.unset(this.connectionPools, connection)
    return null
  }

  /**
   * Returns instance of a new factory instance for
   * a given connection.
   *
   * @param  {String} [connection='']
   *
   * @return {RedisFactory}
   */
  connection (connection) {
    connection = connection || this.Config.get('pusher.connection')
    const config = this.Config.get(`pusher.${connection}`)

    return this.namedConnection(connection, config)
  }

  /**
   * Creates a connection using raw config and adds it to the
   * connection pool.
   *
   * @method namedConnection
   *
   * @param  {String}        name
   * @param  {Object}        config
   *
   * @return {PusherFactory}
   */
  namedConnection (name, config) {
    if (this.connectionPools[name]) {
      return this.connectionPools[name]
    }

    if (!config || !_.size(config) === 0) {
      throw GE.RuntimeException.missingConfig(name || 'configuration for pusher', 'config/pusher.js')
    }

    this.connectionPools[name] = new this.Factory(config)
    return this.connectionPools[name]
  }

  /**
   * Returns a hash of connection pools
   *
   * @return {Object}
   *
   * @public
   */
  getConnections () {
    return this.connectionPools
  }

  /**
   * Closes a single or number of redis connections
   *
   * @param  {Spread} connections
   *
   * @public
   */
  quit (...name) {
    const connections = _.isArray(name) ? name : [name]
    return Promise.all(_.map(connections, (connection) => this._closeConnection(connection)))
  }
}

module.exports = Pusher
