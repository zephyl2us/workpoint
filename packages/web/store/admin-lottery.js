'use strict'

import _ from 'lodash'
import $ from 'jquery'

export default {
  state: () => ({
    categories: [],
    lotteries: [],
		zoneRates: {},
    response: {
      error: {},
      success: {}
    },
  }),
  getters: {
    categories (state) {
      return state.categories
    },
    lotteries (state) {
      return state.lotteries
    },
    zoneRates (state) {
      return state.zoneRates
    },
    governmentCategories (state) {
      return _.filter(state.categories, ['type', 'government'])
    },
    stockCategories (state) {
      return _.filter(state.categories, ['type', 'stock'])
    },
    yeekeeCategories (state) {
      return _.filter(state.categories, ['type', 'yeekee'])
    },
    responseError (state) {
      return state.response.error
    },
    responseSuccess (state) {
      return state.response.success
    },
  },
  mutations: {
		changeZoneRate (state, payload) {
			const { key, value } = payload
			const rates = _.cloneDeep(state.zoneRates)

			_.set(rates, key, parseInt(value))

			state.zoneRates = rates
		},
    receiveCategories (state, payload) {
			const { records:categories } = payload

      // console.log(categories)
      state.categories = categories
    },
		receiveUpdateCategory (state, payload) {
      const { id } = payload
      const categories = _.cloneDeep(state.categories)
      const index = _.findIndex(categories, ['id', id])

      if(index === -1) {
				categories.push(payload)
			} else {
				let category = categories[index]
				category = _.assign(category, payload)
	
				categories[index] = category
			}

      state.categories = categories
		},
    receiveLotteries (state, payload) {
			const { records:lotteries } = payload

      // console.log(lotteries)
      state.lotteries = lotteries
    },
    receiveUpdateLottery (state, payload) {
      const { id } = payload

      const lotteries = _.cloneDeep(state.lotteries)
      const index = _.findIndex(lotteries, ['id', id])

      // console.log(`receiveUpdateLottery index`, index)
      // console.log(payload)

      if(index === -1) {
				lotteries.push(payload)
			} else {
				let lottery = lotteries[index]
				lottery = _.assign(lottery, payload)
	
				lotteries[index] = lottery
			}

      state.lotteries = lotteries
    },
		receiveZoneRates (state, payload) {
			const { records } = payload
			state.zoneRates = records || {}
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
		 * Get Category
		 */
		async getCategories ({ commit }, params) {
			params = $.param(params)
			try {
				const response = await this.$axios.get(`/core/lottery/category`)
				commit('receiveCategories', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Update Category
		 */
		async updateCategory ({ commit }, data) {
			const id = data.id
			try {
				const response = await this.$axios.patch(`/core/lottery/category/${id}`, data)
				commit('receiveSuccess', response.data)
			} catch (e){
        commit('receiveError', e.response)
			}
		},
		/**
		 * Get Lottery Stock
		 */
		async getStock ({ commit }, data) {
			const params = $.param(data.params)
			try {
				const response = await this.$axios.get(`/core/lottery/stock?${params}`)
				commit('receiveLotteries', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Get Lottery Yeekee
		 */
		async getYeekee ({ commit }, data) {
			const params = $.param(data.params)
			try {
				const response = await this.$axios.get(`/core/lottery/yeekee?${params}`)
				commit('receiveLotteries', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Get Lottery Yeekee by Zone
		 */
		async getYeekeeByZone ({ commit }, data) {
			const zone = data.zone
			const params = $.param(data.params)
			try {
				const response = await this.$axios.get(`/core/lottery/yeekee/${zone}?${params}`)
				commit('receiveLotteries', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Get Lottery Yeekee by Slug
		 */
		async getYeekeeBySlug ({ commit }, data) {
			const zone = data.zone
			const slug = data.slug
			const params = $.param(data.params)
			try {
				const response = await this.$axios.get(`/core/lottery/yeekee/${zone}/${slug}?${params}`)
				commit('receiveLotteries', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Get Lottery Zone Rate
		 */
		async getZoneRate ({ commit }, zone) {
			// const zone = data.zone
			try {
				const response = await this.$axios.get(`/core/lottery/zone/${zone}/rate`)
				commit('receiveZoneRates', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Update Lottery Zone Rate
		 */
		async updateZoneRate ({ commit }, data) {
			const zone = data.zone
      const rates = _.get(data, 'rates')

			console.log(rates)
			try {
				const response = await this.$axios.patch(`/core/lottery/zone/${zone}/rate`, {
          rates
        })
				commit('receiveSuccess', response.data)
			} catch (e){
        commit('receiveError', e.response)
			}
		},
  }
}
