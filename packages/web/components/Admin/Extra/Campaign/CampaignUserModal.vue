<template>
  <Modal v-if="user.id" ref="campaignUser" :on-close="onClose" :size="'sm'" :escape-close="true">
    <template #title>
      <h5 class="modal-title">โทรศัพท์</h5>
    </template>
    <template #body>
      <form>
        <div class="modal-body">
          <div class="d-flex flex-column align-items-center">
            <div class="av av-6 mb-3">
              <i class="av-icon fas fa-user"></i>
            </div>
            
            <h3>คุณ{{ user.first_name }} {{ user.last_name }}</h3>
            <div v-if="hasPermission('extra.campaign.create') || _.eq(user.actor_user_id, authUser.id)">เครดิตคงเหลือ : 
              <strong>{{ UIRenderNumber(_.get(user, 'payload.credit'), '0,0.00') }}</strong>
              <strong v-if="parseFloat(_.get(user, 'payload.revenue')) > 0"> | {{ UIRenderNumber(_.get(user, 'payload.revenue'), '0,0.00') }}</strong>
            </div>

            <div class="mb-3"></div>
            
            <!-- <p class="text-muted mb-2">{{ targetNumber || 'ไม่ระบุเบอร์โทร' }}</p> -->

            <div v-if="_.eq('waiting', user.status)" class="d-flex align-items-center mb-4" style="height: 29.5px;">
              <span :class="statusColor" style="font-weight: bold;"></span>
            </div>

            <select 
              v-else-if="_.includes(['ready_to_call', 'call_ended'], statusMessage)"
              v-model="input.user_status"
              class="form-control form-control-sm text-center mb-4"
              style="width: auto;">
              <option v-for="status in statuses" :key="`status-${status}`" :value="status">{{ $t(`extra.campaign_status.${status}`) }}</option>
            </select>

            <div v-else class="d-flex align-items-center mb-4" style="height: 29.5px;">

              <span v-if="timerInterval" class="text-success font-weight-bold" style="font-size: 1.2em;">
                {{ callDuration }}
              </span>
              
              <span v-else-if="activeSession" class="text-warning font-weight-bold">
                <i class="fas fa-spinner fa-spin mr-1"></i> {{ statusMessage }}
              </span>

              <span v-else :class="statusColor" style="font-weight: bold;">
                {{ statusMessage }}
              </span>
            </div>

            <button 
              v-if="activeSession" 
              type="button"
              class="btn btn-lg btn-danger rounded-circle" 
              style="height: 50px; width: 50px;"
              @click="endCall"
            >
              <i class="fa-sharp-duotone fa-solid fa-phone-hangup"></i>
            </button>

            <SlideUnlock 
              v-if="!activeSession && isRegistered"
              :reset-trigger="isReset"
              text="เลื่อนเพื่อโทร"
              success-text="กำลังโทร..."
              @unlock="onCall"
            />

            <button 
              v-if="!isRegistered && !activeSession"
              type="button"
              class="btn btn-sm btn-outline-primary mt-2"
              :disabled="isConnecting"
              @click="connectPhone"
            >
              <i class="fas fa-sync" :class="{'fa-spin': isConnecting}"></i> 
              {{ isConnecting ? 'Connecting...' : 'Click to Connect System' }}
            </button>

          </div>
          <audio ref="remoteAudio" autoplay style="display: none;"></audio>
        </div>
        <div v-if="canSendSms" class="modal-body border-top">

          <button type="button" class="btn btn-success mx-auto" @click="onSendSms">
            <i class="fa-regular fa-message-lines mr-1"></i>
            <span class="">ส่งข้อความ</span>
          </button>
        </div>
      </form>
    </template>
  </Modal>
</template>

<script>
import _ from 'lodash'
import { mapGetters, mapActions } from 'vuex'
import formMixin from '~/mixins/form'
import SlideUnlock from '~/components/Admin/Extra/Campaign/SlideUnlock'

// 1. ประกาศตัวแปร Global Scope ไว้สำหรับเก็บ Class ของ SIP.js
// เพื่อเลี่ยงปัญหา Server-Side Rendering (SSR) Error
let UserAgent, Inviter, SessionState, RegistererState, Registerer

