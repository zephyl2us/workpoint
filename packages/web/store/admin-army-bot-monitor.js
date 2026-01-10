'use strict'

import _ from 'lodash'

export default {
  state: () => ({
    config: {
      automation: false,
      limit: null
    },
    records: [],
    record: [],
    activities: [],
    response: {
      error: {},
      success: {}
    },
  }),
  getters: {
    records (state) {
      return state.records
    },
    activities (state) {
      return state.activities
    },
    isAutomation (state) {
      return state.config.automation
    },
    limit (state) {
      return state.config.limit
    },
    responseError (state) {
      return state.response.error
    },
    responseSuccess (state) {
      return state.response.success
    }
  },
  mutations: {
    receiveBot (state, payload) {
      const { config, records } = payload

      state.config = config


      const orderRecords = _.orderBy(records, ['created_at'], ['desc'])
      state.records = orderRecords

      let activities = []
      _.each(records, (record) => {
        const botActivities = _.get(record, 'activities') || []

        _.each(botActivities, (activity) => {
          activity.army_ant_bot_id = record.id
          activities.push(activity)
        })
      })

      activities = _.orderBy(activities, ['timestamp'], ['desc'])

      state.activities = activities
    },
    updateConfigAutomation (state, value) {
      state.config.automation = value
    },

    // receiveCreateBot (state, payload) {
    //   console.log(`receiveCreateBot`, payload)
    // },

    receiveUpdateBot (state, payload) {
      console.log(`receiveUpdateBot`, payload)

      let records = _.cloneDeep(state.records)
      const id = payload.id

      const index = _.findIndex(records, ['id', id])
      if(index === -1) {
        // records.push(payload)
        records = [payload].concat(records)
      } else {
        let record = records[index]
        record = _.assign({}, record, payload)
        records[index] = record
      }

      state.records = records
    },
    receiveUpdateActivity (state, payload) {
      console.log(`receiveUpdateActivity`, payload)

      const record = payload
      record.army_ant_bot_id = parseInt(record.army_ant_bot_id)
      
      let activities = _.cloneDeep(state.activities)
      activities = [record].concat(activities)

      state.activities = activities
    },
    receiveError (state, payload) {
      state.response.error = payload
    },
    receiveSuccess (state, payload) {
      state.response.success = payload
		},
  },
  actions: {
		/**
		 * Get Bot
		 */
		async getBot ({ commit }, params) {
			params = $.param(params)
			try {
				const response = await this.$axios.get(`/core/army/bot/monitor`)
				commit('receiveBot', response.data)
			} catch (e){
        console.log(e)
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Start Bot
		 */
		async startBot ({ commit }, data) {
			// const id = data.id
			try {
				const response = await this.$axios.post(`/core/army/bot/start`)
        commit('receiveSuccess', response.data)
      } catch (e) {
        commit('receiveError', e.response)
			}
		},

		/**
		 * Start Bot
		 */
		async stopBot ({ commit }, data) {
			// const id = data.id
			try {
				const response = await this.$axios.post(`/core/army/bot/stop`, data)
        commit('receiveSuccess', response.data)
      } catch (e) {
        commit('receiveError', e.response)
			}
		},
    
  }
}
