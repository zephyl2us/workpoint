<template>
  <div class="card mb-3">
    <div class="card-body">
      <h4 class="card-title">สตรีม</h4>
      <div class="row">
        <div class="col-6">
          <div class="row">
            <div class="col-12 mb-2">
              <span class="font-size-sm">ชื่อไฟล์</span>
              <p>{{ _.get(record, 'source.file') }}</p>
            </div>
            <div class="col-12 mb-2">
              <span class="font-size-sm">ที่อยู่</span>
              <p>{{ _.get(record, 'source.path') }}</p>
            </div>
            <div class="col-6 mb-2">
              <span class="font-size-sm">ขนาด</span>
              <p>{{ UIRenderFileSize(_.get(sourceFormat, 'size')) }}</p>
            </div>
            <div class="col-6 mb-2">
              <span class="font-size-sm">ปริมาณข้อมูล</span>
              <p>{{ UIRenderBitRate(_.get(sourceFormat, 'bit_rate')) }}</p>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="bg-light rounded px-2 mr-2">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'MediaList',
  components: {},
  mixins: [],
  props: {},
  data () {
    return {}
  },
  computed: {
    ...mapGetters('admin-movie', [
      'record',
      'sourceFormat',
      'sourceStreams'
    ]),
    ...mapGetters('admin-movie-media', []),
  },
  watch: {
  },
  created () {},
  mounted () {},
  methods: {
    ...mapActions('admin-movie', []),
    ...mapActions('admin-movie-media', []),
  },
}
</script>