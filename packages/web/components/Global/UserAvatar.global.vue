<template>
  <div :class="['av', addAvatarSize()]">
    <i :class="['av-icon fas fa-user']"></i>
  </div>
</template>

<script>
export default {
  name: 'UserAvatar',
  props: {
    size: {
      type: [String, Number],
      default: null,
    },
  },
  data () {
    return {}
  },
  methods: {
    addAvatarSize () {
      return this.size ? `av-${this.size}` : ''
    },
  }
}
</script>