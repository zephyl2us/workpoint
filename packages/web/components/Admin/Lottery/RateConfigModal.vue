<template>
  <Modal ref="sourceImport" :on-close="onClose" :backdrop-close="false" :size="'lg'">
    <template #title>
      <h5 class="modal-title">
        <span class="">ตั้งอัตราจ่าย {{ $t(`lottery.zone.${zone}`) }}</span>
      </h5>
    </template>
    <template #body>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th style="min-width:40px;" class="pl-3"></th>
              <th width="100%">ประเภท</th>
              <th>3 ตัว</th>
              <th>2 ตัว</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(categories, key) in zones">
              <tr :key="`zone-${key}`">
                <td colspan="5" class="">
                  <h5>{{ $t(`nav.lottery_${key}`) }}</h5>
                </td>
              </tr>
              <tr v-for="category in categories" :key="`category-${category.slug}`">
                <td class="">
                  <i :class="[addFlagIconClass(category.slug)]"></i>
                </td>
                <td>
                  <span class="font-weight-bold font-special text-dark">{{ $t(`lottery.slug.${category.slug}`) }}</span>
                </td>
                <td>
                  <input 
                    type="number" 
                    class="form-control form-control-sm font-family-numeral"
                    style="width: 70px;"
                    min="0"
                    max="1000"
                    :value="_.get(zoneRates, `${category.slug}.three_top`)"
							      @keypress="inputOnlyNumber"
                    @input="onChangeRate(category.slug, 'three_top', $event.target.value)"
                    @change="onChangeRate(category.slug, 'three_top', $event.target.value)">
                </td>
                <td>
                  <input 
                    type="number" 
                    class="form-control form-control-sm font-family-numeral"
                    style="width: 55px;"
                    min="0"
                    max="100"
                    :value="_.get(zoneRates, `${category.slug}.two_under`)"
							      @keypress="inputOnlyNumber"
                    @input="onChangeRate(category.slug, 'two_under', $event.target.value)"
                    @change="onChangeRate(category.slug, 'two_under', $event.target.value)">
                </td>
                <td>

                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <div class="modal-footer">
        <button type="button" :class="['btn btn-light-secondary mr-auto']" @click="onClose">
          {{ $t('message.close') }}
        </button>
        <button type="submit" :class="['btn btn-primary', addClassDisabledOnSubmitted]" @click="onSubmit">
          <i class="fa fa-save mr-2"></i> {{ $t('message.save') }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script>
import _ from 'lodash'

import { mapGetters, mapMutations, mapActions } from 'vuex'

import formMixin from '~/mixins/form'

export default {
  name: 'RateConfigModal',
  components: {},
  mixins: [formMixin],
  props: {
    zone: {
      type: String,
      required: true
    },
    onClose: {
      type: Function,
      required: true
    },
  },
  data () {
    return {
      input: {
      }
    }
  },
  computed: {
    ...mapGetters('admin-lottery', [
      'categories',
      'lotteries',
      'zoneRates',
      'responseSuccess',
      'responseError'
    ]),
    zones () {
      const zones = {
        yeekee: this.yeekeeCategories,
        government: this.governmentCategories,
        stock: this.stockCategories,
      }

      return zones
    },
    governmentCategories () {
      const categories = this._.cloneDeep(this.categories)
      const governmentCategories = this._.filter(categories, (category) => this._.eq('government', category.type))

      return governmentCategories
    },
    stockCategories () {
      const categories = this._.cloneDeep(this.categories)
      const stockCategories = this._.filter(categories, (category) => this._.eq('stock', category.type))

      return stockCategories
    },
    yeekeeCategories () {
      const categories = this._.cloneDeep(this.categories)
      const yeekeeCategories = this._.filter(categories, (category) => this._.eq(this.zone, category.zone))

      return yeekeeCategories
    }
  },
  watch: {
    /**
     * Handle after created
     */
    'responseSuccess': {
      handler (response) {
        if (response.status === 'success') {
          this.onClose()
        }
      }
    },
    'responseError': {
      handler (response) {
        // console.log(`error:`, response)
        this.onClose()
      }
    },
  },
  created () {},
  mounted () {
    this.getZoneRate(this.zone)
    // this.setDefaultCategory()
  },
  methods: {
    ...mapMutations('admin-lottery', [
      'changeZoneRate'
    ]),
    ...mapActions('admin-lottery', [
      'getZoneRate',
      'updateZoneRate'
    ]),
    addFlagIconClass (slug) {
      return `fi fi-${this.slugToFlag(slug)}`
    },
    onChangeRate (slug, type, value) {
      value = parseInt(value)
      if(value < 0) {
        value = 0
      }

      if(this._.eq('three_top', type) && value > 1000) {
        value = 1000
      }
      if(this._.eq('two_under', type) && value > 100) {
        value = 100
      }

      const key = `${slug}.${type}`

      this.changeZoneRate({ key, value })
    },
    onSubmit: _.debounce(function () {
      this.submitting()

      const data = {
        zone: this.zone,
        rates: this.zoneRates
      }

      console.log(this.zoneRates)

      this.updateZoneRate(data)
    }, 1000, { leading: true }),
  },
}
</script>