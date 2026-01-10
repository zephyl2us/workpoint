<template>
  <div class="d-flex flex-row-reverse">
    <template v-if="isConfirming">
      <!-- eslint-disable vue/no-v-html -->
      <button 
        class="btn btn-secondary" 
        :class="[addButtonSizeClass()]" 
        :style="addMinWidthStyle()"
        @click="onClickCancel()"
        v-html="cancelHtml">
      </button>
      <button 
        class="btn btn-success mr-2" 
        :class="[addButtonSizeClass()]"
        :disabled="!canSubmit" 
        @click="onClickConfirm"
        v-html="confirmHtml">
      </button>
      <!--eslint-enable-->
    </template>
    <slot 
      v-else 
      name="button" 
      :on-click="onClickContinue"></slot>
  </div>
</template>

<script>
export default {
  name: 'ConfirmOrCancel',
  props: {
    size: {
      type: String,
      default: ''
    },
    minWidth: {
      type: Number,
      default: null
    },
    confirmHtml: {
      type: String,
      default: `ยืนยัน`
    },
    cancelHtml: {
      type: String,
      default: `<i class="fa-regular fa-xmark"></i>`
    },
    onConfirm: {
      type: Function,
      default: () => {},
      required: true,
    },
    canConfirm: {
      type: Boolean,
      default: true
    },
    confirmData: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      isConfirming: false,
      isSubmitting: false
    }
  },
  computed: {
    canSubmit () {
      return this.canConfirm && !this.isSubmitting
    }
  },
  methods: {
    addButtonSizeClass () {
      return this._.includes(['sm', 'lg'], this.size) ? `btn-${this.size}` : ''
    },
    addMinWidthStyle () {
			const style = {
				minWidth: `${this.minWidth}px`
			}

			return style
    },
    onClickContinue () {
      console.log('onClickContinue')
      this.isConfirming = true
    },
    onClickCancel () {
      this.isConfirming = false
    },
    async onClickConfirm () {
      if(!this.canSubmit) {
        return
      }
      // console.log(`onClickConfirm`)
      this.isSubmitting = true
      await this.onConfirm(this.confirmData)
      this.isSubmitting = false
    }
  }
}
</script>