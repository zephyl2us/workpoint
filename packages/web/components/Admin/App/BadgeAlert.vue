<template>
  <span 
    v-if="count"
    :class="['badge badge-count badge-pill', variant]">
    {{ count }}
  </span>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
export default {
  name: 'BadgeAlert',
  props: {
    name: {
      type: String,
      required: true
    },
    variant: {
      default: 'badge-danger',
      type: String
    }
  },
  data () {
    return {}
  },
  computed: {
    ...mapGetters('admin', [
      'countAlerts'
    ]),
    count () {
      // console.log(this.countAlerts)
      const key = this.name
      const count = _.get(this.countAlerts, key)
      return count || 0
    }
  },
  methods: {
  }
}
</script>