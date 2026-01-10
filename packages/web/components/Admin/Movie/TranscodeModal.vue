<template>
  <Modal v-if="movie.id" ref="movieTranscode" :on-close="onClose" :size="'lg'" :escape-close="true">
    <template #title>
      <h5 class="modal-title">แปลงไฟล์ - {{ _.get(movie, 'original_title') }}</h5>
    </template>
    <template #body>
      <div class="card-body">
        <div class="row mb-2">
          <div class="col-12 mb-2">
            <span class="font-size-sm">วิดีโอ</span>
            <p>{{ _.get(record, 'source.path') }}</p>
            <p>{{ _.get(record, 'source.file') }}</p>
          </div>
          <div class="col-4 mb-2">
            <span class="font-size-sm">ขนาดไฟล์</span>
            <p>{{ UIRenderFileSize(_.get(sourceFormat, 'size')) }}</p>
          </div>
          <div class="col-4 mb-2">
            <span class="font-size-sm">ปริมาณข้อมูล</span>
            <p>{{ UIRenderBitRate(_.get(sourceFormat, 'bit_rate')) }}</p>
          </div>
          <div class="col-4 mb-2">
            <span class="font-size-sm">ความยาว</span>
            <p>{{ _.get(sourceFormat, 'duration') }} วินาที</p>
          </div>
          <div class="col-4 mb-2">
            <span class="font-size-sm">การบีบอัด</span>
            <p>{{ _.get(video, 'codec_name') }}</p>
          </div>
          <div class="col-4 mb-2">
            <span class="font-size-sm">ความละเอียด</span>
            <p>{{ sourceResolution }}</p>
          </div>
          <div class="col-4 mb-2">
            <span class="font-size-sm">ภาพต่อวินาที</span>
            <p>{{ UIRenderNumber(sourceFrameRate) }}</p>
          </div>
        </div>

        <div class="row">
          <div v-for="(audio, index) in audios" :key="`audio-${audio.audio_index}`" class="col-6 mb-2">
            <div 
              class=" bg-light border rounded px-3 py-2"
              :class="[addClassAudioSelect(audio)]">
              <div 
                class="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <div>
                    <span class="text-dark">[{{ _.toUpper(_.get(audio, 'tags.language')) }}]</span>
                    <span class="">{{ _.get(audio, 'tags.title') }}</span>
                  </div>
                  <div>
                    <span>{{ _.toUpper(_.get(audio, 'codec_name')) }}</span>
                    <span>{{ _.get(audio, 'channel_layout') }}</span>
                    <span>{{ getAudioBitRate(audio) }}</span>
                  </div>
                </div>
                <span
                  v-if="getTranscodeAudioIndex(audio) === -1"
                  class="badge badge-light-secondary cursor-pointer"
                  style="width: 18px"
                  @click="onClickAudio(audio, index)">
                  <i class="fa-regular fa-plus"></i>
                </span>
                <span 
                  v-else
                  class="badge badge-primary font-numeral"
                  style="width: 18px"
                  @click="onClickAudio(audio, index)">{{ getTranscodeAudioIndex(audio) + 1 }}</span>
              </div>
              <div>
              <!-- <div v-if="getTranscodeAudioIndex(audio) !== -1"> -->
                <select class="form form-control form-control-sm" :disabled="isAudioSelect(audio) ? 'disabled' : false" @change="onChangeLanguage($event, index)">
                  <option 
                    v-if="!isAudioSupport(index)"
                    :value="_.get(audio, 'tags.language')"
                    :selected="isLanguageSelect(index)">{{ _.toUpper(_.get(audio, 'tags.language')) }}</option>
                  <option 
                    v-for="lang in supportLanguages" 
                    :key="`audio-${audio.audio_index}-${lang}`"
                    :value="lang"
                    :selected="isLanguageSelect(index, lang)">{{ _.toUpper(lang) }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th width="90" class="pl-3">คุณภาพ</th>
              <th width="">รายละเอียด</th>
              <th width="120"></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="resolution in resolutions">
              <tr :key="`resolution-${resolution.key}`">
                <td>{{ $t(`movie.resolutions.${resolution.key}`) }}</td>
                <template v-if="hasMedia(resolution)">
                  <template v-if="getMedia(resolution).status == 'completed'">
                    <td>Completed</td>
                    <td></td>
                  </template>
                  <template v-else-if="getMedia(resolution).status == 'transcoding'">
                    <td>
                      <div class="progress" style="height: 5px;">
                        <div class="progress-bar probress-bar-trans" :style="addTranscodePercentStyle(resolution)"></div>
                      </div>
                      <div class="d-flex justify-content-between" style="margin-bottom: -12px;">
                        <small class="">{{ _.toLower(getTranscodeInfo(resolution, 'server')) }}&nbsp;</small>
                        <small v-if="getTranscodeInfo(resolution, 'frames')" class="">
                          <span>{{ getTranscodeInfo(resolution, 'currentFps') }}fps</span> /
                          <span>{{ UIRenderNumber(getTranscodeInfo(resolution, 'currentKbps'), '0,0') }}Kbps</span> /
                          <span>{{ getTranscodeTime(resolution) }}</span>
                        </small>
                      </div>
                    </td>
                    <td></td>
                  </template>
                  <template v-else-if="getMedia(resolution).status == 'queuing'">
                    <td>Queuing</td>
                    <td></td>
                  </template>
                  <template v-else>
                    <td>Error</td>
                    <td></td>
                  </template>
                </template>
                <template v-else>
                  <td></td>
                  <td>
                    <ConfirmOrCancel 
                      v-if="isTranscodeSupport(resolution)" 
                      :size="'sm'" 
                      :min-width="34" 
                      :confirm-html="'ยืนยัน'" 
                      :on-confirm="onTranscodeMovie" 
                      :can-confirm="canTranscode"
                      :confirm-data="{ id: record.id, resolution: resolution.key }">
                      <template #button="{ onClick }">
                        <button class="btn btn-sm btn-light-secondary" :disabled="!canTranscode" @click="onClick">แปลงไฟล์</button>
                      </template>
                    </ConfirmOrCancel>
                  </td>
                </template>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </template>
  </Modal>
</template>

<script>

import { mapGetters, mapActions, mapMutations } from 'vuex'

export default {
  name: 'TranscodeModal',
  components: {},
  mixins: [],
  props: {
    movie: {
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
      videoFormats: ['h264'],
      audioFormats: ['dts', 'ac3', 'aac'],
      transcodeAudios: [],
      supportLanguages: [
        'tha',
        'eng',
        'jpn',
        'kor',
      ],
      audioLanguages: []
    }
  },
  computed: {
    ...mapGetters('admin-movie', [
      'record',
      'sourceFormat',
      'sourceStreams',
      'medias'
    ]),
    ...mapGetters('admin-movie-media', [
      'resolutions',
      'transcodeProgress',
      'responseSuccess',
      'responseError'
    ]),
    video () {
      return this._.first(this._.filter(this.sourceStreams, ['codec_type', 'video']))
    },
    audios () {
      const filterAudios = this._.filter(this.sourceStreams, ['codec_type', 'audio'])

      const audios = []
      this._.each(filterAudios, (audio, index) => {
        let language = this._.get(audio, 'tags.language')
        const title = this._.get(audio, 'tags.title')

        if(!language && (/^Thai/.test(title))) {
          // console.log('set to tha')
          language = 'tha'
          audio.tags.language = language
        }

        if(this._.eq('tha', language)) {
          // console.log('2')
          audios.push(this._.assign({}, audio, {
            audio_index: index
          }))
        }
      })

      this._.each(filterAudios, (audio, index) => {
        let language = this._.get(audio, 'tags.language')
        const title = this._.get(audio, 'tags.title')

        if(!language && (/^Eng/.test(title))) {
           language = 'eng'
           audio.tags.language = language
        }

        if(!this._.eq('tha', language)) {
          audios.push(this._.assign({}, audio, {
            audio_index: index
          }))
        }
      })

      return audios
    },
    sourceResolution () {
      const width = this._.get(this.video, 'width')
      const height = this._.get(this.video, 'height')

      return `${width}x${height}`
    },
    sourceFrameRate () {
      const avgFrameRate = this._.get(this.video, 'avg_frame_rate')

      const splitFrameRate = this._.split(avgFrameRate, '/')
      
      if(this._.size(splitFrameRate) !== 2) {
        return '-'
      }

      const frameRate = parseInt(splitFrameRate[0]) / parseInt(splitFrameRate[1])
      return frameRate
    },
    canTranscode () {
      return !!this._.size(this.transcodeAudios)
    },
    mediaIds () {
      return this._.map(this.medias, (media) => media.id)
    }
  },
  watch: {
    'audios': {
      handler (data) {
        console.log(data)
        this.audioLanguages = this._.map(data, (audio) => {
          const language = this._.get(audio, 'tags.language')
          return {
            default_language: language,
            language
          }
        })
      }
    },
    'responseSuccess': {
      handler (response) {
        this.receiveMovieMedia(response)
      }
    }
  },
	beforeDestroy () {
    this.$pusher.unsubscribe(`movie.media`)
  },
  created () {},
  mounted () {
		this.refId = this.movie.id
		this.fetchRecord()
    this.clearMediaProgress()

    const channel = this.$pusher.subscribe(`movie.media`)

    channel.bind('transcode-progress', (data) => {
      // console.log(`progress`, data)
      if(this._.includes(this.mediaIds, data.id)) {
        this.receiveMediaProgress({
          resolution: this._.get(data, 'resolution'),
          server: this._.get(data, 'transcode_server'),
          progress: this._.get(data, 'progress'),
        })

        let media = {
          id: data.id,
          status: 'transcoding',
        }

        const transcodeAt = this._.get(data, 'transcode_at')
        if(transcodeAt) {
          media = this._.assign(media, {
            transcode_at: transcodeAt
          })
        }

        this.receiveMovieMedia(media)
      }
    })
    channel.bind('transcode-completed', (data) => {
      // console.log(`completed`, data)
      if(this._.includes(this.mediaIds, data.id)) {
        this.receiveMovieMedia(data)
      }
    })


  },
  methods: {
		...mapActions('admin-movie', [
			'getMovieById',
		]),
		...mapMutations('admin-movie', [
			'receiveMovieMedia',
		]),
    ...mapActions('admin-movie-media', [
      'transcodeMovie'
    ]),
		...mapMutations('admin-movie-media', [
			'receiveMediaProgress',
      'clearMediaProgress',
		]),
    async fetchRecord () {
      await this.getMovieById(this.refId)

      // console.log(this.record)
      const transcodeAudios = this._.get(this.record, 'source.transcode_audio')
      // console.log(transcodeAudio)

      for (let i = 0; i < this._.size(transcodeAudios); i++) {
        const transcodeAudio = transcodeAudios[i]
        const audioIndex = transcodeAudio.index
        const findIndex = this._.findIndex(this.audios, ['audio_index', audioIndex])
        
        if(findIndex === -1) {
          continue
        }

        const audio = this.audios[findIndex]

        const language = transcodeAudio.language
        this.audioLanguages[audioIndex].language = language

        console.log(audio, i)

        this.onClickAudio(audio, i)
      }
    },
    isTranscodeSupport (resolution) {
      const width = this._.get(this.video, 'width')
      const size = resolution.size

      return width >= size
    },
    isAudioSupport (index) {
      const audio = this._.get(this.audios, index)
      const audioLanguage = this._.get(audio, 'tags.language')
      const isSupportLanguage = this._.includes(this.supportLanguages, audioLanguage)

      return isSupportLanguage
    },
    isLanguageSelect (index, lang = null) {
      const audio = this._.get(this.audios, index)
      if(this._.isNull(lang)) {
        lang = this._.get(audio, 'tags.language')
      }

      const language = this._.get(this.audioLanguages, `${index}.language`)

      return this._.eq(language, lang)
    },
    getAudioBitRate (audio) {
      const bitRate = parseInt(this._.get(audio, 'bit_rate'))
      if(!bitRate) return ''

      return `${Math.floor(bitRate / 1000)}Kbps`
    },
    getTranscodeAudioIndex (audio) {
      const audioIndex = this._.get(audio, 'audio_index')
      const transcodeIndex = this._.findIndex(this.transcodeAudios, ['index', audioIndex])

      return transcodeIndex
    },
    isAudioSelect (audio) {
      const transcodeIndex = this.getTranscodeAudioIndex(audio)
      return transcodeIndex !== -1
    },
    addClassAudioSelect (audio) {
      // const transcodeIndex = this.getTranscodeAudioIndex(audio)
      return this.isAudioSelect(audio) ? 'border-primary' : 'border-light'
    },
    onClickAudio (audio, index) {
      const transcodeAudios = this._.clone(this.transcodeAudios)
      const findTranscodeIndex = this.getTranscodeAudioIndex(audio)
      console.log(findTranscodeIndex)

      if(findTranscodeIndex === -1) {
        const audioLanguage = this._.get(this.audioLanguages, index)
        const language = this._.get(audioLanguage, 'language')

        if(!language) {
          return
        }

        console.log(language)
        
        const transcodeAudio = {
          index: this._.get(audio, 'audio_index'),
          bit_rate: this._.get(audio, 'bit_rate'),
          
          // language: this._.get(audio, 'tags.language')
          language
        }
        console.log(transcodeAudio)
        transcodeAudios.push(transcodeAudio)
      } else {
        this._.pullAt(transcodeAudios, [findTranscodeIndex])
      }

      this.transcodeAudios = transcodeAudios
    },
    onChangeLanguage (event, index) {
      const lang = event.target.value
      // console.log(lang)
      this.audioLanguages[index].language = lang
    },
    getMedia (resolution) {
      // return this._.find(this.medias, { 'mdb_movie_id': this.refId, 'resolution': resolution.key })
      return this._.find(this.medias, { 'resolution': resolution.key })
    },
    hasMedia (resolution) {
      return !!this._.get(this.getMedia(resolution), 'id')
    },
    getTranscodePercent (resolution) {
      return this._.get(this.transcodeProgress, `${resolution.key}.percent`)
    },
    getTranscodeInfo (resolution, key) {
      const info = this._.get(this.transcodeProgress, `${resolution.key}.${key}`)
      return info
    },
    getTranscodeTime (resolution) {
      const media = this.getMedia(resolution)
      const transcodeAt = this._.get(media, 'transcode_at')

      if(!transcodeAt) {
        return false
      }
      const startTime = this.$moment(transcodeAt).format("YYYY-MM-DD HH:mm:ss")
      // console.log(startTime)
      const diffTime = this.$moment().diff(startTime)
      const duration = this.$moment.duration(diffTime)
      // console.log(duration)
      const hours = this._.padStart(duration.hours(), 2, '0')
      const minutes = this._.padStart(duration.minutes(), 2, '0')
      const seconds = this._.padStart(duration.seconds(), 2, '0')

      let time = `${minutes}:${seconds}`
      if(hours) {
        time = `${hours}:${time}`
      }
      return time
    },
    addTranscodePercentStyle (resolution) {
      const percent = this.getTranscodePercent(resolution)

			const style = {
				minWidth: `${percent || 0}%`
			}

			return style
    },
    async onTranscodeMovie (record) {
      console.log(`onTranscodeMovie`)
      if(!this.canTranscode) {
        return false
      }

      const audios = this._.clone(this.transcodeAudios)
      
      const data = {
        id: record.id,
        resolution: record.resolution,
        audios
      }
      // await console.log(data)
      await this.transcodeMovie(data)

      // this.onClose()
    },
  },
}
</script>