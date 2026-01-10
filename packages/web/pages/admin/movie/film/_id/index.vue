<template>
  <div v-if="hasRecord">
    <header class="content-header">
      <h3 class="header-title">{{ $t(`movie.film`) }}</h3>
      <div class="header-action">
        <!-- <NuxtLink :to="linkTo(`/movie/film/${refId}/transcode`)" class="btn btn-primary">
          <i class="icon fa-duotone fa-file-binary mr-2"></i>
          <span>แปลงรหัส</span>
        </NuxtLink> -->
      </div>
    </header>
    <div class="app__body">
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex">
            <div class="mr-3">
              <div 
                v-if="record.poster_path" 
                class="movie__poster movie__poster-xl" 
                :style="addMoviePosterStyle(record.poster_path, 400)">
              </div>
            </div>
            <div class="w-100">
              <div class="row mb-3">
                <div class="col">
                  <h1 class="mb-1">{{ _.get(record, 'original_title') }}</h1>
                  <h5 class="mb-2">{{ _.get(record, 'title') }}</h5>
                  <div class="d-flex align-items-start">
                    <div class="bg-light rounded px-2 mr-2">
                      <i class="fa-regular fa-camera-movie"></i>
                      <span class="font-numeral">{{ UIRenderDate(_.get(record, 'release_date')) }}</span>
                    </div>
                    <div class="bg-light rounded px-2 mr-2">
                      <i class="fa-regular fa-clock"></i>
                      <span class="font-numeral">{{ _.get(record, 'runtime') }} นาที</span>
                    </div>
                    <ul class="movie__genre-list">
                      <li v-for="genre in genres" :key="`genre-${genre.slug}`" class="list-item">{{ $t(`movie.genre_slug.${genre.slug}`) }}</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <div class="bg-light rounded px-3 py-2">
                  {{ _.get(record, 'original_overview') }}
                </div>
              </div>
              <div class="mb-3">
                <div class="bg-light rounded px-3 py-2">
                  {{ _.get(record, 'overview') }}
                </div>
              </div>
              <div class="row mb-3">
                <div v-for="crew in crews" :key="`crew-${crew.id}`" class="col-4 mb-3">
                  <div class="d-flex flex-column">
                    <div class="font-weight-bold">{{ getPersonNameById(crew.mdb_person_id) }}</div>
                    <span class="text-muted">{{ crew.job }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MediaList></MediaList>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import MediaList from '~/components/Admin/Movie/MediaList'

export default {
  name: 'MovieView',
  components: {
    MediaList
  },
  mixins: [],
  layout: 'admin',
  props: {},
  data () {
    return {
      refId: null
    }
  },
  computed: {
    ...mapGetters('admin-movie', [
      'record',
      'casts',
      'crews',
      'collections',
      'companies',
      'genres',
      'people',
    ]),
  },
  created () {},
  mounted () {
		this.refId = this.$route.params.id
		this.fetchRecord()
  },
  methods: {
		...mapActions('admin-movie', [
			'getMovieById',
		]),
    fetchRecord () {
      this.getMovieById(this.refId)
    },

    getPersonById (id) {
      const index = this._.findIndex(this.people, ['id', id])
      return this._.get(this.people, index)
    },
    getPersonNameById (id) {
      const person = this.getPersonById(id)
      return this._.get(person, 'original_name')
    }
  },
}
</script>