<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`extra.campaign`) }} - {{ _.get(record, 'name') }}</h3>
      <div class="header-action">
      </div>
    </header>
    <div class="app__body">

      <template v-if="hasSummaries">
        <div class="card card-ant-list mb-3">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th style="min-width: 84px;" class="pl-3">#</th>
                  <th width="100%">ชื่อ</th>
                  <!-- <th style="min-width: 40px;"></th> -->
                  <th style="min-width: 100px;">ทั้งหมด</th>
                  <th style="min-width: 80px;">รับสาย</th>
                  <th style="min-width: 80px;">ไม่คุย</th>
                  <th style="min-width: 80px;">ตัดสาย</th>
                  <th style="min-width: 80px;">ไม่ติด</th>
                  <th style="min-width: 80px;">สมัครสมาชิก</th>
                  <th style="min-width: 80px;">เข้าสู่ระบบ</th>
                  <th style="min-width: 80px;">ฝากเงิน</th>
                  <th style="min-width: 100px;">ยอดฝากรวม</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(record, index) in summaries" :key="`record-${index}`">
                  <td>
                    {{ index + 1 }}
                  </td>
                  <td>
                    <div class="mb-0">
                      <span class="font-weight-bold font-special text-dark">{{ getActor(record.actor_user_id) }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="">{{ UIRenderNumber(record.total_user, '0,0') }}</span>
                  </td>
                  <td>
                    <span class="">{{ UIRenderNumber(record.total_answered, '0,0') }}</span>
                  </td>
                  <td>
                    <span class="">{{ UIRenderNumber(record.total_no_answer, '0,0') }}</span>
                  </td>
                  <td>
                    <span class="">{{ UIRenderNumber(record.total_rejected, '0,0') }}</span>
                  </td>
                  <td>
                    <span class="">{{ UIRenderNumber(record.total_unreachable, '0,0') }}</span>
                  </td>
                  <td>
                    <span class="">{{ UIRenderNumber(record.total_registered, '0,0') }}</span>
                  </td>
                  <td>
                    <span class="">{{ UIRenderNumber(record.total_login, '0,0') }}</span>
                  </td>
                  <td>
                    <span class="">{{ UIRenderNumber(record.total_depositors, '0,0') }}</span>
                  </td>
                  <td>
                    <span class="">{{ UIRenderNumber(record.total_deposit_amount, '0,0') }}</span>
                  </td>
                  <td>
                    <div class="table-action">
                    </div>
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
// import _ from 'lodash'
// import qs from 'qs'
import { mapState, mapGetters, mapActions } from 'vuex'

import fetchMixin from '~/mixins/fetch'

export default {
  name: 'ArmyAnt',
  components: {},
  mixins: [fetchMixin],
  layout: 'admin',
  props: {},
  data () {
    return {
      // date: null,
      refId: null,
      filters: {
        status: undefined,
        actor: null
      },
      showActor: 'all',
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
      'summaries',
      'actors',
      'responseSuccess',
      'responseError'
    ]),
    hasSummaries () {
      return !!this._.size(this.summaries)
    },
  },
  watch: {
  },
  created () {},
  beforeDestroy () {
  },
  mounted () {
    this.refId = this.$route.params.id
  },
  methods: {
    ...mapActions('admin-extra-campaign', [
      'getSummary',
    ]),
    /**
     * Data manager work with api
     */
    async dataManager (params, from = null) {
      const data = {
        id: this.$route.params.id,
        params
      }

      await this.getSummary(data)
      this.handleAfterLoaded()
    },

    getActor (actorId) {
      const actor = this.actors.find(actor => actor.id === actorId) || {}
      // console.log(actor)
      return this._.get(actor, 'display_name', '-')
    },
  },
}
</script>