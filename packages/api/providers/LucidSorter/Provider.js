'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class LucidSorterProvider extends ServiceProvider {
  _registerSorter () {
    this.app.bind('Adonis/Addons/LucidSorter', () => {
      const LucidSorter= require('./')
      return new LucidSorter()
    })
    this.app.alias('Adonis/Addons/LucidSorter', 'Sortable')
  }

  _registerModel () {
    this.app.bind('Adonis/Src/ModelSorter', () => require('./ModelSorter'))
    this.app.alias('Adonis/Src/ModelSorter', 'ModelSorter')
  }

  _registerCommand () {
    this.app.bind('Adonis/Commands/Make:ModelSorter', () => require('./commands/MakeModelSorter'))
  }

  register () {
    this._registerSorter()
    this._registerModel()
    this._registerCommand()
  }

  boot () {
    const ace = require('@adonisjs/ace')
    ace.addCommand('Adonis/Commands/Make:ModelSorter')
  }
}

module.exports = LucidSorterProvider
