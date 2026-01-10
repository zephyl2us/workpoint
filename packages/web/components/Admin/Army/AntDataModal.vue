<template>
  <Modal ref="antDelete" :on-close="onClose" :backdrop-close="false" :size="'md'">
    <template #title>
      <h5 class="modal-title">
        <span class="">ข้อมูลกองทัพมด</span>
      </h5>
    </template>
      <template #body>
        <div class="modal-body">
          <div class="form-group">
            <label class="mb-2">ชื่อ - นามสกุล</label>
            <textarea class="form-control" rows="5" :value="names"></textarea>
          </div>
          <div class="form-group">
            <label class="mb-2">ชื่อ</label>
            <textarea class="form-control" rows="5" :value="firstNames"></textarea>
          </div>
          <div class="form-group">
            <label class="mb-2">นามสกุล</label>
            <textarea class="form-control" rows="5" :value="lastNames"></textarea>
          </div>
          <div class="form-group">
            <label class="mb-2">ที่อยู่</label>
            <textarea class="form-control" rows="5" :value="antAddresses"></textarea>
          </div>
          <div class="form-group">
            <label class="mb-2">รหัสผ่าน Google</label>
            <textarea class="form-control" rows="5" :value="googlePasswords"></textarea>
          </div>
          <div class="form-group">
            <label class="mb-2">รหัสผ่าน Facebook</label>
            <textarea class="form-control" rows="5" :value="facebookPasswords"></textarea>
          </div>
          <div class="form-group">
            <label class="mb-2">ปีเกิด</label>
            <textarea class="form-control" rows="5" :value="yearOfBirths"></textarea>
          </div>
          <div class="form-group">
            <label class="mb-2">วันเกิด</label>
            <textarea class="form-control" rows="5" :value="dayOfBirths"></textarea>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary ml-auto" 
            @click="onClose">
            <span>ปิด</span>
          </button>
        </div>
      </template>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex'

import CryptoJS from 'crypto-js'

export default {
  name: 'AntDataModal',
  components: {},
  mixins: [],
  props: {
    onClose: {
      type: Function,
      required: true
    },
  },
  data () {
    return {}
  },
  computed: {
    ...mapGetters('admin-army', [
      'addresses',
    ]),
    ...mapGetters('admin-army-ant', [
      'records',
      'pagination'
    ]),
    reverseRecords () {
      const reverseRecords = this._.cloneDeep(this.records) || []
      return reverseRecords.reverse()
    },
    names () {
      const records = this._.map(this.reverseRecords, (record) => `${record.first_name_en} ${record.last_name_en}`)
      return this._.replace(records, /,/g, `\n`)
    },
    firstNames () {
      const records = this._.map(this.reverseRecords, (record) => `${record.first_name_en}`)
      return this._.replace(records, /,/g, `\n`)
    },
    lastNames () {
      const records = this._.map(this.reverseRecords, (record) => `${record.last_name_en}`)
      return this._.replace(records, /,/g, `\n`)
    },
    antAddresses () {
      const records = this._.map(this.reverseRecords, (record) => {
        const provinceId = this._.get(record, 'province_id')
        // const districtId = this._.get(record, 'district_id')
        // const tumbonId = this._.get(record, 'tambon_id')

        const province = this._.find(this.addresses, ['id', provinceId])
        const provinceName = this._.get(province, 'name')
        return provinceName
      })
      return this._.replace(records, /,/g, `\n`)
    },
    googlePasswords () {
      const records = this._.map(this.reverseRecords, (record) => {
        const passwords = this._.get(record, 'passwords')
        const security = this._.find(passwords, ['social', 'google'])
        if(!this._.has(security, 'hash')) {
          return false
        }
        const hash = security.hash

        const passphrase = '84269713'

        const bytes = CryptoJS.AES.decrypt(hash, passphrase)
        const passwordDecrypted = bytes.toString(CryptoJS.enc.Utf8)
        return passwordDecrypted
      })
      return this._.replace(records, /,/g, `\n`)
    },
    facebookPasswords () {
      const records = this._.map(this.reverseRecords, (record) => {
        const passwords = this._.get(record, 'passwords')
        const security = this._.find(passwords, ['social', 'facebook'])
        if(!this._.has(security, 'hash')) {
          return false
        }
        const hash = security.hash

        const passphrase = '84269713'

        const bytes = CryptoJS.AES.decrypt(hash, passphrase)
        const passwordDecrypted = bytes.toString(CryptoJS.enc.Utf8)
        return passwordDecrypted
      })
      return this._.replace(records, /,/g, `\n`)
    },
    yearOfBirths () {
      const records = this._.map(this.reverseRecords, (record) => this.$moment(record.birthday).format('YYYY'))
      return this._.replace(records, /,/g, `\n`)
    },
    dayOfBirths () {
      const records = this._.map(this.reverseRecords, (record) => this.$moment(record.birthday).format('DD'))
      return this._.replace(records, /,/g, `\n`)
    }
  },
  watch: {
  },
  created () {},
  mounted () {
  },
  methods: {
  },
}
</script>