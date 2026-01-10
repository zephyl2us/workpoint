'use strict'

import _ from 'lodash'
import $ from 'jquery'

export default {
  state: () => ({
    records: [],
    record: {
      credits: []
    },
    collection: {},
    companies: [],
    genres: [],
    people: [],
    source: {
      format: {},
      streams: []
    },
    medias: [],
    tmdbMovies: [],
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
    casts (state) {
      const credits = _.get(state.record, 'credits')
      return _.filter(credits, (credit) => _.eq(credit.group, 'cast'))
    },
    crews (state) {
      const credits = _.get(state.record, 'credits')
      return _.filter(credits, (credit) => _.eq(credit.group, 'crew'))
    },
    collection (state) {
      return state.collection
    },
    companies (state) {
      return state.companies
    },
    genres (state) {
      return state.genres
    },
    people (state) {
      return state.people
    },
    sourceFormat (state) {
      return state.source.format
    },
    sourceStreams (state) {
      return state.source.streams
    },
    medias (state) {
      return state.medias
    },
    tmdbMovies (state) {
      return state.tmdbMovies
    },
    pagination (state) {
      return state.pagination
    },
    responseError (state) {
      return state.response.error
    },
    responseSuccess (state) {
      return state.response.success
    },
  },
  mutations: {
    receiveMovies (state, payload) {
			const { records, pagination } = payload

      // console.log(categories)
      state.records = records
      state.pagination = pagination
    },
    receiveMovie (state, payload) {
			const { record, collection, companies, genres, people } = payload

      // console.log(categories)

      const source = _.get(record, 'source')

      state.record = record
			state.collection = collection
			state.companies = companies
			state.genres = genres
			state.people = people
      state.source.format = _.get(source, 'info.format')
      state.source.streams = _.get(source, 'info.streams')
      state.medias = _.get(record, 'medias') || []
    },
    receiveMovieMedia (state, payload) {
      const medias = _.clone(state.medias)

      const media = payload

      const index = _.findIndex(medias, ['id', media.id])

      if(index === -1) {
        medias.push(media)
      } else {
        medias[index] = _.assign(medias[index], media)
      }

      state.medias = medias
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
		 * Get Movies
		 */
		async getMovies ({ commit }, params) {
      // console.log(params)
			params = $.param(params)
      // console.log(params)
			try {
				const response = await this.$axios.get(`/core/movie/film?${params}`)
				commit('receiveMovies', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Get Movie by ID
		 */
		async getMovieById ({ commit }, id) {
			try {
				const response = await this.$axios.get(`/core/movie/film/${id}`)
				commit('receiveMovie', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},

    async updateMovie ({ commit }, data) {
			try {
				const response = await this.$axios.patch(`/core/movie/film/${data.id}`, data)
        commit('receiveSuccess', response.data)
      } catch (e) {
        commit('receiveError', e.response)
			}
    }
  }
}
