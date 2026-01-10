<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`user.staff`) }}</h3>
      <div class="header-action">
        <NuxtLink
            v-if="hasPermission('setting.user.create')"
            :to="linkTo(`/setting/user/create`)" 
            class="btn btn-primary">
          <i class="icon fa-duotone fa-user-plus mr-2"></i>
          <span>{{ $t(`user.staff_create`) }}</span>
        </NuxtLink>
      </div>
    </header>
    <div class="app__body">
      <div class="d-flex mb-3">
        <input 
          v-model="filters.search"
          type="text"
          class="form-control"
          placeholder="ชื่อ"
          @keyup="handleFilterSubmit">
      </div>
      <template v-if="hasRecords">
        <div class="card card-movie-list mb-3">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th width="60" class="pl-3">#</th>
                  <th>ชื่อผู้ใช้งาน</th>
                  <th width="80">สถานะ</th>
                  <th width="200">เข้าใช้งานล่าสุด</th>
                  <th width="200"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(record, index) in records" :key="`record-${index}`">
                  <td>
                    <NuxtLink :to="linkTo(`/setting/user/${record.id}`)" class="font-numeral">{{ record.id }}</NuxtLink>
                  </td>
                  <td>
                    <div class="mb-0">
                      <span class="font-weight-bold font-special text-dark">{{ record.display_name }}</span>
                    </div>
                    <div class="font-size-sm">
                      <span>{{ record.username }}</span>
                    </div>
                  </td>
                  <td>
                    {{ record.status }}
                  </td>
                  <td>
                    <template v-if="_.result(record, 'last_login_at')">
                      <div class="mb-0">
                        <span class="text-dark">{{ timeFromNow(_.get(record, 'last_login_at')) }}</span>
                      </div>
                      <div class="font-size-sm">
                        <i :class="addClassOsIcon(record)"></i>
                        <i :class="addClassBrowserIcon(record)"></i>
                        <span>{{ _.get(record, 'last_login_ip') }}</span>
                      </div>
                    </template>
                  </td>
                  <td>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>

import UAParser from 'ua-parser-js'
import { mapGetters, mapActions } from 'vuex'

import fetchMixin from '~/mixins/fetch'

export default {
  name: 'UserStaff',
  components: {},
  mixins: [fetchMixin],
  layout: 'admin',
  props: {},
  data () {
    return {
      filters: {
        page: 1
      },
    }
  },
  computed: {
    ...mapGetters('admin-staff', [
      'records'
    ]),
  },
  created () {},
  mounted () {
  },
  methods: {
    ...mapActions('admin-staff', [
      'getUsers'
    ]),
    /**
     * Data manager work with api
     */
    async dataManager (params, from = null) {
      await this.getUsers(params)
      this.handleAfterLoaded()
    },

    ua (record) {
      const userAgent = this._.get(record, 'last_login_agent')
      const parser = new UAParser(userAgent)
      const result = parser.getResult()

      console.log(result)

      return result
    },

    addClassBrowserIcon (record) {
      const ua = this.ua(record)
      let browser = this._.get(ua, 'browser.name')
      browser = this._.snakeCase(browser)

      const classes = {
        safari: 'fa-brands fa-safari',
        edge: 'fa-brands fa-edge',
        chrome: 'fa-brands fa-chrome',
        firefox: 'fa-brands fa-firefox'
      }

      return this._.get(classes, browser) || 'fa-regular fa-earth-americas'
    },

    addClassDeviceIcon (record) {
      const ua = this.ua(record)
      let device = this._.get(ua, 'device.vendor')
      device = this._.snakeCase(device)

      return device
    },

    addClassOsIcon (record) {
      const ua = this.ua(record)
      let os = this._.toLower(this._.get(ua, 'os.name'))
      os = this._.snakeCase(os)

      const classes = {
        mac_os: 'fa-brands fa-apple',
      }

      return this._.get(classes, os) || 'fa-regular fa-laptop-mobile'
    }
  },
}
</script>