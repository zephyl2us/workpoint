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
    receivePeople (state, payload) {
			const { records, pagination } = payload

      // console.log(categories)
      state.records = records
      state.pagination = pagination
    },
  },
  actions: {
		/**
		 * Get People
		 */
		async getPeople ({ commit }, params) {
			params = $.param(params)
			try {
				const response = await this.$axios.get(`/core/movie/person?${params}`)
				commit('receivePeople', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
  }
}
