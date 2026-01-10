<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`movie.film`) }}</h3>
      <div class="header-action">
        <NuxtLink v-if="hasPermission('movie.film.import')"  :to="linkTo(`/movie/film/import`)" class="btn btn-primary">
          <i class="icon fa-duotone fa-cloud-arrow-down mr-2"></i>
          <span>นำเข้า</span>
        </NuxtLink>
      </div>
    </header>
    <div class="app__body">
      <div class="d-flex mb-3">
        <input 
          v-model="filters.search" 
          type="text" 
          class="form-control" 
          placeholder="ชื่อภาพยนตร์"
          @keyup="handleFilterSubmit">
      </div>
      <template v-if="hasRecords">
        <div class="card card-movie-list mb-3">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th style="min-width: 60px;" class="pl-3">#</th>
                  <th style="min-width: 90px;">TMDB</th>
                  <th style="min-width: 84px;"></th>
                  <th width="100%">ชื่อเรื่อง</th>
                  <th style="min-width: 40px;"></th>
                  <th style="min-width: 120px;">ข้อมูล</th>
                  <th style="min-width: 100px;">ความนิยม</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(record, index) in records" :key="`record-${index}`" :class="[addClassDisabled(record)]">
                  <td>
                    <NuxtLink :to="linkTo(`/movie/film/${record.id}`)" class="font-numeral">{{ record.id }}</NuxtLink>
                  </td>
                  <td>
                    <div class="mb-0">
                      <span class="font-weight-bold font-numeral text-dark">{{ record.ref_id }}</span>
                    </div>
                    <!-- <div class="font-size-sm">
                      {{ record.imdb_id }}
                    </div> -->
                  </td>
                  <td>
                    <!-- <div v-if="record.poster_path" class="movie__poster movie__poster-sm" :style="addMoviePosterStyle(record.poster_path, 200)"></div> -->
                    <div 
                      v-if="record.poster_path" 
                      class="movie__poster movie__poster-sm" 
                      :style="addMoviePosterStyle(record.poster_path, 200)">
                    </div>
                  </td>
                  <td>
                    <div class="mb-0">
                      <span class="font-weight-bold font-special text-dark">{{ record.original_title }}</span>
                    </div>
                    <div class="font-size-sm">
                      {{ record.title }}
                    </div>
                  </td>
                  <td>
                    <small v-if="_.get(record, 'source.id')" class="text-success">
                      <i class="fa-regular fa-link"></i>
                    </small>
                  </td>
                  <td>
                    <div>
                      <i class="fa-regular fa-camera-movie"></i>
                      <span class="font-numeral">{{ UIRenderDate(record.release_date) }}</span>
                    </div>
                    <div>
                      <i class="fa-regular fa-film"></i>
                      <template v-if="_.get(record, 'source.info')">
                        <span class="font-numeral font-size-sm">
                          {{ _.get(record, 'source.info.streams.0.width') }}
                          x
                          {{ _.get(record, 'source.info.streams.0.height') }}
                        </span>
                        <small class="font-numeral">({{ UIRenderFileSize(_.get(record, 'source.info.format.size')) }})</small>
                      </template>
                      <span v-else>-</span>
                    </div>
                    <div>
                      <div v-if="hasMedia(record, '4k')" class="cursor-pointer badge badge-light-primary" @click="onClickMedia(record, '4k')">4K</div>
                      <span v-else class="badge" :class="addClassMedia(record, '4k')">4K</span>
                      <div v-if="hasMedia(record, 'fhd')" class="cursor-pointer badge badge-light-primary" @click="onClickMedia(record, 'fhd')">FHD</div>
                      <span v-else class="badge" :class="addClassMedia(record, 'fhd')">FHD</span>
                      <div v-if="hasMedia(record, 'hd')" class="cursor-pointer badge badge-light-primary" @click="onClickMedia(record, 'hd')">HD</div>
                      <span v-else class="badge" :class="addClassMedia(record, 'hd')">HD</span>
                      <div v-if="hasMedia(record, 'sd')" class="cursor-pointer badge badge-light-primary" @click="onClickMedia(record, 'sd')">SD</div>
                      <span v-else class="badge" :class="addClassMedia(record, 'sd')">SD</span>
                    </div>
                    
                  </td>
                  <td>
                    {{ record.vote_average }}
                  </td>
                  <td>
                    <div class="table-action">
                      <NuxtLink :to="linkTo(`/movie/film/${record.id}`)" class="btn btn-sm btn-light-primary mr-2">
                        <i class="fa-regular fa-clapperboard-play"></i>
                      </NuxtLink>
                      <button 
                        v-if="hasPermission('movie.film.edit')"
                        class="btn btn-sm mr-2"
                        :class="[addClassIsEnable(record)]"
                        @click="onClickQuickEditModal(index)">
                        <i class="fa-regular fa-pen-to-square"></i>
                      </button>
                      <button 
                        v-if="hasPermission('movie.film.transcode')"
                        class="btn btn-sm btn-light-secondary"
                        @click="onClickTranscodeModal(index)">
                        <i class="fa-regular fa-binary"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Pagination v-if="hasRecords" :pagination="pagination" :on-page-change="handleOnChangePage"></Pagination>
      </template>
    </div>

    <QuickEditModal v-if="showQuickEditModal" :on-close="onCloseQuickEditModal" :movie="movieRecord"></QuickEditModal>
    <TranscodeModal v-if="showTranscodeModal" :on-close="onCloseTranscodeModal" :movie="movieRecord"></TranscodeModal>
    <MediaPlayerModal v-if="showMediaPlayerModal" :on-close="onCloseMediaPlayerModal" :movie="movieRecord" :media="movieMedia"></MediaPlayerModal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import fetchMixin from '~/mixins/fetch'
