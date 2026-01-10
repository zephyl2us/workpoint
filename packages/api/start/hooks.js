'use strict'

const { hooks } = require('@adonisjs/ignitor')

/**
 * Debug all sql as string.
 */
function fullSqlReading (query) {
  const { sql, bindings } = query
  let i = 0
  const template = sql.replace(/\?/gi, () => {
    const string = `'${bindings[i]}'`
    i++
    return string
  })
  return template
}

hooks.after.providersBooted(() => {
  const Helper = use('App/Helper')
  const Validator = use('Validator')
  const Database = use('Database')
  const _ = use('lodash')

  if (Helper.isDebugDb()) {
		const chalk = require('chalk')
		// Debug db writer
    const Database = use('Database')
    Database.connection('mysql').on('query', (query) => {
			console.log('[WRITER]')
      console.log(chalk.yellow(fullSqlReading(query)))
    })
		// debug db reader
		Database.connection('mysql_read').on('query', (query) => {
			console.log('[READER]')
      console.log(chalk.green(fullSqlReading(query)))
    })
  }

  const hasFn = async (data, field, message, args, get) => {
    const value = get(data, field)
    const [table, column] = args
    const row = await Database.table(table).where(column, value).first()
  
    if (!row) {
      throw message
    }
  }
  Validator.extend('has', hasFn)

  const objValidFn = async (data, field, message, args, get) => {
    const objs = get(data, field)
    for (let obj of objs) {
      for (let arg of args) {
        if(!_.has(obj, arg)) throw message
      }
    }
  }
  Validator.extend('objValid', objValidFn)

  const arrayIsFn = async (data, field, message, args, get) => {
    if (_.size(args) > 1 ) throw 'function only can verify array by one argrument'
    const objs = get(data, field)
    for (let obj of objs) {
      if(typeof obj !== args[0]) throw message
    }
  }
  Validator.extend('arrayIs', arrayIsFn)

  const isMobileFn = async (data, field, message, args, get) => {
    const value = get(data, field)
    if (!value) return

    const pattern = /^0\d+$/

    if (!pattern.test(value) || value.length != 10) {
      throw message
    }
  }
  Validator.extend('is_mobile', isMobileFn)

})
