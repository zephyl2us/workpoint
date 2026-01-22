<template>
  <div 
    ref="containerRef"
    class="slide-container" 
    :class="{ 'unlocked': isUnlocked }"
  >
    <div 
      class="slide-fill" 
      :class="{ 'no-transition': isDragging }"
      :style="{ width: (position + 25) + 'px' }"
    ></div>

    <div class="slide-text">{{ isUnlocked ? successText : text }}</div>

    <div 
      class="slide-handler" 
      :class="{ 'no-transition': isDragging }"
      :style="{ left: (position - 1) + 'px' }"
      @mousedown="startDrag"
      @touchstart="startDrag"
    >
      <span v-if="isUnlocked"><i class="fa-sharp-duotone fa-solid fa-phone"></i></span>
      <span v-else><i class="fa-sharp-duotone fa-solid fa-phone"></i></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SlideUnlock',
  props: {
    text: { type: String, default: 'เลื่อนเพื่อโทร' },
    successText: { type: String, default: 'กำลังโทร...' },
    threshold: { type: Number, default: 0.9 },
    // 1. เพิ่ม Prop สำหรับรับคำสั่ง Reset
    resetTrigger: { type: Boolean, default: false }
  },
  data() {
    return {
      isDragging: false,
      isUnlocked: false,
      position: 0,
      maxSlide: 0
    }
  },
  // 2. เพิ่ม Watcher เพื่อดักจับค่า resetTrigger
  watch: {
    resetTrigger(newVal) {
      if (newVal === true) {
        this.reset()
      }
    }
  },
  mounted() {
    window.addEventListener('mousemove', this.onDrag)
    window.addEventListener('mouseup', this.stopDrag)
    window.addEventListener('touchmove', this.onDrag)
    window.addEventListener('touchend', this.stopDrag)
  },
  beforeDestroy() {
    window.removeEventListener('mousemove', this.onDrag)
    window.removeEventListener('mouseup', this.stopDrag)
    window.removeEventListener('touchmove', this.onDrag)
    window.removeEventListener('touchend', this.stopDrag)
  },
  methods: {
    startDrag(e) {
      if (this.isUnlocked) return
      this.isDragging = true
      // คำนวณความกว้างใหม่ทุกครั้งที่เริ่มลาก เผื่อหน้าจอมีการ resize
      this.maxSlide = this.$refs.containerRef.clientWidth - 50
    },
    onDrag(e) {
      if (!this.isDragging || this.isUnlocked) return
      
      let clientX
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX
      } else {
        clientX = e.clientX
      }

      const containerRect = this.$refs.containerRef.getBoundingClientRect()
      let newPos = clientX - containerRect.left - 25
      
      if (newPos < 0) newPos = 0
      if (newPos > this.maxSlide) newPos = this.maxSlide
      
      this.position = newPos
    },
    stopDrag() {
      if (!this.isDragging || this.isUnlocked) return
      this.isDragging = false

      if (this.position / this.maxSlide > this.threshold) {
        this.position = this.maxSlide
        this.isUnlocked = true
        this.$emit('unlock')
      } else {
        this.position = 0
      }
    },
    reset() {
      console.log('SlideUnlock: Resetting...')
      this.isUnlocked = false
      this.position = 0
      this.isDragging = false
    }
  }
}
</script>

<style scoped>
.slide-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 50px;
  background: #e5e7eb;
  border-radius: 25px;
  user-select: none;
  margin: 0 auto;
}

.slide-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #10b981;
  border-radius: 25px 0 0 25px;
  opacity: 0.8;
  transition: width 0.3s ease-out;
  z-index: 1; 
}

.slide-text {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563; 
  font-weight: bold;
  font-size: 14px; /* ปรับขนาดตัวอักษรให้อ่านง่ายขึ้นนิดหน่อยครับ */
  letter-spacing: 0.5px;
  pointer-events: none;
  z-index: 2; 
}

.slide-handler {
  position: absolute;
  top: 0;
  left: 0;
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 2px 0 5px rgba(0,0,0,0.2);
  transition: left 0.3s ease-out;
  z-index: 3; 
}

.no-transition {
  transition: none !important;
}

.unlocked .slide-handler {
  background: #10b981;
  color: white;
}
.unlocked .slide-text {
  color: white; 
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
</style>