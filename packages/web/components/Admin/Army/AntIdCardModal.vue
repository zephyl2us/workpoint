<!-- eslint-disable vue/no-v-html -->
<template>
  <Modal ref="antIdCard" class="ant__idcard-modal" :on-close="onClose" :backdrop-close="false" :size="'xl'">
    <template #title>
      <h5 class="modal-title">
        <span class="">บัตรประชาชน</span>
      </h5>
    </template>
      <template #body>
        <div class="modal-body">
          <div id="idCard" ref="idCard" class="idcard-container mb-3">
            <div class="idcard-image">
              <img :src="backgroundUrl" class="idcard-backdrop">
              <div class="idcard-card" :class="[addClassIsSaving()]">
                <div class="idcard-line"></div>
                <div v-if="isProfileFilterEnable" class="idcard-filter" :style="addStyleProfileFilter"></div>

                <div class="idcard-profile" :style="{ 'background-position-y': addStyleProfileHeight }" for="profileImage">
                  <div class="profile-grid" :class="[addClassGridActive()]"></div>
                  <img 
                    :src="profileUrl" 
                    :style="{ 
                      'width': profileStyleWidth, 
                      'margin-top': profileStyleUpDown, 
                      'margin-left': profileStyleLeftRight,
                      'filter': profileStyleFilter
                    }">
                </div>

                <template v-if="isMockup">
                  <div class="idcard-default"></div>
                  <div class="national-id">{{ `3510306948419` | national() }}</div>
                  <div class="name-th">น.ส. นาถธรรม ศิริวรภัทร</div>
                  <div class="name-en text-blue">Miss Nattatham</div>
                  <div class="lastname-en text-blue">Siriworapat</div>
                  <div class="birthday-th">6 มี.ค. 2541</div>
                  <div class="birthday-en text-blue">6 Mar. 1998</div>
                  <div class="issue-th">5 ม.ค. 2566</div>
                  <div class="issue-en text-blue">5 Jan. 2023</div>
                  <div class="expiry-th">16 ก.ค. 2574</div>
                  <div class="expiry-en text-blue">16 Jul. 2031</div>
                  <div class="address">252/47 หมู่ที่ 10 ต.หนองปลาสะวาย อ.บ้านโฮ่ง จ.ลำพูน</div>
                  <div class="officer">(นายโกสิน สุคนธ์วัน)</div>
                  <div class="signature"></div>
                  <div class="card-no">{{ `10310501051005` | nationalUnderPicture() }}</div>
                </template>

                <template v-else>
                  <div class="national-id">{{ record.national_id | national() }}</div>
                  <div class="name-th">{{ title }} {{ record.first_name }} {{ record.last_name }}</div>
                  <div class="name-en text-blue">{{ titleEn }} {{ record.first_name_en }}</div>
                  <div class="lastname-en text-blue">{{ record.last_name_en }}</div>
                  <div class="birthday-th">{{ renderThDate(record.birthday) }}</div>
                  <div class="birthday-en text-blue">{{ renderEnDate(record.birthday) }}</div>
                  <div class="issue-th cursor-pointer" @click="renderIssueDate()">{{ renderThDate(input.issue_date) }}</div>
                  <div class="issue-en text-blue">{{ renderEnDate(input.issue_date) }}</div>
                  <div class="expiry-th cursor-pointer" @click="renderExpireDate()">{{ renderThDate(input.expire_date) }}</div>
                  <div class="expiry-en text-blue">{{ renderEnDate(input.expire_date) }}</div>
                  <div class="address cursor-pointer" @click="onClickDistrictNewLine()" v-html="address"></div>
                  <div class="officer cursor-pointer" @click="renderOfficer()">({{ _.get(officers, officer) }})</div>
                  <div 
                    class="signature cursor-pointer" 
                    :style="{ 'background-image': officerSignature }" 
                    @click="renderOfficer()">
                    <!-- <img :src="officerSignature"> -->
                  </div>
                  <div class="card-no">{{ input.card_no | nationalUnderPicture() }}</div>
                </template>

                <div class="religion text-blue">พุทธ</div>
                <div class="barcode">
                  <img :src="barcodeUrl">
                </div>
              </div>
            </div>
          </div>

          <div class="row">

            <div class="col-6">
              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text" style="width: 100px">ภาพพื้นหลัง</span>
                </div>
                <div class="custom-file">
                  <input id="backgroundImage" type="file" class="custom-file-input" @change="onUploadBackground">
                  <label class="custom-file-label" for="backgroundImage">เลือกไฟล์</label>
                </div>
              </div>
              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text" style="width: 100px">ภาพโปรไฟล์</span>
                </div>
                <div class="custom-file">
                  <input id="profileImage" type="file" class="custom-file-input" @change="onUploadProfile">
                  <label class="custom-file-label" for="profileImage">เลือกไฟล์</label>
                </div>
              </div>
              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text" style="width: 100px">ความสูง</span>
                </div>
                <input v-model="input.height" type="number" class="form-control" :min="minHeight" :max="maxHeight">
                <div class="input-group-append">
                  <button class="btn btn-secondary" type="button" @click="renderHeight">
                    <i class="fa-solid fa-arrows-rotate"></i>
                  </button>
                </div>
              </div>
              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text" style="width: 100px">รหัสใต้ภาพ</span>
                </div>
                <input v-model="input.card_no" type="number" class="form-control">
                <div class="input-group-append">
                  <button class="btn btn-secondary" type="button" @click="renderCardNo">
                    <i class="fa-solid fa-arrows-rotate"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="col-6">
              <div class="border rounded bg-light p-2">
                <div class="row">

                  <div class="col-12">
                    <div class="ant__form-range form-group row mb-2">
                      <label class="col-2 col-form-label">ขนาด</label>
                      <div class="col-10">
                        <input v-model="profile.zoom" type="range" class="custom-range" min="0" max="500">
                      </div>
                    </div>
                  </div>

                </div>
                <div class="row">

                  <div class="col-6">
                    <div class="ant__form-range form-group row mb-2">
                      <label class="col-4 col-form-label">ขึ้น-ลง</label>
                      <div class="col-8">
                        <input v-model="profile.up_down" type="range" class="custom-range" min="0" max="1000">
                      </div>
                    </div>
                  </div>

                  <div class="col-6">
                    <div class="ant__form-range form-group row mb-2">
                      <label class="col-4 col-form-label">ซ้าย-ขวา</label>
                      <div class="col-8">
                        <input v-model="profile.left_right" type="range" class="custom-range" min="0" max="1000">
                      </div>
                    </div>
                  </div>

                </div>
                <div class="row">

                  <div class="col-6">
                    <div class="ant__form-range form-group row mb-2">
                      <label class="col-4 col-form-label">Blur</label>
                      <div class="col-8">
                        <input v-model="profile.filter.blur" type="range" class="custom-range" min="0" max="100">
                      </div>
                    </div>
                  </div>

                  <div class="col-6">
                    <div class="ant__form-range form-group row mb-2">
                      <label class="col-4 col-form-label">Brightness</label>
                      <div class="col-8">
                        <input v-model="profile.filter.brightness" type="range" class="custom-range" min="0" max="200">
                      </div>
                    </div>
                  </div>

                  <div class="col-6">
                    <div class="ant__form-range form-group row mb-2">
                      <label class="col-4 col-form-label">Contrast</label>
                      <div class="col-8">
                        <input v-model="profile.filter.contrast" type="range" class="custom-range" min="0" max="2000">
                      </div>
                    </div>
                  </div>

                  <div class="col-6">
                    <div class="ant__form-range form-group row mb-2">
                      <label class="col-4 col-form-label">Saturate</label>
                      <div class="col-8">
                        <input v-model="profile.filter.saturate" type="range" class="custom-range" min="0" max="1000">
                      </div>
                    </div>
                  </div>

                </div>
                <div class="row">

                  <div class="col-6">
                    <div class="ant__form-range form-group row mb-2">
                      <label class="col-4 col-form-label">Filter</label>
                      <div class="col-8">
                        <div class="custom-control custom-switch">
                          <input id="switchFilter" v-model="cardFilter.enable" type="checkbox" class="custom-control-input">
                          <label class="custom-control-label" for="switchFilter"></label>
                        </div>
                        <i v-if="isProfileFilterEnable" class="fa-solid fa-arrows-rotate text-primary cursor-pointer" @click="renderCardFilter"></i>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      <VueBarcode 
        style="display: none"
        :value="record.national_id" 
        format="CODE39" 
        :display-value=false 
        background="transparent"
        :margin="0"
        element-tag="img"
        width="2"></VueBarcode>
      </template>
      <template #footer>
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary mr-auto" 
            @click="onClose">
            <span>ปิด</span>
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            style="width: 60px" 
            @click="saveElementAsImage()">
            <span class="label">บันทึก</span>
          </button>
        </div>
      </template>
  </Modal>
