'use strict'

import _ from 'lodash'

export default {
  state: () => ({
    records: [],
    record: {},
    users: [],
    pagination: {},
    response: {
      error: {},
      success: {}
    },
  }),
  getters: {
    records (state) {
      return state.records
    },
    record (state) {
      return state.record
    },
    users (state) {
      return state.users
    },
    pagination (state) {
      return state.pagination
    },
    responseError (state) {
      return state.response.error
    },
    responseSuccess (state) {
      return state.response.success
    }
  },
  mutations: {
    receiveRecords (state, payload) {
			const { records, pagination } = payload

      state.records = records
      state.pagination = pagination
    },
    receiveRecord (state, payload) {
			const { record, users, pagination } = payload

      state.record = record
      state.users = users
      state.pagination = pagination
    },
    receiveUpdateUser (state, payload) {
      const { id } = payload

      const users = _.cloneDeep(state.users)
      const index = _.findIndex(users, ['id', id])

      // console.log(`receiveUpdateLottery index`, index)
      // console.log(payload)
      payload.payload = !_.isObject(payload.payload) ? JSON.parse(payload.payload) : payload.payload

      if(index === -1) {
        users.push(payload)
      } else {
        let user = users[index]
        user = _.assign(user, payload)
  
        users[index] = user
      }

      state.users = users
    },
    receiveError (state, payload) {
      state.response.error = payload
    },
    receiveSuccess (state, payload) {
      state.response.success = payload
		},
    receiveCalling (state, payload) {
      // state.response.success = payload
		},
  },
  actions: {
		/**
		 * Get Campaign
		 */
		async getCampaigns ({ commit }, params) {
      // console.log(params)
			params = $.param(params)
      // console.log(params)
			try {
				const response = await this.$axios.get(`/core/extra/campaign?${params}`)
				commit('receiveRecords', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Get Campaign
		 */
		async getCampaign ({ commit }, data) {
			const params = $.param(data.params)
			try {
				const response = await this.$axios.get(`/core/extra/campaign/${data.id}?${params}`)
				commit('receiveRecord', response.data)
			} catch (e){
				console.error('CANNOT FIND')
			}
		},

		/**
		 * Update Campaign Status
		 */
    async updateStatus ({ commit }, data) {
			try {
				const response = await this.$axios.patch(`/core/extra/campaign/${data.id}/user/${data.user_id}/status`, data)
        // if (data.is_calling) {
        //   commit('receiveCalling', response.data)
        // } else {
          commit('receiveSuccess', response.data)
        // }
      } catch (e) {
        commit('receiveError', e.response)
			}
    }
  }
}
