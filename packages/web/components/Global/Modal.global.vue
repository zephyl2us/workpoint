<template>
  <div class="modal fade" :class="[addShowClass()]" :style="addDisplayBlockStyle()" @click.self="onClickBackdrop()" >
    <div class="modal-dialog" :class="[addSizeClass()]">
      <div class="modal-content">
        <div class="modal-header">
          <slot name="title"></slot>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="onClickClose()">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <slot name="body"></slot>
        <slot name="footer"></slot>
      </div>
    </div>
    <!-- <div v-if="escapeClose" :id="`${modalId}Keyup`"></div> -->
  </div>
</template>

<script>
export default {
  name: 'ModalDialog',
  props: {
    onClose: {
      type: Function,
      required: true
    },
    size: {
      type: String,
      default: null
    },
    backdropClose: {
      type: Boolean,
      default: false
    },
    escapeClose: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      modalId: null,
      isShow: false,
      displayBlock: true,
    }
  },
  computed: {
  },
  watch: {
    isShow: {
      handler (value) {
        const element = document.getElementById(this.modalId)
        if(value) {
          element.classList.add("show")
        } else {
          element.classList.remove("show")
        }
      }
    }
  },
  beforeDestroy () {
    document.body.classList.remove('modal-open')
    document.getElementById(this.modalId).remove()

    window.removeEventListener('keyup', this.onPressEscape)
  },
  mounted () {
    this.modalId = `Modal${this.$moment().unix()}`

    document.body.classList.add('modal-open')

    const backdropDiv = document.createElement('div')
    backdropDiv.id = this.modalId
    backdropDiv.classList = 'modal-backdrop fade'
    document.body.appendChild(backdropDiv)

    
    window.addEventListener('keyup', this.onPressEscape)
    
    setTimeout(() => {
      this.isShow = true
    }, 1)
  },
  ready () {
    console.log('ready')
  },
  methods: {
    addShowClass () {
      return this.isShow ? 'show' : ''
    },
    addSizeClass () {
      return this._.includes(['sm', 'lg', 'xl'], this.size) ? `modal-${this.size}` : ''
    },
    addDisplayBlockStyle () {
			const style = {
				display: `block`
			}
      return style
    },
    onPressEscape (e) {
        console.log(e)
      if(this.escapeClose) {
        if(e.key === 'Escape' || e.keyCode === 27) {
          console.log('escape')
          this.onClickClose()
        }
      }
    },
    onClickClose () {
      this.isShow = false
      setTimeout(() => {
        this.onClose()
      }, 150)
    },
    onClickBackdrop () {
      // console.log(`onClickBackdrop`)
      if(this.backdropClose) {
        this.onClickClose()
      }
    }
  }
}
</script>