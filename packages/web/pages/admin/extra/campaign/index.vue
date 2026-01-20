<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`extra.campaign`) }}</h3>
      <div class="header-action">
        <NuxtLink 
          v-if="hasPermission('extra.campaign.create')"
          :to="linkTo('/extra/campaign/create/one')"
          class="btn btn-primary mr-2">
          สร้างแคมเปญ
        </NuxtLink>
      </div>
    </header>
    <div class="app__body">

      <template v-if="hasRecords">
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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(record, index) in records" :key="`record-${index}`">
                  <td>
                    <div class="mb-0">
                      <NuxtLink :to="linkTo(`/extra/campaign/${record.id}`)" class="font-numeral">{{ record.id }}</NuxtLink>
                    </div>
                  </td>
                  <td>
                    <div class="mb-0">
                      <span class="font-weight-bold font-special text-dark">{{ record.name }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="">{{ record.total_user }}</span>
                  </td>
                  <td>
                    <span class="">{{ record.total_answered }}</span>
                  </td>
                  <td>
                    <span class="">{{ record.total_no_answer }}</span>
                  </td>
                  <td>
                    <span class="">{{ record.total_rejected }}</span>
                  </td>
                  <td>
                    <span class="">{{ record.total_unreachable }}</span>
                  </td>
                  <td>
                    <span class="">{{ record.total_register }}</span>
                  </td>
                  <td>
                    <span class="">{{ record.total_login }}</span>
                  </td>
                  <td>
                    <div class="table-action">
                      <NuxtLink :to="linkTo(`/extra/campaign/${record.id}`)" class="btn btn-sm btn-light-primary">
                        <i class="fa-regular fa-list-ul"></i>
                      </NuxtLink>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Pagination v-if="hasRecords" :pagination="pagination" :on-page-change="handleOnChangePage"></Pagination>
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
  name: 'ExtraCampaign',
  components: {},
  mixins: [fetchMixin],
  layout: 'admin',
  props: {},
  data () {
    return {}
  },
  computed: {
    ...mapState('auth', [
      'user'
    ]),
    ...mapGetters('admin-extra-campaign', [
      'records',
      'pagination'
    ]),
  },
  watch: {
  },
  created () {},
  beforeDestroy () {},
  mounted () {
  },
  methods: {
    ...mapActions('admin-extra-campaign', [
      'getCampaigns'
    ]),
    /**
     * Data manager work with api
     */
    async dataManager (params, from = null) {
      await this.getCampaigns(params)
      this.handleAfterLoaded()
    },
  },
}
</script>