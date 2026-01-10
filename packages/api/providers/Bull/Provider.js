'use strict'

const { ServiceProvider, resolver } = require('@adonisjs/fold')
const path = require('path')

class BullProvider extends ServiceProvider {

  _registerBull () {
    this.app.singleton('Rocketseat/Bull', (app) => {
      const Queue = require('.')
      const Helpers = app.use('Adonis/Src/Helpers')
      const Logger = app.use('Adonis/Src/Logger')
      const Config = app.use('Adonis/Src/Config')
      const jobs = require(path.join(Helpers.appRoot(), 'start/jobs.js')) || []
      return new Queue(Logger, Config, jobs, app, resolver)
    })
    this.app.alias('Rocketseat/Bull', 'Bull')
  }

  _registerCommands () {
    this.app.bind('Adonis/Commands/Bull:Listen', () => require('./commands/BullListen'))
    this.app.bind('Adonis/Commands/Bull:Monit', () => require('./commands/BullMonit'))
  }

  boot () {
    const ace = require('@adonisjs/ace')
    ace.addCommand('Adonis/Commands/Bull:Listen')
    ace.addCommand('Adonis/Commands/Bull:Monit')
  }

  register () {
    this._registerBull()
    this._registerCommands()
  }
}

module.exports = BullProvider
