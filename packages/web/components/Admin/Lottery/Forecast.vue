<template>
  <div class="app__body">
    <div class="row">
      <div class="col-9">
        <ForecastGroup v-if="filter.type" :records="records" :group="filter.group" :type="filter.type" :hunt="filter.hunt"></ForecastGroup>
        <!-- <div v-for="i in 100" :key="`${i}`">LotteryYeekeeForecast {{ i }}</div> -->
      </div>
      <div class="col-3">
        <div class="card card-lottery-forecast-filter app-sticky-top">
          <div class="card-body">
            <div class="btn-group w-100" role="group" aria-label="First group">
              <button 
                v-for="value in hunts" 
                :key="`hunt-${value}`" 
                type="button" 
                class="btn btn-sm px-0" 
                :class="[addClassHuntButton(value)]"
                @click="onClickHuntButton(value)">
                {{ $t(`lottery.forecast_filter.hunts.${huntToString(value)}_sm`) }}
              </button>
            </div>
          </div>
          <ul class="forecast-group">
            <li 
              v-for="(types, key) in groups" 
              :key="`group-${key}`" 
              class="forecast-group-item"
              :class="[addClassForecastMenu(key)]">
              <div class="forecast-menu" @click="onClickForecastMenu(key)">
                <span class="menu-label">{{ $t(`lottery.forecast_groups.${key}`) }}</span>
                <span class="badge badge-secondary badge-pill">{{ _.size(types) }}</span>
              </div>
              <div
                class="forecast-submenu">
                <div 
                  v-for="(obj, type) in types" 
                  :key="`group-${type}`" 
                  class="submenu-item"
                  :class="[addClassForecastType(type)]"
                  @click="onClickForecastType(type, key)">
                  <span class="menu-label">{{ $t(`lottery.forecast_types.${type}`) }}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

import ForecastGroup from '~/components/Admin/Lottery/ForecastGroup'

