<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`army.bot`) }}</h3>
      <div class="header-action">
        <NuxtLink
            v-if="hasPermission('army.bot.view')"
            :to="linkTo(`/army/bot/monitor`)" 
            class="btn btn-primary mr-3">
          <i class="icon fa-duotone fa-chart-simple-horizontal mr-2"></i>
          <span>{{ $t(`army.bot_monitor`) }}</span>
        </NuxtLink>
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text"><i class="fa-light fa-calendar"></i></span>
          </div>
          <VueDatePicker v-model="date" type="date" value-type="format"></VueDatePicker>
        </div>
      </div>
    </header>
    <div class="app__body">
      <div class="d-flex mb-3">
        <select
          v-model="filters.status"
          class="form-control mr-2"
          style="max-width: 100px;"
          @change="handleFilterSubmit">
          <option :selected="!filters.status" :value="undefined">ทั้งหมด</option>
          <option value="running">กำลังทำงาน</option>
          <option value="stopped">เสร็จแล้ว</option>
          <option value="checkpoint">ตรวจสอบ</option>
        </select>
        <input 
          v-model="filters.search"
          type="text"
          class="form-control"
          placeholder="ชื่อมด"
          @keyup="handleFilterSubmit">
        <div class="d-flex form-control text-nowrap ml-2" style="width: auto;">
          <div class="pr-2">
            ทั้งหมด <span class="font-weight-bolder">{{ _.get(stats, 'total') }}</span>
          </div>
          <div class="px-2 border-left">
            กำลังทำงาน <span class="font-weight-bolder text-success">{{ _.get(stats, 'running') }}</span>
          </div>
          <div class="px-2 border-left">
            ตรวจสอบ <span class="font-weight-bolder text-danger">{{ _.get(stats, 'checkpoint') }}</span>
          </div>
          <div class="pl-2 border-left">
            เสร็จ <span class="font-weight-bolder text-primary">{{ _.get(stats, 'success') }}</span>
          </div>
        </div>
      </div>
      <template v-if="hasRecords">
        <div class="card card-ant-list mb-3">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th style="min-width: 84px;" class="pl-3">#</th>
                  <th style="min-width: 84px;"></th>
                  <th width="100%">ชื่อ</th>
                  <!-- <th style="min-width: 40px;"></th> -->
                  <th style="min-width: 150px;">พร็อกซี่</th>
                  <th style="min-width: 60px">สถานะ</th>
                  <th style="min-width: 60px;"></th>
                  <th style="min-width: 200px;">หมายเหตุ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(record, index) in records" :key="`record-${index}`">
                  <td>
                    <div class="mb-0">
                      <NuxtLink :to="linkTo(`/army/ant?id=${record.ant.id}`)" class="font-numeral">{{ record.ant.id }}</NuxtLink>
                    </div>
                    <div class="font-size-sm">
                      {{ _.get(record, 'ant.adspower_id') }}
                    </div>
                  </td>
                  <td>
                    <div v-if="_.get(record, 'profile_path')" class="av">
                      <div v-if="record.profile_path" class="av-picture" :style="`background-image: url('${linkImage(record.profile_path, 92)}')`"></div>
                    </div>
                    <div v-else class="av cursor-pointer">
                      <i class="av-icon fas fa-user"></i>
                    </div>
                  </td>
                  <td>
                    <div class="mb-0">
                      <span v-clipboard="`${record.ant.first_name_en} ${record.ant.last_name_en}`" class="cursor-clipboard font-weight-bold font-special text-dark">
                        {{ record.ant.first_name_en }} {{ record.ant.last_name_en }}
                      </span>
                    </div>
                    <div class="font-size-sm">
                      <span v-clipboard="`${record.ant.first_name} ${record.ant.last_name}`" class="cursor-clipboard">{{ record.ant.first_name }} {{ record.ant.last_name }}</span>
                    </div>
                    <div class="font-size-sm">
                      <span v-if="_.has(record, 'ant.creator.display_name')" class="">{{ _.get(record, 'ant.creator.display_name') }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="mb-0">
                      <span class="font-weight-bold font-special text-dark">
                        {{ record.server }}
                      </span>
                    </div>
                    <div class="font-size-sm">
                      <span class="">{{ record.proxy }}</span>
                    </div>
                  </td>
                  <td>
                    <span v-if="record.checkpoint" class="badge badge-danger">
                      <i v-if="_.eq('facebook', record.checkpoint)" class="fa-brands fa-facebook"></i>
                      ตรวจสอบ
                    </span>
                    <span v-else class="badge" :class="[addClassStatus(record)]">{{ getBotStatus(record) }}</span>
                  </td>
                  <td>
                    <div class="">
                      <small class="">
                        <i class="fa-regular fa-heart text-danger"></i>
                        <span class="font-family-numeral">{{ getBotActionCount(record).like }}</span>
                      </small>
                    </div>
                    <div class="">
                      <small class="">
                        <i class="fa-regular fa-video text-info"></i>
                        <span class="font-family-numeral">{{ getBotActionCount(record).watch }}</span>
                      </small>
                    </div>
                    <div class="">
                      <small class="">
                        <i class="fa-regular fa-comment text-success"></i>
                        <span class="font-family-numeral">{{ getBotActionCount(record).comment }}</span>
                      </small>
                    </div>
                  </td>
                  <td>
                    <span v-if="record.screenshot" class="cursor-pointer" @click="onClickScreenshotModal(record)">
                      <i class="fa-regular fa-image text-primary"></i>
                    </span>
                    <span class="text-sm">{{ getActivityCode(record) }}</span>
                  </td>
                  <td>

                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <Pagination v-if="hasRecords" :pagination="pagination" :on-page-change="handleOnChangePage"></Pagination>
      </template>
    </div>

    <AntScreenshotModal v-if="showScreenshotModal" :on-close="onCloseScreenshotModal" :record="currentRecord" :images="currentScreenshots"></AntScreenshotModal>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'

import AntScreenshotModal from '~/components/Admin/Army/AntScreenshotModal'

import fetchMixin from '~/mixins/fetch'

let interval
const requestInterval = require('request-interval')

export default {
  name: 'ArmyAnt',
  components: {
    AntScreenshotModal
  },
  mixins: [fetchMixin],
  layout: 'admin',
  props: {},
  data () {
    return {
      showScreenshotModal: false,
      currentScreenshots: [],
      // currentRecord: {},
      date: null,
      filters: {
        date: null,
        status: undefined
      },
    }
  },
  computed: {
    ...mapGetters('admin-army-bot', [
      'records',
      'pagination',
      'stats'
    ]),
  },
  watch: {
    'date': {
      handler (value, old) {
        console.log(`watch: date`, value, old)
        if(!this.$moment(value).isValid()) {
          this.setDefaultDate()
          return
        }
        this.filters.date = this.$moment(value).format('YYYY-MM-DD')
        this.handleFilterSubmit()

        this.getStats(value)
        this.startFetchStats()
      }
    },
  },
	beforeDestroy () {
    this.stopFetchStats()
    this.$pusher.unsubscribe(`ant_bot`)
  },
  created () {},
  mounted () {
    const channel = this.$pusher.subscribe(`ant_bot`)

    // channel.bind('bot-create', (data) => {
    //   this.receiveCreateBot(data)
    // })

    channel.bind('bot-update', (data) => {
      this.receiveUpdateBot(data)
    })

    // channel.bind('activity-update', (data) => {
    //   // this.receiveUpdateActivity(data)
    // })

    this.setDefaultDate()
  },
  methods: {
    ...mapMutations('admin-army-bot', [
      'receiveUpdateBot'
    ]),
    ...mapActions('admin-army-bot', [
      'getBots',
      'getStats'
    ]),
    startFetchStats() {
      this.stopFetchStats()
      interval = requestInterval(10000, () => {

        const date = this.filters.date
        if(date) {
          this.getStats(date)
        }
      })
    },
    stopFetchStats() {
      if (!this._.isUndefined(interval)) {
        requestInterval.clear(interval)
      }
    },
    /**
     * Data manager work with api
     */
    async dataManager (params, from = null) {
      // console.log(params)
      if(!this._.get(this.filters, 'date')) {
        return
      }
      
      const data = {
        params: { ...params }
			}
      // console.log(data)

      await this.getBots(data)
      this.handleAfterLoaded()
    },
    setDefaultDate () {
      if(this.filters.date) {
        this.date = this.$moment(this.filters.date).format('YYYY-MM-DD')
      } else {
        this.date = this.$moment().format('YYYY-MM-DD')
      }
    },
    addClassStatus (record) {
      const sts = {
        ready: 'badge-light-secondary',
        running: 'badge-success',
        stopped: 'badge-primary'
      }
      return this._.get(sts, record.status)
    },
    getBotStatus (record) {
      const status = this._.get(record, 'status')

      return this.$t(`army.bot_status.${status}`)
    },
    getBotActionCount (record) {
      const activities = this._.get(record, 'payload.activities')
      const result = {
        like: 0,
        watch: 0,
        comment: 0
      }

      this._.each(activities, (activity) => {
        const action = activity.action
        if(this._.includes(['facebook_like'], action)) {
          result.like++
        } else if(this._.includes(['facebook_watch'], action)) {
          result.watch++
        } else if(this._.includes(['facebook_comment'], action)) {
          result.comment++
        }
      })

      return result
    },
    getActivityCode (record) {
      const activities = this._.get(record, 'payload.activities')

      const checkpoint = this._.find(activities, (activity) => {
        // const code = this._.get(activity, 'code')
        // if(activity.action === 'facebook_checkpoint') console.log(activity.action)
        // return this._.includes(['facebook_checkpoint'], activity.action)
        return this._.has(activity, 'code')
      })

      return this._.get(checkpoint, 'code')
    },
    onClickScreenshotModal (record) {
      // this.currentRecord = record
      const screenshot = this._.get(record, 'screenshot')

      if(!screenshot) {
        return
      }
      
      this.currentRecord = this._.get(record, 'ant')
      this.currentScreenshots = [screenshot]
      this.showScreenshotModal = true
    },
    onCloseScreenshotModal () {
      this.showScreenshotModal = false
    },
  },
}
</script>