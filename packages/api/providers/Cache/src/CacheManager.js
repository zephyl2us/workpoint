'use strict'

const BaseCacheManager = require('adonis-cache/src/Stores/CacheManager')

const Repository = require('./Repository')
const RedisStore = require('./RedisStore')

class CacheManager extends BaseCacheManager {

  /**
   * Create a new cache repository with the given implementation.
   *
   * @param  {Store}  store
   * @return {Repository}
   */
  repository (store) {
    const repository = new Repository(store)

    const Event = this._app.use('Adonis/Src/Event')
    if (Event != null) {
      repository.setEventDispatcher(Event)
    }

    return repository
	}

	/**
   * Create an instance of the Redis cache driver.
   *
   * @param  {object}  config
   * @return {Repository}
   * @private
   */
  _createRedisDriver (config) {
    const redis = this._app.use('Adonis/Addons/Redis')
		const connection = config['connection'] ? config['connection'] : 'local'
		const connectionReadOnly = config['readConnection'] ? config['readConnection'] : connection

		// console.log(connectionReadOnly)

    return this.repository(
			new RedisStore(
				redis,
				this._getPrefix(config),
				connection,
				connectionReadOnly
			)
		)
  }

}

module.exports = CacheManager
