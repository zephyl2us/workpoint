'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class UserPermission extends Model {
  static boot() {
    super.boot()

    this.addHook('beforeSave', async (data) => {
      if (data.dirty.payload) {
        data.payload = JSON.stringify(data.payload)
      }
    })

    this.addHook('afterFetch', async (data) => {
      for (let item of data) {
        item.payload = JSON.parse(item.payload)
      }
    })
  }
}

module.exports = UserPermission
