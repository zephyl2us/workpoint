'use strict'

const _ = use('lodash')
const Event = use('Event')

class Repository {

  constructor ({ store, sender }) {
    this._store = store
    this._sender = sender

    return new Proxy(this, {
      get: function (target, name) {
        if (target[name] !== undefined) {
          return target[name]
        }

        // Pass missing functions to the store.
        if (typeof target._store[name] === 'function') {
          return target._store[name].bind(target._store)
        }
      }
    })
  }

  /**
   * Send the sms message
   */
  async send ({ sender, number, message, options = {} } = {}) {
    sender = sender || this._sender
    return await this._store.sendSms(sender, number, message, options)
  }

  /**
   * Request otp verify to mobile
   */
  async otpRequest ({ sender, number, brand, codeLength = 4, options = { expires: 300 } } = {}) {
		sender = sender || this._sender
		const response = await this._store.requestVerify(sender, number, brand, codeLength, options)

		const requestId = _.get(response, 'request_id')
		Event.fire('sms::created', {
			brand: brand,
			number: number,
			options: options,
			request_id: requestId
		})

		return response
  }

  /**
   * Cancel otp verify
   * This method need to call before retry the new one
   * [Cannot cancel on first 30 seconds]
   */
  async otpCancel (requesId) {
    return await this._store.cancelVerify(requesId)
  }

  /**
   * Check match code
   */
  async otpCheck (requestId, code) {
    return await this._store.checkVerify(requestId, code)
	}

	/**
	 * Search by request id
	 */
	async otpSearch (requestId) {
		return await this._store.searchVerify(requestId)
	}

}

module.exports = Repository
