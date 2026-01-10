<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`army.bot_monitor`) }}</h3>
      <div class="header-action">
        <template v-if="hasPermission('army.bot.control')">
          <button v-if="!isAutomation" class="btn btn-success ml-2" @click="onClickStartBotModal()">
            <i class="fa-solid fa-play mr-2"></i>
            <span>เริ่มระบบอัตโนมัติ</span>
          </button>
          <button v-else class="btn btn-danger ml-2" @click="onClickStopBotModal()">
            <i class="fa-solid fa-stop mr-2"></i>
            <span>หยุดระบบอัตโนมัติ</span>
          </button>
        </template>
        <!-- <NuxtLink
            v-if="hasPermission('army.ant.create')"
            :to="linkTo(`/army/ant/create`)" 
            class="btn btn-primary">
          <i class="icon fa-duotone fa-ant-plus mr-2"></i>
          <span>{{ $t(`army.ant_create`) }}</span>
        </NuxtLink> -->
      </div>
    </header>
    <div class="app__body app__body-fluid">
      <div class="ant__bot">
        <div v-bar class="left-content">
          <div class="">
            <ul class="bot-list">
              <li 
                class="bot-item"
                :class="[addClassBotActive(null)]"
                @click="onClickBot(null)">
                <div class="w-100 text-center py-1">
                  <h6 class="font-weight-bolder">แสดงทั้งหมด</h6>
                </div>
              </li>
              <li 
                v-for="record in activeRecords" 
                :key="`bot-${record.id}`" 
                class="bot-item"
                :class="[addClassBotActive(record.id)]"
                @click="onClickBot(record.id)">
                <UserAvatar style="min-width: 40px;"></UserAvatar>
                <div class="w-100 ml-2">
                  <div class="d-flex">
                    <div class="">
                      {{ _.get(record, 'ant.first_name') }} 
                      {{ _.get(record, 'ant.last_name') }} 
                    </div>
                    <div class="ml-auto">
                      <small class="text-mute">#{{ _.get(record, 'ant.id') }}</small>
                    </div>
                  
                  </div>
                  <div class="d-flex">
                    <small class="mr-2">
                      <i class="fa-regular fa-heart text-danger"></i>
                      <span class="font-family-numeral">{{ getBotActionCount(record).like }}</span>
                    </small>
                    <small class="mr-2">
                      <i class="fa-regular fa-video text-info"></i>
                      <span class="font-family-numeral">{{ getBotActionCount(record).watch }}</span>
                    </small>
                    <small class="">
                      <i class="fa-regular fa-comment text-success"></i>
                      <span class="font-family-numeral">{{ getBotActionCount(record).comment }}</span>
                    </small>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div v-bar class="right-content">
          <div ref="botActivity" class="">
            <ul class="activity-list">
              <template v-for="(activity, index) in botActivities" >
                <li 
                  v-if="getBotByActivity(activity)"
                  :key="`activity-${index}`" 
                  class="activity-item" 
                  :class="[]">
                  <div class="d-flex flex-column w-100 font-size-sm">
                    <div>
                      <span v-if="_.eq('adspower_start', activity.action)" class="badge badge-success">Start</span>
                      <span v-else-if="_.eq('adspower_stop', activity.action)" class="badge badge-secondary">Stop</span>
                      <span v-else-if="_.includes(['facebook_checkpoint'], activity.action)" class="badge badge-danger">Checkpoint</span>
                      <span 
                        v-else-if="_.includes(['facebook_like', 'facebook_watch', 'facebook_comment'], activity.action)" 
                        class="text-facebook">
                        <i class="fa-brands fa-facebook"></i>
                        <i v-if="_.eq('facebook_like', activity.action)" class="fa-solid fa-heart text-danger"></i>
                        <i v-if="_.eq('facebook_watch', activity.action)" class="fa-solid fa-video text-info"></i>
                        <i v-if="_.eq('facebook_comment', activity.action)" class="fa-solid fa-comment text-success"></i>
                      </span>
                      <span v-else>{{ activity.action }}</span>
                      <span class="">#{{ getAntIdByActivity(activity) }}:{{ _.get(activity, 'army_ant_bot_id') }}</span>
                      <span class="text-muted">|</span>
                      <span class="">{{ _.get(getBotByActivity(activity), 'proxy') }}</span>
                      <span class="text-muted">|</span>
                      <span class="">{{ _.get(getBotByActivity(activity), 'server') }}</span>
                    </div>
                    <div class="text-muted">
                      <span class="">{{ _.get(activity, 'url') }}</span>
                    </div>
                  </div>
                  <div class="ml-auto text-right" style="min-width: 60px">
                    <small class="text-muted">{{ $moment(activity.timestamp).format('HH:mm:ss') }}</small>
                  </div>
                    <div v-if="_.eq(activity, 'facebook_like')" class="">

                    </div>
                  <!-- {{ activity }} -->
                </li>
              </template>
            </ul>
            <div ref="activityBottom"></div>
          </div>
        </div>
      </div>
    </div>
    <BotStartModal v-if="showStartBotModal" :on-close="onCloseStartBotModal"></BotStartModal>
    <BotStopModal v-if="showStopBotModal" :on-close="onCloseStopBotModal"></BotStopModal>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'

