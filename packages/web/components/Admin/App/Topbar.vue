<template>
  <header class="app__topbar">
    <button class="btn btn-navbar-toggle d-lg-none" @click="toggleNavbar(true)">
      <i class="fa-light fa-bars"></i>
    </button>
    <ul class="topbar-nav ml-auto">
      <!-- <TopbarLanguage></TopbarLanguage> -->
      <!-- <TopbarVolumeControl></TopbarVolumeControl> -->
      <!-- <TopbarTheme></TopbarTheme> -->
      <!-- <TopbarNotification></TopbarNotification> -->
      <TopbarUser></TopbarUser>
    </ul>
  </header>
</template>

<script>
import { mapMutations } from 'vuex'

import TopbarLanguage from './TopbarLanguage'
import TopbarNotification from './TopbarNotification'
import TopbarUser from './TopbarUser'
import TopbarTheme from './TopbarTheme'
import TopbarVolumeControl from './TopbarVolumeControl'

export default {
  name: 'TopBar',
  components: {
    TopbarLanguage,
    TopbarNotification,
    TopbarUser,
    TopbarTheme,
    TopbarVolumeControl
  },
  data () {
    return {}
  },
  computed: {
  },
  methods: {
    ...mapMutations('admin', [
      'toggleNavbar'
    ]),
  }
}
</script>