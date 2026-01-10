'use strict'

const BaseSchedulerProvider = require('adonis-scheduler/providers/SchedulerProvider')
const path = require('path')

class SchedulerProvider extends BaseSchedulerProvider {

  _registerScheduler () {
    this.app.singleton('Adonis/Addons/Scheduler', (app) => {
      return make(require('.'))
    })
    this.app.alias('Adonis/Addons/Scheduler', 'Scheduler')
  }

  _registerCommands () {
    this.app.bind('Adonis/Commands/Run:Scheduler', () => require('adonis-scheduler/src/Commands/Run/Scheduler'))
    this.app.bind('Adonis/Commands/Make:Task', () => require('adonis-scheduler/src/Commands/Make/Task'))
  }

  boot () {
    const ace = require('@adonisjs/ace')
    ace.addCommand('Adonis/Commands/Run:Scheduler')
    ace.addCommand('Adonis/Commands/Make:Task')
  }

  register () {
    this._registerScheduler()
    this._registerTask()
    this._registerCommands()
  }

}

module.exports = SchedulerProvider
