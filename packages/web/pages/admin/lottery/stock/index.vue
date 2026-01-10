<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`lottery.type.stock`) }}</h3>
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
      <LotteryList :records="records" :type="'stock'"></LotteryList>
      <!-- <div class="row row-sm">
        <div v-for="(slug) in slugs" :key="`yeekee-card-${slug}`" class="col-12 col-md-6">
          <YeekeeCard :zone="_.get($route, 'params.zone')" :slug="slug"></YeekeeCard>
        </div>
      </div> -->



    </div>
  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'

import fetchMixin from '~/mixins/fetch'

import LotteryList from '~/components/Admin/Lottery/List'

export default {
  name: 'LotteryStock',
  components: {
    LotteryList
  },
  mixins: [fetchMixin],
  beforeRouteUpdate (to, from, next) {
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
      'lotteries'
    ]),
    records () {
      const lotteries = this._.cloneDeep(this.lotteries)
      const resultedLotteries = this._.filter(lotteries, (lottery) => this._.eq('stock', lottery.type))

      // console.log(resultedLotteries)
      const records = this._.orderBy(resultedLotteries, ['end_at'], ['asc'])

      const categories = this._.cloneDeep(this.categories)
      const stockCategories = this._.filter(categories, (category) => this._.eq('stock', category.type))
      const categoryIds = this._.map(records, (record) => record.lottery_category_id)
      const emptyCategories = this._.filter(stockCategories, (category) => !this._.includes(categoryIds, category.id))
      
      // console.log(emptyCategories)

      const emptyLotteries = this._.map(emptyCategories, (category) => {
        const obj = {
          lottery_category_id: category.id,
          slug: category.slug,
          type: category.type
        }
        return obj
      })


      return this._.union(records, emptyLotteries)
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
      'getStock'
    ]),
    /**
     * Data manager work with api
     */
    async dataManager (params, from = null) {
      // console.log('dataManager', from)
      if(!this._.get(this.filters, 'date')) {
        return
      }
      
      const data = {
        params: { ...params }
			}

      // console.log(this.$route)
      await this.getStock(data)
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