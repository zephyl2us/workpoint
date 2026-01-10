'use strict'

const _ = require('lodash')
const path = require('path')
const util = require('util')

/*
|--------------------------------------------------------------------------
| Providers
|--------------------------------------------------------------------------
|
| Providers are building blocks for your Adonis app. Anytime you install
| a new Adonis specific package, chances are you will register the
| provider here.
|
*/
const providers = [
  '@adonisjs/framework/providers/AppProvider',
  '@adonisjs/framework/providers/ViewProvider',
  '@adonisjs/lucid/providers/LucidProvider',
  '@adonisjs/bodyparser/providers/BodyParserProvider',
  '@adonisjs/cors/providers/CorsProvider',
  '@adonisjs/shield/providers/ShieldProvider',
  '@adonisjs/session/providers/SessionProvider',
  // '@adonisjs/auth/providers/AuthProvider',
  '@adonisjs/drive/providers/DriveProvider',
  '@adonisjs/redis/providers/RedisProvider',
	'@adonisjs/loggly/providers/LogglyProvider',
  '@adonisjs/validator/providers/ValidatorProvider',
  'adonis-guard/providers/GuardProvider',
  '@radmen/adonis-lucid-soft-deletes/providers/SoftDeletesProvider',
  'adonis-lucid-update-or-create/providers/UpdateOrCreateProvider',
  path.join(__dirname, '..', 'providers', 'Auth/Provider'),
  path.join(__dirname, '..', 'providers', 'Cache/Provider'),
  path.join(__dirname, '..', 'providers', 'Block/Provider'),
  path.join(__dirname, '..', 'providers', 'Bull/Provider'),
  path.join(__dirname, '..', 'providers', 'Scheduler/Provider'),
  path.join(__dirname, '..', 'providers', 'LucidFilter/Provider'),
  path.join(__dirname, '..', 'providers', 'LucidSorter/Provider'),
  path.join(__dirname, '..', 'providers', 'Pusher/Provider'),
  // path.join(__dirname, '..', 'providers', 'Message/Provider'),
  path.join(__dirname, '..', 'providers', 'Block/Provider'),
  path.join(__dirname, '..', 'providers', 'InAppProvider'),
]

/*
|--------------------------------------------------------------------------
| Ace Providers
|--------------------------------------------------------------------------
|
| Ace providers are required only when running ace commands. For example
| Providers for migrations, tests etc.
|
*/
const aceProviders = [
  '@adonisjs/lucid/providers/MigrationsProvider'
]

/*
|--------------------------------------------------------------------------
| Aliases
|--------------------------------------------------------------------------
|
| Aliases are short unique names for IoC container bindings. You are free
| to create your own aliases.
|
| For example:
|   { Route: 'Adonis/Src/Route' }
|
*/
const aliases = {
  Cache: 'Adonis/Addons/Cache',
}

/*
|--------------------------------------------------------------------------
| Commands
|--------------------------------------------------------------------------
|
| Here you store ace commands for your package
|
*/
const commands = [
  'App/Commands/Test',
  'App/Commands/ArmyAntUpdate',
  'App/Commands/ArmyAntRunner',
  'App/Commands/ArmyAntStarter',
  'App/Commands/ArmyAntStopper',
  'App/Commands/ArmyAntAdsPowerTransfer',
  'App/Commands/ArmyProxyStatus',
  'App/Commands/MovieReTranscode',
  'App/Commands/MovieUpdate',
  'App/Commands/MovieVideo'
]

/**
 * Add console.deep tp easy debug nested object
 */
console.deep = function (msg, ...options) {
  console.log(util.inspect(msg, { showHidden: false, depth: null, colors: true }))
}

/**
 * Ignore knex warning
 */
console.log = function (msg, ...options) {
  const ignore = '.returning() is not supported by mysql and will not have any effect.'
  if (!_.isString(msg) || msg.indexOf(ignore) === -1) {
    console.info(msg, ...options)
  }
}

module.exports = { providers, aceProviders, aliases, commands }
