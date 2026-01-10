<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`movie.collection`) }}</h3>
      <div class="header-action"></div>
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
                  <th width="60" class="pl-3">#</th>
                  <th width="90">TMDB</th>
                  <th width="84"></th>
                  <th>ชื่อเรื่อง</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(record, index) in records" :key="`record-${index}`">
                  <td>
                    <NuxtLink :to="linkTo(`/movie/collection/${record.id}`)" class="font-numeral">{{ record.id }}</NuxtLink>
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
                      <span class="font-weight-bold font-special text-dark">{{ record.original_name }}</span>
                    </div>
                    <div class="font-size-sm">
                      {{ record.name }}
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
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import fetchMixin from '~/mixins/fetch'

export default {
  name: 'MovieCollection',
  components: {},
  mixins: [fetchMixin],
  layout: 'admin',
  props: {},
  data () {
    return {
      // date: null,
      filters: {
        page: 1
        // date: null
      },
    }
  },
  computed: {
    ...mapGetters('admin-movie-collection', [
      'records',
      'pagination'
    ]),
  },
  created () {},
  mounted () {},
  methods: {
    ...mapActions('admin-movie-collection', [
      'getCollections'
    ]),
    /**
     * Data manager work with api
     */
    async dataManager (params, from = null) {
      await this.getCollections(params)
      this.handleAfterLoaded()
    },
  },
}
</script>