'use strict'

import _ from 'lodash'

export default {
  state: () => ({
    records: [],
    record: {},
    permissions: {},
    defaultPermissions: {},
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
    permissions (state) {
      return state.permissions
    },
    responseError (state) {
      return state.response.error
    },
    responseSuccess (state) {
      return state.response.success
    }
  },
  mutations: {
    receiveUsers (state, payload) {
			const { records, pagination } = payload

      state.records = records
      state.pagination = pagination
    },
    receiveUser (state, payload) {
			const { record, permissions } = payload

      state.record = record
      state.permissions = permissions
      state.defaultPermissions = permissions
    },
    receivePermissions (state, payload) {
      const { permissions } = payload
      state.permissions = permissions
    },
    setDefaultPermission (state, payload) {
      const permissions = _.cloneDeep(state.defaultPermissions)
      state.permissions = permissions
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
		 * Get Users
		 */
		async getUsers ({ commit }, params) {
      // console.log(params)
			params = $.param(params)
      // console.log(params)
			try {
				const response = await this.$axios.get(`/core/user/staff?${params}`)
				commit('receiveUsers', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Get User
		 */
		async getUser ({ commit }, id) {
			try {
				const response = await this.$axios.get(`/core/user/staff/${id}`)
				commit('receiveUser', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Get Default Permissions
		 */
		async getPermissions ({ commit }, params) {
			params = $.param(params)
			try {
				const response = await this.$axios.get(`/core/user/staff/permission`)
				commit('receivePermissions', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Create User
		 */
		async createUser ({ commit }, data) {
			// const id = data.id
			try {
				const response = await this.$axios.post(`/core/user/staff/create`, data)
        commit('receiveSuccess', response.data)
      } catch (e) {
        commit('receiveError', e.response)
			}
		},
		/**
		 * Update User
		 */
		async updateUser ({ commit }, data) {
			try {
				const response = await this.$axios.patch(`/core/user/staff/${data.id}`, data)
        commit('receiveSuccess', response.data)
      } catch (e) {
        commit('receiveError', e.response)
			}
		},
  }
}
