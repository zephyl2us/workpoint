'use strict'

import _ from 'lodash'

export default {
  state: () => ({
    theme: 'default',
    volumeEnable: true,
    countAlerts: {
      notification: 6,
      transfer_deposit: 10,
      transfer_withdraw: 0,
      member_review: 2
    },
    currentDropdown: null,
    activeModals: [],
    activeSidebar: [],
    isNavbarActive: false,
    creators: [],
  }),
  getters: {
    theme (state) {
      return state.theme
    },
    countAlerts (state) {
      return state.countAlerts
    },
    currentDropdown (state) {
      return state.currentDropdown
    },
    isNavbarActive (state) {
      return state.isNavbarActive
    },
    isVolumeEnable (state) {
      return state.volumeEnable
    },
    creators (state) {
      return state.creators
    },
  },
  mutations: {
    updateTheme (state, value) {
      const themes = ['default', 'dark']
      state.theme = _.includes(themes, value) ? value : 'default'
    },
    updateCurrentDropdown (state, value) {
      state.currentDropdown = value
    },
    toggleVolume (state, value) {
      state.volumeEnable = !state.volumeEnable
    },
    toggleNavbar (state, value = null) {
      if(!_.isNull(value)) {
        state.isNavbarActive = _.eq(value, true)
      } else {
        state.isNavbarActive = !state.isNavbarActive
      }
    },
    receiveCreators (state, payload) {
			const { records } = payload

      state.creators = records
    },
  },
  actions: {
		/**
		 * Get Creator
		 */
		async getCreators ({ commit }, params) {
			params = $.param(params)
			try {
				const response = await this.$axios.get(`/core/user/creator`)
				commit('receiveCreators', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
  }
}
