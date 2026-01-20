// plugins/sip.client.js
import Vue from 'vue'
import { UserAgent } from 'sip.js'

// สร้าง Global method หรือ Inject เข้า Vue prototype
// เพื่อให้เรียกใช้ได้ทั่วแอพผ่าน this.$sip
const SipService = {
  ua: null,
  
  init(config) {
    // Config เบื้องต้นเชื่อมต่อกับ WebRTC Gateway (เช่น Asterisk)
    this.ua = new UserAgent({
      uri: UserAgent.makeURI(config.uri), // เช่น 'sip:extension@your-pbx.com'
      transportOptions: {
        server: config.wsServer // เช่น 'wss://your-pbx.com:8089/ws'
      },
      authorizationPassword: config.password,
      authorizationUsername: config.username,
    });

    return this.ua;
  },
  
  start() {
    if(this.ua) this.ua.start();
  },
  
  // ฟังก์ชันโทรออก
  call(target) {
    if(!this.ua) return;
    const targetURI = UserAgent.makeURI(target);
    return this.ua.invite(targetURI);
  }
}

// Inject เข้าไปใน context ของ Nuxt
export default ({ app }, inject) => {
  inject('sip', SipService)
}