<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`army.ant`) }}</h3>
      <div class="header-action">
        <!-- <button 
          class="btn btn-secondary mr-2"
          @click="onClickDataModal">
          <i class="fa-regular fa-clone"></i>
        </button> -->
        <NuxtLink
            v-if="hasPermission('army.ant.create')"
            :to="linkTo(`/army/ant/create`)"
            class="btn btn-primary">
          <i class="icon fa-duotone fa-bugs mr-2"></i>
          <span>{{ $t(`army.ant_create`) }}</span>
        </NuxtLink>
      </div>
    </header>
    <div class="app__body">
      <div class="d-flex mb-3">
        <select
          v-if="hasCreator"
          v-model="filters.user_id"
          class="form-control mr-2"
          style="max-width: 100px;"
          @change="handleFilterSubmit">
          <option :selected="!filters.user_id" :value="undefined">ทุกคน</option>
          <option 
            v-for="creator in creators" 
            :key="`creator-${creator.id}`"
            :value="creator.id">
            {{ creator.display_name }}
          </option>
          <!-- <option :value="_.get(user, 'id')">เฉพาะฉัน</option> -->
        </select>
        <select
          v-model="filters.status"
          class="form-control mr-2"
          style="max-width: 150px;"
          @change="handleFilterSubmit">
          <option :selected="!filters.status" :value="undefined">ทุกสถานะ</option>
          <option :value="1">เปิดใช้งาน</option>
          <option :value="2">รอตรวจสอบ</option>
          <option :value="3">อุทธรณ์</option>
          <option :value="4">ระงับ</option>
        </select>
        <input 
          v-model="filters.search" 
          type="text" 
          class="form-control" 
          placeholder="ชื่อมด"
          @keyup="handleFilterSubmit">
      </div>
      <template v-if="hasRecords">
        <div class="card card-ant-list mb-3">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th style="min-width: 84px;" class="pl-3">#</th>
                  <th style="min-width: 64px;"></th>
                  <th width="100%">ชื่อ</th>
                  <!-- <th style="min-width: 40px;"></th> -->
                  <th style="min-width: 40px;"></th>
                  <th style="min-width: 150px;">บัตรประชาชน</th>
                  <th style="min-width: 150px;">โซเชียล</th>
                  <th style="min-width: 150px;">ผู้สร้าง</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(record, index) in records" :key="`record-${index}`">
                  <td>
                    <div class="mb-0">
                      <NuxtLink :to="linkTo(`/army/ant/${record.id}`)" class="font-numeral">{{ record.id }}</NuxtLink>
                    </div>
                    <div class="font-size-sm">
                      {{ _.get(record, 'adspower_id') }}
                    </div>
                  </td>
                  <td>
                    <div v-if="_.get(record, 'photo.id')" class="av">
                      <div 
                        v-if="record.profile_path" 
                        class="av-picture cursor-pointer" 
                        :style="`background-image: url('${linkImage(record.profile_path, 92)}')`"
                        @click="onClickPhotoModal(record)"></div>
                    </div>
                    <div v-else class="av cursor-pointer" @click="onClickPhotoSyncModal(record)">
                      <i class="av-icon fas fa-user"></i>
                    </div>
                  </td>
                  <td>
                    <div class="mb-0">
                      <span v-if="_.eq(record.type, 'user')" class="badge badge-primary">USER</span>
                      <span v-clipboard="`${record.first_name_en} ${record.last_name_en}`" class="cursor-clipboard font-weight-bold font-special text-dark">
                        {{ record.first_name_en }} {{ record.last_name_en }}
                      </span>
                    </div>
                    <div class="font-size-sm">
                      <span v-clipboard="`${record.first_name} ${record.last_name}`" class="cursor-clipboard">{{ record.first_name }} {{ record.last_name }}</span>
                    </div>
                    <div class="font-size-sm">
                      <span v-clipboard="record.email" class="cursor-clipboard">{{ record.email }}</span>
                    </div>
                  </td>
                  <!-- <td>
                    <div class="mb-0">
                      <i v-if="record.adspower_id" class="fa-regular fa-rectangle-ad text-primary"></i>
                      <i v-else class="fa-regular fa-rectangle-ad text-muted"></i>
                    </div>
                  </td> -->
                  <td>
                    <span v-if="_.eq(record.gender, 'male')" class="text-info">
                      <i class="fa-regular fa-mars"></i>
                    </span>
                    <span v-else-if="_.eq(record.gender, 'female')" class="text-danger">
                      <i class="fa-regular fa-venus"></i>
                    </span>
                  </td>
                  <td>
                    <div class="mb-0">
                      <span class="font-numeral">{{ record.national_id | national() }}</span>
                    </div>
                    <div class="font-size-sm">
                      {{ $moment(record.birthday).lang('en').format('D MMM YYYY') }}
                    </div>
                  </td>
                  <td>
                    <div>
                      <span 
                        class="badge" 
                        :class="addClassSocial(record, 'google')"
                        @click="onClickQuickEditModal(record, 'google')">
                        <!-- <i class="fa-brands fa-google"></i> -->
                        Gmail
                      </span>
                      <span 
                        class="badge cursor-pointer" 
                        :class="addClassSocial(record, 'facebook')" 
                        @click="onClickQuickEditModal(record, 'facebook')">
                        <!-- <i class="fa-brands fa-facebook"></i> -->
                        FB
                      </span>
                      <span 
                        class="badge cursor-pointer" 
                        :class="addClassSocial(record, 'instagram')" 
                        @click="onClickQuickEditModal(record, 'instagram')">
                        <!-- <i class="fa-brands fa-instagram"></i> -->
                        IG
                      </span>
                      <span 
                        class="badge cursor-pointer" 
                        :class="addClassSocial(record, 'tiktok')" 
                        @click="onClickQuickEditModal(record, 'tiktok')">
                        <!-- <i class="fa-brands fa-tiktok"></i> -->
                        TT
                      </span>
                      <!-- <span 
                        class="badge" 
                        :class="addClassSocial(record, 'line')">
                        <i class="fa-brands fa-line"></i>
                        LN
                      </span> -->
                    </div>

                    <span v-if="_.get(record, 'latest_bot.screenshot')" class="cursor-pointer" @click="onClickScreenshotModal(record)">
                      <i class="fa-regular fa-image text-primary"></i>
                    </span>
                    <small class="">{{ getActivityCode(record) }}</small>
                  </td>
                  <td>
                    <div class="mb-0">
                      <span class="font-weight-bold font-special text-dark">{{ _.get(record, 'creator.display_name') }}</span>
                    </div>
                    <div class="font-size-sm font-numeral">
                      {{ UIRenderDateTime(record.created_at) }}
                    </div>
                  </td>
                  <td>
                    <div class="table-action">
                      <NuxtLink :to="linkTo(`/army/ant/${record.id}`)" class="btn btn-sm btn-light-primary">
                        <i class="fa-regular fa-bugs"></i>
                      </NuxtLink>
                      <!-- <NuxtLink :to="linkTo(`/army/ant/${record.id}/photo`)" class="btn btn-sm btn-light-secondary ml-2">
                        <i class="fa-regular fa-images-user"></i>
                      </NuxtLink> -->
                      <ArmyAntListAction 
                        :record="record" 
                        :on-delete="onClickDeleteModal"
                        :on-id-card="onClickIdCardModal"></ArmyAntListAction>
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
    <AntDataModal v-if="showDataModal" :on-close="onCloseDataModal"></AntDataModal>
    <AntPhotoSyncModal v-if="showPhotoSyncModal" :on-close="onClosePhotoSyncModal" :record="currentRecord"></AntPhotoSyncModal>

    <AntDeleteModal v-if="showDeleteModal" :on-close="onCloseDeleteModal" :record="currentRecord"></AntDeleteModal>
    <AntIdCardModal v-if="showIdCardModal" :on-close="onCloseIdCardModal" :record="currentRecord"></AntIdCardModal>
    <QuickEditModal v-if="showQuickEditModal" :on-close="onCloseQuickEditModal" :record="currentRecord" :type="quickEditType"></QuickEditModal>

    <AntPhotoModal v-if="showPhotoModal" :on-close="onClosePhotoModal" :record="currentRecord" :images="currentPhotos"></AntPhotoModal>
    <AntScreenshotModal v-if="showScreenshotModal" :on-close="onCloseScreenshotModal" :record="currentRecord" :images="currentScreenshots"></AntScreenshotModal>
  </div>
