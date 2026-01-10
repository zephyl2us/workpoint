<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`lottery.setting`) }}</h3>
      <div class="header-action"></div>
    </header>

    <div class="app__body">
      <div class="card-lottery-yeekee card mb-3">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th style="min-width: 32px; padding-right: 0px;"></th>
                <th style="min-width: 135px; padding-left: 8px;">ประเภท</th>
                <th width="100%"></th>
                <th style="min-width: 60px">สถานะ</th>
                <th style="min-width: 200px;">วันเปิด</th>
                <th style="min-width: 100px;">วันหยุด</th>
                <th style="min-width: 88px;">เวลาเปิด</th>
                <th style="min-width: 88px;">เวลาปิด</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="type in types">
                <tr :key="`${type}`">
                  <td colspan="8" class="">
                    <h5>{{ $t(`lottery.type.${type}`) }}</h5>
                  </td>
                </tr>

                <template v-for="zone in getZones(type)">
                  <tr v-for="(category, i) in getCategories(type, zone)" :key="`${type}-${zone}-${i}`">
                    <td style="padding-right: 0px;">
                      <i v-if="!i" :class="[addFlagIconClass(zone)]"></i>
                    </td>
                    <td style="padding-left: 8px;">
                      <div v-if="!i" class="mb-0">
                        <span class="font-weight-bold font-special text-dark">{{ $t(`lottery.zone.${zone}`) }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="">{{ $t(`lottery.slug.${category.slug}`) }}</span>
                    </td>
                    <td>
                      <span class="badge" :class="[addClassStatus(category)]">{{ getCategoryStatus(category) }}</span>
                    </td>
                    <td>
                      <p v-if="_.size(getAvailableDays(category))" class="">
                        <span 
                          v-if="_.size(getAvailableDays(category)) === 7" 
                          class="badge badge-primary mr-1">
                          ทุกวัน
                        </span>
                        <template v-else>
                          <span 
                            v-for="(day, index) in getAvailableDays(category)" 
                            :key="`available-day-${index}`" 
                            class="badge badge-light-primary mr-1">
                            {{ $moment().day(day).format('dd') }}
                          </span>
                        </template>
                      </p>
                      <template v-if="_.size(getSpecialDays(category))">
                        <p v-for="(specialDay, index) in getSpecialDays(category)" :key="`special-day-${index}`" class="">
                          <span class="badge badge-light-success">{{ specialDay }}</span>
                        </p>
                      </template>
                    </td>
                    <td>
                      <template v-if="_.size(getHolidays(category))">
                        <p v-for="(holiday, index) in getHolidays(category)" :key="`holiday-${index}`" class="">
                          <span class="badge badge-light-warning">{{ holiday }}</span>
                        </p>
                      </template>
                    </td>
                    <td>
                      <span class="font-family-numeral">{{ _.get(category, 'start_time') }}</span>
                      <small v-if="_.result(category, 'pre_start')" class="font-family-numeral text-muted">
                        (-{{ _.get(category, 'pre_start') }})
                      </small>
                    </td>
                    <td>
                      <span class="font-family-numeral">{{ _.get(category, 'end_time') }}</span>
                    </td>
                    <td>
                      <div class="d-flex">
                        <button class="btn btn-sm btn-light-secondary" @click="onClickConfigModal(category)">
                          <i class="fa-light fa-gear"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <CategoryConfigModal v-if="showConfigModal" :on-close="onCloseConfigModal" :category="configCategory"></CategoryConfigModal>

  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

import CategoryConfigModal from '~/components/Admin/Lottery/CategoryConfigModal'

export default {
  name: 'LotteryYeekee',
  components: {
    CategoryConfigModal
  },
  mixins: [],
  layout: 'admin',
  props: {},
  data () {
    return {
      showConfigModal: false,
      configCategory: null,
      types: ['government', 'stock', 'yeekee']
    }
  },
  computed: {
    ...mapGetters('admin-lottery', [
      'categories',
    ]),
  },
  watch: {
  },
	beforeDestroy () {
  },
  created () {},
  mounted () {
    this.getCategories()
  },
  methods: {
    ...mapActions('admin-lottery', [
      'getCategories'
    ]),
    getZones (type) {
      const categories = this._.cloneDeep(this.categories)
      const zoneCategories = this._.filter(categories, (category) => this._.eq(type, category.type))
      const zones = this._.uniq(this._.map(zoneCategories, (category) => category.zone))

      return zones
    },
    addFlagIconClass (zone) {
      return `fi fi-${this.zoneToFlag(zone)}`
    },
    getCategories (type, zone) {
      const categories = this._.cloneDeep(this.categories)
      const zoneCategories = this._.filter(categories, (category) => this._.eq(type, category.type) && this._.eq(zone, category.zone))
      return zoneCategories
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
    getAvailableDays (category) {
      return this._.get(category, 'available_day')
    },
    getSpecialDays (category) {
      return this._.get(category, 'special_day')
    },
    getHolidays (category) {
      return this._.get(category, 'holiday')
    },
    onClickConfigModal (category) {
      // console.log(record)
      this.configCategory = category
      this.showConfigModal = true
    },
    onCloseConfigModal () {
      this.showConfigModal = false
      this.configCategory = null
    },
  },
}
</script>