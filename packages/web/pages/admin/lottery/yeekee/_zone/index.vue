<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`lottery.type.yeekee`) }} {{ $t(`lottery.zone.${_.get($route, 'params.zone')}`) }}</h3>
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
      <div class="row row-sm">
        <div v-for="(slug) in slugs" :key="`yeekee-card-${slug}`" class="col-12 col-md-6">
          <YeekeeCard :zone="_.get($route, 'params.zone')" :slug="slug"></YeekeeCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'

import _ from 'lodash'
import fetchMixin from '~/mixins/fetch'

import YeekeeCard from '~/components/Admin/Lottery/YeekeeCard'

export default {
  name: 'LotteryYeekee',
  components: {
    YeekeeCard
  },
  mixins: [fetchMixin],
  beforeRouteUpdate (to, from, next) {
    // console.log(to.path, from.path)
    next()
  },
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
      // 'lotteries'
    ]),
    slugs () {
      const zone = this._.get(this.$route, 'params.zone')

      const categories =  this._.map(this._.filter(this.categories, ['zone', zone]), (arr) => arr.slug)
      return categories
    }
  },
  watch: {
    // '$route.query': {
    //   handler (query, old)  {
    //     console.log(`watch 2: $route.query`, query, old)
    //     // this.filters = _.cloneDeep(query)
    //     // this.dataManager(query)
    //   },
    //   // deep: true,
    //   // immediate: true
    // },
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
      'getYeekeeByZone'
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
        params: { ...params }
			}

      console.log(this.$route)
      await this.getYeekeeByZone(data)
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