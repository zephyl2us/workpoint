'use strict'

const _ = use('lodash')
const md5 = use('md5')
const Bull = use('Bull')
const Redis = use('Redis')
const moment = use('moment')
const Helper = use('App/Helper')
const rp = use('request-promise')

class SmsRepository {

  static get inject() {
    return [
      // 'App/Models/Movie',
    ]
  }

  constructor() {
		this.Redis = Redis.connection('temp')

    this.cachePermissionDuration = 60
    this.maxRequestPerHour = 5
    this.verificationTime = 30
  }

  async send (from, phone, message, driver = 'thsms') {
    // console.log(phone)

    const to = phone.substring(1, phone.length)

    const data = {
      from: from,
      to: to,
      message: message,
      driver: driver
    }

    await this.sending(data)
    // Bull.add(SendSms.key, data)
  }

  // For Jobs
  async sending (data) {
    let result = false

    if(_.eq(data.driver, 'thsms')) {
      result = this.senderThsms(data)
    } else if(_.eq(data.driver, 'vonage')) {
      result = this.senderVonage(data)
    }

    return result
  }

  async senderThsms (data) {
    const token = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC90aHNtcy5jb21cL21hbmFnZVwvYXBpLWtleSIsImlhdCI6MTY5Mjk3NzUxMywibmJmIjoxNjkyOTc3NTEzLCJqdGkiOiJITVFsQjZCRFJ6MzRRT1FtIiwic3ViIjoxMTAzMjksInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.bVwDobiXrmusxiZrB2FxcXDMqhrLXCBpNBF49bqd2-U`

    const to = '0' + data.to
    const from = data.from
    const message = data.message

    const options = {
      method: `POST`,
      uri: `https://thsms.com/api/send-sms`,
			headers: {
				authorization: `Bearer ${token}`
			},
      body: {
        sender: from,
        msisdn: [to],
        message: message
      },
      json: true
    }

		const result = await this.request(options)
    // console.log(result)
    return result
  }

  async senderVonage (data) {
    const { Vonage } = require('@vonage/server-sdk')
    
    const vonage = new Vonage({
      apiKey: "71ecb211",
      apiSecret: "47deb8d45665acd6"
    })

    const to = '66' + data.to
    const from = data.from
    const message = data.message

    // console.log(to, from, message)

    await vonage.sms.send({to, from, message})
      .then(resp => { 
        console.log('Message sent successfully')
        console.log(resp)
      })
      .catch(err => { 
        console.log('There was an error sending the messages.')
        console.error(err)
      })
  }

  async otpRequest (request, app, phone) {
    const ref = _.toUpper(Helper.randomString(4))
    const code = Helper.randomNumber(6)
    const expireAt = moment().add(this.verificationTime, 'minutes').format('YYYY-MM-DD HH:mm:ss')

		const ip = request.header('cf-connecting-ip') || request.ip()

    const encryptIp = md5(ip)
    const ipCacheKey = `block:ip:${encryptIp}:${app}`

    const dataKeys = await this.Redis.keys(`mega:${ipCacheKey}:*`)

    if (dataKeys.length >= this.maxRequestPerHour) {
      return {
        ref,
        code,
        expired_at: expireAt,
        message: `request limit per hour`,
        status: false
      }
    }

    let blockData = {
      request: request.headers(),
      app: app,
      phone: phone
    }
    blockData = JSON.stringify(blockData)

    const unixTime = moment().valueOf()

    const ipTimeCacheKey = `${ipCacheKey}:${unixTime}`
    const pipeline = this.Redis.pipeline()
    pipeline.set(ipTimeCacheKey, blockData)
    pipeline.expire(ipTimeCacheKey, 60 * 60)

    const verifyCacheKey = `verify:phone:${phone}`
    let verifyData = {
      ref,
      code,
      request: request.headers(),
      expired_at: expireAt,
    }
    verifyData = JSON.stringify(verifyData)

    pipeline.set(verifyCacheKey, verifyData)
    pipeline.expire(verifyCacheKey, this.verificationTime * 60)
    await pipeline.exec()

    const message = `รหัส OTP: ${code} สำหรับยืนยันตัวตน (ภายใน ${this.verificationTime} นาที) รหัสอ้างอิง: ${ref}`
    await this.send('KULT SMS', phone, message)

    return {
      ref,
      code,
      expired_at: expireAt,
      status: true
    }
  }

  async otpActivate (phone, code) {
    const verifyCacheKey = `verify:phone:${phone}`
    const expireAt = moment().add(this.verificationTime, 'minutes').format('YYYY-MM-DD HH:mm:ss')

    const verify = await this.otpValidate(phone, code)

    if(!verify) {
      return false
    }

    let verifyData = {
      ...verify,
      expired_at: expireAt,
      activated: true
    }
    // console.log(verifyData)
    verifyData = JSON.stringify(verifyData)


    const pipeline = this.Redis.pipeline()
    pipeline.set(verifyCacheKey, verifyData)
    pipeline.expire(verifyCacheKey, this.verificationTime * 60)
    await pipeline.exec()

    return {
      expired_at: expireAt,
    }
  }

  async otpValidate (phone, code) {
    const verifyCacheKey = `verify:phone:${phone}`

    let verify = await this.Redis.get(verifyCacheKey)
    verify = JSON.parse(verify)
    // console.log(verify)

    if (!_.has(verify, 'code')) {
      return false
    }

    if(!_.eq(verify.code, code)) {
      return false
    }

    return verify
  }

	async request (options) {

    const result = await rp(options)
    .then(function (response) {
      return response
    })
    .catch(function (error) {
      return error
    })
    
    return result
	}

}

module.exports = SmsRepository
