<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`army.ant_create`) }}</h3>
      <div class="header-action">
        <button class="btn btn-primary" @click="onRandomAnt">
          <span>สุ่มข้อมูล</span>
        </button>
      </div>
    </header>
    <div class="app__body">
      <div class="card">
        <ValidationObserver :ref="formRef" v-slot="{ handleSubmit }">
          <form @submit.prevent="handleSubmit(onSubmit)">
            <div class="card-body border-bottom py-4">
              <h4 class="mb-4">ข้อมูลน้องมด</h4>
							<TextInput 
                v-model="input.national_id"
                type="text" 
                name="national_id"
                :rules="`required|min:5|max:30`"
                :value="input.national_id"
                :input-class="'col-sm-4 col-md-3'"
                :clipboard="true">
              </TextInput>
              <div class="form-group row">
                <label for="email" class="col-form-label col-sm-4 col-md-3">
                  <span>ชื่อเล่น</span>
                </label>
                <FormInput 
                  v-model="input.nickname"
                  type="text" 
                  name="nickname"
                  :rules="`min:2|max:20`"
                  :value="input.nickname"
                  :input-class="'col-sm-4 col-md-3'">
                </FormInput>
              </div>
              <div class="form-group row">
                <label for="email" class="col-form-label col-sm-4 col-md-3">
                  <span>ชื่อ-นามสกุล</span>
                </label>
                <FormInput 
                  v-model="input.first_name"
                  type="text" 
                  name="first_name"
                  :rules="`required|min:2|max:30`"
                  :value="input.first_name"
                  :input-class="'col-sm-4 col-md-3 mb-2 mb-sm-0'"
                  :clipboard="true">
                </FormInput>
                <FormInput 
                  v-model="input.last_name"
                  type="text" 
                  name="last_name"
                  :rules="`required|min:2|max:30`"
                  :value="input.last_name"
                  :input-class="'col-sm-4 col-md-3'"
                  :clipboard="true">
                </FormInput>
              </div>
              <div class="form-group row">
                <label for="email" class="col-form-label col-sm-4 col-md-3">
                  <span>ชื่อเล่น (อังกฤษ)</span>
                </label>
                <FormInput 
                  v-model="input.nickname_en"
                  type="text" 
                  name="nickname_en"
                  :rules="`min:2|max:20`"
                  :value="input.nickname_en"
                  :input-class="'col-sm-4 col-md-3'">
                </FormInput>
              </div>
              <div class="form-group row">
                <label for="email" class="col-form-label col-sm-4 col-md-3">
                  <span>ชื่อ-นามสกุล (อังกฤษ)</span>
                </label>
                <FormInput 
                  v-model="input.first_name_en"
                  type="text" 
                  name="first_name_en"
                  :rules="`required|min:2|max:30`"
                  :value="input.first_name_en"
                  :input-class="'col-sm-4 col-md-3 mb-2 mb-sm-0'"
                  :clipboard="true">
                </FormInput>
                <FormInput 
                  v-model="input.last_name_en"
                  type="text" 
                  name="last_name_en"
                  :rules="`required|min:2|max:30`"
                  :value="input.last_name_en"
                  :input-class="'col-sm-4 col-md-3'"
                  :clipboard="true">
                </FormInput>
              </div>
              <div class="form-group row">
                <label for="email" class="col-form-label col-sm-4 col-md-3">
                  <span>เพศ</span>
                </label>
                <div class="col-sm-4 col-md-3 pt-2">
                  <div class="custom-control custom-radio custom-control-inline">
                    <input id="genderMale" v-model="input.gender" value="male" type="radio" name="genderMale" class="custom-control-input">
                    <label class="custom-control-label" for="genderMale">ชาย</label>
                  </div>
                  <div class="custom-control custom-radio custom-control-inline">
                    <input id="genderFemale" v-model="input.gender" value="female" type="radio" name="genderFemale" class="custom-control-input">
                    <label class="custom-control-label" for="genderFemale">หญิง</label>
                  </div>
                  <div class="custom-control custom-radio custom-control-inline">
                    <input id="genderOther" v-model="input.gender" value="other" type="radio" name="genderOther" class="custom-control-input">
                    <label class="custom-control-label" for="genderOther">ไม่ระบุ</label>
                  </div>
                </div>
              </div>
              <div class="form-group row">
                <label for="email" class="col-form-label col-sm-4 col-md-3">
                  <span>วันเกิด</span>
                </label>
                <div class="col-sm-4 col-md-3">
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text"><i class="fa-light fa-calendar"></i></span>
                    </div>
                    <VueDatePicker v-model="input.birthday" type="date" value-type="format" style="flex: 1;"></VueDatePicker>
                  </div>
                </div>
              </div>
            </div>

            <div class="card-body border-bottom py-4">
							<TextInput 
                v-model="input.address"
                type="text" 
                name="address"
                :rules="`required|min:5|max:30`"
                :value="input.address" >
              </TextInput>
              <div class="form-group row">
                <label for="" class="col-form-label col-sm-4 col-md-3">
                  <span>จังหวัด</span>
                </label>
                <div class="col-sm-4 col-md-3">
                  <select v-model="input.province_id" class="custom-select">
                    <option value=""></option>
                    <option 
                      v-for="province in addresses" 
                      :key="`province-${province.id}`"
                      :value="province.id">{{ province.name }}</option>
                  </select>
                </div>
              </div>
              <div v-if="districts" class="form-group row">
                <label for="" class="col-form-label col-sm-4 col-md-3">
                  <span>อำเภอ/เขต</span>
                </label>
                <div class="col-sm-4 col-md-3">
                  <select v-model="input.district_id" class="custom-select">
                    <!-- <option value=""></option> -->
                    <option 
                      v-for="district in districts" 
                      :key="`district-${district.id}`"
                      :value="district.id">{{ district.name }}</option>
                  </select>
                </div>
              </div>
              <div v-if="tambons" class="form-group row">
                <label for="" class="col-form-label col-sm-4 col-md-3">
                  <span>ตำบล/แขวง</span>
                </label>
                <div class="col-sm-4 col-md-3">
                  <select v-model="input.tambon_id" class="custom-select">
                    <!-- <option value=""></option> -->
                    <option 
                      v-for="tambon in tambons" 
                      :key="`tambon-${tambon.id}`"
                      :value="tambon.id">{{ tambon.name }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="card-body border-bottom py-4">
							<TextInput 
                v-model="input.email"
                type="email" 
                name="email"
                :rules="`required|email|min:5|max:50`"
                :value="input.email"
                :clipboard="true">
              </TextInput>
              <div class="form-group row">
                <label class="col-form-label col-sm-4 col-md-3"></label>
                <div class="col-sm-8 col-md-6">
                  <div class="input-group">
                    <input type="text" class="form-control bg-light" readonly :value="email_name">
                    <div class="input-group-append">
                      <span class="input-group-text bg-light" style="min-width: 110px">{{ email_domain }}</span>
                      <button v-clipboard="email_name" type="button" class="btn btn-light-secondary">
                        <i class="fa-light fa-copy"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
							<TextInput 
                v-model="input.phone"
                type="text" 
                name="phone"
                :rules="`min:5|max:30`"
                :value="input.phone"
                :input-class="'col-sm-4 col-md-3'">
              </TextInput>
              <!-- <div class="form-group row">
                <label for="email" class="col-form-label col-sm-4 col-md-3">
                  <span>รหัสอ้างอิง AdsPower</span>
                </label>
                <FormInput 
                  v-model="input.ref_id"
                  type="text" 
                  name="ref_id"
                  :rules="`min:7|max:7`"
                  :value="input.ref_id"
                  :input-class="'col-sm-4 col-md-3 mb-2 mb-sm-0'">
                </FormInput>
              </div> -->
            </div>
            <div class="card-body border-bottom py-4">
							<AntPasswordInput 
                v-model="password.google"
                type="password" 
                name="google"
                :rules="`min:8|max:30`"
                :value="password.google" >
              </AntPasswordInput>
							<!-- <AntPasswordInput 
                v-model="password.facebook"
                type="password" 
                name="facebook"
                :rules="`min:8|max:30`"
                :value="password.facebook" >
              </AntPasswordInput>
							<AntPasswordInput 
                v-model="password.instagram"
                type="password" 
                name="instagram"
                :rules="`min:8|max:30`"
                :value="password.instagram" >
              </AntPasswordInput>
							<AntPasswordInput 
                v-model="password.tiktok"
                type="password" 
                name="tiktok"
                :rules="`min:8|max:30`"
                :value="password.tiktok" >
              </AntPasswordInput>
							<AntPasswordInput 
                v-model="password.line"
                type="password" 
                name="line"
                :rules="`min:8|max:30`"
                :value="password.line" >
              </AntPasswordInput> -->
            </div>

            <div class="card-body py-4">
              <h4 class="mb-4">AdsPower</h4>
              <div class="form-group row">
                <label for="" class="col-form-label col-sm-4 col-md-3">
                  <span>กลุ่ม</span>
                </label>
                <div class="col-sm-4 col-md-3">
                  <div class="btn-group">
                    <button 
                      v-for="group in groups"
                      :key="`group-${group.id}`"
                      type="button" 
                      class="btn btn-sm px-3" 
                      :class="[addClassGroup(group.id)]" 
                      @click="onClickGroupButton(group.id)">
                      <span class="">{{ group.name }}</span>
                    </button>
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
                  <button 
                    type="submit" 
								    :disabled="isSubmitted"
                    :class="['btn btn-primary', addClassDisabledOnSubmitted]">
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

import armyAntMixin from '~/mixins/army-ant'
import formMixin from '~/mixins/form'

import AntPasswordInput from '~/components/Admin/Army/AntPasswordInput'

export default {
  name: 'ArmyAntCreate',
  components: {
    AntPasswordInput
  },
  mixins: [armyAntMixin, formMixin],
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.prevRoute = from.fullPath
    })
  },
  layout: 'admin',
  props: {},
  data () {
    return {
      formRef: 'createArmyAnt',
      prevRoute: null,
      input: {
        group_id: '0'
      },
      password: {
        google: null
      },
      groups: [
        {
          id: '0',
          name: 'ไม่มีกลุ่ม'
        },
        {
          id: '3347124',
          name: 'EMP'
        },
        {
          id: '3347125',
          name: 'NBC'
        },
        {
          id: '3347126',
          name: 'TMB'
        }
      ]
    }
  },
  computed: {
    ...mapGetters('admin-army-ant', [
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
            this.$router.go(-1)
            // this.$router.push({ path: this.prevRoute })
            // this.$router.push({ path: this.linkTo('/army/ant') })
          }, 100)
        }
      }
    },
    // 'responseError': {
    //   handler (response) {
    //     console.log(`error:`, response)
    //   }
    // }

    'input.province_id': {
      handler (value) {
        if(!value) {
          this.input.district_id = null
          this.input.tambon_id = null
        }
      }
    },
    'input.district_id': {
      handler (value) {
        if(!value) {
          this.input.tambon_id = null
        }
      }
    },
  },
  created () {},
  mounted () {
    const password = this.randomString(20, {
      symbol: true
    })

    this.password.google = password
  },
  methods: {
    ...mapActions('admin-army-ant', [
      'createAnt'
    ]),

    addClassGroup (value) {
      return this._.eq(this.input.group_id, value) ? 'btn-primary' : 'btn-light-secondary'
    },
    onClickGroupButton (value) {
      this.input.group_id = value
    },

    onSubmit: _.debounce(function () {
      this.submitting()

      const input = this._.assign({}, this.input, {
        password: this.password
      })

      this.createAnt(input)
    }, 1000, { leading: true }),
  },
}
</script>