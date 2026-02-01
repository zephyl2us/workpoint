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
import fetchMixin from '~/mixins/fetch'
import LotteryList from '~/components/Admin/Lottery/List'

export default {
  name: 'LotteryCryptoSlug',
  components: {
    LotteryList
  },
  mixins: [fetchMixin],
  layout: 'admin',
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
      const resultedLotteries = this._.filter(lotteries, (lottery) => 
        this._.eq(slug, lottery.slug)
      )
      const records = this._.orderBy(resultedLotteries, ['round'], ['asc'])
      return records
    },
  },
  watch: {
    'date': {
      handler (value, old) {
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
    this.$pusher.unsubscribe('lottery')
  },
  mounted () {
    const channel = this.$pusher.subscribe('lottery')
    channel.bind('update', (data) => {
      this.receiveUpdateLottery(data)
    })
    this.setDefaultDate()
  },
  methods: {
    ...mapMutations('admin-lottery', [
      'receiveUpdateLottery'
    ]),
    ...mapActions('admin-lottery', [
      'getCryptoBySlug'
    ]),
    async dataManager (params) {
      if(!this._.get(this.filters, 'date')) {
        return
      }
      const data = {
        slug: this.$route.params.slug,
        params: { ...params }
      }
      await this.getCryptoBySlug(data)
    },
    setDefaultDate () {
      if(this.filters.date) {
        this.date = this.$moment(this.filters.date).format('YYYY-MM-DD')
      } else {
        this.date = this.$moment().subtract(5, 'hours').format('YYYY-MM-DD')
      }
    },
  },
}
</script>
