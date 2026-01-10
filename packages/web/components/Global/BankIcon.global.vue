<template>
  <i :class="['bank', addBankSize(), addBankClass()]"></i>
</template>

<script>
export default {
  name: 'UserAvatar',
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: [String, Number],
      default: null,
    },
    light: {
      type: [String, Number, Boolean],
      default: false
    }
  },
  data () {
    return {}
  },
  computed: {
    isLight () {
      const light = this.light
      return this._.includes(['true', true, 1], light)
    }
  },
  methods: {
    addBankSize () {
      return this.size ? `bank-${this.size}` : ''
    },
    addBankClass () {
      let className = 'bank-'
      className += this.isLight ? 'light-' : ''

      return className + this.name
    }
  }
}
</script>