<template>
  <Modal v-if="movie.id" ref="movieMediaPlayer" :on-close="onClose" :size="'lg'" :escape-close="true">
    <template #title>
      <h5 class="modal-title">{{ _.get(movie, 'original_title') }}</h5>
    </template>
    <template #body>
      <div class="card-body">
        <!-- <video-player :src="media.url"/> -->
        <video-player :options="videoOptions" style="max-width: 100%;" />
      </div>
    </template>
  </Modal>
</template>

<script>

// import { mapGetters, mapActions, mapMutations } from 'vuex'

// import VideoPlayer from 'nuxt-video-player'

// require('nuxt-video-player/src/assets/css/main.css')
require('video.js/dist/video-js.css')

export default {
  name: 'MediaPlayerModal',
  components: {
    // VideoPlayer
  },
  mixins: [],
  props: {
    movie: {
      type: Object,
      required: true
    },
    media: {
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
      videoOptions: {
        autoplay: true,
        controls: true,
        aspectRatio: '16:9',
        sources: [
          {
            src:
              this.media.url,
              // type: 'video/mp4'
          }
        ]
      }
    }
  },
  computed: {
  },
  watch: {
  },
	beforeDestroy () {
  },
  created () {},
  mounted () {
  },
  methods: {
  },
}
</script>