'use strict'

const Redis = use('Redis')

class Block {

  /**
   * Constructor
   * @param  {object} Redis
   */
  constructor() {
    this.Redis = Redis.connection('local')
	}

  /**
   * Check exists.
   *
   * @return {boolean}
   */
  async exists (name, seconds = 1, { times = 1 } = {}) {
    const expireInMilliSeconds = seconds * 1000

    const number = await this.Redis.incrby(name, 1)
    if (number > 0) {
      if (number === 1) {
        this.Redis.pexpire(name, expireInMilliSeconds)
      }
      if (number <= times) {
        return false
      }
      const ttl = await this.Redis.ttl(name)
      if (ttl == -1) {
        await this.Redis.del(name)
      }
      return true
    }
    return true
  }

  /**
   * Clear the block
   */
  async destroy (name) {
    await this.Redis.del(name)
    return true
  }

	async ttl(name) {
		const contains = await this.Redis.get(name)
		if (contains !== null) {
			// Sometimes problem with redis expire we check the ttl too.
			const ttl = await this.Redis.ttl(name)
			return ttl
		}
		return false
	}
}

module.exports = Block
