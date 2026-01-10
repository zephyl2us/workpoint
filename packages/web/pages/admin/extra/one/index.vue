<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`extra.one`) }}</h3>
      <div class="header-action">
        <button 
          v-if="hasPermission('extra.one.export')"
          class="btn btn-secondary mr-2"
          :class="[addClassExport()]"
          @click="onClickExport()">
          <i class="fa-regular fa-download"></i>
        </button>
        <!-- <NuxtLink
            v-if="hasPermission('extra.one.export')"
            :to="linkTo(`/army/ant/create`)"
            class="btn btn-primary">
          <i class="icon fa-duotone fa-bugs mr-2"></i>
          <span>{{ $t(`army.ant_create`) }}</span>
        </NuxtLink> -->
      </div>
    </header>
    <div class="app__body">
      <div class="d-flex mb-3">
        <MultiSelect
          v-model="agentIds"
          class="w-100"
          :options="options"
          placeholder="เอเย่นต์"
          icon-down="custom-icon-down"
          icon-check="custom-icon-check">
        </MultiSelect>
      </div>
      <div class="row">
        <div v-for="(filter, i) in filterConditions" :key="`filter-${i}`" class="col-12 d-flex mb-3">
          <select
            v-model="filter.key"
            class="form-control mr-3"
            style="min-width: 150px; width: 150px;"
            @change="onUpdateFilter()">
            <option v-for="field in filterLists" :key="`filter-${i}-${field}`">{{ field }}</option>
          </select>
          <select
            v-model="filter.condition"
            class="form-control mr-3"
            style="min-width: 60px; width: 60px;"
            @change="onUpdateFilter()">
            <option value="equal">=</option>
            <option value="more">&gt;</option>
            <option value="less">&lt;</option>
          </select>

          <input 
            v-model="filter.value"
            class="form-control mr-3" 
            style="width: 100%"
            @change="onUpdateFilter()">

          <button class="btn btn-light-secondary mr-2" :class="addClassRemoveFilter(i)" @click="onRemoveFilter(i)"><i class="fa-solid fa-minus"></i></button>
          <button class="btn btn-light-secondary" :class="addClassAddFilter(i)" @click="onAddFilter(i)"><i class="fa-solid fa-plus"></i></button>
        </div>
      </div>
      <!-- <div class="d-flex mb-3">
         
      </div> -->
      <template v-if="hasRecords">
        <div class="card card-ant-list mb-3">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th style="min-width: 84px;" class="pl-3">#</th>
                  <th width="100%">ชื่อ</th>
                  <!-- <th style="min-width: 40px;"></th> -->
                  <th style="min-width: 150px;">เบอร์โทร</th>
                  <th style="min-width: 150px;">ฝาก</th>
                  <th style="min-width: 150px;">ถอน</th>
                  <th style="min-width: 150px;">ยอดทายผล</th>
                  <th style="min-width: 150px;">ยอดทายผลหวย</th>
                  <th style="min-width: 150px;">ยอดทายผลเกม</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(record, index) in records" :key="`record-${index}`">
                  <td>
                    <div class="mb-0">
                      <span class="">{{ record.one_user_id }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="mb-0">
                      <span v-clipboard="`${record.first_name} ${record.last_name}`" class="cursor-clipboard font-weight-bold font-special text-dark">{{ record.first_name }} {{ record.last_name }}</span>
                    </div>
                    <div class="font-size-sm">
                      <span v-clipboard="`${record.username}`" class="cursor-clipboard">{{ record.username }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="">
                      <span class="font-numeral">{{ record.mobile }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="font-size-sm">
                      <span class="font-numeral">{{ UIRenderNumber(record.deposit, '0,0.00') }}</span>
                    </div>
                    <div class="font-size-sm">
                      <span class="font-numeral text-muted">{{ UIRenderDateTime(record.latest_deposit) }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="font-size-sm">
                      <span class="font-numeral">{{ UIRenderNumber(record.withdraw, '0,0.00') }}</span>
                    </div>
                    <div class="font-size-sm">
                      <span class="font-numeral text-muted">{{ UIRenderDateTime(record.latest_withdraw) }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="font-size-sm">
                      <span class="font-numeral">{{ UIRenderNumber(record.betall, '0,0.00') }}</span>
                    </div>
                    <div class="font-size-sm">
                      <span class="font-numeral" :class="{ 'text-danger' : record.settlement < 0, 'text-success' : record.settlement > 0 }">{{ UIRenderNumber(record.settlement, '0,0.00') }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="font-size-sm">
                      <span class="font-numeral">{{ UIRenderNumber(record.bet_lotto_government, '0,0.00') }}</span>
                    </div>
                    <div class="font-size-sm">
                      <span class="font-numeral">{{ UIRenderNumber(record.bet_lotto_stock, '0,0.00') }}</span>
                    </div>
                    <div class="font-size-sm">
                      <span class="font-numeral">{{ UIRenderNumber(record.bet_lotto_yeekee, '0,0.00') }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="font-size-sm">
                      <span class="font-numeral">{{ UIRenderNumber(record.bet_game_paoyingchub, '0,0.00') }}</span>
                    </div>
                    <div class="font-size-sm">
                      <span class="font-numeral">{{ UIRenderNumber(record.bet_game_huakoi, '0,0.00') }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Pagination v-if="hasRecords" :pagination="pagination" :on-page-change="handleOnChangePage"></Pagination>
      </template>
    </div>
  </div>
</template>

<script>
// import _ from 'lodash'
import qs from 'qs'
import { mapState, mapGetters, mapActions } from 'vuex'

import fetchMixin from '~/mixins/fetch'

export default {
  name: 'ArmyAnt',
  components: {},
  mixins: [fetchMixin],
  layout: 'admin',
  props: {},
  data () {
    return {
      // date: null,
      filters: {
        id: undefined,
        status: undefined,
        page: 1,
        agent_ids: null,
        // user_id: ''
        conditions: []
      },
      agentIds: [],
      filterConditions: [
        {
          key: 'last_login_at',
          condition: 'equal',
          value: ''
        }
      ],
      options: [
        { id: 10, label: 'agentyt' },
        { id: 15, label: 'agentsg' },
        { id: 12, label: 'agentmi' },
        { id: 17, label: 'agentpe' },
        { id: 19, label: 'donuts' },
        { id: 14, label: 'agentti' },
        { id: 16, label: 'cookie' },
        { id: 13, label: 'agenttk' },
        { id: 11, label: 'agentyk' },
        { id: 9, label: 'agentb' },
        { id: 18, label: 'waffle' },
        { id: 93, label: 'pancake' },
        { id: 65, label: 'brownie' },
        { id: 45811, label: 'pannacotta' },
        { id: 251841, label: 'agentpo' },
        { id: 251842, label: 'agentgo' },
        { id: 302615, label: 'agentmcr' },
        { id: 315419, label: 'marcarone' },
        { id: 326207, label: 'agentna' },
        { id: 349198, label: 'agentt' }
      ],
      filterLists: [
          // 'login_count',
					'last_login_at',
					'deposit',
					// 'deposit_times',
					'latest_deposit',
					'withdraw',
					// 'withdraw_times',
					'latest_withdraw',
					'settlement',
					'bet_lotto_government',
					'bet_lotto_stock',
					'bet_lotto_yeekee',
					'bet_game_paoyingchub',
					'bet_game_huakoi',
					// 'af_bet_lotto_government',
					// 'af_bet_lotto_stock',
					// 'af_bet_lotto_yeekee',
					// 'af_bet_game_paoyingchub',
					// 'af_bet_game_huakoi',
					// 'af_bet_credit',
					// 'af_bet_rolling',
					// 'bet_credit',
					// 'bet_rolling',
					'betall',
					// 'result_bet_credit',
					// 'revenue_income',
					// 'revenue_outcome',
					// 'revenue_settlement',
					// 'rolling',
					// 'revenue_commission',
					// 'revenue_af',
					// 'latest_update_bet',
      ]
    }
  },
  computed: {
    ...mapState('auth', [
      'user'
    ]),
    ...mapGetters('admin-extra-one', [
      'records',
      'agents',
      'pagination'
    ]),
    hasAgent () {
      return !!this._.size(this.agents)
    },
    canExport () {
      return !!this._.size(this.agentIds)
    },
  },
  watch: {
    agentIds: {
      handler (value ) {
        const agentIds = this._.join(value, ',') || null
        this.filters.agent_ids = agentIds
        this.handleFilterSubmit()
      }
    }
  },
  created () {},
  beforeDestroy () {},
  mounted () {
  },
  methods: {
    ...mapActions('admin-extra-one', [
      'getUsers'
    ]),
    /**
     * Data manager work with api
     */
    async dataManager (params, from = null) {
      await this.getUsers(params)
      this.handleAfterLoaded()
    },

    canRemoveFilter (index) {
      return this._.size(this.filterConditions) > 1
    },

    canAddFilter (index) {
      return this._.size(this.filterConditions) < 5
    },

    addClassRemoveFilter (index) {
      return this.canRemoveFilter(index) ? '' : 'disabled'
    },

    addClassAddFilter (index) {
      return this.canAddFilter(index) ? '' : 'disabled'
    },

    onRemoveFilter (index) {
      if (!this.canRemoveFilter(index)) {
        return false
      }

      const filters = this._.cloneDeep(this.filterConditions)
      filters.splice(index, 1)
      this.filterConditions = filters

      this.onUpdateFilter()
    },

    onAddFilter (index) {
      if (!this.canAddFilter(index)) {
        return false
      }

      const filters = this._.cloneDeep(this.filterConditions)
      filters.splice((index + 1), 0, {
          key: 'last_login_at',
          condition: 'equal',
          value: ''
      })

      this.filterConditions = filters
    },

    onUpdateFilter () {
      console.log(`onUpdateFilter`)

      const filterConditions = this._.cloneDeep(this.filterConditions)
      const conditions = []

      this._.each(filterConditions, (filter) => {
        if (filter.value) conditions.push(filter)
      })

      this.filters.conditions = conditions
      this.handleFilterSubmit()
    },

    // onUpdateFilter: _.debounce(function () {
    // }, 500, { leading: true }),

    convertToCSV () {

    },

    addClassExport (index) {
      return this.canExport ? '' : 'disabled'
    },

    onClickExport () {
      if (!this.canExport) {
        return false
      }


      // console.log(`url`, this.$axios.defaults.baseURL)
      const baseURL = this.$axios.defaults.baseURL
      const queryString = qs.stringify(this.filters)
      const url = `${baseURL}/core/extra/one/export?${queryString}`

      console.log(this.$route.query)

      console.log(url)

      window.open(`${url}`, '_blank')

      // try {
      //   const csvContent = `name,test\r\n`
        
      //   // สร้าง Blob จากข้อมูล CSV
      //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        
      //   // สร้าง URL และ link เพื่อดาวน์โหลด
      //   const url = window.URL.createObjectURL(blob)
      //   const link = document.createElement('a')
        
      //   // กำหนดชื่อไฟล์
      //   const currentDate = new Date().toISOString().slice(0, 10)
      //   const filename = `data_export_${currentDate}.csv`
        
      //   link.href = url
      //   link.setAttribute('download', filename)
      //   document.body.appendChild(link)
      //   link.click()
        
      //   // ทำความสะอาด
      //   document.body.removeChild(link)
      //   window.URL.revokeObjectURL(url)
      // } catch (e) {

      // }

    },
  },
}
</script>