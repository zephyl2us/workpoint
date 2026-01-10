'use strict'

const _ = use('lodash')
const Model = use('Model')
const Filter = use('App/Models/Filters/UserFilter')
const Sorter = use('App/Models/Sorters/UserSorter')

const getUsername = (value) => {
  const splitUsername = _.split(value, '@')
  splitUsername.pop()
  return _.join(splitUsername)
}

class User extends Model {
  static boot () {
    super.boot()

    this.addTrait('@provider:Filterable', Filter)
    this.addTrait('@provider:Sortable', Sorter)

    this.addHook('beforeSave', async (data) => {
    })

    this.addHook('afterFind', async (data) => {
      // data.username = getUsername(data.username)
    })

    this.addHook('afterFetch', async (data) => {
      for (let item of data) {
        item.username = getUsername(item.username)
      }
    })

    this.addHook('afterPaginate', async (data) => {
      for (let item of data) {
        item.username = getUsername(item.username)
      }
    })
  }

  static get hidden() {
    return ['password', 'deleted_at']
  }
  
  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens () {
    return this.hasMany('App/Models/Token')
  }

  permission () {
    return this.hasOne('App/Models/UserPermission')
	}
}

module.exports = User
