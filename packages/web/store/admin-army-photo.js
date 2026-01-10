'use strict'

// import _ from 'lodash'

export default {
  state: () => ({
    records: [],
    record: {},
		stats: {},
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
    stats (state) {
      return state.stats
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
    receivePhotos (state, payload) {
			const { records, pagination } = payload

      state.records = records
      state.pagination = pagination
    },
    receivePhoto (state, payload) {
			const { record } = payload

      state.record = record
    },
    receiveStats (state, payload) {
			const { stats } = payload

      state.stats = stats
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
		 * Get Photos
		 */
		async getPhotos ({ commit }, params) {
      // console.log(params)
			params = $.param(params)
      // console.log(params)
			try {
				const response = await this.$axios.get(`/core/army/photo?${params}`)
				commit('receivePhotos', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Get Photo
		 */
		async getPhoto ({ commit }, id) {
			try {
				const response = await this.$axios.get(`/core/army/photo/${id}`)
				commit('receivePhoto', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Get Stats
		 */
		async getStats ({ commit }, id) {
			try {
				const response = await this.$axios.get(`/core/army/photo/stats`)
				commit('receiveStats', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Create Photo
		 */
		async createPhoto ({ commit }, data) {
			// const id = data.id
			try {
				const response = await this.$axios.post(`/core/army/photo/create`, data)
        commit('receiveSuccess', response.data)
      } catch (e) {
        commit('receiveError', e.response)
			}
		},
		/**
		 * Update Photo
		 */
		async updatePhoto ({ commit }, data) {
			try {
				const response = await this.$axios.patch(`/core/army/photo/${data.id}`, data)
        commit('receiveSuccess', response.data)
      } catch (e) {
        commit('receiveError', e.response)
			}
		},
		/**
		 * Sync Photo
		 */
		async syncPhoto ({ commit }, data) {
			try {
				const response = await this.$axios.patch(`/core/army/photo/${data.id}/sync`, data)
        commit('receiveSuccess', response.data)
      } catch (e) {
        commit('receiveError', e.response)
			}
		},
		/**
		 * Delete Photo
		 */
		async deletePhoto ({ commit }, data) {
			try {
				const response = await this.$axios.delete(`/core/army/photo/${data.id}`)
        commit('receiveSuccess', response.data)
      } catch (e) {
        commit('receiveError', e.response)
			}
		},
  }
}