</template>

<script>
// import _ from 'lodash'
import { mapState, mapGetters, mapActions } from 'vuex'

import ArmyAntListAction from '~/components/Admin/Army/AntListAction'
import AntDataModal from '~/components/Admin/Army/AntDataModal'
import AntPhotoSyncModal from '~/components/Admin/Army/AntPhotoSyncModal'
import AntDeleteModal from '~/components/Admin/Army/AntDeleteModal'
import AntIdCardModal from '~/components/Admin/Army/AntIdCardModal'
import QuickEditModal from '~/components/Admin/Army/QuickEditModal'

import AntPhotoModal from '~/components/Admin/Army/AntPhotoModal'
import AntScreenshotModal from '~/components/Admin/Army/AntScreenshotModal'

import fetchMixin from '~/mixins/fetch'

let interval
const requestInterval = require('request-interval')

export default {
  name: 'ArmyAnt',
  components: {
    ArmyAntListAction,
    AntDataModal,
    AntPhotoSyncModal,
    AntDeleteModal,
    AntIdCardModal,
    QuickEditModal,
    AntPhotoModal,
    AntScreenshotModal
  },
  mixins: [fetchMixin],
  layout: 'admin',
  props: {},
  data () {
    return {
      // date: null,
      showDataModal: false,
      showPhotoSyncModal: false,
      showDeleteModal: false,
      showIdCardModal: false,
      showQuickEditModal: false,
      showPhotoModal: false,
      showScreenshotModal: false,
      currentRecord: {},
      currentPhotos: [],
      currentScreenshots: [],
      quickEditType: null,
      filters: {
        id: undefined,
        status: undefined,
        page: 1,
        // user_id: ''
      },
    }
  },
  computed: {
    ...mapState('auth', [
      'user'
    ]),
    ...mapGetters('admin-army-ant', [
      'records',
      'pagination'
    ]),
    ...mapGetters('admin', [
      'creators'
    ]),
    hasCreator () {
      return !!this._.size(this.creators)
    }
  },
  created () {},
  beforeDestroy () {
    requestInterval.clear(interval)
  },
  mounted () {
    this.getCreators()

    interval = requestInterval(2000, () => {
      this.checkAdsPowerStatus()
    })
  },
  methods: {
    ...mapActions('admin-army-ant', [
      'getAnts'
    ]),
    ...mapActions('admin', [
      'getCreators'
    ]),
    async checkAdsPowerStatus () {
			// try {
			// 	const response = await this.$axios.get(`http://localhost:50325`)
      //   console.log(response)
      // } catch (e) {
      //   console.log(e)
			// }
    },
    getActivityCode (record) {
      const activities = this._.get(record, 'latest_bot.payload.activities')

      const checkpoint = this._.find(activities, (activity) => {
        // const code = this._.get(activity, 'code')
        // if(activity.action === 'facebook_checkpoint') console.log(activity.action)
        // return this._.includes(['facebook_checkpoint'], activity.action)
        return this._.has(activity, 'code')
      })

      return this._.get(checkpoint, 'code')
    },
    hasSocial (record, social) {
      const passwords = this._.get(record, 'passwords')
      const index = this._.findIndex(passwords, ['social', social])

      if(index === -1) {
        return false
      }

      return true
    },
    // addClassSocial (record, social) {
    //   const passwords = this._.get(record, 'passwords')
    //   const index = this._.findIndex(passwords, ['social', social])

    //   if(index === -1) {
    //     return 'text-muted'
    //   }

    //   const classLists = {
    //     google: 'text-google',
    //     facebook: 'text-facebook',
    //     line: 'text-line',
    //     tiktok: 'text-tiktok',
    //     instagram: 'text-instagram',
    //   }

    //   const isFacebookEnable = !!this._.get(record, 'facebook_enable')
    //   const isInstagramEnable = !!this._.get(record, 'instagram_enable')
    //   const isTiktokEnable = !!this._.get(record, 'tiktok_enable')
    //   const isLineEnable = !!this._.get(record, 'line_enable')
    //   if((this._.eq(social, 'google'))
    //   || (this._.eq(social, 'facebook') && isFacebookEnable)
    //   || (this._.eq(social, 'instagram') && isInstagramEnable)
    //   || (this._.eq(social, 'tiktok') && isTiktokEnable)
    //   || (this._.eq(social, 'line') && isLineEnable)) {
    //     let socialClass = this._.get(classLists, social)
    //     socialClass += ` active`
    //     return socialClass
    //   }


    //   return 'inactive'
    // },

    addClassSocial (record, social) {
      const passwords = this._.cloneDeep(this._.get(record, 'passwords'))
      const index = this._.findIndex(passwords, ['social', social])

      if(index === -1) {
        return 'badge-light-secondary'
      }

      const googleStatus = this._.get(record, 'gmail_status')
      const facebookStatus = this._.get(record, 'facebook_status')
      const instagramStatus = this._.get(record, 'instagram_status')
      const tiktokStatus = this._.get(record, 'tiktok_status')
      const lineStatus = this._.get(record, 'line_status')

      let status = null

      if(this._.eq(social, 'google')) {
        status = googleStatus
      } else if(this._.eq(social, 'facebook')) {
        status = facebookStatus
      } else if(this._.eq(social, 'instagram')) {
        status = instagramStatus
      } else if(this._.eq(social, 'tiktok')) {
        status = tiktokStatus
      } else if(this._.eq(social, 'line')) {
        status = lineStatus
      }

      if(status === 1) {
        return 'badge-success'
      } else if(status === 2) {
        return 'badge-light-warning'
      } else if(status === 3) {
        return 'badge-warning'
      } else if(status === 4) {
        return 'badge-danger'
      }

      return 'badge-light-success'
    },
    onClickDataModal (record) {
      this.showDataModal = true
    },
    onCloseDataModal () {
      this.showDataModal = false
    },
    onClickPhotoSyncModal (record) {
      this.currentRecord = record
      this.showPhotoSyncModal = true
    },
    onClosePhotoSyncModal () {
      this.showPhotoSyncModal = false
      this.currentRecord = null

      this.hotRefresh()
    },
    onClickDeleteModal (record) {
      this.currentRecord = record
      this.showDeleteModal = true
    },
    onCloseDeleteModal () {
      this.showDeleteModal = false
      this.currentRecord = null

      this.hotRefresh()
    },
    onClickIdCardModal (record) {
      this.currentRecord = record
      this.showIdCardModal = true
    },
    onCloseIdCardModal () {
      this.showIdCardModal = false
      this.currentRecord = null
    },
    onClickQuickEditModal (record, type) {
      this.currentRecord = record
      this.quickEditType = type
      this.showQuickEditModal = true
    },
    onCloseQuickEditModal () {
      this.showQuickEditModal = false
      this.currentRecord = null
      this.hotRefresh()
    },
    onClickPhotoModal (record) {
      // this.currentRecord = record
      const photos = this._.get(record, 'photo.payload.photos') || []

      if(!this._.size(photos)) {
        return
      }
      
      this.currentRecord = record
      this.currentPhotos = photos
      this.showPhotoModal = true
    },
    onClosePhotoModal () {
      this.showPhotoModal = false
    },
    onClickScreenshotModal (record) {
      // this.currentRecord = record
      const screenshot = this._.get(record, 'latest_bot.screenshot')

      if(!screenshot) {
        return
      }
      
      this.currentRecord = record
      this.currentScreenshots = [screenshot]
      this.showScreenshotModal = true
    },
    onCloseScreenshotModal () {
      this.showScreenshotModal = false
    },

    /**
     * Data manager work with api
     */
    async dataManager (params, from = null) {
      await this.getAnts(params)
      this.handleAfterLoaded()
    },
  },
}
</script>