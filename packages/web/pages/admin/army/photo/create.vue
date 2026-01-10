<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`army.photo_create`) }}</h3>
      <div class="header-action">
      </div>
    </header>
    <div class="app__body">
      <div class="card">
        <ValidationObserver :ref="formRef" v-slot="{ handleSubmit }">
          <form @submit.prevent="handleSubmit(onSubmit)">
            <div class="card-body border-bottom py-4">
              <h4 class="mb-4">ข้อมูลรูปภาพ</h4>
							<TextInput 
                v-model="input.source_url"
                type="text" 
                name="source_url"
                :rules="``"
                :value="input.source_url"
                :prepen-html="`<i class='fa-regular fa-globe'></i>`">
              </TextInput>
							<ValidationProvider 
                v-slot="{ errors }"
                tag="div" 
                class="form-group row" 
                name="gender" 
                rules="required" >
                <label class="col-form-label col-sm-4 col-md-3">
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
								<span class="d-none">{{ errors[0] }}</span>
							</ValidationProvider>
              <!-- <div class="form-group row">
                <label class="col-form-label col-sm-4 col-md-3">
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
              </div> -->
							<ValidationProvider 
                v-slot="{ errors }"
                tag="div" 
                class="form-group row" 
                name="age_range" 
                rules="required" >
                <label class="col-form-label col-sm-4 col-md-3">
                  <span>อายุ</span>
                </label>
                <div class="col-sm-4 col-md-3">
                  <select 
                    v-model="input.age_range" 
                    class="custom-select" 
                    :class="{ 'is-invalid': _.has(errors, '0') }"
                    placeholder="เลือกช่วงอายุ">
                    <option :value="null"></option>
                    <option :value="2">20-29 ปี</option>
                    <option :value="3">30-39 ปี</option>
                    <option :value="4">40-49 ปี</option>
                    <option :value="5">50-59 ปี</option>
                    <option :value="6">60 ปีขึ้นไป</option>
                  </select>
								  <div class="d-none">{{ errors[0] }}</div>
                </div>
							</ValidationProvider>
            </div>

            <div class="card-body py-4">
              <div class="form-group row">
                <label class="col-form-label col-sm-4 col-md-3">
                  <span>ภาพ</span>
                </label>
                <div class="col-sm-8 col-md-6 pt-2">
                  <ImageManager
                    v-if="id"
                    :id="id"
                  ></ImageManager>
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

import formMixin from '~/mixins/form'

import ImageManager from '~/components/Admin/Army/ImageManager'

export default {
  name: 'ArmyPhotoCreate',
  components: {
    ImageManager
  },
  mixins: [formMixin],
  layout: 'admin',
  props: {},
  data () {
    return {
      formRef: 'createArmyPhoto',
      id: null,
      input: {
        source_url: null,
        gender: 'male',
        age_range: null,
      }
    }
  },
  computed: {
    ...mapGetters('admin-army-photo', [
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
            this.$router.push({ path: this.linkTo('/army/photo') })
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
    this.id = `temp_${this.$moment().valueOf()}`
  },
  methods: {
    ...mapActions('admin-army-photo', [
      'createPhoto'
    ]),

    onSubmit: _.debounce(function () {
      this.submitting()

      const input = this._.assign({}, this.input, {
        id: this.id
      })

      this.createPhoto(input)
    }, 1000, { leading: true }),
  },
}
</script>