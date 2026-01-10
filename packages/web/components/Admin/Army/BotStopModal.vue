<template>
  <Modal ref="antDelete" :on-close="onClose" :backdrop-close="false" :size="'sm'">
    <template #title>
      <h5 class="modal-title">
        <span class="">เปิดระบบอัตโนมัติ</span>
      </h5>
    </template>
      <template #body>
        <div class="modal-body">
          <!-- <div class="font-weight-bold font-special text-dark text-center">{{ _.get(record, 'first_name_en') }} {{ _.get(record, 'last_name_en') }}</div>
          <div class="text-center">{{ _.get(record, 'first_name') }} {{ _.get(record, 'last_name') }}</div>
          <div class="text-center">{{ _.get(record, 'email') }}</div> -->
        </div>
      </template>
      <template #footer>
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary mr-auto" 
            @click="onClose">
            <span>ปิด</span>
          </button>
          <!-- <button 
            type="button" 
            class="btn btn-danger" 
            style="width: 60px" 
            :disabled="isSubmitted" 
            @click="onSubmit()">
            <span class="label">หยุดทันที</span>
          </button> -->
          <button 
            type="button" 
            class="btn btn-danger" 
            style="width: 60px" 
            :disabled="isSubmitted" 
            @click="onSubmit()">
            <span class="label">หยุด</span>
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
  name: 'BotStopModal',
  components: {},
  mixins: [formMixin],
  props: {
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
    ...mapGetters('admin-army-bot-monitor', [
      'responseSuccess',
      'responseError'
    ])
  },
  watch: {
    /**
     * Handle after created
     */
    'responseSuccess': {
      handler (response) {
        if (response.status === 'success') {
          this.updateConfigAutomation(false)

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
  },
  created () {},
  mounted () {
    this.input = this._.clone(this.record)
  },
  methods: {
    ...mapMutations('admin-army-bot-monitor', [
      'updateConfigAutomation'
    ]),
    ...mapActions('admin-army-bot-monitor', [
      'stopBot'
    ]),
    onSubmit: _.debounce(function () {
      this.submitting()

      const input = this._.assign({}, this.input, {
      })

      this.stopBot(input)
    }, 1000, { leading: true }),
  },
}
</script>