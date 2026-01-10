'use strict'

// import _ from 'lodash'
import $ from 'jquery'

export default {
  state: () => ({
    records: [],
    pagination: {},
  }),
  getters: {
    records (state) {
      return state.records
    },
    pagination (state) {
      return state.pagination
    }
  },
  mutations: {
    receiveCollections (state, payload) {
			const { records, pagination } = payload

      // console.log(categories)
      state.records = records
      state.pagination = pagination
    },
  },
  actions: {
		/**
		 * Get Collections
		 */
		async getCollections ({ commit }, params) {
      // console.log(params)
			params = $.param(params)
      // console.log(params)
			try {
				const response = await this.$axios.get(`/core/movie/collection?${params}`)
				commit('receiveCollections', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
  }
}
