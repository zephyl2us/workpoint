'use strict'

import _ from 'lodash'

import { mapGetters, mapActions } from 'vuex'

export default {
  data () {
    return {
      email_name: null,
      email_domain: null,
      input: {
        ref_id: null,
        email: null,
        national_id: null,
        nickname: null,
        first_name: null,
        last_name: null,
        nickname_en: null,
        first_name_en: null,
        last_name_en: null,
        gender: null,
        birthday: null,
        phone: null,
        address: null,
        tambon_id: null,
        district_id: null,
        province_id: null,
        profile_path: null,
        // ref_id: '',
        // email: 'test@test.com',
        // national_id: '',
        // nickname: null,
        // first_name: 'ชื่อ',
        // last_name: 'นามสกุล',
        // nickname_en: null,
        // first_name_en: 'Firstname',
        // last_name_en: 'Lastname',
        // gender: 'male',
        // birthday: '1980-01-01',
        // phone: '66888888888',
        // address: null,
        // tambon_id: null,
        // district_id: null,
        // province_id: null,
        // profile_path: null,
      },
      password: {
        google: null,
        facebook: null,
        instagram: null,
        tiktok: null,
        line: null
      },
    }
  },
  computed: {
    ...mapGetters('admin-army', [
      'addresses',
    ]),
    ...mapGetters('admin-army-ant', [
      'generateAnt'
    ]),
    districts () {
      const provinceId = this._.get(this.input, 'province_id')
      const districts = this.districtByProvinceId(provinceId)
      return districts
    },
    tambons () {
      const districtId = this._.get(this.input, 'district_id')
      const tambons = this.tambonByDistrictId(districtId)
      return tambons
    }
  },
  watch: {
    'generateAnt': {
      handler (ant) {

        const gender = this._.get(ant, 'gender')
        this.input.gender = this._.includes(['male', 'female'], gender) ? gender : 'other'

        const firstNameEn = this._.get(ant, 'first_name.en')
        const lastNameEn = this._.get(ant, 'last_name.en')

        this.input.first_name = this._.get(ant, 'first_name.th')
        this.input.last_name = this._.get(ant, 'last_name.th')
        this.input.nickname = this._.get(ant, 'nick_name.th')
        this.input.first_name_en = firstNameEn
        this.input.last_name_en = lastNameEn
        this.input.nickname_en = this._.get(ant, 'nick_name.en')

        // const firstString = this._.first(this._.split(firstNameEn, ''))
        // const email = this._.toLower(`${firstString}.${lastNameEn}@gmail.com`)
        const lastBirthYear = this.$moment(this.input.birthday).format('YY')
        const email = this._.toLower(`${firstNameEn}.${lastNameEn}${lastBirthYear}`)

        this.input.email = `${email}@gmail.com`
      },
      deep: true
    },

    'input.email': {
      handler (value) {
        const emailSplit = this._.split(value, '@')
        const emailName = this._.get(emailSplit, 0, '')
        const emailDomain = '@' + this._.get(emailSplit, 1, '')

        this.email_name = emailName
        this.email_domain = emailDomain
      }
    },

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
  methods: {
    ...mapActions('admin-army-ant', [
      'getGenerateAnt'
    ]),
    onRandomAnt: _.debounce(function () {
      this.getGenerateAnt()

      // const gender = this._.sample(['male', 'female'])
      // this.input.gender = gender

      const startBirthday = '1973-01-01'
      const endBirthday = this.$moment().subtract(20, 'years').format('YYYY-MM-DD')
      const startBirthdayUnix = this.$moment(startBirthday).unix()
      const endBirthdayUnix = this.$moment(endBirthday).unix()
      const birthdayUnix = this._.random(startBirthdayUnix, endBirthdayUnix)
      const birthday = this.$moment(birthdayUnix * 1000).format('YYYY-MM-DD')

      this.input.birthday = birthday

      this.randomAntAddress()
      this.randomNationalId()
    }, 200, { leading: true }),

    randomAntAddress () {
      // Address
      const province = this._.sample(this.addresses)
      // const province = this._.get(this.addresses, 1)
      const provinceId = this._.get(province, 'id')

      const districts = this._.get(province, 'district')
      const district = this._.sample(districts)
      const districtId = this._.get(district, 'id')

      const tambons = this._.get(district, 'tambon')
      const tambon = this._.sample(tambons)
      const tambonId = this._.get(tambon, 'id')

      this.input.province_id = provinceId
      this.input.district_id = districtId
      this.input.tambon_id = tambonId

      let address = ''
      if(provinceId === 10) {
        address = ''
      } else {
        if(this._.random(1, 10) === 1) {
          address += this._.random(100, 300)
        } else {
          address += `${this._.random(10, 500)}/${this._.random(1, 99)}`
        }

        const moo = this._.random(1, 10)
        address += ` หมู่ที่ ${moo}`
      }

      this.input.address = address
    },

    randomNationalId () {
      const birthday = this.input.birthday
      const provinceId = this.input.province_id
      const districtId = this.input.district_id
      const tambonId = this.input.tambon_id

      // console.log(birthday)
      // console.log(provinceId)
      // console.log(districtId)
      // console.log(tambonId)

      if(!this.$moment(birthday).isValid() || !provinceId || !districtId || !tambonId) {
        // console.log('false')
        return false
      }

      // ประเภทที่ 1 ได้แก่ คนที่เกิดและมีสัญชาติ ไทย ได้แจ้งเกิดภายในกำหนดเวลาตั้งแต่1 มกราคม 2527)
      // ประเภทที่ 3 ได้แก่คนไทยและคนต่างด้าวที่ มีใบสำคัญประจำตัวคนต่างด้าวและมีที่อยู่ในทะเบียนบ้าน ในสมัยเริ่มแรก (1 ม.ค. - 31 พ.ค.2527)
      // ประเภทที่ 5 ได้แก่ คนไทยที่ได้รับอนุมัติให้เพิ่มชื่อเข้าในทะเบียนบ้านในกรณีตกสำรวจหรือกรณีอื่น ๆ

      let nationalId = ''
      let personType = 1
      let nationalLimit = 9999

      let startBornNumber = 10
      let endBornNumber = nationalLimit

      if(this.$moment(birthday).isBefore('1984-05-31')) {
        if(this._.random(1, 50) === 1) {
          personType = 5
          nationalLimit = 999
        } else {
          personType = 3
          nationalLimit = 99
        }
      } else {
        const bornPerMonth = 65000
        const bornPerProvince = bornPerMonth / 500
        const districts = this.districtByProvinceId(provinceId)
        const bornPerDistrict = Math.floor(bornPerProvince / this._.size(districts))
        // console.log(`bornPerDistrict`, bornPerDistrict)
        
        const startYear = '1984'
        const startMonth = '06'
        const birthYear = this.$moment(birthday).format('YYYY')
        const birthMonth = this.$moment(birthday).format('MM')

        const diffYear = parseInt(birthYear) - parseInt(startYear)
        const diffMonth = parseInt(birthMonth) - parseInt(startMonth)
        const totalDiffMonth = (diffYear * 12) + diffMonth

        // console.log(`diffYear`, diffYear)
        // console.log(`diffMonth`, diffMonth)

        startBornNumber = totalDiffMonth * bornPerDistrict
        endBornNumber = (totalDiffMonth * bornPerDistrict) + bornPerDistrict

        // console.log(`totalDiffMonth`, totalDiffMonth)
        // console.log(`bornPerDistrict`, bornPerDistrict)
        // console.log(`startBornNumber`, startBornNumber)
        // console.log(`endBornNumber`, endBornNumber)
      }

      // หลักที่ 1
      nationalId += personType
      // หลักที่ 2-5
      nationalId += districtId

      const bornNumber = this._.padStart(this._.random(startBornNumber, endBornNumber), 5, '0')
      // หลักที่ 6-10
      nationalId += bornNumber

      const bookNumber = this._.padStart(this._.random(1, 99), 2, '0')
      // หลักที่ 11-12
      nationalId += bookNumber

      const nationalIdSum = this.nationalIdSum(nationalId)
      // หลักที่ 13
      nationalId += nationalIdSum

      console.log(`nationalId:`, nationalId)
      this.input.national_id = nationalId
    },

    nationalIdSum (id) {
      if(id.length !== 12) {
        return false
      }

      const numbers = this._.split(id, '')
      let sum = 0
      for(let i = 0; i < this._.size(numbers); i++) {
        const no = 13 - i
        const number = numbers[i]
        sum += (number * no)
      }

      const sumFaction = 11 - (sum % 11)
      const sumNumber = sumFaction % 10

      return sumNumber
    },

    districtByProvinceId (id) {
      const index = this._.findIndex(this.addresses, ['id', id])

      const districts = this._.get(this.addresses, `${index}.district`) || false

      return districts
    },
    tambonByDistrictId (id) {
      const index = this._.findIndex(this.districts, ['id', id])

      const tambons = this._.get(this.districts, `${index}.tambon`) || false

      return tambons
    }
  },
}
