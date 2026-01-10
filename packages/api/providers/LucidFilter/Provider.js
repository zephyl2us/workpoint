'use strict'

const BaseKueProvider = require('adonis-lucid-filter/providers/LucidFilterProvider')

class LucidFilterProvider extends BaseKueProvider {

  _registerModel () {
    this.app.bind('Adonis/Src/ModelFilter', () => require('./ModelFilter'))
    this.app.alias('Adonis/Src/ModelFilter', 'ModelFilter')
  }

  _registerCommand () {
    this.app.bind('Adonis/Commands/Make:ModelFilter', () => require('./commands/MakeModelFilter'))
  }

}

module.exports = LucidFilterProvider
