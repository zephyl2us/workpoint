'use strict'

const Nexmo = require('nexmo')

class NexmoStore {
  constructor (config) {
    const { options, ...nexmoConfig } = config
    this.nexmo = new Nexmo(nexmoConfig, options)
  }

  /**
   * Send sms message
   */
  async sendSms (sender, recipient, message, options) {
    // Change local to Thai national
    const number = this._recipient(recipient)
    return new Promise((resolve, reject) => {
      this.nexmo.message.sendSms(sender, number, message, options, (resp) => {
        resolve(resp)
      })
    })
  }

  /**
   * Request verification request_id
   */
  async requestVerify (sender, recipient, brand) {
    const number = this._recipient(recipient)
    return new Promise((resolve, reject) => {
      this.nexmo.verify.request({ number, brand }, (err, result) => {
        if (err) reject(err)
        resolve(result)
      })
    })
  }

  /**
   * Cancel the previous verification before retry one
   */
  async cancelVerify (requestId) {
    return new Promise((resolve, reject) => {
      this.nexmo.verify.control({ request_id: requestId, cmd: 'cancel' }, (err, result) => {
        if (err) reject(err)
        resolve(result)
      })
    })
  }

  /**
   * Check verification code
   */
  async checkVerify (requestId, code) {
    return new Promise((resolve, reject) => {
      this.nexmo.verify.check({ request_id: requestId, code: code }, (err, result) => {
        if (err) reject(err)
        resolve(result)
      })
    })
	}

	/**
	 * Look up otp by request
	 */
	async searchVerify (requestId) {
		return new Promise((resolve, reject) => {
      // this.nexmo.verify.search(requestId, (err, result) => {
      //   if (err) reject(err)
      //   resolve(result)
			// })

			this.nexmo.message.search('1C0000007A06E3B0', (err, result) => {
        if (err) reject(err)
        resolve(result)
      })

    })
	}

  /**
   * Look up Thai number if not leading with +
   */
  _recipient (recipient) {
    if (!recipient.startsWith('+') && recipient.length === 10) {
      recipient = `+66${recipient.substring(1, recipient.length)}`
    }
    return recipient
  }

}

module.exports = NexmoStore
