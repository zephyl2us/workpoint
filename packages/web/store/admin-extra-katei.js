'use strict'

// import _ from 'lodash'

export default {
  state: () => ({
    reward: {},
    response: {
      error: {},
      success: {}
    },
  }),
  getters: {
    reward (state) {
      return state.reward
    },
    responseError (state) {
      return state.response.error
    },
    responseSuccess (state) {
      return state.response.success
    }
  },
  mutations: {
    receiveReward (state, payload) {
      console.log(payload)
			const { reward } = payload

      state.reward = reward
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
		 * Get Reward
		 */
		async getReward ({ commit }) {
			try {
				const response = await this.$axios.get(`/core/extra/katei/reward`)
				commit('receiveReward', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Update Reward
		 */
		async updateReward ({ commit }, data) {
			try {
				const response = await this.$axios.patch(`/core/extra/katei/reward`, data)
        commit('receiveSuccess', response.data)
      } catch (e) {
        commit('receiveError', e.response)
			}
		},
  }
}
