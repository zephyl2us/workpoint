<template>
  <Modal ref="sourceImport" :on-close="onClose" :size="'lg'">
    <template #title>
      <h5 class="modal-title">
        <span class="font-weight-bold font-special text-dark">{{ source.name_en }}</span>
        <span v-if="source.name_th" class="font-weight-bold font-special text-dark"> - {{ source.name_th }}</span>
        <span v-if="source.year" class="font-weight-bold font-special text-dark">[{{ source.year }}]</span>
      </h5>
    </template>
    <template #body>
      <div class="modal-body">
        <div class="mb-3">
          <div>
            <small><span class="text-dark">Path:</span> {{ source.path }}</small>
          </div>
          <div>
            <small><span class="text-dark">File:</span> {{ source.file }}</small>
          </div>
        </div>
        <div class="input-group mb-3">
          <input 
            v-model="input.year" 
            type="number" 
            class="form-control form-control-lg" 
            style="max-width: 120px;"
            :placeholder="$t(`movie.release_year`)">
          <input 
            v-model="input.search" 
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
                  <div v-if="isAlready(record.id)" class="d-flex justify-content-end">
                    <button v-if="hasMovieId(record)" class="btn btn-sm btn-success mr-2">
                      <i class="fa-regular fa-link"></i>
                    </button>
                    <button v-else class="btn btn-sm btn-light-secondary mr-2" @click="onLinkSource(record)">
                      <i class="fa-regular fa-link"></i>
                    </button>

                    <NuxtLink :to="linkTo(getMovieView(record.id))" class="d-inline-block btn btn-sm btn-primary">
                      <i class="fa-regular fa-clapperboard-play"></i>
                    </NuxtLink>
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
    </template>
  </Modal>
</template>

<script>

import { mapGetters, mapActions, mapMutations } from 'vuex'

export default {
  name: 'SourceImportModal',
  components: {},
  mixins: [],
  props: {
    source: {
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
      input: {
        search: null,
        year: null
      }
    }
  },
  computed: {
    ...mapGetters('admin-movie-tmdb', [
      'records',
      'movies',
    ]),
    canSubmit () {
      return !!this._.get(this.input, 'search')
    },
    alreadyIds () {
      return this._.map(this.movies, (movie) => movie.ref_id)
    },
  },
  watch: {
  },
  created () {},
  mounted () {
    console.log(`SourceImportModal`, this.source)
    const nameEn = this._.get(this.source, 'name_en')
    const nameTh = this._.get(this.source, 'name_th')
    const year = this._.get(this.source, 'year')

    this.input.search = nameEn || nameTh
    this.input.year = year

    this.clearRecords()
    this.handleOnClickSearch()
  },
  methods: {
    ...mapActions('admin-movie-tmdb', [
      'searchMovies',
      'syncMovie',
    ]),
    ...mapMutations('admin-movie-tmdb', [
      'clearRecords'
    ]),
    ...mapActions('admin-movie-source', [
      'linkSource'
    ]),
    async handleOnClickSearch () {
      if(!this.canSubmit) {
        return
      }

      const params = {
        search: this.input.search,
        year: this.input.year,
        page: 1
      }

      await this.searchMovies(params)
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
    hasMovieId (record) {
      const sourceMovieId = this._.get(this.source, 'mdb_movie_id')
      const refId = this._.get(record, 'id')

      const index = this._.findIndex(this.movies, ['ref_id', refId])

      if(index === -1) {
        return false
      }

      const movie = this.movies[index]
      const movieId = this._.get(movie, 'id')

      return sourceMovieId === movieId
    },
    getMovieView (refId) {
      const index = this._.findIndex(this.movies, (movie) => movie.ref_id === refId)
      const movie = this._.get(this.movies, index)
      const id = movie.id
      const path = `/movie/film/${id}`
      return path
    },
    async onLinkSource (record) {
      console.log(`onLinkSource`)
      const data = {
        id: this._.get(this.source, 'id'),
        ref_id: record.id,
      }
      await this.linkSource(data)

      this.onClose()
    },
    async onSyncMovie (record) {
      // console.log(`onSyncMovie`)
      const data = {
        id: record.id,
        source_id: this._.get(this.source, 'id')
      }
      await this.syncMovie(data)

      this.onClose()
    },
  },
}
</script>