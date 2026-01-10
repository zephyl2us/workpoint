<template>
  <li class="nav-item">
    <button v-if="isDefaultTheme" class="nav-btn" @click="updateTheme('dark')">
      <i class="icon far fa-sun-bright"></i>
    </button>
    <button v-else class="nav-btn" @click="updateTheme('default')">
      <i class="icon far fa-moon"></i>
    </button>
  </li>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'TopbarTheme',
  components: {},
  mixins: [],
  data () {
    return {}
  },
  computed: {
    ...mapGetters('admin', [
      'theme',
    ]),
    isDefaultTheme () {
      return this._.eq(this.theme, 'default')
    }
  },
  methods: {
    ...mapMutations('admin', [
      'updateTheme'
    ]),
  }
}
</script>