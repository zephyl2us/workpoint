'use strict'

const _ = use('lodash')

const Env = use('Env')
const Helper = make('App/Helper')
const rp = use('request-promise')
// const SmsRepository = make('App/Repositories/SmsRepository')
class SendSms {
  // static get connection() {
  //   return "remote";
  // }

  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'SendSms-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))
    
    const { data } = job
    
		try {

      // console.log(data)
		  await this.sending(data)
      
		} catch (e) {
      // console.log(e)
			const dataLogs = {
				title: 'SendSms-job',
				path: 'app/Jobs',
				channel: 'kue',
				message: e.message,
				data: e,
				params: data
			}
			LogRepository.fire(dataLogs)
		}
  }

  async onCompleted(job, result) {
    // console.log('Job Compleate...', result)
  }

  async sending (data) {
    let result = false

    if(_.eq(data.driver, 'thsms')) {
      result = this.senderThsms(data)
    } else if(_.eq(data.driver, 'vonage')) {
      result = this.senderVonage(data)
    } else if(_.eq(data.driver, 'clicksend')) {
      result = this.senderClickSend(data)
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


	async senderClickSend(data) {

    // console.log(`senderClickSend`, data)
    // return

    const username = Env.get('CLICKSEND_USERNAME')
    const apiKey = Env.get('CLICKSEND_API_KEY')

    const authString = Buffer.from(`${username}:${apiKey}`).toString('base64')

    const to = '+66' + data.to
    // const from = data.from
    const message = data.message

    const options = {
      method: 'POST',
      uri: 'https://rest.clicksend.com/v3/sms/send',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      },
      body: {
        messages: [
          {
            to: to,
            body: message,
            // source: 'adonis-app'
          }
        ]
      },
      json: true
    }
    // console.log(options)

    try {
      // ยิง Request
      const result = await rp(options)
      // console.log(result)

      return true
      
      // return response.status(200).json({
      //   status: 'success',
      //   data: result
      // })

    } catch (error) {
      // request-promise จะ throw error ถ้า status code ไม่ใช่ 2xx
      // console.error('SMS Error:', error.error || error.message)
      
      return false
      // return response.status(500).json({
      //   status: 'error',
      //   details: error.error || error.message
      // })
    }
  }
}

module.exports = SendSms
