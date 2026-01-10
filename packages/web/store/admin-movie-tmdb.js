'use strict'

import _ from 'lodash'
import $ from 'jquery'

export default {
  state: () => ({
    records: [],
    record: {},
    movies: [],
    pagination: {},
  }),
  getters: {
    records (state) {
      return state.records
    },
    movies (state) {
      return state.movies
    },
    alreadyIds (state) {
      // console.log(state.movies)
      return _.map(state.movies, (movie) => movie.ref_id)
    },
    pagination (state) {
      return state.pagination
    },
  },
  mutations: {
    receiveMovies (state, payload) {
			const { records, movies, pagination } = payload

      // console.log(categories)
      state.records = records
      state.movies = movies
      state.pagination = pagination
    },
    receiveMovie (state, payload) {
			const { record } = payload

      // console.log(categories)
      state.record = record

      // eslint-disable-next-line prefer-const
      let movies = _.cloneDeep(state.movies)
      const movieId = _.get(record, 'id')
      const refId = _.get(record, 'ref_id')
      movies.push({
        id: movieId,
        ref_id: parseInt(refId)
      })
      state.movies = movies
    },
    clearRecords (state) {
      state.records = []
    }
  },
  actions: {
		/**
		 * Search Movies
		 */
		async searchMovies ({ commit }, params) {
			params = $.param(params)
			try {
				const response = await this.$axios.get(`/core/movie/tmdb/search?${params}`)
				commit('receiveMovies', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Sync Movie
		 */
		async syncMovie ({ commit }, data) {
			const id = data.id
      const sourceId = _.get(data, 'source_id')
			try {
				const response = await this.$axios.post(`/core/movie/tmdb/sync/movie/${id}`, {
          source_id: sourceId
        })
				commit('receiveMovie', response.data)
			} catch (e){
        commit('receiveError', e.response)
			}
		},
  }
}
