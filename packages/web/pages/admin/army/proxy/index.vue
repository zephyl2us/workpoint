<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`army.proxy`) }}</h3>
      <div class="header-action">
        <!-- <NuxtLink
            v-if="hasPermission('army.proxy.create')"
            :to="linkTo(`/army/proxy/create`)" 
            class="btn btn-primary">
          <i class="icon fa-duotone fa-user-plus mr-2"></i>
          <span>{{ $t(`army.proxy_create`) }}</span>
        </NuxtLink> -->
      </div>
    </header>
    <div class="app__body">
      <template v-if="hasRecords">
        <div class="card card-movie-list mb-3">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th style="min-width:60px" class="pl-3">#</th>
                  <th style="min-width:200px">ผู้ให้บริการ</th>
                  <th style="min-width:160px">Proxy/Socks5</th>
                  <th width="100%">Public IP</th>
                  <th style="min-width:120px">อัพเดทล่าสุด</th>
                  <th style="min-width:60px"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(record, index) in records" :key="`record-${index}`">
                  <td>
                    <div class="mb-0">
                      <span class="font-weight-bold font-numeral text-dark">{{ record.aircard_label }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="mb-0">
                      <span class="font-weight-bold font-special text-dark">{{ record.display_name }}</span>
                    </div>
                    <div class="font-size-sm">
                      <i class="fa-duotone text-primary" :class="[addClassSignalIcon(record)]"></i>
                      <!-- <span class="badge badge-primary">{{ _.get(record, 'payload.extra_info.network_mode') }}</span> -->
                      <span>{{ _.get(record, 'payload.extra_info.provider') }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="font-size-sm">
                      <span v-clipboard="getProxyAddress(record)" class="cursor-clipboard">{{ getProxyAddress(record) }}</span>
                    </div>
                    <div class="font-size-sm">
                      <span v-clipboard="getSocks5Address(record)" class="cursor-clipboard">{{ getSocks5Address(record) }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="">
                      <span v-clipboard="_.get(record, 'payload.public_ip')" class="cursor-clipboard">{{ _.get(record, 'payload.public_ip') }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="mb-0">
                      <span class="font-weight-bold font-special text-dark">{{ timeFromNow(_.get(record, 'updated_at')) }}</span>
                    </div>
                    <div class="font-size-sm font-numeral">
                      {{ UIRenderDateTime(record.updated_at) }}
                    </div>
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

import { mapGetters, mapActions } from 'vuex'

import fetchMixin from '~/mixins/fetch'

let interval
const requestInterval = require('request-interval')

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
    ...mapGetters('admin-army-proxy', [
      'records',
      'pagination'
    ]),
  },
  created () {},
  beforeDestroy () {
    requestInterval.clear(interval)
  },
  mounted () {
    interval = requestInterval(10000, () => {
      this.hotRefresh()
    })
  },
  methods: {
    ...mapActions('admin-army-proxy', [
      'getProxies'
    ]),
    /**
     * Data manager work with api
     */
    async dataManager (params, from = null) {
      await this.getProxies(params)
      this.handleAfterLoaded()
    },

    addClassSignalIcon (record) {
      const signalStrength = this._.get(record, 'payload.extra_info.signal_strength') || 0
      const signalClasses = [
        'fa-signal-slash',
        'fa-signal-weak',
        'fa-signal-fair',
        'fa-signal-good',
        'fa-signal-strong',
        'fa-signal',
      ]

      return this._.get(signalClasses, signalStrength)
    },

    getProxyAddress (record) {
      const ip = this._.get(record, 'ip')
      const port = this._.get(record, 'payload.proxy_port')

      return `${ip}:${port}`
    },

    getSocks5Address (record) {
      const ip = this._.get(record, 'ip')
      const port = this._.get(record, 'payload.sock_port')

      return `${ip}:${port}`
    },
  },
}
</script>