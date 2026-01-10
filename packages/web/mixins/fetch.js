'use strict'

import _ from 'lodash'
// import moment from 'moment'

export default {
  data () {
    return {
      doRandom: true,
      filters: {
				page: null,
				sort: null,
				type: null,
        search: null,
        rand: null
      },
      isRefreshing: false
    }
  },
  beforeDestroy () {
    //
  },
  created () {
  },
  mounted () {
    this.onMounted()
  },
  computed: {
  },
  methods: {
    onMounted () {
      console.log('handleOnMounted')
      const query = _.get(this.$route, 'query')
  
      const filters = _.merge({}, this.filters, _.pick(query, Object.keys(this.filters)))
      this.filters = filters
      this.dataManager(query)
    },
    /**
     * Handle on page change, push to url
     */
    handleOnChangePage (page) {
      this.filters.page = page
      this.$router.push({ name: this.$route.name, query: _.pickBy(this.filters, _.identity) })
    },
    /**
     * Handle on filter submit.
     */
    handleFilterSubmit: _.debounce(function (query, old) {
      console.log('handleFilterSubmit', this.$route)
      this.filters.page = ''
      this.$router.push({ path: this.$route.path, query: _.pickBy(this.filters, _.identity) })
    }, 500),
    onQueryChange: _.debounce(function (query, old) {
      // console.log(`watch: $route.query`, query, old)
      this.filters = _.cloneDeep(query)
      this.dataManager(query)
    }, 10),
    /**
     * Refresh but not reset the page.
     */
    hotRefresh (delayInMilliSeconds = 300) {
			setTimeout(() => {
        if (this.doRandom) {
          this.filters.timestamp = this.$moment().unix()
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
  },
  watch: {
    '$route.query': {
      handler (query, old)  {
        this.onQueryChange(query, old)
      },
    }
  }
}
