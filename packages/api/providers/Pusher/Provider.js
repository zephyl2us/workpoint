'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class PusherProvider extends ServiceProvider {
  register () {
    this.app.bind('Adonis/Addons/PusherFactory', () => require('./src/PusherFactory'))

    this.app.singleton('Adonis/Addons/Pusher', (app) => {
      const PusherFactory = app.use('Adonis/Addons/PusherFactory')
      const Config = app.use('Adonis/Src/Config')
      const Pusher = require('./src/Pusher')
      return new Pusher(Config, PusherFactory)
    })

    this.app.alias('Adonis/Addons/Pusher', 'Pusher')
  }
}

module.exports = PusherProvider
