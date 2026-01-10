<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`lottery.type.yeekee`) }}</h3>
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
      <div class="card-lottery-yeekee card mb-3">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th style="min-width: 80px" class="pl-3">#</th>
                <th width="100%">ประเภท</th>
                <th style="min-width: 60px">สถานะ</th>
                <th style="min-width: 60px">รอบที่</th>
                <th style="min-width: 200px">ผล</th>
                <th style="min-width: 66px"></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(slugs, zone) in zoneRecords">
                <tr :key="`zone-${zone}`">
                  <td colspan="6" class="">
                    <div class="d-flex align-items-center">
                      <h5>{{ $t(`lottery.zone.${zone}`) }}</h5>
                      <div class="ml-auto">
                        <button 
                          v-if="hasPermission('lottery.yeekee.lottery_rate')" 
                          class="btn btn-sm btn-light-secondary ml-2"
                          @click="onClickRateModal(zone)">อัตราจ่าย</button>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr v-for="category in slugs" :key="`category-${category.slug}`">
                  <td scope="row" class="pl-3">
                    <NuxtLink :to="`/admin/category/category/${category.id}`" class="font-numeral">{{ category.id }}</NuxtLink>
                  </td>
                  <td>
                    <div class="mb-0">
                      <span class="font-weight-bold font-special text-dark">{{ $t(`lottery.slug.${category.slug}`) }}</span>
                    </div>
                    <div class="font-size-sm">
                      {{ category.slug }}
                    </div>
                  </td>
                  <td>
                    <span class="badge" :class="[addClassStatus(category)]">{{ getCategoryStatus(category) }}</span>
                  </td>
                  <td>{{ _.get(category, 'lottery.round') }}</td>
                  <td>
                    <div v-if="_.has(category, 'lottery.result.three_top')" class="mb-0">
                      <span class="font-weight-bold font-numeral">{{ _.get(category, 'lottery.result.three_top') }}</span> /
                      <span class="font-weight-bold font-numeral">{{ _.get(category, 'lottery.result.two_under') }}</span>
                    </div>
                    <div v-else class="mb-0">
                      <span class="font-numeral text-muted">XXX</span> /
                      <span class="font-numeral text-muted">XX</span>
                    </div>
                    <div class="font-size-sm text-muted">
                      <i class="fa-light fa-clock"></i>
                      <span class="">{{ _.get(category, 'lottery.result_at') }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="table-action">
                      <NuxtLink :to="urlToCategory(category)" class="btn btn-sm btn-light-primary">
                        <i class="fa-regular fa-list"></i>
                      </NuxtLink>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <RateConfigModal v-if="showRateConfigModal" :on-close="onCloseRateConfigModal" :zone="rateConfigZone"></RateConfigModal>

  </div>
</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'

import fetchMixin from '~/mixins/fetch'
import RateConfigModal from '~/components/Admin/Lottery/RateConfigModal'

export default {
  name: 'LotteryYeekee',
  components: {
    RateConfigModal
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
      showRateConfigModal: false,
      rateConfigZone: null,
      configCategoryId: null,
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
    zoneRecords () {
      let lotteries = this._.cloneDeep(this.lotteries)
      lotteries = this._.orderBy(lotteries, ['round'], ['desc'])
      const categories = this._.cloneDeep(this.categories)
      const yeekeeCategories = this._.filter(categories, (category) => this._.eq('yeekee', category.type))

      this._.each(yeekeeCategories, (category, index) => {
        const findIndex = this._.findIndex(lotteries, (lottery) => lottery.slug === category.slug)
        // if(findIndex === -1) {
        //   return true
        // }

        const lottery = this._.get(lotteries, findIndex)
        yeekeeCategories[index].lottery = lottery
      })

      const categoryZones = this._.uniq(this._.map(yeekeeCategories, (category) => category.zone))

      const zoneRecords = {}
      this._.each(categoryZones, (zone) => {
        // zoneRecords[zone] = []
        // const slugs = []
        const slugs = this._.filter(categories, (category) => this._.eq(zone, category.zone))
        zoneRecords[zone] = slugs

      })

      return zoneRecords
    }
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
      'getYeekee'
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
        params: { ...params }
			}

      // console.log(this.$route)
      await this.getYeekee(data)
      // this.handleAfterLoaded()
    },
    setDefaultDate () {
      if(this.filters.date) {
        this.date = this.$moment(this.filters.date).format('YYYY-MM-DD')
      } else {
        this.date = this.$moment().subtract(5, 'hours').format('YYYY-MM-DD')
      }
    },
    addClassStatus (category) {
      const sts = ['badge-light-secondary', 'badge-success']
      return this._.get(sts, category.is_enable)
    },
    getCategoryStatus (category) {
      const sts = ['disable', 'enable']
      const status = this._.get(sts, category.is_enable)

      return this.$t(`lottery.category.status.${status}`)
    },
    urlToCategory (category) {
      let date = this._.get(this.$route, 'query.date')

      if(!date) {
        date = this.$moment().subtract(5, 'hours').format('YYYY-MM-DD')
      }

      const zone = this._.get(category, 'zone')
      const slug = this._.get(category, 'slug')

      return `${this.$route.path}/${zone}/${slug}?date=${date}`
    },
    onClickRateModal (zone) {
      this.rateConfigZone = zone
      this.showRateConfigModal = true
    },
    onCloseRateConfigModal () {
      this.showRateConfigModal = false
      this.rateConfigZone = null
    },
  },
}
</script>