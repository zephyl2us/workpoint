<template>
  <li class="nav-item">
    <button class="nav-btn" @click="toggleVolume()">
      <i v-if="isVolumeEnable" class="icon far fa-volume"></i>
      <i v-else class="icon far fa-volume-slash text-warning"></i>
    </button>
  </li>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'TopbarVolumeControl',
  components: {},
  mixins: [],
  data () {
    return {}
  },
  computed: {
    ...mapGetters('admin', [
      'isVolumeEnable',
    ])
  },
  methods: {
    ...mapMutations('admin', [
      'toggleVolume'
    ]),
  }
}
</script>