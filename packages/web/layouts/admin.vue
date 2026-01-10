<template>
  <div class="app">
    <Navbar></Navbar>
    <Topbar class="app__topbar"></Topbar>
    <Nuxt class="app__content" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import Navbar from '~/components/Admin/App/Navbar'
import Topbar from '~/components/Admin/App/Topbar'

export default {
  name: 'AdminLayout',
  components: {
    Navbar,
    Topbar
  },
  middleware: ['auth'],
  computed: {
    ...mapGetters('user', [
      'isAuthorized'
    ]),
    ...mapGetters('admin', [
      'isNavbarActive'
    ]),
  },
  watch: {
    isNavbarActive: {
      handler () {
        this.addBodyFixedClass()
      }
    },
    isAuthorized: {
      handler (value) {
        if(!value) {
          this.handleOnLogout()
        }
      },
      // immediate: true
    }
  },
  beforeMount () {
    // console.log(this.$auth.loggedIn)
    if(!this.$auth.loggedIn) {
      this.$auth.redirect('login', true)
    }
  },
  mounted () {
    this.fetchPermission()
    this.getCategories()
    this.getAddresses()
  },
  methods: {
    ...mapActions('user', [
      'fetchPermission'
    ]),
    ...mapActions('admin-lottery', [
      'getCategories'
    ]),
    ...mapActions('admin-army', [
      'getAddresses'
    ]),
    addBodyFixedClass () {
      if(this.isNavbarActive) {
        $('body').addClass('fixed')
      } else {
        $('body').removeClass('fixed')
      }

      if(this.isLotteryConfiguring) {
        $('body').addClass('config-fixed')
      } else {
        $('body').removeClass('config-fixed')
      }
    },
  },
}
</script>

<style lang="scss">
@import "@/assets/scss/admin.scss";
</style>
