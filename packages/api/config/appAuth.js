
'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | App Available
  |--------------------------------------------------------------------------
  */
  apps: [
    'core',
    'huay_scanner'
  ],

  app: {
    core: {
      sessionExpire: 300,
      single: true,
    },
    huay_scanner: {
      sessionExpire: 43200,
      single: true,
    }
  }
}