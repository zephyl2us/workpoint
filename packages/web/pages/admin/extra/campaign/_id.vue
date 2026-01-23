<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`extra.campaign`) }} - {{ _.get(record, 'name') }}</h3>
      <div class="header-action">
      </div>
    </header>
    <div class="app__body">

      <template v-if="hasUsers">
        <div class="card card-ant-list mb-3">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th style="min-width: 84px;" class="pl-3">#</th>
                  <th style="min-width: 64px;"></th>
                  <th width="100%">ชื่อ</th>
                  <!-- <th style="min-width: 40px;"></th> -->
                  <th style="min-width: 130px;">เบอร์โทร</th>
                  <th style="min-width: 120px;">เครดิต</th>
                  <th style="min-width: 120px;">สถานะ</th>
                  <th style="min-width: 230px"></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(user, index) in users" :key="`record-${index}`">
                  <td>
                    <div class="mb-0">
                      <span class="">{{ user.id }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="av">
                      <i class="av-icon fas fa-user"></i>
                    </div>
                  </td>
                  <td>
                    <div class="mb-0">
                      <span class="font-weight-bold font-special text-dark">{{ user.first_name }} {{ user.last_name }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="">
                      <span class="font-numeral">{{ user.mobile }}</span>
                    </div>
                  </td>
                  <td>
                    <template v-if="hasPermission('extra.campaign.create') || _.eq(user.actor_user_id, authUser.id)">
                      <div class="font-size-sm">
                        <span class="font-numeral font-weight-bolder" :class="{ 'text-success' : _.get(user, 'payload.credit') > 0 }">{{ UIRenderNumber(_.get(user, 'payload.credit'), '0,0.00') }}</span>
                      </div>
                      <div class="font-size-sm">
                        <span class="font-numeral">{{ UIRenderNumber(_.get(user, 'payload.revenue'), '0,0.00') }}</span>
                      </div>
                    </template>
                    <template v-else>
                      <div class="font-size-sm">
                        <span class="font-numeral font-weight-bolder">*.**</span>
                      </div>
                      <div class="font-size-sm">
                        <span class="font-numeral">*.**</span>
                      </div>
                    </template>
                  </td>
                  <td>
                    <div>
                      <span 
                        class="badge" 
                        :class="addStatusClass(user)">
                        <!-- <i class="fa-brands fa-google"></i> -->
                        {{ $t(`extra.campaign_status.${user.status}`) }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div>
                      <span
                        class="badge"
                        :class="{ 'badge-success': user.send_sms_count > 0, 'badge-light-secondary': !user.send_sms_count }">
                        <!-- ส่งข้อความ -->
                        <i class="fa-regular fa-comment-sms"></i>
                      </span>
                      <span
                        class="badge"
                        :class="{ 'badge-success': user.is_register, 'badge-light-secondary': !user.is_register }">
                        <!-- สมัครสมาชิก -->
                        <i class="fa-solid fa-circle-1"></i>
                      </span>
                      <span
                        class="badge"
                        :class="{ 'badge-success': user.is_login, 'badge-light-secondary': !user.is_login }">
                        <!-- เข้าสู่ระบบ -->
                        <i class="fa-regular fa-arrow-right-to-bracket"></i>
                      </span>
                      <span
                        class="badge"
                        :class="{ 'badge-success': user.deposit, 'badge-light-secondary': !user.deposit }">
                        <!-- เข้าสู่ระบบ -->
                        <i class="fa-regular fa-money-bill-1-wave"></i>
                        <span v-if="user.deposit" class="ml-1">{{ UIRenderNumber(_.get(user, 'deposit'), '0,0') }}</span>
                      </span>
                      
                    </div>
                  </td>
                  <td>
                    <div class="table-action">
                      <template v-if="hasPermission('extra.campaign.action')">
                        <button class="btn btn-sm btn-light-primary" @click="onClickCampaignUserModal(user)">
                          <i class="fa-regular fa-phone"></i>
                        </button>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Pagination v-if="hasUsers" :pagination="pagination" :on-page-change="handleOnChangePage"></Pagination>
      </template>
    </div>

    <CampaignUserModal 
      v-if="showCampaignUserModal" 
      :on-close="onCloseCampaignUserModal" 
      :record="currentRecord">
    </CampaignUserModal>
  </div>
</template>

<script>
// import _ from 'lodash'
// import qs from 'qs'
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

import fetchMixin from '~/mixins/fetch'
import formMixin from '~/mixins/form'

import CampaignUserModal from '~/components/Admin/Extra/Campaign/CampaignUserModal'

export default {
  name: 'ArmyAnt',
  components: {
    CampaignUserModal
  },
  mixins: [fetchMixin, formMixin],
  layout: 'admin',
  props: {},
  data () {
    return {
      // date: null,
      filters: {
        status: undefined,
      },
      currentRecord: null,
      showCampaignUserModal: false,
    }
  },
  computed: {
    ...mapState('auth', [
      'user'
    ]),
    ...mapGetters('admin-extra-campaign', [
      'record',
      'users',
      'pagination',
      'responseSuccess',
      'responseError'
    ]),
    hasUsers () {
      return !!this._.size(this.users)
    },
  },
  watch: {
  },
  created () {},
  beforeDestroy () {
    this.$pusher.unsubscribe(`campaign-user`)
  },
  mounted () {
    const channel = this.$pusher.subscribe(`campaign-user`)

    // channel.bind('bot-create', (data) => {
    //   this.receiveCreateBot(data)
    // })

    channel.bind('update', (data) => {
      this.receiveUpdateUser(data)
    })
  },
  methods: {
    ...mapActions('admin-extra-campaign', [
      'getCampaign',
    ]),
    ...mapMutations('admin-extra-campaign', [
      'receiveUpdateUser'
    ]),
    /**
     * Data manager work with api
     */
    async dataManager (params, from = null) {
      const data = {
        id: this.$route.params.id,
        params
      }

      await this.getCampaign(data)
      this.handleAfterLoaded()
    },
    onClickCampaignUserModal (record) {
      this.currentRecord = record
      this.showCampaignUserModal = true
    },
    onCloseCampaignUserModal () {
      this.showCampaignUserModal = false
    },

    addStatusClass (record) {
      const classes = {
        waiting: 'badge-light-secondary',
        answered: 'badge-light-success',
        no_answer: 'badge-light-warning',
        rejected: 'badge-light-danger',
        unreachable: 'badge-light-success',
      }


      return this._.get(classes, record.status) || 'badge-light-secondary'
    },
  },
}
</script>