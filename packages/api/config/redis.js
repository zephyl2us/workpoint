'use strict'

/*
|--------------------------------------------------------------------------
| Redis Configuaration
|--------------------------------------------------------------------------
|
| Here we define the configuration for redis server. A single application
| can make use of multiple redis connections using the redis provider.
|
*/
const _ = use('lodash')
const Env = use('Env')

const config = {
  /*
  |--------------------------------------------------------------------------
  | connection
  |--------------------------------------------------------------------------
  |
  | Redis connection to be used by default.
  |
  */
  connection: Env.get('REDIS_CONNECTION', 'local'),

  /*
  |--------------------------------------------------------------------------
  | local connection config
  |--------------------------------------------------------------------------
  |
  | Configuration for a named connection.
  |
  */
  local: {
    host: Env.get('REDIS_HOST'),
    port: Env.get('REDIS_PORT', 6379),
    username: Env.get('REDIS_USERNAME', null),
    password: Env.get('REDIS_PASSWORD', null),
    db: 0,
    keyPrefix: 'mega:',
		pool: {
      idleTimeoutMillis: 30000, // ปิด connection ที่ไม่ได้ใช้งานเกิน 30 วินาที
      evictionRunIntervalMillis: 1000 // ตรวจสอบ connection ที่ไม่ได้ใช้งานทุก 1 วินาที
    }
  },

  /*
|--------------------------------------------------------------------------
| commom connection config
|--------------------------------------------------------------------------
|
| Configuration is the same as local (cache)
|
*/
  session: {
    host: Env.get('REDIS_HOST'),
    port: Env.get('REDIS_PORT', 6379),
    username: Env.get('REDIS_USERNAME', null),
    password: Env.get('REDIS_PASSWORD', null),
    db: 1,
    keyPrefix: 'mega:',
		pool: {
      idleTimeoutMillis: 30000, // ปิด connection ที่ไม่ได้ใช้งานเกิน 30 วินาที
      evictionRunIntervalMillis: 1000 // ตรวจสอบ connection ที่ไม่ได้ใช้งานทุก 1 วินาที
    }
  },

  user: {
    host: Env.get('REDIS_HOST'),
    port: Env.get('REDIS_PORT', 6379),
    username: Env.get('REDIS_USERNAME', null),
    password: Env.get('REDIS_PASSWORD', null),
    db: 2,
    keyPrefix: 'mega:',
		pool: {
      idleTimeoutMillis: 30000, // ปิด connection ที่ไม่ได้ใช้งานเกิน 30 วินาที
      evictionRunIntervalMillis: 1000 // ตรวจสอบ connection ที่ไม่ได้ใช้งานทุก 1 วินาที
    }
  },

  temp: {
    host: Env.get('REDIS_HOST'),
    port: Env.get('REDIS_PORT', 6379),
    username: Env.get('REDIS_USERNAME', null),
    password: Env.get('REDIS_PASSWORD', null),
    db: 3,
    keyPrefix: 'mega:',
		pool: {
      idleTimeoutMillis: 30000, // ปิด connection ที่ไม่ได้ใช้งานเกิน 30 วินาที
      evictionRunIntervalMillis: 1000 // ตรวจสอบ connection ที่ไม่ได้ใช้งานทุก 1 วินาที
    }
  },

  lottery: {
    host: Env.get('REDIS_HOST'),
    port: Env.get('REDIS_PORT', 6379),
    username: Env.get('REDIS_USERNAME', null),
    password: Env.get('REDIS_PASSWORD', null),
    db: 4,
    keyPrefix: 'mega:',
		pool: {
      idleTimeoutMillis: 30000, // ปิด connection ที่ไม่ได้ใช้งานเกิน 30 วินาที
      evictionRunIntervalMillis: 1000 // ตรวจสอบ connection ที่ไม่ได้ใช้งานทุก 1 วินาที
    }
  },

  army: {
    host: Env.get('REDIS_HOST'),
    port: Env.get('REDIS_PORT', 6379),
    username: Env.get('REDIS_USERNAME', null),
    password: Env.get('REDIS_PASSWORD', null),
    db: 5,
    keyPrefix: 'mega:',
		pool: {
      idleTimeoutMillis: 30000, // ปิด connection ที่ไม่ได้ใช้งานเกิน 30 วินาที
      evictionRunIntervalMillis: 1000 // ตรวจสอบ connection ที่ไม่ได้ใช้งานทุก 1 วินาที
    }
  },

	queue: {
		host: Env.get('REDIS_HOST'),
		port: Env.get('REDIS_PORT', 6379),
    username: Env.get('REDIS_USERNAME', null),
		password: Env.get('REDIS_PASSWORD', null),
		db: 10,
		keyPrefix: 'mega:',
		pool: {
      idleTimeoutMillis: 30000, // ปิด connection ที่ไม่ได้ใช้งานเกิน 30 วินาที
      evictionRunIntervalMillis: 1000 // ตรวจสอบ connection ที่ไม่ได้ใช้งานทุก 1 วินาที
    }
	},

  /*
  |--------------------------------------------------------------------------
  | cluster config
  |--------------------------------------------------------------------------
  |
  | Below is the configuration for the redis cluster.
  |
  */
  cluster: {
    clusters: [{
      host: '127.0.0.1',
      port: 6379,
      password: null,
      db: 0,
			pool: {
				idleTimeoutMillis: 30000, // ปิด connection ที่ไม่ได้ใช้งานเกิน 30 วินาที
				evictionRunIntervalMillis: 1000 // ตรวจสอบ connection ที่ไม่ได้ใช้งานทุก 1 วินาที
			}
    },
    {
      host: '127.0.0.1',
      port: 6380,
      password: null,
      db: 0,
			pool: {
				idleTimeoutMillis: 30000, // ปิด connection ที่ไม่ได้ใช้งานเกิน 30 วินาที
				evictionRunIntervalMillis: 1000 // ตรวจสอบ connection ที่ไม่ได้ใช้งานทุก 1 วินาที
			}
    }]
  }
}


if (Env.get('NODE_ENV') === 'production') {
  const tls = {
    host: Env.get("REDIS_HOST"),
  }

  _.each(config, (obj, key) => {
    const conf = _.assign(obj, {
      tls: tls
    })
    config[key] = conf
  })
}
module.exports = config