export default {
  name: 'LotteryForecast',
  components: {
    ForecastGroup
  },
  mixins: [],
  props: {},
  data () {
    return {
      hunts: [1, 3, 4, 5],
      groups: {
        run: {
          run_1: null,
          run_2: null,
          run_1_top: null,
          run_2_top: null,
          run_1_under: null,
          run_2_under: null,
        },
        slide: {
          slide_1: null,
          slide_2: null,
          slide_1_top: null,
          slide_2_top: null,
          slide_3_top: null,
          slide_4_top: null,
          slide_1_under: null,
          slide_2_under: null,
          slide_3_under: null,
          slide_4_under: null,
        },
        three_win: {
          three_win_5: null,
          three_win_6: null,
          three_win_7: null,
          three_win_8: null,
        },
        win: {
          win_5: null,
          win_6: null,
          win_7: null,
          win_8: null,
          win_9: null,
          win_5_top: null,
          win_6_top: null,
          win_7_top: null,
          win_8_top: null,
          win_9_top: null,
          win_5_under: null,
          win_6_under: null,
          win_7_under: null,
          win_8_under: null,
          win_9_under: null,
        },
        high_low: {
          high_low_top: null,
          high_low_under: null,
          high_low_top_flow: null,
          high_low_under_flow: null,
        },
        even_odd: {
          even_odd_top: null,
          even_odd_under: null,
          even_odd_top_flow: null,
          even_odd_under_flow: null,
        },
        sticky: {
          sticky_ones_5_top: null,
          sticky_ones_6_top: null,
          sticky_ones_7_top: null,
          sticky_ones_8_top: null,
          sticky_ones_9_top: null,
          sticky_tens_5_top: null,
          sticky_tens_6_top: null,
          sticky_tens_7_top: null,
          sticky_tens_8_top: null,
          sticky_tens_9_top: null,
          sticky_hundreds_5_top: null,
          sticky_hundreds_6_top: null,
          sticky_hundreds_7_top: null,
          sticky_hundreds_8_top: null,
          sticky_hundreds_9_top: null,
          sticky_ones_5_under: null,
          sticky_ones_6_under: null,
          sticky_ones_7_under: null,
          sticky_ones_8_under: null,
          sticky_ones_9_under: null,
          sticky_tens_5_under: null,
          sticky_tens_6_under: null,
          sticky_tens_7_under: null,
          sticky_tens_8_under: null,
          sticky_tens_9_under: null,
        },
        fixed: {
          fixed_run_2: null,
          fixed_run_2_top: null,
          fixed_run_2_under: null,
          fixed_slide_2: null,
          fixed_slide_2_top: null,
          fixed_slide_3_top: null,
          fixed_slide_4_top: null,
          fixed_slide_2_under: null,
          fixed_slide_3_under: null,
          fixed_slide_4_under: null,
          fixed_win_5: null,
          fixed_win_6: null,
          fixed_win_7: null,
          fixed_win_8: null,
          fixed_win_9: null,
          fixed_win_5_top: null,
          fixed_win_6_top: null,
          fixed_win_7_top: null,
          fixed_win_8_top: null,
          fixed_win_9_top: null,
          fixed_win_5_under: null,
          fixed_win_6_under: null,
          fixed_win_7_under: null,
          fixed_win_8_under: null,
          fixed_win_9_under: null,
          fixed_sticky_ones_5_top: null,
          fixed_sticky_ones_6_top: null,
          fixed_sticky_ones_7_top: null,
          fixed_sticky_ones_8_top: null,
          fixed_sticky_tens_5_top: null,
          fixed_sticky_tens_6_top: null,
          fixed_sticky_tens_7_top: null,
          fixed_sticky_tens_8_top: null,
          fixed_sticky_hundreds_5_top: null,
          fixed_sticky_hundreds_6_top: null,
          fixed_sticky_hundreds_7_top: null,
          fixed_sticky_hundreds_8_top: null,
          fixed_sticky_ones_5_under: null,
          fixed_sticky_ones_6_under: null,
          fixed_sticky_ones_7_under: null,
          fixed_sticky_ones_8_under: null,
          fixed_sticky_tens_5_under: null,
          fixed_sticky_tens_6_under: null,
          fixed_sticky_tens_7_under: null,
          fixed_sticky_tens_8_under: null,
        },
        // flow: {
        //   flow_run_1: null,
        //   flow_run_2: null,
        //   flow_run_3_top: null,
        //   flow_run_4_top: null,
        //   flow_run_3_under: null,
        //   flow_run_4_under: null,
        //   flow_win_5: null,
        //   flow_win_6: null,
        //   flow_win_7: null,
        //   flow_win_7_top: null,
        //   flow_win_8_top: null,
        //   flow_win_9_top: null,
        //   flow_win_7_under: null,
        //   flow_win_8_under: null,
        //   flow_win_9_under: null,
        //   flow_sticky_ones_5_top: null,
        //   flow_sticky_ones_6_top: null,
        //   flow_sticky_ones_7_top: null,
        //   flow_sticky_ones_8_top: null,
        //   flow_sticky_tens_5_top: null,
        //   flow_sticky_tens_6_top: null,
        //   flow_sticky_tens_7_top: null,
        //   flow_sticky_tens_8_top: null,
        //   flow_sticky_ones_5_under: null,
        //   flow_sticky_ones_6_under: null,
        //   flow_sticky_ones_7_under: null,
        //   flow_sticky_ones_8_under: null,
        //   flow_sticky_tens_5_under: null,
        //   flow_sticky_tens_6_under: null,
        //   flow_sticky_tens_7_under: null,
        //   flow_sticky_tens_8_under: null,
        // }
      },
      filter: {
        hunt: 1,
        group: null,
        type: null,
      },
      menuActive: null,
    }
  },
  computed: {
    ...mapGetters('admin-lottery', [
      'lotteries'
    ]),
    records () {
      const lotteries = this._.cloneDeep(this.lotteries)
      const slug = this._.get(this.$route, 'params.slug')
      const filterLotteries = this._.filter(lotteries, (lottery) => this._.eq(slug, lottery.slug))
      const orderLotteries = this._.orderBy(filterLotteries, ['round'], ['asc'])
      const resultedLotteries = this._.filter(orderLotteries, (lottery) => this._.isObject(lottery.result))
      const comingLotteries = this._.filter(orderLotteries, (lottery) => !this._.isObject(lottery.result))
      
      // const huntValues = {
      //   normal: 1,
      //   three: 3,
      //   four: 4,
      //   five: 5
      // }
      const resultedSize = this._.size(resultedLotteries)
      const huntValue = this.filter.hunt
      const huntRemainder = (resultedSize) % huntValue
      const huntAddon = huntValue - huntRemainder
      const huntLotteries = this._.slice(comingLotteries, 0, huntAddon)

      // console.log(huntLotteries)

      // console.log(this._.merge(resultedLotteries, huntLotteries))
      // console.log(resultedLotteries)
      const records = this._.concat(resultedLotteries, huntLotteries)

      return records
    },
    // refData () {
    //   console.log(this.$route)
    //   return {
    //     date: this._.get(this.$route, 'query.date'),
    //     slug: this._.get(this.$route, 'params.slug')
    //   }
    // }
  },
  watch: {
  },
  created () {},
  mounted () {
  },
  methods: {
    addClassHuntButton (value) {
      return this._.eq(this.filter.hunt, value) ? 'btn-primary': 'btn-light-secondary'
    },
    onClickHuntButton (value) {
      this.filter.hunt = value
    },
    addClassForecastMenu (value) {
      const regexp = new RegExp('^' + value, 'i')
      const type = this.filter.type
      if (regexp.test(type)) {
        return 'active'
      }
      
      return this._.eq(this.menuActive, value) ? 'active': ''
    },
    onClickForecastMenu (value) {
      if(this._.eq(this.menuActive, value)) {
        this.menuActive = null
        return
      }
      this.menuActive = value
    },
    addClassForecastType (value) {
      return this._.eq(this.filter.type, value) ? 'active': ''
    },
    onClickForecastType (value, group) {
      this.filter.type = value
      this.filter.group = group
    },
    huntToString (value) {
      const hunts = {
        1: 'normal',
        3: 'three',
        4: 'four',
        5: 'five'
      }
      return this._.get(hunts, value) || 'normal'
    },
  },
}
</script>