</template>

<script>
import _ from 'lodash'

import { mapGetters } from 'vuex'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'
// import screenshot from 'image-screenshot'

// import VueBarcode from 'vue-barcode'
import VueBarcode from '~/components/Custom/VueBarcode'

export default {
  name: 'AntIdCardModal',
  components: {
    VueBarcode
  },
  props: {
    record: {
      type: Object,
      required: true
    },
    onClose: {
      type: Function,
      required: true
    },
  },
  data () {
    return {
      isMockup: false,
      isSaving: false,
      maxHeight: 190,
      minHeight: 133,
      districtNewLine: false,
      backgroundSrc: null,
      backgroundUrl: '/assets/idcard/idcard-backdrop-default.png',
      profileSrc: null,
      profileUrl: null,
      barcodeUrl: null,
      input: {
        background: null,
        profile: null,
        height: null,
        card_no: null,
        expire_date: null,
        issue_date: null,
      },
      profile: {
        zoom: 0,
        up_down: 500,
        left_right: 500,
        blur: 0,
        brightness: 100,
        contrast: 1000,
        saturate: 1000,
        filter: {
          blur: 0,
          brightness: 100,
          contrast: 1000,
          saturate: 1000
        }
      },
      cardFilter: {
        enable: true,
        background: null,
        opacity: 0,
        top: 0,
        left: 0,
      },
      officer: null,
      officers: [
        'วชิรวิทย์ ผ่องรักษา',
        'สถิตคุณ ขาวโกศล',
        'ปริรม ธนเกียรติโกศล',
        'รัฐภาคย์ เจริญกาณต์',
        'วรนน ปรีดาศิริกุล',
        'พัฒน์ พัฒนปรีชา',
        'ชัชชน มงคลจิต',
      ]
    }
  },
  computed: {
    ...mapGetters('admin-army', [
      'addresses'
    ]),
    isMale () {
      return this._.get(this.record, 'gender') === 'male'
    },
    isFemale () {
      return this._.get(this.record, 'gender') === 'female'
    },
    province () {
      const provinceId = this._.get(this.record, 'province_id')
      const index = this._.findIndex(this.addresses, ['id', provinceId])

      const province = this._.get(this.addresses, `${index}`)

      return province
    },
    district () {
      const districts = this._.get(this.province, 'district')
      const districtId = this._.get(this.record, 'district_id')
      const index = this._.findIndex(districts, ['id', districtId])

      const district = this._.get(districts, `${index}`)

      return district
    },
    tambon () {
      const tambons = this._.get(this.district, 'tambon')
      const tambonId = this._.get(this.record, 'tambon_id')
      const index = this._.findIndex(tambons, ['id', tambonId])

      const tambon = this._.get(tambons, `${index}`)

      return tambon
    },
    address () {
      let address = this._.get(this.record, 'address')
      // const tambonId = this._.get(this.record, 'tambon_id')
      // const districtId = this._.get(this.record, 'district_id')
      // const provinceId = this._.get(this.record, 'province_id')

      address += ` ต.${this._.get(this.tambon, 'name')} `
      address += (this.districtNewLine ? '<br>' : '') + `อ.${this._.get(this.district, 'name')} `
      address += (!this.districtNewLine ? '<br>' : '') + `จ.${this._.get(this.province, 'name')}`

      return address
    },
    title () {
      if(this.isMale) {
        return 'นาย'
      } else if(this.isFemale) {
        return 'น.ส.'
      }
      return ''
    },
    titleEn () {
      if(this.isMale) {
        return 'Mr.'
      } else if(this.isFemale) {
        return 'Miss'
      }
      return ''
    },
    officerSignature () {
      return `url('/assets/idcard/officer-${this.officer}.png')`
    },
    addStyleProfileHeight () {
      const maxHeight = this.maxHeight
      const minHeight = this.minHeight
      const heightRange = (maxHeight - minHeight)

      const height = this.input.height

      const heightPercent = Math.abs(height - maxHeight) * (100 / heightRange)

      return `${heightPercent}%`
    },
    profileStyleWidth () {
      let width = 100
      const profileZoom = this.profile.zoom

      width += (profileZoom / 10)

      return `${width}%`
    },
    profileStyleUpDown () {
      let position = 0
      const profileUpDown = (this.profile.up_down - 500 )

      position += (profileUpDown / 10)

      return `${position}%`
    },
    profileStyleLeftRight () {
      let position = 0
      const profileLeftRight = (this.profile.left_right - 500 )

      position += (profileLeftRight / 10)

      return `${position}%`
    },
    profileStyleFilter () {
      // let filter = ''

      const profileBlur = this._.get(this.profile, 'blur')
      const profileBrightness = this._.get(this.profile, 'brightness')
      const profileContrast = this._.get(this.profile, 'contrast')
      const profileSaturate = this._.get(this.profile, 'saturate')

      const blur = `blur(${profileBlur / 100}px) `
      const brightness = `brightness(${profileBrightness / 100}) `
      const contrast = `contrast(${profileContrast / 10}%) `
      const saturate = `saturate(${profileSaturate / 10}%) `

      let filter = ''
      filter += blur
      filter += brightness
      filter += contrast
      filter += saturate

      // disabled filter
      filter = ''

      return filter
    },
    isProfileFilterEnable () {
      return !!this.cardFilter.enable
    },
    addStyleProfileFilter () {
      // if(this.isProfileFilterEnable) {
      //   return {}
      // }

      const filter = {
        backgroundImage: `url(/assets/idcard/idcard-filter-${this._.padStart(this.cardFilter.background, 2, '0')}.png)`,
        opacity: this.cardFilter.opacity,
        backgroundPositionX: `${this.cardFilter.left}%`,
        backgroundPositionY: `${this.cardFilter.top}%`
      }
      return filter
    }
  },
  watch: {
    'record.national_id': {
      handler (value) {
        setTimeout(() => {
          this.renderBarcode()
        }, 100)
      },
      immediate: true
    },
    'profile.filter': {
      handler (value) {
        this.onChangeProfileFilter()
      },
      deep: true
    },
    'cardFilter.enable': {
      handler (value) {
        if(value) {
          this.renderCardFilter()
        }
      },
      immediate: true
    }
  },
  created () {
    this.renderHeight()
    this.renderCardNo()
    this.renderExpireDate()
    this.renderOfficer()
  },
  mounted () {
  },
  methods: {
    renderBase64 (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result)
        reader.onerror = (error) => reject(error)
      })
    },
    // renderBase64(file, attr) {
    //   const reader = new FileReader()
    //   reader.readAsDataURL(file);
    //   reader.onload = function () {
    //     console.log(reader.result)
    //     attr = reader.result
    //   }
    //   reader.onerror = function (error) {
    //     console.log('Error: ', error)
    //   }
    // },
    renderBarcode () {
      const imageSrc = $('.vue-barcode-element').attr('src')

      this.rotateImage(imageSrc, 90, (rotatedImage) => {
        // console.log(rotatedImage)
        this.barcodeUrl = rotatedImage
      })
    },
    rotateImage (base64Image, degrees, callback) {
      const img = new Image();
      img.src = base64Image;
      img.onload = function () {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.height
        canvas.height = img.width
        
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(degrees * Math.PI / 180)
        ctx.drawImage(img, -img.width / 2, -img.height / 2)
        // ctx.restore()
      
        const rotatedBase64 = canvas.toDataURL('image/png')
        callback(rotatedBase64);
      }
    },
    addClassGridActive () {
      return this.isSaving ? '' : 'active'
    },
    addClassIsSaving () {
      return this.isSaving ? 'is-saving' : ''
    },
    renderThDate (value) {
      return `${this.$moment(value).format('D MMM')} ${(parseInt(this.$moment(value).format('YYYY')) + 543)}`
    },
    renderEnDate (value) {
      return this.$moment(value).locale('en').format('D MMM. YYYY')
    },
    renderHeight () {
      const maleMaxHeight = 182
      const maleMinHeight = 167
      const femaleMaxHeight = 170
      const femaleMinHeight = 150

      let maxHeight = null
      let minHeight = null

      if(this._.get(this.record, 'gender') === 'male') {
        maxHeight = maleMaxHeight
        minHeight = maleMinHeight
      } else if(this._.get(this.record, 'gender') === 'female') {
        maxHeight = femaleMaxHeight
        minHeight = femaleMinHeight
      } else {
        maxHeight = maleMaxHeight
        minHeight = femaleMinHeight
      }

      const height = this._.random(minHeight, maxHeight)

      this.input.height = height
    },
    renderCardNo () {
      const first = this._.random(1001, 1049) + ''
      const second = this._.random(2, 4) + ''
      const third = this._.random(1118465, 9643842) + ''

      const no = first + this._.padStart(second, 2, '0') + this._.padStart(third, 8, '0')

      this.input.card_no = no
    },
    renderExpireDate () {
      const addYear = this._.random(0, 5)
      const birthday = this._.get(this.record, 'birthday')
      const nextBirthday = this.$moment().add(1, 'year').format('YYYY') + '-' + this.$moment(birthday).add(addYear, 'years').format('MM-DD')
      const expireDate = this.$moment(nextBirthday).add(addYear, 'years').format('YYYY-MM-DD')

      this.input.expire_date = expireDate
      this.renderIssueDate()
    },
    renderIssueDate () {
      const expireDate = this._.get(this.input, 'expire_date')
      const addDay = this._.random(30,180)
      const issueDate = this.$moment(expireDate).subtract(9, 'years').add(addDay, 'days').format('YYYY-MM-DD')

      this.input.issue_date = issueDate
    },
    renderOfficer () {
      const officerIndex = this._.random(0, (this._.size(this.officers) - 1))

      this.officer = officerIndex
    },
    renderCardFilter () {
      const background = this._.random(1, 5)
      const opacity = (this._.random(10, 30) / 100)

      this.cardFilter.background = background
      this.cardFilter.opacity = opacity
      this.cardFilter.top = this._.random(0, 100)
      this.cardFilter.left = this._.random(0, 100)
    },
    onClickDistrictNewLine () {
      this.districtNewLine = !this.districtNewLine
    },

    // saveElementAsImage () {

    //   const img = document.getElementById('idCard')

    //   screenshot(img).download()
    // }
    
    async onUploadBackground (e) {
      const files = e.target.files || e.dataTransfer.files
      if (!files.length)
        return

      const file = files[0]
      this.input.backgorund = file

      // const imageUrl = URL.createObjectURL(file)
      const imageSrc = await this.renderBase64(file)

      this.backgroundSrc = imageSrc
      this.backgroundUrl = imageSrc
    },
    async onUploadProfile (e) {
      const files = e.target.files || e.dataTransfer.files
      if (!files.length)
        return

      const file = files[0]
      this.input.profile = file

      this.profile.filter = {
        blur: 0,
        brightness: 100,
        contrast: 1000,
        saturate: 1000
      }
      
      // const imageUrl = URL.createObjectURL(file)
      const imageSrc = await this.renderBase64(file)

      this.profileSrc = imageSrc
      this.profileUrl = imageSrc
    },

    onChangeProfileFilter: _.throttle(function () {
      if(_.isNull(this.profileSrc)) {
        return
      }
      // console.log(this.profile.filter)

      const profileBlur = this._.get(this.profile, 'filter.blur')
      const profileBrightness = this._.get(this.profile, 'filter.brightness')
      const profileContrast = this._.get(this.profile, 'filter.contrast')
      const profileSaturate = this._.get(this.profile, 'filter.saturate')

      const blur = `blur(${profileBlur / 10}px) `
      const brightness = `brightness(${profileBrightness}%) `
      const contrast = `contrast(${profileContrast / 10}%) `
      const saturate = `saturate(${profileSaturate / 10}%) `

      let filter = ''
      filter += blur
      filter += brightness
      filter += contrast
      filter += saturate

      const imageSrc = _.clone(this.profileSrc)

      this.filterImage(imageSrc, filter, (filteredImage) => {
        // console.log(`filteredImage`, filteredImage)
        this.profileUrl = filteredImage
      })
    }, 100, { leading: false }),

    filterImage (base64Image, filter, callback) {
      const img = new Image();
      img.src = base64Image;
      img.onload = function () {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        // console.log(filter)

        // ctx.filter = "blur(5px) brightness(150%) contrast(150%)"
        ctx.filter = filter
        ctx.drawImage(img, 0, 0)
      
        const filteredBase64 = canvas.toDataURL('image/png')
        callback(filteredBase64)
      }
    },

    async saveElementAsImage() {
      this.isSaving = true

      await setTimeout(async () => {
        const element = this.$refs.idCard

        const id = this.record.id
        const firstName = this._.lowerCase(this.record.first_name_en)
        const lastName = this._.lowerCase(this.record.last_name_en)
        const fileName = `${id}_${firstName}_${lastName}.jpg`

        try {
          const canvas = await html2canvas(element)
          const imageBlob = canvas.toDataURL('image/jpg')
          console.log(imageBlob)

          saveAs(imageBlob, fileName)
          this.isSaving = false
        } catch (error) {
          console.error('An error occurred:', error)
          this.isSaving = false
        }
      }, 20)
    }
  },
}
</script>