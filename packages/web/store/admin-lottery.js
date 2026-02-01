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
		clearLotteries (state) {
			state.lotteries = []
		},
		clearCategories (state) {
			state.categories = []
		},
		clearAll (state) {
			state.categories = []
			state.lotteries = []
			state.zoneRates = {}
		},
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
			// รองรับทั้ง format เก่า { records: [...] } และ format ใหม่ { categories: [...], lotteries: [...] }
			const { records, lotteries, categories } = payload
			
			const hasLotteryData = !!(lotteries || records)

			// อัปเดต categories:
			// - ถ้ามี lotteries/records (หน้า lottery) → merge แบบฉลาด (อัปเดตเฉพาะ categories ที่มาใหม่)
			// - ถ้าไม่มี lotteries/records → ไม่ต้องทำอะไร (ให้ใช้ receiveCategories แทน)
			if (categories && categories.length > 0 && hasLotteryData) {
				const existingCategories = _.cloneDeep(state.categories)
				
				// Loop categories ที่ได้มาใหม่
				categories.forEach(newCategory => {
					const existingIndex = _.findIndex(existingCategories, { id: newCategory.id })
					if (existingIndex !== -1) {
						// อัปเดต category ที่มีอยู่แล้ว
						existingCategories[existingIndex] = _.assign(existingCategories[existingIndex], newCategory)
					} else {
						// เพิ่ม category ใหม่
						existingCategories.push(newCategory)
					}
				})
				
				state.categories = existingCategories
			}

			// อัปเดต lotteries: ต้อง clear เสมอเพื่อไม่ให้ข้อมูลเก่าค้างอยู่
			if (lotteries) {
				state.lotteries = lotteries
			} else if (records) {
				state.lotteries = records
			} else {
				// ถ้าไม่มีข้อมูลมา ให้ clear เป็น empty array
				state.lotteries = []
			}

      // console.log(lotteries)
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
	 * Get Lottery Crypto
	 */
	async getCrypto ({ commit }, data) {
		const params = $.param(data.params)
		try {
			const response = await this.$axios.get(`/core/lottery/crypto?${params}`)
			commit('receiveLotteries', response.data)
		} catch (e){
			console.error('CANNOT FETCH')
		}
	},
	/**
	 * Get Lottery Crypto by Slug
	 */
	async getCryptoBySlug ({ commit }, data) {
		const slug = data.slug
		const params = $.param(data.params)
		try {
			const response = await this.$axios.get(`/core/lottery/crypto/${slug}?${params}`)
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