import QuickEditModal from '~/components/Admin/Movie/QuickEditModal'
import TranscodeModal from '~/components/Admin/Movie/TranscodeModal'
import MediaPlayerModal from '~/components/Admin/Movie/MediaPlayerModal'

export default {
  name: 'MovieDatabase',
  components: {
    QuickEditModal,
    TranscodeModal,
    MediaPlayerModal
  },
  mixins: [fetchMixin],
  layout: 'admin',
  props: {},
  data () {
    return {
      // date: null,
      showQuickEditModal: null,
      showTranscodeModal: null,
      showMediaPlayerModal: null,
      movieRecord: {},
      movieMedia: {},

      filters: {
        page: 1
        // date: null
      },
    }
  },
  computed: {
    ...mapGetters('admin-movie', [
      'records',
      'pagination'
      // 'lotteries'
    ]),
  },
  created () {},
  mounted () {},
  methods: {
    ...mapActions('admin-movie', [
      'getMovies'
    ]),
    /**
     * Data manager work with api
     */
    async dataManager (params, from = null) {
      await this.getMovies(params)
      this.handleAfterLoaded()
    },

    addClassDisabled (record) {
      const isEnable = record.is_enable
      return isEnable ? '' : 'disabled'
    },

    onClickTranscodeModal (index) {
      this.movieRecord = this._.clone(this.records[index])
      this.showTranscodeModal = true
    },
    onCloseTranscodeModal () {
      this.movieRecord = {}
      this.showTranscodeModal = false
      this.hotRefresh()
    },

    onClickQuickEditModal (index) {
      this.movieRecord = this._.clone(this.records[index])
      this.showQuickEditModal = true
    },
    onCloseQuickEditModal () {
      this.showQuickEditModal = false
      this.movieRecord = {}
      this.hotRefresh()
    },

    hasMedia (record, value) {
      const medias = this._.get(record, 'medias')

      const index = this._.findIndex(medias, ['resolution', value])

      // console.log(value, index)

      if(index === -1) {
        return false
      }

      const media = medias[index]
      const status = media.status

      return status === 'completed'
    },

    addClassMedia (record, value) {
      const medias = this._.get(record, 'medias')

      const index = this._.findIndex(medias, ['resolution', value])

      // console.log(value, index)

      if(index === -1) {
        return 'badge-light-secondary'
      }

      const media = medias[index]
      const status = media.status

      const statusClasses = {
        queuing: 'badge-secondary',
        transcoding: 'badge-light-warning',
        completed: 'badge-light-primary',
        error: 'badge-light-danger',
      }

      return this._.get(statusClasses, status) || 'badge-light-secondary'
    },

    addClassIsEnable (record) {
      return record.is_enable ? 'btn-light-success' : 'btn-light-secondary'
    },

    async onClickMedia (record, value) {
			try {
				const response = await this.$axios.get(`/core/movie/film/${record.id}/media/${value}?`)
        const url = this._.get(response, 'data.url')

        this.showMediaPlayerModal = true
        this.movieRecord = record
        this.movieMedia = {
          url
        }

        // window.open(`${url}`, '_blank')
        // console.log(url)
			} catch (e){
				console.error('CANNOT FETCH')
			}
    },

    onCloseMediaPlayerModal () {
      this.showMediaPlayerModal = false
      this.movieRecord = {}
      this.movieMedia = {}
    },
  },
}
</script>