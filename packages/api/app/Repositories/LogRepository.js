'use strict'

const _ = use('lodash')
const Bull = use('Bull')
const Config = use('Config')
const moment = use('moment')
// const Message = use('Message')

class LogRepository {

	/**
	 * Log to message queue
	 */
  fire (data) {
    const logData = {
      title: _.get(data, 'title', ''),
      path: _.get(data, 'path', ''),
      msg: _.get(data, 'message', ''),
      channel: _.get(data, 'channel', 'general'),
      datetime: _.get(data, 'datetime', moment(new Date).format('YYYY-MM-DD HH:mm:ss')),
      data: _.get(data, 'data', {}),
      params: _.get(data, 'params', {}),
		}
    // console.log('Error Logs: ', data)
    Bull.add('KueLogger', logData)
  }

	/**
	 * Log to SMS alert
	 */
	// sendWarningNotice (message, params = {}) {
	// 	const recipients = Config.get('message.notices')
	// 	if (!_.size(recipients)) {
	// 		return
	// 	}

	// 	try {
	// 		_.each(recipients, (o) => {
	// 			// console.log(o.mobile)
	// 			Message.send({
	// 				sender: null,
	// 				number: o.mobile,
	// 				message: message
	// 			})
	// 		})
	// 	} catch (e) {
	// 		console.log('Cannot send warning message', e)
	// 	}
	// }

}

module.exports = LogRepository
