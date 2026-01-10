'use strict'

const { ServiceProvider } = require('@adonisjs/fold')
const _ = require('lodash')
_.mixin(require('lodash-inflection'))


class InAppProvider extends ServiceProvider {

  async boot () {
    const Block = use('Block')
    const Request = use('Adonis/Src/Request')

    Request.macro('ingroup', this.$requestIngroup)
    Request.macro('parents', this.$requestParents)
    Request.macro('segments', this.$requestSegments)
		Request.macro('isMethod', this.$requestIsMethod)
		Request.macro('isParent', this.$requestIsParent)
    Request.macro('getChild', this.$requestGetChild)
    Request.macro('getParent', this.$requestGetParent)
    Request.macro('getPresentId', this.$requestGetPresentId)

    Request.macro('block', () => {
      return Block
    })

    // Extend validator rules.
    this.$extendValidatorRules()
  }

  /**
   * Find group in all groups and subgroup
   */
  $requestIngroup (group) {
    return _.replace(group, /^sub/, '')
  }

  /**
   * Pull parent ids from the auth data.
   */
  $requestParents (authUser, data, pick = ['admin_id', 'manager_id', 'smaster_id', 'master_id', 'agent_id']) {
    const authData = authUser.toJSON()
    const currentGroup = _.replace(authData.group, /^sub/, '')
		const appends = _.pick(authData, pick)
    Object.assign(data, appends)
    // If not sub user we need to add more data
    if (!_.startsWith(authData.group, 'sub') && !_.eq(authData.group, 'god')) {
      if(currentGroup !== 'member'){
        data[`${currentGroup}_id`] = authUser.id
      }
    }
  }

	/**
	 * This is similar with guard, but use with api token
	 */
	$requestIsParent (authUser, resource) {
		const group = this.ingroup(authUser.group)
		const field = `${group}_id`
		const presentId = resource[field]
		return _.eq(presentId, resource[field])
	}

  /**
   * Extract url path to array.
   */
  $requestSegments (segment, { singular = true } = {}) {
    const url = this.url()
    var segments = url.split('/').filter(Boolean)
    if (singular) {
      segments = segments.map((o) => _.singularize(o))
    }
    if (segment) {
      return segments[segment]
    }
    return segments
  }

  /**
   * Check is method.
   */
  $requestIsMethod (method) {
    return _.toLower(this.method()) === method
  }

  /**
   * Get the real present id from auth data.
   */
  $requestGetPresentId (authUser) {
    const authData = authUser.toJSON()
    const groupId = `${this.ingroup(authData.group)}_id`
    // Case officer
    if (_.has(authData, groupId)) {
      return authData[groupId]
    }
    // Case member
    return authData.id
  }

  /**
   * Retrive child from the user
   */
  $requestGetChild (authUser) {
    const groups = ['god', 'admin', 'manager', 'smaster', 'master', 'agent', 'member', 'dealer']
    const authData = authUser.toJSON()
    const group = this.ingroup(authData.group)

    const index = groups.findIndex((i) => i == group)
    const parent = groups[index + 1]

    return {
      group: parent,
      column: `${parent}_id`,
      id: authData[`${parent}_id`] || null
    }
  }

  /**
   * Retrive parent from the user
   */
  $requestGetParent (authUser) {
    const groups = ['god', 'admin', 'manager', 'smaster', 'master', 'agent', 'member', 'dealer']
    const authData = authUser.toJSON()
    const group = this.ingroup(authData.group)

    const index = groups.findIndex((i) => i == group)
    const parent = groups[index - 1]

    return {
      group: parent,
      column: `${parent}_id`,
      id: authData[`${parent}_id`] || null
    }
  }

  /**
   * Extend validator rules.
   */
  $extendValidatorRules () {
    const Database = use('Database')
    const Validator = use('Validator')

    // Exact: must be the same length
    Validator.extend('exact', async function (data, field, message, args, get) {
      const value = get(data, field)
      if (!_.eq(value.length, Number(args[0]))) {
        throw message
      }
    })
    // Numeric: check the number case
    Validator.extend('numeric', async function (data, field, message, args, get) {
      const fieldValue = get(data, field)
      if (!fieldValue) {
        return
      }
      if (!isNaN(parseFloat(fieldValue)) && isFinite(fieldValue)) {
        return
      }
      throw message
    })
    // Check exists in the db
    Validator.extend('exists', async function (data, field, message, args, get) {
      const value = get(data, field)
      // Bypass on not valueable
      if (!value) {
        return
      }
      // Find in the db
      const [table, column] = args
      const row = await Database.table(table).where(column, value).first()
      if (!row) {
        throw message
      }
    })
		// Check is mobile
    Validator.extend('isMobile', async function (data, field, message, args, get) {
      const value = get(data, field)
      if (!value) return

      const pattern = /^\d+$/

      if (!pattern.test(value) || value.length != 10) {
        throw message
      }
		})
  }

}

module.exports = InAppProvider
