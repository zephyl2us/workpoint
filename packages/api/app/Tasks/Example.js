'use strict'

const Task = use('Task')

class Example extends Task {
  static get schedule () {
    return '0 */1 * * * *'
  }

  async handle () {
    console.log('Task Example handle')
  }
}

module.exports = Example