export default {
  name: 'CampaignUserModal',
  components: {
    SlideUnlock
  },
  mixins: [formMixin],
  props: {
    record: {
      type: Object,
      required: true
    },
    onClose: {
      type: Function,
      required: true
    },
  },
  data () {
    return {
      formRef: 'editMovie',
      refId: null,
      input: {
        user_status: 'waiting',
        sms_type: ''
      },
      user: {
        status: null
      },
      sms: {

      },
      statuses: ['calling', 'answered', 'no_answer', 'rejected', 'unreachable'],
      
      // --- SIP Configuration ---
      sipConfig: {
        uri: 'sip:1002@pbx.onewg.net',
        wsServer: 'wss://pbx.onewg.net:8089/ws',
        username: '1002',
        password: 'b55b3ddf1be9300244a5232eb10976ed'
      },
      
      userAgent: null,
      activeSession: null,
      
      // UI State
      statusMessage: 'loading_system',
      isConnecting: false,
      isRegistered: false,
      isLibraryLoaded: false,
      targetNumber: '',
      callDuration: '00:00',
      callSeconds: 0,
      timerInterval: null,
      isReset: false
    }
  },
  computed: {
    ...mapGetters('admin-extra-campaign', [
      'users',
      'responseSuccess',
      'responseError'
    ]),
    statusColor () {
      if (this.activeSession) return 'text-success'; // Bootstrap class
      if (this.isRegistered) return 'text-primary'
      if (this.statusMessage.includes('failed')) return 'text-danger'
      return 'text-muted'
    },
    canSendSms () {
      return !this._.includes(['waiting', 'calling'], this.user.status)
    }
  },
  watch: {
    // 'user': {
    //   handler (response) {
    //     // console.log(response)
    //     this.setDefault()
    //   },
    //   deep: true
    // },
    'user.status': {
      handler (response) {
        // console.log(response)
        // this.setDefault()
      },
    },
    'input.user_status': {
      handler (value) {
        // console.log(value)
        this.updateUserStatus(value)
      }
    },
    'statusMessage': {
      handler (value) {
        console.log(value)
      }
    },
    'responseSuccess': {
      handler (response) {
        
        this.isReset = true
        setTimeout(() => {
          this.isReset = false
        }, 100)
        
        if (response.status === 'success') {
          // Logic เมื่อ Save สำเร็จ

        }
      }
    },
    'responseError': {
      handler (response) {
        console.log(`error:`, response)
        this.onClose()
      }
    },
  },
  async beforeDestroy() {
    this.$pusher.unsubscribe(`campaign-user.${this.refId}`)
    this.stopTimer(); // <-- เพิ่มบรรทัดนี้
    
    if (this.userAgent) {
      console.log('Stopping SIP Connection...')
      
      // คำสั่งนี้จะทำ 2 อย่างพร้อมกัน:
      // 1. ส่งสัญญาณ Unregister ไปบอก Server ว่า "ฉันไม่อยู่แล้วนะ"
      // 2. ปิด WebSocket Connection
      await this.userAgent.stop(); 
      
      this.userAgent = null
      this.isRegistered = false
      this.statusMessage = 'disconnected'
    }
  },
  async mounted () {
    this.setDefault()
    this.refId = this.user.id

    const channel = this.$pusher.subscribe(`campaign-user.${this.refId}`)

    channel.bind('update', (data) => {
      if (this._.has(data, 'payload')) {
        data.payload = !_.isObject(data.payload) ? JSON.parse(data.payload) : data.payload
      }
      // console.log(data)
      this.user = data
    })

    this.targetNumber = this.user.phone || this.user.mobile
    
    try {
      const sip = await import('sip.js')
      UserAgent = sip.UserAgent
      Inviter = sip.Inviter
      SessionState = sip.SessionState
      RegistererState = sip.RegistererState
      Registerer = sip.Registerer

      this.isLibraryLoaded = true
      // console.log('SIP Library Loaded')
      
      // Auto Connect ทันทีที่เปิด Modal
      this.connectPhone()

    } catch (error) {
      console.error('Failed to load SIP library', error)
      this.statusMessage = 'cannot_load_sip'
    }
  },
  methods: {
    ...mapActions('admin-extra-campaign', [
      'updateStatus',
      'sendSms'
    ]),

    setDefault () {
      const record = this._.cloneDeep(this.record)
      this.user = record
      this.input.user_status = record.status
    },

    async updateUserStatus (status, isCalling = false) {
      // console.log(this.record)
      if (this.user.status === status) return false

      await this.updateStatus({
        id: this._.get(this.user, 'campaign_id'),
        user_id: this._.get(this.user, 'id'),
        status,
        is_calling: isCalling
      })
    },

    async onCall () {
      await this.updateUserStatus('calling', true)
      // console.log('Unlock -> Calling')
      this.makeCall()
    },

    onSendSms: _.debounce(function () {
      this.submitting()
      // Submit Logic...

      const regex = /^(?:นางสาว|นาย|นาง|น\.ส\.)\s*/

      let name = this._.get(this.user, 'first_name')
      name = name.replace(regex, '')
      name = `คุณ${name}`

      const input = {
        id: this._.get(this.user, 'campaign_id'),
        user_id: this._.get(this.user, 'id'),
        mobile: this.user.mobile,
        message: `${name} สามารถติดต่อย้ายข้อมูลไปยังระบบใหม่พร้อมรับโปรโมชั่นได้ที่ ไลน์ไอดี : @one.transfer`
      }

      console.log(input)

      this.sendSms(input)

    }, 5000, { leading: true }),

    async connectPhone() {
      if (!this.isLibraryLoaded) return
      
      this.isConnecting = true
      this.statusMessage = 'connecting'

      try {
        this.userAgent = new UserAgent({
          uri: UserAgent.makeURI(this.sipConfig.uri),
          transportOptions: {
            server: this.sipConfig.wsServer
          },
          authorizationUsername: this.sipConfig.username,
          authorizationPassword: this.sipConfig.password,
          sessionDescriptionHandlerFactoryOptions: {
            peerConnectionOptions: {
              rtcConfiguration: {
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
              }
            }
          }
        })

        await this.userAgent.start()
        this.statusMessage = 'registering'

        const registerer = new Registerer(this.userAgent)
        
        registerer.stateChange.addListener((newState) => {
          if (newState === RegistererState.Registered) {
            this.isRegistered = true
            this.isConnecting = false
            this.statusMessage = 'ready_to_call'
          }
        })

        await registerer.register()

      } catch (error) {
        console.error('Connection Failed:', error)
        this.statusMessage = 'connection_failed'
        this.isConnecting = false
      }
    },

    makeCall() {
      if (!this.userAgent || !this.targetNumber) {
        alert('System not ready or Invalid number')
        return
      }

      const targetURI = UserAgent.makeURI(`sip:${this.targetNumber}@${this.userAgent.configuration.uri.host}`)
      if (!targetURI) {
        alert('Invalid target number format')
        return
      }

      const inviter = new Inviter(this.userAgent, targetURI)
      this.activeSession = inviter
      this.setupSessionHandlers(inviter)

      inviter.invite()
        .then(() => {
          this.statusMessage = 'calling'
        })
        .catch((error) => {
          console.error('Call failed', error)
          this.statusMessage = 'call_failed'
          this.activeSession = null
        })
    },

    endCall() {
      if (!this.activeSession) return

      switch (this.activeSession.state) {
        case SessionState.Established:
          this.activeSession.bye()
          break
        case SessionState.Establishing:
          this.activeSession.cancel()
          break
        default:
          // ถ้า State อื่นๆ อาจจะใช้ dispose หรือปล่อยให้ event จัดการ
          break
      }
    },

    setupSessionHandlers(session) {
      session.stateChange.addListener((newState) => {
        // 1. สถานะกำลังโทร/รอสาย (Ringing)
        if (newState === SessionState.Establishing) {
          this.statusMessage = 'ringing'; 
          // ❌ ห้ามใส่ this.startTimer() ตรงนี้เด็ดขาด
        }

        // 2. สถานะรับสายแล้ว (Answered)
        else if (newState === SessionState.Established) {
          this.statusMessage = 'connected';
          
          // ✅ ใส่ตรงนี้ครับ! นาฬิกาจะเริ่มเดินวินาทีนี้
          this.startTimer(); 
          
          // เล่นเสียง
          const remoteStream = session.sessionDescriptionHandler.peerConnection.getRemoteStreams()[0];
          if (this.$refs.remoteAudio) {
            this.$refs.remoteAudio.srcObject = remoteStream;
            this.$refs.remoteAudio.play();
          }
        } 
        
        // 3. สถานะวางสาย (Ended)
        else if (newState === SessionState.Terminated) {
          this.statusMessage = 'call_ended';
          this.activeSession = null;
          this.stopTimer(); // หยุดนับทันที
        }
      });
    },
    
    startTimer() {
      this.stopTimer()
      this.callSeconds = 0
      this.callDuration = '00:00'
      
      this.timerInterval = setInterval(() => {
        this.callSeconds++
        
        // แปลงวินาที เป็น MM:SS
        const mins = Math.floor(this.callSeconds / 60).toString().padStart(2, '0')
        const secs = (this.callSeconds % 60).toString().padStart(2, '0')
        
        this.callDuration = `${mins}:${secs}`
      }, 1000)
    },

    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },
  },
}
</script>

<style scoped>
.text-green { color: #28a745; font-weight: bold; }
.text-blue { color: #007bff; }
.text-gray { color: #6c757d; }
.text-danger { color: #dc3545; }
</style>