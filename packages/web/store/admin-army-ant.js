'use strict'

// import _ from 'lodash'

export default {
  state: () => ({
    records: [],
    record: {},
    pagination: {},
    generateAnt: {
      first_name: {},
      last_name: {},
      nickname: {},
      gender: null
    },
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
    generateAnt (state) {
      return state.generateAnt
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
    receiveAnts (state, payload) {
			const { records, pagination } = payload

      state.records = records
      state.pagination = pagination
    },
    receiveAnt (state, payload) {
			const { record } = payload

      state.record = record
    },
    receiveGenerateAnt (state, payload) {
			const { record } = payload

      // console.log(payload)
      // console.log(record)

      state.generateAnt = record
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
		 * Get Ants
		 */
		async getAnts ({ commit }, params) {
      // console.log(params)
			params = $.param(params)
      // console.log(params)
			try {
				const response = await this.$axios.get(`/core/army/ant?${params}`)
				commit('receiveAnts', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Get Generate Ant
		 */
		async getGenerateAnt ({ commit }, id) {
			try {
				const response = await this.$axios.get(`/core/army/generate/person`)
				commit('receiveGenerateAnt', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Get Ant
		 */
		async getAnt ({ commit }, id) {
			try {
				const response = await this.$axios.get(`/core/army/ant/${id}`)
				commit('receiveAnt', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Create Ant
		 */
		async createAnt ({ commit }, data) {
			// const id = data.id
			try {
				const response = await this.$axios.post(`/core/army/ant/create`, data)
        commit('receiveSuccess', response.data)
      } catch (e) {
        commit('receiveError', e.response)
			}
		},
		/**
		 * Update Ant
		 */
		async updateAnt ({ commit }, data) {
			try {
				const response = await this.$axios.patch(`/core/army/ant/${data.id}`, data)
        commit('receiveSuccess', response.data)
      } catch (e) {
        commit('receiveError', e.response)
			}
		},
		/**
		 * Update Ant Social
		 */
		async updateAntSocial ({ commit }, data) {
			try {
				const response = await this.$axios.patch(`/core/army/ant/${data.id}/social`, data)
        commit('receiveSuccess', response.data)
      } catch (e) {
        commit('receiveError', e.response)
			}
		},
		/**
		 * Delete Ant
		 */
		async deleteAnt ({ commit }, data) {
			try {
				const response = await this.$axios.delete(`/core/army/ant/${data.id}`)
        commit('receiveSuccess', response.data)
      } catch (e) {
        commit('receiveError', e.response)
			}
		},
  }
}
