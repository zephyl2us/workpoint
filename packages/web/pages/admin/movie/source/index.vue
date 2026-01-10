<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`movie.source`) }}</h3>
      <div class="header-action">
        <button v-if="hasPermission('movie.source.sync')"  class="btn btn-primary" @click="onClickSyncModal()">
          <i class="icon fa-duotone fa-rotate mr-2"></i>
          <span>ซิงค์ข้อมูล</span>
        </button>
      </div>
    </header>
    <div class="app__body">
      <div class="d-flex mb-3">
        <input 
          v-model="filters.search" 
          type="text" 
          class="form-control" 
          placeholder="ชื่อภาพยนตร์"
          @keyup="handleFilterSubmit">
      </div>
      <template v-if="hasRecords">
        <div class="card card-movie-list mb-3">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th width="60" class="pl-3">#</th>
                  <th width="90">MID</th>
                  <th>ชื่อเรื่อง</th>
                  <th width="100">ความละเอียด</th>
                  <th width="84">ขนาดไฟล์</th>
                  <th width="84"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(record, index) in records" :key="`record-${index}`">
                  <td>
                    {{ record.id }}
                  </td>
                  <td>
                    <NuxtLink v-if="record.movie_id" :to="linkTo(`/movie/source/${record.movie_id}`)" class="font-numeral">{{ record.movie_id }}</NuxtLink>
                  </td>
                  <td>
                    <div class="mb-0">
                      <span class="font-weight-bold font-special text-dark">{{ record.name_en }}</span>
                      <span v-if="record.name_th" class="font-weight-bold font-special text-dark"> - {{ record.name_th }}</span>
                      <span v-if="record.year" class="font-weight-bold font-special text-dark">[{{ record.year }}]</span>
                    </div>
                    <div>
                      <small><span class="text-dark">Path:</span> {{ record.path }}</small>
                    </div>
                    <div>
                      <small><span class="text-dark">File:</span> {{ record.file }}</small>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-light-secondary font-numeral">{{ record.resolution }}</span>
                  </td>
                  <td>
                    <span class="font-numeral">{{ fileSize(record.size) }}</span>
                  </td>
                  <td>
                    <div class="d-flex justify-content-end">
                      <button 
                        v-if="record.mdb_movie_id"
                        class="btn btn-sm btn-success"
                        @click="onClickImportModal(record)">
                        <i class="fa-solid fa-link"></i>
                      </button>
                      <button 
                        v-else
                        class="btn btn-sm btn-light-secondary"
                        @click="onClickImportModal(record)">
                        <i class="fa-solid fa-link"></i>
                      </button>
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

    <Modal v-if="showSyncModal" ref="sync" :on-close="onCloseSyncModal">
      <template #title>
        <h5 class="modal-title">ซิงค์ไฟล์ต้นฉบับ</h5>
      </template>
      <template #body>
        <div class="modal-body">
          <div class="d-flex mb-1">
            <span class="font-special text-dark">สถานะ</span>
            <span class="font-numeral ml-auto">{{ UIRenderNumber(syncCurrent) }} / {{ UIRenderNumber(syncTotal) }}</span>
          </div>
          <div class="progress">
            <div class="progress-bar probress-bar-trans" :style="addSyncPercentStyle()"></div>
          </div>
          <div class="d-flex justify-content-center mt-1" style="height: 18px">
            <small v-if="!isSyncFinished" class="">{{ syncName }}</small>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="$refs.sync.onClickClose()">
            <span>ปิด</span>
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            style="width: 60px" 
            :disabled="!canSubmit" 
            @click="onSubmitSync()">
            <span v-if="countdown" class="label">{{ countdown }}</span>
            <span v-else class="label">ซิงค์</span>
          </button>
        </div>
      </template>
    </Modal>

    <SourceImportModal v-if="showImportModal" :on-close="onCloseImportModal" :source="sourceRecord"></SourceImportModal>
  </div>
</template>

<script>
import _ from 'lodash'

import { mapGetters, mapMutations, mapActions, } from 'vuex'

import countdownMixin from '~/mixins/countdown'
import fetchMixin from '~/mixins/fetch'
import formMixin from '~/mixins/form'
import SourceImportModal from '~/components/Admin/Movie/SourceImportModal'

export default {
  name: 'MovieSource',
  components: {
    SourceImportModal
  },
  mixins: [countdownMixin, fetchMixin, formMixin],
  layout: 'admin',
  props: {},
  data () {
    return {
      // date: null,
      showSyncModal: false,
      showImportModal: false,

      sourceRecord: {},

      filters: {
        page: 1
        // date: null
      },
    }
  },
  computed: {
    ...mapGetters('admin-movie-source', [
      'records',
      'pagination',
      'isSyncFinished',
      'syncCurrent',
      'syncTotal',
      'syncName',
      'responseError',
      'responseSuccess'
      // 'lotteries'
    ]),
    canSubmit () {
      return !this.isSubmitted && !this.countdown
    }
  },
  watch: {
    'responseSuccess': {
      handler (response) {
        console.log(`success:`, response)
        const duration = this._.get(response, 'duration')
        this.startCountdown(duration)
      }
    },
    'responseError': {
      handler (response) {
        console.log(`error:`, response)
        const duration = this._.get(response, 'data.duration')
        this.startCountdown(duration)
      }
    }
  },
	beforeDestroy () {
    this.$pusher.unsubscribe(`movie.source`)
  },
  created () {},
  mounted () {
    const channel = this.$pusher.subscribe(`movie.source`)

    channel.bind('sync', (data) => {
      this.receiveSync(data)
    })
  },
  methods: {
    ...mapActions('admin-movie-source', [
      'getSources',
      'getSync',
      'syncSource'
    ]),
    ...mapMutations('admin-movie-source', [
      'receiveSync',
      'clearSync'
    ]),
    /**
     * Data manager work with api
     */
    async dataManager (params, from = null) {
      await this.getSources(params)
      this.handleAfterLoaded()
    },
    fileSize (size) {
      size = size * 1000 / 1024
      if(size >= 1000) {
        return `${this.UIRenderNumber((size / 1000), '0,0.00')} GB`
      }

      return `${this.UIRenderNumber(size, '0,0')} MB`
    },

    addSyncPercentStyle () {
      const percent = Math.floor(this.syncCurrent * 100 / this.syncTotal)

			const style = {
				minWidth: `${percent || 0}%`
			}

			return style
    },
    onClickSyncModal () {
      this.clearSync()
      this.showSyncModal = true
    },
    onCloseSyncModal () {
      this.showSyncModal = false

      // this.clearSync()
      this.hotRefresh()
    },
    onSubmitSync: _.debounce(function () {
      this.submitting()
      this.syncSource()
      this.clearSync()
    }, 1000, { leading: true }),

    onClickImportModal (record) {
      this.sourceRecord = this._.clone(record)
      // console.log(record)
      this.showImportModal = true
    },
    onCloseImportModal () {
      this.sourceRecord = {}
      this.showImportModal = false

      this.hotRefresh()
    },
  },
}
</script>