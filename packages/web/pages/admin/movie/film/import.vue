<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`movie.import`) }}</h3>
      <div class="header-action">
      </div>
    </header>
    <div class="app__body">
      <div class="row">
        <div class="col-8 offset-2">
            <div class="input-group mb-3">
              <input 
                v-model="filters.year" 
                type="number" 
                class="form-control form-control-lg" 
                style="max-width: 120px;"
                :placeholder="$t(`movie.release_year`)">
              <input 
                v-model="filters.search" 
                type="text" 
                class="form-control form-control-lg" 
                :placeholder="$t(`movie.search_placeholder`)"
                @keyup.enter="handleOnClickSearch()">
              <div class="input-group-append">
                <button 
                  type="button" 
                  class="btn btn-lg btn-primary" 
                  :disabled="!canSubmit" 
                  @click.prevent="handleOnClickSearch()">{{ $t(`message.search`) }}</button>
              </div>
            </div>
            <div class="card card-movie-list mb-3">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th width="90">TMDB</th>
                      <th width="84"></th>
                      <th>ชื่อเรื่อง</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(record, index) in records" :key="`record-${index}`">
                      <td>
                        <div class="mb-0">
                          <span class="font-weight-bold font-numeral text-dark">{{ record.id }}</span>
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
                        <div class="">
                          <small><i class="fa-light fa-calendar"></i> {{ record.release_date }}</small>
                        </div>
                      </td>
                      <td>
                        <div v-if="isAlready(record.id)" class="d-flex">
                          <NuxtLink :to="linkTo(getMovieView(record.id))" class="d-inline-block btn btn-sm btn-primary ml-auto">
                            <i class="fa-regular fa-clapperboard-play"></i>
                          </NuxtLink>
                          <!-- <button class="btn btn-sm btn-primary ml-auto">
                            <i class="fa-regular fa-clapperboard-play"></i>
                          </button> -->
                        </div>
                        <ConfirmOrCancel v-else :size="'sm'" :min-width="34" :confirm-html="'เพิ่ม'" :on-confirm="onSyncMovie" :confirm-data="{ id: record.id}">
                          <template #button="{ onClick }">
                            <button class="btn btn-sm btn-light-secondary" @click="onClick"><i class="fa-regular fa-cloud-arrow-down"></i></button>
                          </template>
                        </ConfirmOrCancel>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <Pagination :pagination="pagination" :on-page-change="handleOnChangePage"></Pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import fetchMixin from '~/mixins/fetch'

export default {
  name: 'MovieImport',
  components: {},
  mixins: [fetchMixin],
  layout: 'admin',
  props: {},
  data () {
    return {
      // input: {
      // },
      filters: {
        search: '',
        year: '',
        page: 1
      },
    }
  },
  computed: {
    ...mapGetters('admin-movie-tmdb', [
      'records',
      'movies',
      // 'alreadyIds',
      'pagination'
      // 'lotteries'
    ]),
    canSubmit () {
      return !!this._.get(this.filters, 'search')
    },
    alreadyIds () {
      return this._.map(this.movies, (movie) => movie.ref_id)
    },
  },
  created () {},
  mounted () {},
  methods: {
    ...mapActions('admin-movie-tmdb', [
      'searchMovies',
      'syncMovie'
    ]),
    handleOnClickSearch () {
      if(!this.canSubmit) {
        return
      }
      this.hotRefresh()
    },
		getMovieImageUrl (path, size = 'original') {
			const width = `w${size}`
			const endpoint = `https://image.tmdb.org/t/p/`

			const fullPath = `${endpoint}${width}${path}`

			return fullPath
		},
    isAlready (id) {
      const alreadyIds = this._.clone(this.alreadyIds)
      return this._.includes(alreadyIds, id)
    },
    getMovieView (refId) {
      const index = this._.findIndex(this.movies, (movie) => movie.ref_id === refId)
      const movie = this._.get(this.movies, index)
      const id = movie.id
      const path = `/movie/film/${id}`
      return path
    },
    async onSyncMovie (record) {
      // console.log(`onSyncMovie`)
      const data = {
        id: record.id
      }
      await this.syncMovie(data)
    },
    /**
     * Data manager work with api
     */
    async dataManager (params, from = null) {
      // console.log(this.filters)
      if(!this.canSubmit) {
        return
      }

      await this.searchMovies(params)
      // this.handleAfterLoaded()
    },
  },
}
</script>