'use strict'

import _ from 'lodash'
// import $ from 'jquery'

export default {
  state: () => ({
    records: [],
    pagination: {},
    resolutions: [
      {
        key: '4k',
        size: 3840
      },
      {
        key: 'fhd',
        size: 1920
      },
      {
        key: 'hd',
        size: 1280
      },
      {
        key: 'sd',
        size: 720
      }
    ],
    transcodeProgress: {
      '4k': null,
      'fhd': null,
      'hd': null,
      'sd': null,
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
    pagination (state) {
      return state.pagination
    },
    transcodeProgress (state) {
      return state.transcodeProgress
    },
    resolutions (state) {
      return state.resolutions
    },
    responseError (state) {
      return state.response.error
    },
    responseSuccess (state) {
      return state.response.success
    }
  },
  mutations: {
    receiveError (state, payload) {
      state.response.error = payload
    },
    receiveSuccess (state, payload) {
      state.response.success = payload
		},
    receiveMediaProgress (state, payload) {
      const { resolution, progress, server } = payload

      // console.log(resolution, progress)

      // console.log(state.transcodeProgress)
      if(!_.has(state.transcodeProgress, resolution)) {
        return false
      }

      const transcodeProgress = _.cloneDeep(state.transcodeProgress)
      transcodeProgress[resolution] = _.assign(_.assign(progress, { server }))

      state.transcodeProgress = transcodeProgress
    },
    clearMediaProgress (state) {
      _.each(state.transcodeProgress, (value, key) => {
        state.transcodeProgress[key] = null
      })
    }
  },
  actions: {
		/**
		 * Transcode Movie
		 */
		async transcodeMovie ({ commit }, data) {
			const id = data.id
      const resolution = _.get(data, 'resolution')
      const audios = _.get(data, 'audios')
			try {
				const response = await this.$axios.post(`/core/movie/film/${id}/transcode`, {
          resolution,
          audios
        })
        // console.log(response)
				commit('receiveSuccess', response.data)
			} catch (e){
        commit('receiveError', e.response)
			}
		},
  }
}
