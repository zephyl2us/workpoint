'use strict'

const { Command } = require('@adonisjs/ace')
const _ = use('lodash')
const moment = use('moment')
const rp = use('request-promise')
const Bull = use('Bull')
// const AdsPowerOpenJob = use('App/Jobs/AdsPowerOpen')
// const AdsPowerCloseJob = use('App/Jobs/AdsPowerClose')
const ArmyAntRepository = make('App/Repositories/ArmyAntRepository')
const ArmyAntProxyRepository = make('App/Repositories/ArmyAntProxyRepository')

class ArmyProxyStatus extends Command {
  static get signature () {
    return 'proxy:status'
  }

  static get description () {
    return 'Tell something helpful about this command'
  }

  async handle (args, options) {

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

        const publicIpv4 = _.get(record, 'public_ip')
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
  }

}

module.exports = ArmyProxyStatus
