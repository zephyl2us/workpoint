'use strict'

const _ = use('lodash')
const moment = use('moment')
const Task = use('Task')
const Bull = use('Bull')
const Helper = use('App/Helper')
const ArmyAntRepository = make('App/Repositories/ArmyAntRepository')
const ArmyAntProxyRepository = make('App/Repositories/ArmyAntProxyRepository')
const LogRepository = make('App/Repositories/LogRepository')

class ArmyProxyStatus extends Task {
  static get schedule () {
    return '15,45 */1 * * * *'
  }

  async handle () {
    if(Helper.isDevMode()) {
      return
    }
    if(Helper.isDevMode()) console.log('Scheduler : Army Proxy Status every 30 Second. (15,45)')


    try {

      const proxyServers = ['proxy-01']
  
      for(let i = 0; i < _.size(proxyServers); i++) {
        const server = proxyServers[i]
        let statusProxy = null
        try {
          statusProxy = await ArmyAntProxyRepository.statusProxy(server)
        } catch (e) {}
  
        if(!statusProxy) {
          // console.log(server, 'is offline')
          continue
        }
  
        const records = _.get(statusProxy, 'data') || []
        
        if(!_.size(records)) {
          continue
        }
  
        let proxies = await ArmyAntProxyRepository.browse({
          filter: {
            // aircard_label:
            server: server
          },
          sort: 'id|asc'
        }).fetch()
  
        proxies = proxies.toJSON()
    
        for(let j = 0; j < _.size(proxies); j++) {
          const proxy = proxies[j]
          // console.log(_.get(proxy, 'aircard_label'))
          const aircardLabel = _.get(proxy, 'aircard_label')
          const payload = _.get(proxy, 'payload')
  
          const index = _.findIndex(records, ['num', (aircardLabel + '')])
          // console.log(aircardLabel, index)
  
          let record = {}
  
          if(index !== -1) {
            record = records[index]
          }
  
          let publicIpv4 = _.get(record, 'public_ip')

          if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/g.test(publicIpv4)) {
            publicIpv4 = null
          }

          // console.log(aircardLabel, publicIpv4)
          // console.log(payload, record)
          // console.log()
  
          if(!_.isEqual(payload, record)) {
            const armyProxy = await ArmyAntProxyRepository.findBy('id', proxy.id)
            const updateArmyProxy = await ArmyAntProxyRepository.update(armyProxy, {
              public_ipv4: publicIpv4,
              payload: record
            })
          }
        }
      }
			
    } catch (e) {
			const dataLogs = {
        title: 'ArmyProxyStatus-Task',
        path: 'App/Tasks/ArmyProxyStatus',
        channel: 'tasks',
        message: e.message,
				data: e,
      }
			LogRepository.fire(dataLogs)
    }
  }
}

module.exports = ArmyProxyStatus
