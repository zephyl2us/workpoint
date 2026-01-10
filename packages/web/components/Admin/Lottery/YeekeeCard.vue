<template>
  <div class="card-lottery-yeekee card mb-3">
    <div class="card-header">
      <h4>{{ $t(`lottery.short_slug.${shortSlug}`) }}</h4>
      <NuxtLink :to="urlToForecast" class="btn btn-sm btn-primary ml-auto">
        <!-- <i class="fa-sharp fa-regular fa-square-root"></i> -->
        สูตร
      </NuxtLink>
      <NuxtLink :to="urlToCategory" class="btn btn-sm btn-light-secondary ml-2">
        &nbsp;<i class="fa-sharp fa-regular fa-angles-right"></i>&nbsp;
      </NuxtLink>
    </div>
    <div class="table-responsive">
      <table class="table table-sm table-hover mb-0">
        <thead>
          <tr>
            <th class="pl-3">รอบที่</th>
            <th width="70">บน</th>
            <th width="70">ล่าง</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(lottery, index) in lastedResult" :key="`result-${lottery.id}`">
            <td scope="row" class="pl-3">
              <span class="" :class="[addFirstRowClass(index)]">{{ _.get(lottery, 'round') }}</span>
              <span class="font-size-sm text-muted">{{ $moment(_.get(lottery, 'result_at')).format('HH:mm:ss') }}</span>
            </td>
            <td><span :class="[addFirstRowClass(index)]">{{ _.get(lottery, 'result.three_top') }}</span></td>
            <td><span :class="[addFirstRowClass(index)]">{{ _.get(lottery, 'result.two_under') }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'YeekeeCard',
  components: {},
  mixins: [],
  props: {
    zone: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      isResultUpdating: false
    }
  },
  computed: {
    ...mapGetters('admin-lottery', [
      'lotteries'
    ]),
    shortSlug () {
      return this._.replace(this.slug, this.zone, '')
    },
    lastedResult () {
      const lotteries = this._.cloneDeep(this.lotteries)
      // console.log(this.zone)
      // console.log(this.slug)
      const resultedLotteries = this._.filter(lotteries, (lottery) => this._.eq(this.slug, lottery.slug) && this._.isObject(lottery.result))

      // console.log(resultedLotteries)
      const lastedLotteries = this._.orderBy(resultedLotteries, ['round'], ['desc']).slice(0, 5)

      return lastedLotteries
    },
    urlToCategory () {
      let date = this._.get(this.$route, 'query.date')

      if(!date) {
        date = this.$moment().subtract(5, 'hours').format('YYYY-MM-DD')
      }

      return `${this.$route.path}/${this.slug}?date=${date}`
    },
    urlToForecast () {
      let date = this._.get(this.$route, 'query.date')

      if(!date) {
        date = this.$moment().subtract(5, 'hours').format('YYYY-MM-DD')
      }

      return `${this.$route.path}/${this.slug}/forecast?date=${date}`
    }
  },
  watch: {
    // 'lastedResult': {
    //   handler (value, old) {
    //     console.log('lastedResult', value, old)
    //     const id = value.id
    //     const oldId = old.id

    //     if(!this._.eq(id, oldId)) {
    //       this.handleUpdate()
    //     }
    //   },
    //   deep: true
    // }
  },
  created () {},
  mounted () {
  },
  methods: {
    handleUpdate () {
      // console.log('handleUpdate')
      this.isResultUpdating = true

      setTimeout(() => {
        // console.log('clear')
        this.isResultUpdating = false
      }, 500)
    },
    addClassUpdateResult () {
      return this.isResultUpdating ? 'is-updating' : ''
    },
    addFirstRowClass (index) {
      return index === 0 ? 'font-size-lg font-weight-bold' : ''
    },
  },
}
</script>