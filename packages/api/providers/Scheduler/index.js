'use strict'

const BaseScheduler = require('adonis-scheduler/src/Scheduler')
const fs = require('fs')
const path = require('path')
const debug = require('debug')('adonis:scheduler')
const { ioc } = require('@adonisjs/fold')
const CE = require('adonis-scheduler/src/Exceptions')
const Task = require('adonis-scheduler/src/Scheduler/Task')

class Scheduler extends BaseScheduler {

  /**
   * Load task file
   *
   * @param {String} file
   * @private
   */
  async _fetchTask (taskPath) {
    let task
    try {
      task = use(taskPath)
    } catch (e) {
      if (e instanceof ReferenceError) {
        debug('Unable to import task class <%s>. Is it a valid javascript class?', file)
        return
      } else {
        throw e
      }
    }

    // Get instance of task class
    const taskInstance = ioc.make(task)

    // Every task must expose a schedule
    if (!('schedule' in task)) {
      throw CE.RuntimeException.undefinedTaskSchedule(file)
    }

    // Every task must expose a handle function
    if (!('handle' in taskInstance)) {
      throw CE.RuntimeException.undefinedTaskHandle(file)
    }

    if (!(taskInstance instanceof Task)) {
      throw CE.RuntimeException.undefinedInstanceTask(file)
    }

    // Track currently registered tasks in memory
    this.registeredTasks.push(taskInstance)

    // Before add task to schedule need check & unlock file if exist
    const locked = await taskInstance.locker.check()
    if (locked) {
      await taskInstance.locker.unlock()
    }

    // Register task handler
    this.instance.scheduleJob(task.schedule, taskInstance._run.bind(taskInstance))
  }

  /**
   * Register scheduled tasks for every task found in app/Tasks
   *
   * @public
   */
  async run () {
    debug('Scan tasks path %s', this.tasksPath)
    let taskFiles
    try {
      // taskFiles = fs.readdirSync(this.tasksPath)
      taskFiles = require(path.join(this.Helpers.appRoot(), 'start/tasks.js')) || []
    } catch (e) {
      // If the directory isn't found, log a message and exit gracefully
      if (e.code === 'ENOENT') {
        throw CE.RuntimeException.notFoundTask(this.tasksPath)
      }
      throw e
    }

    for (let task of taskFiles) {
      await this._fetchTask(task)
    }

    debug('scheduler running %d tasks', this.registeredTasks.length)
  }

}

module.exports = Scheduler