import BotStartModal from '~/components/Admin/Army/BotStartModal'
import BotStopModal from '~/components/Admin/Army/BotStopModal'

import fetchMixin from '~/mixins/fetch'

export default {
  name: 'ArmyAnt',
  components: {
    BotStartModal,
    BotStopModal
  },
  mixins: [fetchMixin],
  layout: 'admin',
  props: {},
  data () {
    return {
      // date: null,
      showStartBotModal: false,
      showStopBotModal: false,
      currentBotId: null
    }
  },
  computed: {
    ...mapGetters('admin-army-bot-monitor', [
      'records',
      'activities',
      'isAutomation',
      'limit',
      // 'records',
      // 'pagination'
    ]),
    activeRecords () {
      let records = this._.cloneDeep(this.records)

      records = this._.filter(records,  (record) => this._.includes(['ready', 'running'], record.status))

      // const orderRecords = this._.orderBy(records, ['created_at'], ['asc'])

      return records
    },
    botActivities () {
      const botId = this._.clone(this.currentBotId)

      let activities = this._.cloneDeep(this.activities)
      // activities = this._.orderBy(activities, ['timestamp'], ['desc'])

      if(botId) {
        activities = this._.filter(activities, (activity) => this._.eq(activity.army_ant_bot_id, botId))
      } else {
        activities = this._.slice(activities, 0, 100)
      }

      return activities
    }
  },
  watch: {
    'activeRecords': {
      handler (records) {
        console.log(`activeRecords`, records)
        const botId = this.currentBotId
        if(botId) {
          const activeRecords = this._.cloneDeep(records)
          const index = this._.findIndex(activeRecords, ['id', botId])

          if(index === -1) {
            this.currentBotId = null
          }
        }
      },
      deep: true
    },
    // 'botActivities': {
    //   handler (records) {
    //     this.activityScroll()
    //   },
    //   immediate: true,
    //   deep: true
    // }
  },
	beforeDestroy () {
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

    channel.bind('activity-update', (data) => {
      this.receiveUpdateActivity(data)
    })
  },
  methods: {
    ...mapMutations('admin-army-bot-monitor', [
      'receiveCreateBot',
      'receiveUpdateBot',
      'receiveUpdateActivity'
    ]),
    ...mapActions('admin-army-bot-monitor', [
      'getBot'
    ]),

    getBotByActivity (activity) {
      const botId = this._.get(activity, 'army_ant_bot_id')

      const records = this._.cloneDeep(this.records)
      const index = this._.findIndex(records, ['id', botId])

      if(index === -1) {
        return false
      }

      const bot = records[index]
      return bot
    },

    getBotProxyByActivity (activity) {
      const bot = this.getBotByActivity(activity)
      return this._.get(bot, 'proxy')
    },

    getAntIdByActivity (activity) {
      const bot = this.getBotByActivity(activity)
      return this._.get(bot, 'ant.id')
    },

    getBotActionCount (record) {
      const botId = this._.get(record, 'id')

      const activities = this._.cloneDeep(this.activities)
      const index = this._.findIndex(activities, ['army_ant_bot_id', botId])

      const result = {
        like: 0,
        watch: 0,
        comment: 0
      }

      if(index === -1) {
        return result
      }

      this._.each(activities, (activity) => {
        if(!this._.eq(botId, activity.army_ant_bot_id)) {
          return true
        }

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


    /**
     * Data manager work with api
     */
    async dataManager (params, from = null) {
      await this.getBot(params)
      this.handleAfterLoaded()
    },
    onClickBot (value) {
      console.log(`onClickBot`, value)
      this.currentBotId = value
    },
    addClassBotActive (value) {
      return this._.eq(this.currentBotId, value) ? 'active' : ''
    },
    activityScroll () {
      console.log(`activityScroll`)
      const el = this.$refs.activityBottom
      if(el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    },

    onClickStartBotModal () {
      this.showStartBotModal = true
    },
    onCloseStartBotModal () {
      this.showStartBotModal = false
    },

    onClickStopBotModal () {
      this.showStopBotModal = true
    },
    onCloseStopBotModal () {
      this.showStopBotModal = false
    },
  },
}
</script>