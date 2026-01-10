'use strict'

/*
 * adonis-lucid-sorter
 *
 * (c) Lookin Anton <lookin@lookinlab.ru>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const _ = require('lodash')
const pluralize = require('pluralize')

/**
 * Methods of query builder to be added
 * to model filter
 */
const aggregates = [
  'select',
  'innerJoin',
  'leftJoin',
  'rightJoin',
  'joinRaw',
  'where',
  'orWhere',
  'groupBy',
  'orderBy'
]

class ModelSorter {
  /**
   * ModelSorter constructor
   *
   * @param {QueryBuilder} query
   * @param {Object} input
   *
   * @return {void}
   */
  constructor (query, input = {}) {
    this.$query = query
    this.$input = this._removeEmptyInput(input)

    // console.log(this.$input)
  }

  /**
   * Remove empty strings from the input data
   *
   * @method _removeEmptyInput
   * @private
   *
   * @param {Object} input
   *
   * @return {Object}
   */
  _removeEmptyInput (input) {
    const filterableInput = {}

    for (const key in input) {
      const value = input[key]

      if (value !== '' && value !== null) {
        filterableInput[key] = value
      }
    }
    return filterableInput
  }

  /**
   * Array of method names that should not be called
   *
   * @method sortable
   * @static
   *
   * @return String[]
   */
  static get sortable () {
    return []
  }

  /**
   * Handle all filters
   *
   * @method handle
   *
   * @return {QueryBuilder}
   */
  handle () {
    /* istanbul ignore next */
    // if (this.setup && typeof (this.setup) === 'function') {
    //   this.setup(this.$query)
    // }
    this._sortInput()

    return this.$query
	}

	/**
	 * Get table name
	 */
	getTableName () {
		return _.chain(pluralize.plural(this.$query.Model.name)).lowerCase().snakeCase().value()
	}

  /**
   * Sort with input object
   *
   * @method _filterInput
   * @private
   *
   * @return {void}
   */
  _sortInput () {
		const input = this.$input
		const tb = this.getTableName()

    for (const key in input) {
      if (!this._columnIsCallable(key)) {
        continue
      }

      const method = this._getSorterMethod(key)

      const value = input[key]
      if (this._methodIsCallable(method)) {
        this[method](value)
      } else {
        this.$query.orderBy(`${tb}.${key}`, value)
      }
    }
  }

  _columnIsCallable (column) {
    const sortableList = this.constructor.sortable
    return !!(~sortableList.indexOf(column))
  }

  /**
   * and callable on the extended class
   *
   * @method _methodIsCallable
   * @private
   *
   * @param {String} method
   *
   * @return {Boolean}
   */
  _methodIsCallable (method) {
    return !!this[method] && typeof (this[method]) === 'function'
  }

  /**
   * Get sorter method name
   *
   * @method _getFilterMethod
   * @private
   *
   * @param {String} key
   *
   * @return {String}
   */
  _getSorterMethod (key) {
    return _.camelCase(this.constructor.dropId ? key.replace(/^(.*)_id$/, '$1') : key)
  }

}

aggregates.forEach((method) => {
  ModelSorter.prototype[method] = function (...args) {
    return this.$query[method](...args)
  }
})

module.exports = ModelSorter
