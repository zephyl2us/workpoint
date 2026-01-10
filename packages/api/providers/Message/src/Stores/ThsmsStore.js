'use strict'

const _ = require('lodash')
const axios = require('axios')
const shortid = require('shortid')
const randomize = require('randomatic')
const secToHuman = require('seconds-to-human')

class ThsmsStore {
  constructor (config, Redis, connection) {
    this._config = config
    this._redis = Redis
    this.setConnection(connection)
  }

  /**
   * Send the sms message
   */
  async sendSms (sender, recipient, message) {
		const { apiPath, ...config } = this._config

		const axiosConfig = {
			headers: {
				'Authorization': `Bearer ${config.apiToken}`
			}
		}

		const bodyParameters = {
			"sender": sender,
			"msisdn": [recipient],
			"message": message
		}

		// const response = await axios.post(apiPath, bodyParameters, axiosConfig)

		axios.post(apiPath, bodyParameters, axiosConfig)
			.then(function (response) {
				const data = _.get(response, 'data.data')
				const creditUsage = data.credit_usage
				const remainingCredit = data.remaining_credit
			})
			.catch(function (error) {
				// Do something
			})


    // const props = {
    //   ...config,
    //   method: 'send',
    //   from: sender,
    //   to: recipient,
    //   message: message
    // }

    // const encodeQuery = this._encodeData(props)
		// const requestUrl = `${apiPath}?${encodeQuery}`
		// return await axios.get(requestUrl)
  }

  /**
   * Request verification request_id
   */
  async requestVerify (sender, recipient, brand, codeLength, options = {}) {
    // check the exists
    const exists = await this.connection().keys(`*otp:${recipient}*`)
    if (exists.length) {
      return {
        status: '10',
        request_id: this._removeOtpPrefixKey(exists[0]),
        error_text: 'Concurrent verifications to the same number are not allowed'
      }
		}

    // Generate request and code save to db
    const shortId = shortid.generate()
    const requestId = `otp:${recipient}:${shortId}`
		const code = randomize('0', codeLength)
		const expires = Number(options.expires)

		await this.connection().setex(requestId, expires, `${code}|${expires}`)

    // Send message to recipient
    const duration = secToHuman(expires)
		const message = `${brand} code: ${code}. Valid for ${duration}`

		// Can disable on dev
		this.sendSms(sender, recipient, message)

    return {
      status: '0',
      request_id: requestId
    }
  }

  /**
   * Cancel the previous verification before retry one
   */
  async cancelVerify (requestId) {
    const request = await this.connection().get(requestId)
    if (!request) {
      return {
        status: '6',
        error_text: `The requestId '${requestId}' does not exist or its no longer active.`
      }
    }
    // Cannot cancel before 30 seconds
    const [ code, expires ] = request.split('|')
    const ttl = await this.connection().ttl(requestId)
    const duration = parseInt(expires) - parseInt(ttl)
    if (duration <= 30) {
      return {
        status: '19',
        error_text: `Verification request ['${requestId}'] can't be cancelled within the first 30 seconds.`
      }
    }
    // Delete db
    await this.connection().del(requestId)

    return {
      status: '0',
      command: 'cancel'
    }
  }

  /**
   * Check verification code
   */
  async checkVerify (requestId, compare) {
    const request = await this.connection().get(requestId)
    if (!request) {
      return {
        status: '6',
        error_text: `The platform was unable to process this message for the following reason: Request '${requestId}' was not found or it has been verified already.`
      }
    }

    const [ code, expires ] = request.split('|')

    if (!_.eq(code, compare)) {
      return {
        status: '16',
        request_id: requestId,
        error_text: 'The code provided does not match the expected value'
      }
    }
    // Delete request after done
    await this.connection().del(requestId)

    return {
      status: '0',
      request_id: requestId
    }
	}

	/**
	 * Look up otp by request
	 */
	async searchVerify (requestId) {
		//
	}

  /**
   * Remove prefix from scan
   */
  _removeOtpPrefixKey (key) {
    const found = key.match(/^([a-z]+:)?(otp(.*))/)
    return !_.isUndefined(found[2]) ? found[2] : null
  }

  /**
   * Encode url parameters
   */
  _encodeData (data) {
    return Object.keys(data).map(function(key) {
      return [key, data[key]].map(encodeURIComponent).join("=")
    }).join("&")
  }

  /**
   * Get the Redis connection instance
   *
   * @return {Object}
   *
   */
  connection () {
    return this._redis.connection(this._connection)
  }

  /**
   * Set the connection name to be used
   *
   * @param {string} connection
   * @return {void}
   */
  setConnection (connection) {
    this._connection = connection
  }

}

module.exports = ThsmsStore
