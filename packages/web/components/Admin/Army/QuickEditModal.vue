<template>
  <Modal v-if="record.id" ref="antQuickEdit" :on-close="onClose" :size="'lg'" :escape-close="true">
    <template #title>
      <h5 class="modal-title">{{ _.get(record, 'first_name_en') }} {{ _.get(record, 'last_name_en') }}</h5>
    </template>
    <template #body>
      <ValidationObserver :ref="formRef" v-slot="{ handleSubmit }">
        <form @submit.prevent="handleSubmit(onSubmit)">
          <div class="modal-body">
            <div class="form-group row">
              <label class="col-form-label col-sm-4 col-md-3">
                <span>สถานะ {{ _.startCase(type) }}</span>
              </label>
              <div class="col-sm-8 col-md-6">
                <div class="btn-group w-100">
                  <button type="button" class="btn btn-sm" :class="[addStatusClass(0)]" @click="onClickStatus(0)">
                    <span class="">ปิด</span>
                  </button>
                  <button type="button" class="btn btn-sm" :class="[addStatusClass(1)]" @click="onClickStatus(1)">
                    <span class="">เปิดใช้งาน</span>
                  </button>
                  <button type="button" class="btn btn-sm" :class="[addStatusClass(2)]" @click="onClickStatus(2)">
                    <span class="">รอตรวจสอบ</span>
                  </button>
                  <button type="button" class="btn btn-sm" :class="[addStatusClass(3)]" @click="onClickStatus(3)">
                    <span class="">อุทธรณ์</span>
                  </button>
                  <button type="button" class="btn btn-sm" :class="[addStatusClass(4)]" @click="onClickStatus(4)">
                    <span class="">ระงับ</span>
                  </button>
                </div>

                <!-- <div class="col-sm-4 col-md-3 pt-2">
                  <div class="custom-control custom-radio custom-control-inline">
                    <input id="statusDefault" v-model="input.status" value="0" type="radio" name="statusDefault" class="custom-control-input">
                    <label class="custom-control-label" for="statusDefault">ปิด</label>
                  </div>
                  <div class="custom-control custom-radio custom-control-inline">
                    <input id="statusEnable" v-model="input.status" value="1" type="radio" name="statusEnable" class="custom-control-input">
                    <label class="custom-control-label" for="statusEnable">เปิดใช้งาน</label>
                  </div>
                  <div class="custom-control custom-radio custom-control-inline">
                    <input id="statusCheckpoint" v-model="input.status" value="2" type="radio" name="statusCheckpoint" class="custom-control-input">
                    <label class="custom-control-label" for="statusCheckpoint">รอตรวจสอบ</label>
                  </div>
                  <div class="custom-control custom-radio custom-control-inline">
                    <input id="statusAppeal" v-model="input.status" value="3" type="radio" name="statusAppeal" class="custom-control-input">
                    <label class="custom-control-label" for="statusAppeal">กำลังตรวจสอบ</label>
                  </div>
                  <div class="custom-control custom-radio custom-control-inline">
                    <input id="statusBan" v-model="input.status" value="4" type="radio" name="statusBan" class="custom-control-input">
                    <label class="custom-control-label" for="statusBan">ระงับ</label>
                  </div>
                </div> -->
                <!-- <div class="custom-control custom-switch" style="padding-top: 7px; padding-bottom: 7px;">
                  <input id="isEnable" v-model="input.status" type="checkbox" class="custom-control-input">
                  <label class="custom-control-label" for="isEnable"></label>
                </div> -->
              </div>
            </div>
            <!-- <TextInput 
              v-model="input.ref_id"
              type="text" 
              name="ref_id"
              :rules="`min:2|max:80`"
              :value="input.ref_id">
            </TextInput> -->
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

import { mapGetters, mapActions } from 'vuex'

import formMixin from '~/mixins/form'

export default {
  name: 'QuickEditModal',
  components: {},
  mixins: [formMixin],
  props: {
    record: {
      type: Object,
      required: true
    },
    type: {
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
      formRef: 'editAnt',
      input: {
        status: null,
        ref_id: null,
      }
    }
  },
  computed: {
    ...mapGetters('admin-army-ant', [
      'responseError',
      'responseSuccess'
    ]),
  },
  watch: {
    'record': {
      handler (data) {
        // this.setDefaultMovie()
      }
    },
    /**
     * Handle after edit
     */
    'responseSuccess': {
      handler (response) {
        if (response.status === 'success') {
          // const data = this._.get(response, 'record')
          console.log(response)
          // this.receiveUpdateCategory(data)

          setTimeout(() => {
            this.onClose()
          }, 100)
        }
      }
    },
    'responseError': {
      handler (response) {
        console.log(`error:`, response)
        this.onClose()
      }
    },
  },
	beforeDestroy () {
  },
  created () {},
  mounted () {
		this.refId = this.record.id
    this.setDefaultMovie()
  },
  methods: {
    ...mapActions('admin-army-ant', [
      'updateAntSocial'
		]),
    setDefaultMovie () {
      const record = _.cloneDeep(this.record)

      if(_.eq(this.type, 'google')) {
        this.input.status = parseInt(_.get(record, 'gmail_status') || 0)
        this.input.ref_id = _.get(record, 'gmail_id')
      }
      if(_.eq(this.type, 'facebook')) {
        this.input.status = parseInt(_.get(record, 'facebook_status') || 0)
        this.input.ref_id = _.get(record, 'facebook_id')
      }
      if(_.eq(this.type, 'instagram')) {
        this.input.status = parseInt(_.get(record, 'instagram_status') || 0)
        this.input.ref_id = _.get(record, 'instagram_id')
      }
      if(_.eq(this.type, 'tiktok')) {
        this.input.status = parseInt(_.get(record, 'tiktok_status') || 0)
        this.input.ref_id = _.get(record, 'tiktok_id')
      }
    },
    addStatusClass (value) {

      if(!this._.eq(this.input.status, value)) {
        return 'btn-light-secondary'
      }
      if(this._.eq(value, 1)) {
        return 'btn-success'
      } else if(this._.eq(value, 2)) {
        return 'btn-light-warning'
      } else if(this._.eq(value, 3)) {
        return 'btn-warning'
      } else if(this._.eq(value, 4)) {
        return 'btn-danger'
      } else {
        return 'btn-secondary'
      }
    },
    onClickStatus (value) {
      this.input.status = value
    },
    onSubmit: _.debounce(function () {
      this.submitting()

      const input = {
        id: this.refId
      }

      if(_.eq(this.type, 'google')) {
        input.gmail_status = this.input.status
        input.gmail_id = this.input.ref_id
      }
      if(_.eq(this.type, 'facebook')) {
        input.facebook_status = this.input.status
        input.facebook_id = this.input.ref_id
      }
      if(_.eq(this.type, 'instagram')) {
        input.instagram_status = this.input.status
        input.instagram_id = this.input.ref_id
      }
      if(_.eq(this.type, 'tiktok')) {
        input.tiktok_status = this.input.status
        input.tiktok_id = this.input.ref_id
      }

      this.updateAntSocial(input)
    }, 1000, { leading: true }),
    onReset () {
      this.setDefaultMovie()
    }
  },
}
</script>