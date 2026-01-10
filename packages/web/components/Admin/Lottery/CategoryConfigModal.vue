<template>
  <Modal ref="sourceImport" :on-close="onClose" :backdrop-close="true" :size="'lg'">
    <template #title>
      <h5 class="modal-title">
        <span class="">{{ $t(`lottery.slug.${category.slug}`) }}</span>
        <!-- <span class="font-weight-bold font-special text-dark">{{ source.name_en }}</span>
        <span v-if="source.name_th" class="font-weight-bold font-special text-dark"> - {{ source.name_th }}</span>
        <span v-if="source.year" class="font-weight-bold font-special text-dark">[{{ source.year }}]</span> -->
      </h5>
    </template>
    <template #body>
      <ValidationObserver :ref="formRef" v-slot="{ handleSubmit }">
        <form @submit.prevent="handleSubmit(onSubmit)">
          <div class="modal-body">
            <div class="form-group row">
              <label class="col-form-label col-sm-4 col-md-3">
                <span>เปิดใช้งาน</span>
              </label>
              <div class="col-sm-8 col-md-9 col-lg-7">
                <div class="custom-control custom-switch" style="padding-top: 7px; padding-bottom: 7px;">
                  <input id="isEnable" v-model="input.is_enable" type="checkbox" class="custom-control-input">
                  <label class="custom-control-label" for="isEnable"></label>
                </div>
              </div>
            </div>

            <div v-if="!isGovernment" class="form-group row">
              <label class="col-form-label col-sm-4 col-md-3">
                <span>วันเปิด</span>
              </label>
              <div class="col-sm-8 col-md-9 col-lg-7">
                <div class="btn-group w-100">
                  <button 
                    v-for="i in 7" :key="'available-day-' + i"
                    type="button"
                    :class="['btn btn-sm w-100', addClassAvilableDay(i)]" 
                    @click="onClickAvailableDay(i)"
                  >
                    <span class="d-none d-sm-inline">{{ isoDayOfWeek(i) }}</span>
                    <span class="d-sm-none">{{ isoDayOfWeek(i, 'dd') }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-group row">
              <label class="col-form-label col-sm-4 col-md-3">
                <span>เปิดรอบพิเศษ</span>
              </label>
              <div class="col-sm-8 col-md-9 col-lg-7">
                <div class="input-group w-100 mb-2">
                  <div class="input-group-prepend">
                    <span class="input-group-text"><i class="fa-light fa-calendar"></i></span>
                  </div>
                  <VueDatePicker 
                    v-model="specialDay" 
                    type="date" 
                    value-type="format" 
                    style="flex: 1;"
                  >
                  </VueDatePicker>
                </div>
                <ul class="list-group mb-2">
                  <li v-for="(day, index) in input.special_day" :key="`special-day-${index}`" class="list-group-item p-2">
                    <div class="d-flex align-items-center" style="height: 22px;">
                      <!-- <span class="font-family-numeral" style="width: 20px">{{ index + 1 }}.</span> -->
                      <span class="badge badge-light-success font-family-numeral font-weight-bold" style="margin-top: 2px;">{{ day }}</span>
                      <span class="ml-2">{{ $moment(day).format('วันddddที่ D MMM YYYY') }}</span>
                      <button 
                        type="button"
                        class="btn btn-sm btn-light-secondary py-0 ml-auto" 
                        @click="onRemoveSpecialDay(index)"
                      >
                        <i class="far fa-times"></i>
                      </button>
                    </div>
                  </li>
                  <li v-if="!_.size(input.special_day)" class="list-group-item p-2">
                    <div class="d-flex justify-content-center align-items-center" style="height: 22px;">
                      <span class="text-muted">ยังไม่มีข้อมูล</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div v-if="!isGovernment" class="form-group row">
              <label class="col-form-label col-sm-4 col-md-3">
                <span>วันหยุด</span>
              </label>
              <div class="col-sm-8 col-md-9 col-lg-7">
                <div class="input-group w-100 mb-2">
                  <div class="input-group-prepend">
                    <span class="input-group-text"><i class="fa-light fa-calendar"></i></span>
                  </div>
                  <VueDatePicker 
                    v-model="holiday" 
                    type="date" 
                    value-type="format" 
                    style="flex: 1;"
                  >
                  </VueDatePicker>
                </div>
                <ul class="list-group mb-2">
                  <li v-for="(day, index) in input.holiday" :key="`special-day-${index}`" class="list-group-item p-2">
                    <div class="d-flex align-items-center" style="height: 22px;">
                      <!-- <span class="font-family-numeral" style="width: 20px">{{ index + 1 }}.</span> -->
                      <span class="badge badge-light-warning font-family-numeral font-weight-bold" style="margin-top: 2px;">{{ day }}</span>
                      <span class="ml-2">{{ $moment(day).format('วันddddที่ D MMM YYYY') }}</span>
                      <button 
                        type="button"
                        class="btn btn-sm btn-light-secondary py-0 ml-auto" 
                        @click="onRemoveHoliday(index)"
                      >
                        <i class="far fa-times"></i>
                      </button>
                    </div>
                  </li>
                  <li v-if="!_.size(input.holiday)" class="list-group-item p-2">
                    <div class="d-flex justify-content-center align-items-center" style="height: 22px;">
                      <span class="text-muted">ยังไม่มีข้อมูล</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" :class="['btn btn-light-secondary mr-3', addClassDisabledOnSubmitted]" @click="onReset">
              {{ $t('message.reset') }}
            </button>
            <button type="submit" :class="['btn btn-primary', addClassDisabledOnSubmitted]">
              <i class="fa fa-save mr-2"></i> {{ $t('message.save') }}
            </button>
          </div>
        </form>
      </ValidationObserver>
    </template>
  </Modal>
</template>

<script>
import _ from 'lodash'

import { mapGetters, mapMutations, mapActions } from 'vuex'

import formMixin from '~/mixins/form'

export default {
  name: 'CategoryConfigModal',
  components: {},
  mixins: [formMixin],
  props: {
    category: {
      type: Object,
      required: true
    },
    onClose: {
      type: Function,
      required: true
    },
  },
  data () {
    return {
      formRef: 'editLotteryCategory',
      specialDay: null,
      holiday: null,
      input: {
        is_enable: null,
        available_day: [],
        special_day: [],
        holiday: [],
        // search: null,
        // year: null
      }
    }
  },
  computed: {
    ...mapGetters('admin-lottery', [
      'responseSuccess',
      'responseError'
    ]),
    isGovernment () {
      return this._.get(this.category, 'type') === 'government'
    },
  },
  watch: {
    /**
     * Handle after created
     */
    'responseSuccess': {
      handler (response) {
        if (response.status === 'success') {
          const data = this._.get(response, 'record')
          // console.log(response)
          this.receiveUpdateCategory(data)

          setTimeout(() => {
            this.onClose()
          }, 100)
        }
      }
    },
    'responseError': {
      handler (response) {
        // console.log(`error:`, response)
        this.onClose()
      }
    },
    'specialDay': {
      handler (value) {
        if(value) {
          this.onAddSpecialDay(value)
        }
      }
    },
    'holiday': {
      handler (value) {
        if(value) {
          this.onAddHoliday(value)
        }
      }
    }
  },
  created () {},
  mounted () {
    this.setDefaultCategory()
  },
  methods: {
    ...mapMutations('admin-lottery', [
      'receiveUpdateCategory'
    ]),
    ...mapActions('admin-lottery', [
      'updateCategory'
    ]),
    setDefaultCategory () {
      const category = _.cloneDeep(this.category)
      category.is_enable = !!category.is_enable
      category.available_day = category.available_day || []
      category.special_day = category.special_day || []
      category.holiday = category.holiday || []

      this.input = category
    },
    hasAvailableDay (value) {
			return this._.includes(this.input.available_day, value)
    },
    addClassAvilableDay (value) {
			return this.hasAvailableDay(value) ? 'btn-primary' : 'btn-light-secondary'
    },
    onClickAvailableDay (value) {
      const availableDays = this._.clone(this.input.available_day)

      if(this.hasAvailableDay(value)) {
        const index = _.indexOf(availableDays, value)
        availableDays.splice(index, 1)
      } else {
        availableDays.push(value)
        availableDays.sort()
      }

      this.input.available_day = availableDays
    },
    onAddSpecialDay (value) {
      const specialDays = this._.clone(this.input.special_day)

      if(!this._.includes(specialDays, value)) {
        specialDays.push(value)
        specialDays.sort()

        this.input.special_day = specialDays
      }
      this.specialDay = null
    },
    onRemoveSpecialDay (value) {
      const specialDays = this._.clone(this.input.special_day)
      specialDays.splice(value, 1)
      this.input.special_day = specialDays
    },
    onAddHoliday (value) {
      const holidays = this._.clone(this.input.holiday)

      if(!this._.includes(holidays, value)) {
        holidays.push(value)
        holidays.sort()

        this.input.holiday = holidays
      }
      this.holiday = null
    },
    onRemoveHoliday (value) {
      const holidays = this._.clone(this.input.holiday)
      holidays.splice(value, 1)
      this.input.holiday = holidays
    },
    onSubmit: _.debounce(function () {
      this.submitting()

      const input = this._.assign({}, this.input, {
      })

      input.is_enable = input.is_enable ? 1 : 0

      this.updateCategory(input)
    }, 1000, { leading: true }),
    onReset () {
      this.setDefaultCategory()
    }
  },
}
</script>