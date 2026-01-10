'use strict'

import _ from 'lodash'

export default {
  data () {
    return {
      doRandom: true,
      filters: {
				page: null,
				sort: null,
				type: null,
        search: null,
        uniqueId: null
      },
      isRefreshing: false
    }
  },
  beforeDestroy () {
    //
  },
  created () {
    // enable for fix jquery__WEBPACK_IMPORTED_MODULE_0___default.a.param
    // this.dataManager(this.$route.query)
  },
  mounted () {
  },
  computed: {
    /**
     * Add class spin to refresh icon
     */
    addClassSpin () {
      return this.isRefreshing ? 'fa-spin' : ''
		},
		/**
		 * Check has contents
		 */
		hasContent () {
			return _.size(this.records) > 0
		}
  },
  methods: {

    /**
     * Handle on page change, push to url
     */
    handleOnChangePage (page) {
      this.filters.page = page
      this.$router.push({ name: this.$route.name, query: _.pickBy(this.filters, _.identity) })
    },
    /**
     * Handle on field sort
     */
    handleOnFieldSort (sort) {
      const sorter = _(this.filters.sort).split('|').filter().value()
      let ordering
      if (_.isEmpty(sorter) || sorter[0] !== sort) {
        ordering = [sort, 'asc']
      } else {
        const order = sorter[1] === 'asc' ? 'desc' : 'asc'
        ordering = [sort, order]
      }
      this.filters.sort = ordering.join('|')
      this.filters.page = null
      this.$router.push({ name: this.$route.name, query: _.pickBy(this.filters, _.identity) })
    },
    /**
     * Handle on filter submit.
     */
    handleFilterSubmit () {
      this.filters.page = ''
      this.$router.push({ name: this.$route.name, query: _.pickBy(this.filters, _.identity) })
    },
    /**
     * Handle on filter clear.
     */
    handleFilterReset () {
      // eslint-disable-next-line no-return-assign
      _.map(this.filters, (v, k) => this.filters[k] = '')
      this.filters.page = 1
      this.$router.push({ name: this.$route.name, query: _.pickBy(this.filters, _.identity) })
    },
    /**
     * Handle on refresh.
     */
    handleOnRefresh: _.debounce(function () {
      this.isRefreshing = true
      this.filters.page = 1
      this.hotRefresh()
    }, 1000, { leading: true }),
    /**
     * Refresh but not reset the page.
     */
    hotRefresh (delayInMilliSeconds = 300) {
			setTimeout(() => {
        if (this.doRandom) {
          this.filters.uniqueId = _.uniqueId('rand_')
				}
				this.$router.push({ name: this.$route.name, query: _.pickBy(this.filters, _.identity) })
			}, delayInMilliSeconds)
		},
    /**
     * Handle after dataManager loaded
     */
    handleAfterLoaded () {
      setTimeout(() => {
        this.isRefreshing = false
      }, 500)
    },
    /**
     * Handle confirm to delete
		 * To sepearate from handleConfirm, cause the future
		 * we need something to special
     */
    handleConfirmToDelete (callback, props) {
      const options = {
        okText: this.$t('messages.continue'),
        cancelText: this.$t('messages.close'),
        animation: 'fade'
      }
      this.$dialog
        .confirm(this.$t('messages.are_you_sure'), options)
        .then((dialog) => {
          dialog.close && dialog.close()
          if (_.isFunction(callback)) {
            callback(props)
          }
        })
        .catch(function() {
          // Click cancel
        })
    },
    /**
     * Handle confirm
     */
    handleConfirm (callback, props) {
      const options = {
        okText: this.$t('messages.continue'),
        cancelText: this.$t('messages.close'),
        animation: 'fade'
      }
      this.$dialog
        .confirm(this.$t('messages.are_you_sure'), options)
        .then((dialog) => {
          dialog.close && dialog.close()
          if (_.isFunction(callback)) {
            callback(props)
          }
        })
        .catch(function() {
          // Click cancel
        })
		}
  },
  watch: {
    /**
     * When route change try re-fetch from api
     */
    '$route.query': {
      handler (query) {
        // console.log(`query`, query)
        this.filters = _.cloneDeep(query)
        this.dataManager(query)
      },
      // disabled for fix jquery__WEBPACK_IMPORTED_MODULE_0___default.a.param
      // immediate: true
    },
    /**
     * Handle form error server
     */
    'responseError': {
      handler (error) {
				// if (_.isEmpty(error) || _.has(error, 'action')) {
				// 	return
				// }

				if (_.isEmpty(error) || _.has(error, 'data.action')) {
					return
				}

        if (error.status === 400) {
          if (_.has(error, 'data.code')) {
						const args = _.get(error, 'data.args', {})
            // Handle general error
            const tr = this.$t(`errors.${error.data.code}`, args)
            this.$toast.global.cerror(tr)
          } else {
            // Handle form error
            this.handleFormError(error, this.$refs[this.formRef])
          }
        }
      },
      deep: true
    },
    /**
     * Handle message on success
     */
    'responseSuccess': {
      handler (response) {
				if (_.isEmpty(response) || _.has(response, 'action')) {
					return
				}
				// console.log(response)
        if (response.status === 'success') {
          const message = this.$t('messages.processed')
          this.$toast.global.csuccess(message)
				}

				// if (_.isFunction(this.hookListingResponseSuccess)) {
				// 	this.hookListingResponseSuccess(response)
				// }

        setTimeout(() => {
					this.status = null
					// if (_.isFunction(this.hookListingResponseDone)) {
					// 	this.hookListingResponseDone(response)
					// }
        }, 2000)
      },
      deep: true
    }
  }
}
