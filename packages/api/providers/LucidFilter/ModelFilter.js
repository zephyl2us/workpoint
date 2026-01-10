'use strict'

const BaseModelFilter = require('adonis-lucid-filter/src/Model')

/*
 * adonis-lucid-filter
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
  'orderBy',
  'where',
  'whereNot',
  'whereIn',
  'whereNotIn',
  'whereNull',
  'whereNotNull',
  'whereExists',
  'whereNotExists',
  'whereBetween',
  'whereNotBetween',
  'whereRaw',
  'whereHas',
  'orWhereHas',
  'whereDoesntHave',
  'orWhereDoesntHave',
  'with',
  'withCount',
  'has',
  'orHas',
  'doesntHave',
  'orDoesntHave'
]

/**
 * ModelFilter class to filtering Adonis Lucid ORM
 *
 * @class ModelFilter
 * @constructor
 */
class ModelFilter extends BaseModelFilter {
  /**
   * ModelFilter constructor
   *
   * @param {QueryBuilder} query
   * @param {Object} input
   *
   * @return {void}
   */
  constructor (query, input = {}) {
    super(query, input)
	}

	/**
	 * Get table name
	 */
	getTableName () {
		// return _.chain(this.$query.Model.name).plural().snakeCase().value()
		// return _.chain(pluralize.plural(this.$query.Model.name)).snakeCase().value()
		return _.chain(pluralize.plural(this.$query.Model.name)).lowerCase().snakeCase().value()
	}
}

aggregates.forEach((method) => {
  ModelFilter.prototype[method] = function (...args) {
    return this.$query[method](...args)
  }
})

module.exports = ModelFilter
