'use strict'

import { code, messages } from 'vee-validate/dist/locale/th.json'

export default {
	code,
	messages: {
		...messages,
		unique: '{_field_}นี้มีอยู่ในระบบแล้ว',
  },
  names: {
    display_name: 'ชื่อ',
    email: 'อีเมล',
    username: 'ชื่อผู้ใช้งาน',
    password: 'รหัสผ่าน',
    password_confirmation: 'ยืนยันรหัสผ่าน',
    old_password: 'รหัสผ่านปัจจุบัน',
    national_id: 'รหัสบัตรประชาชน',
    google_password: 'รหัสผ่าน Google',
    facebook_password: 'รหัสผ่าน Facebook',
    instagram_password: 'รหัสผ่าน Instagram',
    tiktok_password: 'รหัสผ่าน Tiktok',
    line_password: 'รหัสผ่าน Line',
    ref_id: 'รหัสอ้างอิง',
    phone: 'เบอร์โทรศัพท์',
    address: 'ที่อยู่',
    source_url: 'ลิ้งค์ต้นฉบับ',

    reward_1_number: 'หมายเลข',
    reward_1_name: 'ชื่อ',
    reward_2_number: 'หมายเลข',
    reward_2_name: 'ชื่อ',
    reward_3_number: 'หมายเลข',
    reward_3_name: 'ชื่อ',
  }
}