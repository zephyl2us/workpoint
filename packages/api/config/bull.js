'use strict'

const Config = use('Config')

module.exports = {
  connection: 'queue',
  queue: {
    redis: Config.get('redis.queue')
  }
}
