'use strict'

export default {
  success: {
    staff_created: 'สร้างผู้ดูแลระบบสำเร็จ',
    staff_updated: 'บันทึกข้อมูลผู้ดูแลระบบสำเร็จ',
    lottery_category_updated: 'บันทึกข้อมูลสำเร็จ',
    lottery_zone_rate_updated: 'บันทึกอัตราจ่ายสำเร็จ',
    army_ant_created: 'สร้างกองทัพมดสำเร็จ',
    army_ant_updated: 'บันทึกข้อมูลกองทัพมดสำเร็จ',
    army_ant_deleted: 'ลบข้อมูลกองทัพมดสำเร็จ',
    password_changed: 'เปลี่ยนรหัสผ่านสำเร็จ'
  },
  error: {
    nothing_update: 'ไม่มีข้อมูลอัพเดท',
    account: {
      invalid_password: 'รหัสผ่านไม่ถูกต้อง',
      password_is_same_old: 'รหัสผ่านใหม่เหมือนรหัสผ่านปัจจุบัน'
    },
    army: {
      create_failed: 'ไม่สามารถสร้างน้องมดได้',
      create_farm_failed: 'ไม่สามารถส่งข้อมูลไปยังฟาร์มได้',
      cannot_send_to_cloud: 'ไม่สามารถย้ายไปยังคลาวด์ได้'
    }
  }
}