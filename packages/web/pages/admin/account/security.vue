<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`nav.security`) }}</h3>
    </header>
    <div class="app__body">
      <div class="card">
        <ValidationObserver :ref="formRef" v-slot="{ handleSubmit }">
          <form @submit.prevent="handleSubmit(onSubmit)">
            <div class="card-body py-4">
              <h4 class="mb-4">เปลี่ยนรหัสผ่าน</h4>
							<TextInput 
                v-model="input.old_password"
                type="password" 
                name="old_password"
                :rules="`required|min:8|max:30`"
                :value="input.old_password" >
              </TextInput>
              <TextInput 
                v-model="input.password"
                type="password" 
                name="password"
                :rules="`required|min:8|max:30`"
                :value="input.password">
              </TextInput>
              <TextInput 
                v-model="input.password_confirmation"
                type="password" 
                name="password_confirmation"
                :rules="`required|confirmed:password`"
                :value="input.password_confirmation">
              </TextInput>
            </div>
            <div class="card-footer pt-0">
              <div class="form-group row">
                <div class="d-flex col-sm-8 offset-sm-4 col-md-6 offset-md-3">
                  <button type="submit" :class="['btn btn-primary', addClassDisabledOnSubmitted]">
                    <i class="fa fa-save mr-2"></i> {{ $t('message.change_password') }}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </ValidationObserver>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'

import { mapGetters, mapActions } from 'vuex'

import formMixin from '~/mixins/form'

export default {
  name: 'AccountSecurity',
  components: {},
  mixins: [formMixin],
  layout: 'admin',
  props: {},
  data () {
    return {
      refId: null,
      formRef: 'editPassword',
      input: {
        old_password: null,
        password: null,
        password_confirmation: null
      },
    }
  },
  computed: {
    ...mapGetters('admin-account', [
      'responseError',
      'responseSuccess'
    ]),
  },
  watch: {
    /**
     * Handle after created
     */
    'responseSuccess': {
      handler (response) {
        if (response.status === 'success') {
          this.input.old_password = null
          this.input.password = null
          this.input.password_confirmation = null

          $(`#inputOldPassword`).focus()

          this.resetFormError(this.$refs[this.formRef])
        }
      }
    },
    'responseError': {
      handler (response) {
        console.log(`error:`, response)
      }
    },
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
    $(`#inputOldPassword`).focus()
  },
  methods: {
    ...mapActions('admin-account', [
      'changePassword'
    ]),
    onSubmit: _.debounce(function () {
      this.submitting()

      const input = this._.assign({}, this.input, {})

      this.changePassword(input)
    }, 1000, { leading: true }),
  },
}
</script>