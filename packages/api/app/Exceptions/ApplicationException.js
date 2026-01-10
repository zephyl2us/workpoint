'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')

class ApplicationException extends LogicalException {
  /**
   * Handle this exception by itself
   */
  // handle () {}
}

class CreditException extends LogicalException {
  //
}

class PointException extends LogicalException {
  //
}

class LottoException extends LogicalException {
  //
}

class NotBelongsToException extends LogicalException {
  //
}

module.exports = {
  ApplicationException,
  CreditException,
  PointException,
  LottoException,
  NotBelongsToException
}
