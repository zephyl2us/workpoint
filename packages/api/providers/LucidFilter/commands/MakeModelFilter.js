'use strict'

const path = require('path')
const BaseMakeModelFilter = require('adonis-lucid-filter/commands/MakeModelFilter')

class MakeModelFilter extends BaseMakeModelFilter {

  async handle ({ name }) {
    name = name.replace(/Filter$/g, '')
    name += 'Filter'

    /**
     * Reading template as a string form the mustache file
     */
    const template = await this.readFile(path.join(__dirname, '../templates/filter.mustache'), 'utf8')

    /**
     * Directory paths
     */
    const relativePath = path.join('app/Models/Filters', `${name}.js`)
    const filterPath = path.join(this.Helpers.appRoot(), relativePath)

    /* istanbul ignore next */
    if (!this.viaAce) {
      return this.generateFile(filterPath, template, { name })
    }

    /* istanbul ignore next */
    try {
      await this.generateFile(filterPath, template, { name })
      this.completed('create', relativePath)
    } catch (error) {
      this.error(`${relativePath} filter already exists`)
    }
  }

}

module.exports = MakeModelFilter
