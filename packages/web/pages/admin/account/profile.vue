<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`account.profile`) }}</h3>
    </header>
    <div class="app__body">
    </div>
  </div>
</template>

<script>
// import _ from 'lodash'

// import { mapGetters, mapMutations, mapActions } from 'vuex'

import formMixin from '~/mixins/form'

export default {
  name: 'UserStaffView',
  components: {},
  mixins: [formMixin],
  layout: 'admin',
  props: {},
  data () {
    return {
      refId: null,
      formRef: 'editUser',
      input: {
        display_name: null,
        username: null,
        password: null
      },
      filters: {
        page: 1
      },
    }
  },
  computed: {
  },
  watch: {
    /**
     * Handle after created
     */
    // 'responseSuccess': {
    //   handler (response) {
    //     if (response.status === 'success') {
    //       setTimeout(() => {
    //         this.$router.push({ path: this.linkTo('/setting/user') })
    //       }, 100)
    //     }
    //   }
    // },
    // 'responseError': {
    //   handler (response) {
    //     console.log(`error:`, response)
    //   }
    // }
    /**
     * Add to input after record receive
     */
    'record': {
      handler (record) {
        this.input = this._.cloneDeep(record)
      }
    },
  },
  created () {},
  mounted () {
		// this.refId = this.$route.params.id
    // await this.getPermissions()
		// this.fetchRecord()
  },
  methods: {
    // onSubmit: _.debounce(function () {
    //   this.submitting()

    //   const input = this._.assign({}, this.input, {
    //     permissions: this.permissions
    //   })

    //   this.updateUser(input)
    // }, 1000, { leading: true }),
    // onReset () {
    //   this.setDefaultPermission()
    // }
  },
}
</script>