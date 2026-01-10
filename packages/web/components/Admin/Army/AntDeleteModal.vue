<template>
  <Modal ref="antDelete" :on-close="onClose" :backdrop-close="false" :size="'sm'">
    <template #title>
      <h5 class="modal-title">
        <span class="">ลบน้องมด</span>
      </h5>
    </template>
      <template #body>
        <div class="modal-body">
          <div class="font-weight-bold font-special text-dark text-center">{{ _.get(record, 'first_name_en') }} {{ _.get(record, 'last_name_en') }}</div>
          <div class="text-center">{{ _.get(record, 'first_name') }} {{ _.get(record, 'last_name') }}</div>
          <div class="text-center">{{ _.get(record, 'email') }}</div>
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
          <button 
            type="button" 
            class="btn btn-danger" 
            style="width: 60px" 
            :disabled="isSubmitted" 
            @click="onSubmit()">
            <span class="label">ลบ</span>
          </button>
        </div>
      </template>
  </Modal>
</template>

<script>
import _ from 'lodash'

import { mapGetters, mapActions } from 'vuex'

import formMixin from '~/mixins/form'

export default {
  name: 'AntDeleteModal',
  components: {},
  mixins: [formMixin],
  props: {
    record: {
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
      input: {
      }
    }
  },
  computed: {
    ...mapGetters('admin-army-ant', [
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
    ...mapActions('admin-army-ant', [
      'deleteAnt'
    ]),
    onSubmit: _.debounce(function () {
      this.submitting()

      const input = this._.assign({}, this.input, {
      })

      this.deleteAnt(input)
    }, 1000, { leading: true }),
  },
}
</script>