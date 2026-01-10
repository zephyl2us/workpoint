'use strict'

const Util = require('adonis-cache/src/Util')
const BaseRedisStore = require('adonis-cache/src/Stores/RedisStore')

class RedisStore extends BaseRedisStore {

	constructor (Redis, prefix = '', connection, connectionRo) {
    super(Redis, prefix, connection)
    this.setConnectionRo(connectionRo)
	}

	/**
   * Retrieve an item from the cache by key.
   *
   * @param  {string} key
   * @return {Promise<mixed>}
   */
  async get (key) {
    return Util.deserialize(await this.connectionRo().get(this._prefix + key))
  }

	/**
   * Get the Redis connection instance
   *
   * @return {Object}
   *
   */
  connectionRo () {
    return this._redis.connection(this._connectionRo)
  }

	/**
   * Set the connection name to be used
   *
   * @param {string} connection
   * @return {void}
   */
  setConnectionRo (connection) {
		this._connectionRo = connection
  }

}

module.exports = RedisStore
