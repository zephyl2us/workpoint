'use strict'

const _ = use('lodash')
const moment = use('moment')
const Task = use('Task')
const Helper = use('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const ArmyAntRepository = make('App/Repositories/ArmyAntRepository')
const ArmyAntBotRepository = make('App/Repositories/ArmyAntBotRepository')
const ArmyAntProxyRepository = make('App/Repositories/ArmyAntProxyRepository')

class AntAutomation extends Task {
  static get schedule () {
    return '*/5 * 7-23 * * *'
  }

  async handle () {
    // this.info('Task AntAutomation handle')
    if(Helper.isDevMode()) console.log('Scheduler : Ant Automation every 5 Second between 07-23')

    try {
      const config = await ArmyAntBotRepository.getConfig()
      const automation = _.get(config, 'automation') || false
  
      if(automation !== true) {
        if(Helper.isDevMode()) console.log('Automation is disabled.')
        return
      }
  
      const availableProxy = await ArmyAntProxyRepository.getAvailableProxy()

      if(!availableProxy) {
        if(Helper.isDevMode()) console.log('No available proxy.')
        return
      }
      
      const availableServer = await ArmyAntBotRepository.getAvailableServer()
  
      if(!availableServer) {
        if(Helper.isDevMode()) console.log('No available server.')
        return
      }
  
      // console.log(availableServer)
  
      const ant = await ArmyAntBotRepository.getAntAutomation()
      if(!ant) {
        if(Helper.isDevMode()) console.log(`No available ant.`)
        return
      }
  
      const antId = ant.id
      const antPower = await ArmyAntBotRepository.createAutomationByAntId(antId)
  
      if(!antPower) {
        if(Helper.isDevMode()) console.log(`Cann't create automation.`)
        return
      }
  
    } catch (e) {
			const dataLogs = {
        title: 'AntAutomation-Task',
        path: 'App/Tasks/AntAutomation',
        channel: 'tasks',
        message: e.message,
				data: e,
      }
			LogRepository.fire(dataLogs)
    }
  }
}

module.exports = AntAutomation