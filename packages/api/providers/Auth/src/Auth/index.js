'use strcit'

const _ = require('lodash')
const AuthManager = require('./Manager')
const GE = require('@adonisjs/generic-exceptions')
const BaseAuth = require('@adonisjs/auth/src/Auth')

class Auth extends BaseAuth {

	authenticator (name) {
    name = name || this.Config.get('auth.authenticator')

    /**
     * if authenticator instance exists, please return it
     */
    if (this._authenticatorsPool[name]) {
      return this._authenticatorsPool[name]
    }

    const config = this.Config.get(`auth.${name}`)

    /**
     * Throws exception when config is defined or missing
     */
    if (!config || !_.size(config)) {
      throw GE.RuntimeException.missingConfig(`auth.${name}`, 'config/auth.js')
    }

    /**
     * Throws exception if any of the required config keys are
     * missing
     */
    if (!_.every([config.serializer, config.scheme])) {
      throw GE.RuntimeException.incompleteConfig(['serializer', 'scheme'], 'config/auth.js', `auth.${name}`)
    }

    /**
     * Configuring serializer
     */
    const serializerInstance = AuthManager.getSerializer(config.serializer)
    serializerInstance.setConfig(config)

    /**
     * Configuring scheme
     */
    const schemeInstance = AuthManager.getScheme(config.scheme)
    schemeInstance.setOptions(config, serializerInstance)
    schemeInstance.setCtx(this._ctx)

    /**
     * Storing scheme instance inside pool
     */
    this._authenticatorsPool[name] = schemeInstance
    return schemeInstance
  }
}

module.exports = Auth
