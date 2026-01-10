'use strict'

class BaseValidator {
  async fails (errorMessages) {
    errorMessages = errorMessages.map(err => {
      const ruleWithValues = ['min', 'max']

      ruleWithValues.forEach(rule => {
        if (err.validation === rule) {
          err['length'] = this.rules[err.field].split('|').find(r => r.includes(`${rule}:`)).split(':')[1]
        }
      })

      return err
    })

    return this.ctx.response.status(400).send(errorMessages)
  }
}

module.exports = BaseValidator