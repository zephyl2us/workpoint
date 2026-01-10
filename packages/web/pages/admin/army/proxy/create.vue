<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`army.proxy_create`) }}</h3>
    </header>
    <div class="app__body">
      <div class="card">
        <ValidationObserver :ref="formRef" v-slot="{ handleSubmit }">
          <form @submit.prevent="handleSubmit(onSubmit)">
            <div class="card-body py-4">
              <h4 class="mb-4">ข้อมูลพร็อกซี่</h4>
							<TextInput 
                v-model="input.display_name"
                type="text"
                name="display_name"
                :rules="`required|min:2|max:30`" 
                :value="input.display_name" >
              </TextInput>
							<TextInput 
                v-model="input.username"
                type="text" 
                name="username"
                :rules="`required|alpha_dash|min:5|max:30`"
                :value="input.username" >
              </TextInput>
							<TextInput 
                v-model="input.password"
                type="password" 
                name="password"
                :rules="`required|min:8|max:30`"
                :value="input.password" >
              </TextInput>
            </div>
            <div class="card-footer pt-0">
              <div class="form-group row">
                <div class="d-flex col-sm-8 offset-sm-4 col-md-6 offset-md-3">
                  <button type="reset" :class="['btn btn-light-secondary mr-3', addClassDisabledOnSubmitted]">
                    {{ $t('message.reset') }}
                  </button>
                  <button type="submit" :class="['btn btn-primary', addClassDisabledOnSubmitted]">
                    <i class="fa fa-save mr-2"></i> {{ $t('message.create') }}
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
  name: 'ArmyProxyCreate',
  components: {},
  mixins: [formMixin],
  layout: 'admin',
  props: {},
  data () {
    return {
      formRef: 'createArmyProxy',
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
    ...mapGetters('admin-army-proxy', [
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
          setTimeout(() => {
            this.$router.push({ path: this.linkTo('/army/proxy') })
          }, 100)
        }
      }
    },
    // 'responseError': {
    //   handler (response) {
    //     console.log(`error:`, response)
    //   }
    // }
  },
  created () {},
  mounted () {
  },
  methods: {
    ...mapActions('admin-army-proxy', [
      'createProxy'
    ]),
    onSubmit: _.debounce(function () {
      this.submitting()

      const input = this._.assign({}, this.input, {
      })

      this.createProxy(input)
    }, 1000, { leading: true }),
  },
}
</script>