'use strict'

const _ = use('lodash')
const BullBoard = require('bull-board')
const BaseQueue = require('@rocketseat/adonis-bull/src/Queue')

class Queue extends BaseQueue {
  constructor (Logger, Config, jobs, app, resolver) {
    super(Logger, Config, jobs, app, resolver)
  }

  add (name, data, options) {
    const queue = this.get(name)

    const job = queue.bull.add(data, { ...queue.options, ...options })

    return job
  }

  ui (port = 9999) {
    BullBoard.setQueues(Object.values(this.queues).map(queue => queue.bull))

    const { UI } = BullBoard

    const server = UI.listen(port, () => {
      this.Logger.info(`bull board on http://localhost:${port}`)
    })

    const shutdown = () => {
      server.close(() => {
        this.Logger.info('Stopping bull board server')
        process.exit()
      })
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
  }

  process (options) {
		const { accepts, rejects } = options
		var queues = this.queues
		// Reject some queues
		if (rejects) {
			queues = _.omit(queues, _.split(rejects, ','))
		}
		// Accept only queues
		if (accepts) {
			queues = _.pick(queues, _.split(accepts, ','))
		}

    // this.Logger.info('Queue processing started')
    this.Logger.info(`Queue worker listening for ${Object.values(queues).length} job(s)`)
    Object.values(queues).forEach(queue => {
      const Job = new queue.Job()

      const jobListeners = this._getJobListeners(queue.Job)

      jobListeners.forEach(function (item) {
        queue.bull.on(item.eventName, Job[item.method].bind(Job))
      })

      queue.bull.process(queue.concurrency, (job, done) => {
        Job.handle(job).then(result => {
          done(null, result)
        }).catch(error => {
          this.handleException(error, job)
          done(error)
        })
      })
    })

    const shutdown = () => {
      Object.values(queues).map(queue => {
        queue.bull.close()
      })
      process.nextTick(() => {
        process.exit()
      })
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
  }

}

module.exports = Queue
