'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class BlockProvider extends ServiceProvider {
  register () {
    this.app.singleton('App/Block', () => {
      const Config = this.app.use('Adonis/Src/Config')
      return new (require('.'))(Config)
    })
    this.app.alias('App/Block', 'Block')
  }
}

module.exports = BlockProvider
