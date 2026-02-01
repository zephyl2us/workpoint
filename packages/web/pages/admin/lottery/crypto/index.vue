<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t('lottery.type.crypto') }}</h3>
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
      <div class="card-lottery-crypto card mb-3">
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
              <tr v-for="category in records" :key="`category-${category.slug}`">
                <td scope="row" class="pl-3">
                  <NuxtLink :to="`/admin/category/category/${category.id}`" class="font-numeral">
                    {{ category.id }}
                  </NuxtLink>
                </td>
                <td>
                  <div class="mb-0">
                    <span class="font-weight-bold font-special text-dark">
                      {{ $t(`lottery.slug.${category.slug}`) }}
                    </span>
                  </div>
                  <div class="font-size-sm">
                    {{ category.slug }}
                  </div>
                </td>
                <td>
                  <span class="badge" :class="[addClassStatus(category)]">
                    {{ getCategoryStatus(category) }}
                  </span>
                </td>
                <td>{{ _.get(category, 'lottery.round') }}</td>
                <td>
                  <div v-if="_.has(category, 'lottery.result.three_top')" class="mb-0">
                    <span class="font-weight-bold font-numeral">
                      {{ _.get(category, 'lottery.result.three_top') }}
                    </span> /
                    <span class="font-weight-bold font-numeral">
                      {{ _.get(category, 'lottery.result.two_under') }}
                    </span>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import fetchMixin from '~/mixins/fetch'

export default {
  name: 'LotteryCrypto',
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
      let lotteries = this._.cloneDeep(this.lotteries)
      lotteries = this._.orderBy(lotteries, ['round'], ['desc'])
      const categories = this._.cloneDeep(this.categories)
      const cryptoCategories = this._.filter(categories, (category) => 
        this._.eq('crypto', category.type)
      )

      this._.each(cryptoCategories, (category, index) => {
        const findIndex = this._.findIndex(lotteries, (lottery) => 
          lottery.slug === category.slug
        )
        const lottery = this._.get(lotteries, findIndex)
        cryptoCategories[index].lottery = lottery
      })

      return cryptoCategories
    }
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
      'getCrypto'
    ]),
    async dataManager (params) {
      if(!this._.get(this.filters, 'date')) {
        return
      }
      const data = {
        params: { ...params }
      }
      await this.getCrypto(data)
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
      const slug = this._.get(category, 'slug')
      return `${this.$route.path}/${slug}?date=${date}`
    },
  },
}
</script>
