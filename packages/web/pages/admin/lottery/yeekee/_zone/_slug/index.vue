<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`lottery.slug.${_.get($route, 'params.slug')}`) }}</h3>
      <div class="header-action">
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text"><i class="fa-light fa-calendar"></i></span>
          </div>
          <VueDatePicker v-model="date" type="date" value-type="format"></VueDatePicker>
        </div>
      </div>
    </header>

    <div class="app__body">
      <LotteryList :records="records"></LotteryList>
    </div>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'

import _ from 'lodash'
import fetchMixin from '~/mixins/fetch'

import LotteryList from '~/components/Admin/Lottery/List'

export default {
  name: 'LotteryYeekeeSlug',
  components: {
    LotteryList
  },
  mixins: [fetchMixin],
  // beforeRouteUpdate (to, from, next) {
  //   console.log(to.path, from.path)
  //   next()
  // },
  layout: 'admin',
  props: {},
  data () {
    return {
      date: null,
      filters: {
        date: null
      },
    }
  },
  computed: {
    ...mapGetters('admin-lottery', [
      'categories',
      'lotteries'
    ]),
    records () {
      const lotteries = this._.cloneDeep(this.lotteries)
      const slug = this._.get(this.$route, 'params.slug')
      const resultedLotteries = this._.filter(lotteries, (lottery) => this._.eq(slug, lottery.slug))

      // console.log(resultedLotteries)
      const records = this._.orderBy(resultedLotteries, ['round'], ['asc'])

      return records
    },
  },
  watch: {
    'date': {
      handler (value, old) {
        console.log(`watch: date`, value, old)
        if(!this.$moment(value).isValid()) {
          this.setDefaultDate()
          return
        }
        this.filters.date = this.$moment(value).format('YYYY-MM-DD')
        this.handleFilterSubmit()
      }
    },
  },
	beforeDestroy () {
    this.$pusher.unsubscribe(`lottery`)
  },
  created () {},
  mounted () {
    const channel = this.$pusher.subscribe(`lottery`)

    channel.bind('update', (data) => {
      this.receiveUpdateLottery(data)
    })

    // this.dataManager(this.filters, 'mount')
    this.setDefaultDate()
  },
  methods: {
    ...mapMutations('admin-lottery', [
      'receiveUpdateLottery'
    ]),
    ...mapActions('admin-lottery', [
      'getCategories',
      'getYeekeeBySlug'
    ]),
    /**
     * Data manager work with api
     */
    async dataManager (params, from = null) {
      console.log('dataManager', from)
      if(!this._.get(this.filters, 'date')) {
        return
      }
      
      const data = {
        zone: _.get(this.$route, 'params.zone'),
        slug: _.get(this.$route, 'params.slug'),
        params: { ...params }
			}

      console.log(this.$route)
      await this.getYeekeeBySlug(data)
      // this.handleAfterLoaded()
    },
    setDefaultDate () {
      if(this.filters.date) {
        this.date = this.$moment(this.filters.date).format('YYYY-MM-DD')
      } else {
        this.date = this.$moment().subtract(5, 'hours').format('YYYY-MM-DD')
      }
    }
  },
}
</script>