'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class MessageProvider extends ServiceProvider {
  register () {
    this.app.singleton('Adonis/Addons/Message', (app) => {
      const MessageManager = require('./src/Stores/MessageManager')
      return new MessageManager(app)
    })

    this.app.alias('Adonis/Addons/Message', 'Message')
  }
}

module.exports = MessageProvider
