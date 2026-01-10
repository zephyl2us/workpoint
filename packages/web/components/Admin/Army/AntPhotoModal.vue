<template>
  <Modal ref="antDelete" :on-close="onClose" :backdrop-close="false" :size="'lg'">
    <template #title>
      <h5 class="modal-title">
        <span class="">{{ _.get(record, 'first_name_en') }} {{ _.get(record, 'last_name_en') }}</span>
      </h5>
    </template>
      <template #body>
        <div class="modal-body">
          <div v-for="(image, i) in images" :key="`image-${i}`" class="">
            <img :src="linkImage(image)" style="max-width: 100%;">
          </div>
        </div>
      </template>
      <template #footer>
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary ml-auto" 
            @click="onClose">
            <span>ปิด</span>
          </button>
        </div>
      </template>
  </Modal>
</template>

<script>
// import { mapGetters } from 'vuex'

export default {
  name: 'AntPhotoModal',
  components: {},
  mixins: [],
  props: {
    record: {
      type: Object,
      required: true
    },
    images: {
      type: Array,
      required: true
    },
    onClose: {
      type: Function,
      required: true
    },
  },
  data () {
    return {}
  },
  computed: {
  },
  watch: {
  },
  created () {},
  mounted () {
  },
  methods: {
  },
}
</script>