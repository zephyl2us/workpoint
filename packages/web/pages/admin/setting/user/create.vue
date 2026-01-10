<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`user.staff_create`) }}</h3>
    </header>
    <div class="app__body">
      <div class="card">
        <ValidationObserver :ref="formRef" v-slot="{ handleSubmit }">
          <form @submit.prevent="handleSubmit(onSubmit)">
            <div class="card-body border-bottom py-4">
              <h4 class="mb-4">ข้อมูลผู้ใช้งาน</h4>
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
            <div class="card-body">
              <h4 class="mb-4">สิทธิ์การใช้งาน</h4>
              <div 
                v-for="(nav, group) in permissions" 
                :key="`permission-${group}`" 
                class="form-group row mb-2">
                <label class="col-sm-4 col-md-3 col-form-label">{{ $t(`nav.${group}`) }}</label>
                <div class="col-sm-8 col-md-6">
                  <div 
                    v-for="(permissions, sub) in nav" 
                    :key="`permission-${group}-${sub}`">
                    <div readonly class="form-control-plaintext">{{ $t(`nav.${group}_${sub}`) }}</div>

                    <div class="row row-sm">
                      <div 
                        v-for="(permission, key) in permissions" 
                        :key="`permission-${group}-${sub}-${key}`" 
                        class="col-6 col-sm-4 col-md-3 mb-3">
                        <div class="custom-control custom-checkbox">
                          <input 
                            :id="`${group}-${sub}-${key}`" 
                            type="checkbox" 
                            class="custom-control-input"
                            :value="`${group}.${sub}.${key}`"
                            :checked="isPermissionChecked(`${group}.${sub}.${key}`)"
                            @change="onPermissionChange(`${group}.${sub}.${key}`)">
                          <label :for="`${group}-${sub}-${key}`" class="custom-control-label">{{ $t(`user.permissions.${key}`) }}</label>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
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

import { mapGetters, mapMutations, mapActions } from 'vuex'

import formMixin from '~/mixins/form'

export default {
  name: 'UserStaffCreate',
  components: {},
  mixins: [formMixin],
  layout: 'admin',
  props: {},
  data () {
    return {
      formRef: 'createUserStaff',
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
    ...mapGetters('admin-staff', [
      'permissions',
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
            this.$router.push({ path: this.linkTo('/setting/user') })
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
    this.getPermissions()
  },
  methods: {
    ...mapMutations('admin-staff', [
      'receivePermissions'
    ]),
    ...mapActions('admin-staff', [
      'getPermissions',
      'createUser'
    ]),
    isPermissionChecked (value) {
      return !!this._.get(this.permissions, value)
    },
    onPermissionChange (value) {
      const isChecked = this.isPermissionChecked(value)
      let permissions = this._.cloneDeep(this.permissions)

      const permission = !isChecked ? 1 : 0

      permissions = this._.set(permissions, value, permission)

      this.receivePermissions({ permissions })
    },
    onSubmit: _.debounce(function () {
      this.submitting()

      const input = this._.assign({}, this.input, {
        permissions: this.permissions
      })

      this.createUser(input)
    }, 1000, { leading: true }),
  },
}
</script>