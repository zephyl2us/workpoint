'use strict'

// let timeout
let interval
// const requestTimeout = require('nk-request-timeout')
const requestInterval = require('request-interval')

export default {
  data () {
    return {
      countdown: null
    }
  },
  computed: {},
  methods: {
    startCountdown(count) {
      if (!count || count < 1) {
        this.countdown = null
        return
      }

      // if (!this._.isUndefined(timeout)) {
      //   requestTimeout.clear(timeout)
      // }

      this.countdown = count
      // timeout = requestTimeout(1000, () => {
      //   this.startCountdown(count - 1)
      // })
      setTimeout(() => {
        this.startCountdown(count - 1)
      }, 1000)
    },
    stopCountdown() {
      if (!this._.isUndefined(interval)) {
        requestInterval.clear(interval)
      }
      // if (!this._.isUndefined(timeout)) {
      //   requestTimeout.clear(timeout)
      // }
    },
  },
  watch: {}
}
