<template>
  <main>
    <AppLogo></AppLogo>
    <div class="card w-100 p-5">
      <div class="text-center mb-4">
        <h2>Workpoint</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
      <ValidationObserver :ref="formRef" v-slot="{ handleSubmit }">
        <form @submit.prevent="handleSubmit(onSubmit)">
          <TextInput 
            v-model="input.username"
            type="text" 
            name="username"
            :rules="`required|alpha_dash|min:3|max:30`"
            :group-class="'form-group mb-0'"
            :label-class="'col-form-label'"
            :input-class="''"
            :value="input.username" >
          </TextInput>
          <TextInput 
            v-model="input.password"
            type="password" 
            name="password"
            :rules="`required|min:8|max:30`"
            :group-class="'form-group'"
            :label-class="'col-form-label'"
            :input-class="''"
            :value="input.password" >
          </TextInput>
          <!-- <div class="form-group">
            <label for="exampleInputEmail1">Email</label>
            <input v-model="data.username" type="text" class="form-control">
          </div>
          <div class="form-group">
            <label for="exampleInputPassword1">Password</label>
            <input v-model="data.password" type="password" class="form-control">
          </div> -->
          <!-- <div class="form-group">
            <label for="exampleInputPassword1">2FA</label>
            <input type="number" class="form-control">
          </div> -->
          <button type="submit" class="btn btn-primary w-100">Login</button>
        </form>
      </ValidationObserver>
    </div>
  </main>
</template>

<script>
import _ from 'lodash'

import { mapMutations } from 'vuex'

import formMixin from '~/mixins/form'

export default {
  name: 'AuthLogin',
  components: {},
  mixins: [formMixin],
  layout: 'auth',
  props: {},
  data () {
    return {
      formRef: 'authLogin',
      input: {
        username: null,
        password: null
      },
      // data: {
      //   username: null,
      //   password: null
      // }
    }
  },
  computed: {},
  created () {},
  mounted () {
    this.setAuthorized(true)
    // console.log(`this.$auth.loggedIn`, this.$auth.loggedIn)
    // if(this.$auth.loggedIn) {
      // this.$auth.logout()
    // }
  },
  methods: {
    ...mapMutations('user', [
      'setSessionToken',
      'setAuthorized'
    ]),
    onSubmit: _.debounce(async function () {
      // this.submitting()
      
      try {
        const response = await this.$auth.loginWith('local', { data: this.input })

        // console.log(response)

        const sessionToken = this._.get(response, 'data.session_token')

        console.log(sessionToken)

        await this.setSessionToken(sessionToken)

        // if(response) {
        //   await this.$auth.setUser(this.data)
        // }
      } catch (err) {
        console.log(err)
      }
    }, 1000, { leading: true }),
  },
}
</script>