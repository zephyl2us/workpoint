<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`army.photo`) }}</h3>
      <div class="header-action">
        <NuxtLink
            v-if="hasPermission('army.photo.create')"
            :to="linkTo(`/army/photo/create`)" 
            class="btn btn-primary">
          <i class="icon fa-duotone fa-images-user mr-2"></i>
          <span>{{ $t(`army.photo_create`) }}</span>
        </NuxtLink>
      </div>
    </header>
    <div class="app__body">
      <div class="row mb-2">
        <div class="col-12 col-md-6 mb-2">
          <div class="d-flex form-control text-nowrap" style="width: auto;">
            <div class="pr-2">
              <span class="text-info">
                <i class="fa-regular fa-mars"></i>
              </span>
            </div>
            <div class="px-2 border-left text-center" style="flex: 1;">
              <span class="font-weight-bolder">2x:</span>
              <span class="" :class="[addStatsClass('male', 'twenty', 'ready')]">
                {{ generateStats('male', 'twenty', 'ready') }}
              </span> /
              <span class="">{{ generateStats('male', 'twenty', 'total') }}</span>
            </div>
            <div class="px-2 border-left text-center" style="flex: 1;">
              <span class="font-weight-bolder">3x:</span>
              <span class="" :class="[addStatsClass('male', 'thirty', 'ready')]">
                {{ generateStats('male', 'thirty', 'ready') }}
              </span> /
              <span class="">{{ generateStats('male', 'thirty', 'total') }}</span>
            </div>
            <div class="px-2 border-left text-center" style="flex: 1;">
              <span class="font-weight-bolder">4x:</span>
              <span class="" :class="[addStatsClass('male', 'forty', 'ready')]">
                {{ generateStats('male', 'forty', 'ready') }}
              </span> /
              <span class="">{{ generateStats('male', 'forty', 'total') }}</span>
            </div>
            <div class="px-2 border-left text-center" style="flex: 1;">
              <span class="font-weight-bolder">5x:</span>
              <span class="" :class="[addStatsClass('male', 'fifty', 'ready')]">
                {{ generateStats('male', 'fifty', 'ready') }}
              </span> /
              <span class="">{{ generateStats('male', 'fifty', 'total') }}</span>
            </div>
            <div class="pl-2 border-left text-center" style="flex: 1;">
              <span class="font-weight-bolder">6+:</span>
              <span class="" :class="[addStatsClass('male', 'sixty', 'ready')]">
                {{ generateStats('male', 'sixty', 'ready') }}
              </span> /
              <span class="">{{ generateStats('male', 'sixty', 'total') }}</span>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 mb-2">
          <div class="d-flex form-control text-nowrap" style="width: auto;">
            <div class="pr-2">
              <span class="text-danger">
                <i class="fa-regular fa-venus"></i>
              </span>
            </div>
            <div class="px-2 border-left text-center" style="flex: 1;">
              <span class="font-weight-bolder">2x:</span>
              <span class="" :class="[addStatsClass('female', 'twenty', 'ready')]">
                {{ generateStats('female', 'twenty', 'ready') }}
              </span> /
              <span class="">{{ generateStats('female', 'twenty', 'total') }}</span>
            </div>
            <div class="px-2 border-left text-center" style="flex: 1;">
              <span class="font-weight-bolder">3x:</span>
              <span class="" :class="[addStatsClass('female', 'thirty', 'ready')]">
                {{ generateStats('female', 'thirty', 'ready') }}
              </span> /
              <span class="">{{ generateStats('female', 'thirty', 'total') }}</span>
            </div>
            <div class="px-2 border-left text-center" style="flex: 1;">
              <span class="font-weight-bolder">4x:</span>
              <span class="" :class="[addStatsClass('female', 'forty', 'ready')]">
                {{ generateStats('female', 'forty', 'ready') }}
              </span> /
              <span class="">{{ generateStats('female', 'forty', 'total') }}</span>
            </div>
            <div class="px-2 border-left text-center" style="flex: 1;">
              <span class="font-weight-bolder">5x:</span>
              <span class="" :class="[addStatsClass('female', 'fifty', 'ready')]">
                {{ generateStats('female', 'fifty', 'ready') }}
              </span> /
              <span class="">{{ generateStats('female', 'fifty', 'total') }}</span>
            </div>
            <div class="pl-2 border-left text-center" style="flex: 1;">
              <span class="font-weight-bolder">6+:</span>
              <span class="" :class="[addStatsClass('female', 'sixty', 'ready')]">
                {{ generateStats('female', 'sixty', 'ready') }}
              </span> /
              <span class="">{{ generateStats('female', 'sixty', 'total') }}</span>
            </div>
          </div>
        </div>
      </div>
      <template v-if="hasRecords">
        <div class="card card-photo-list mb-3">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th style="min-width: 84px;" class="pl-3">#</th>
                  <th style="min-width: 84px;"></th>
                  <th width="100%">รูปภาพ</th>
                  <!-- <th style="min-width: 40px;"></th> -->
                  <th style="min-width: 40px;"></th>
                  <th style="min-width: 150px;">ผู้สร้าง</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(record, index) in records" :key="`record-${index}`">
                  <td>
                    <div class="mb-0">
                      <NuxtLink :to="linkTo(`/army/photo/${record.id}`)" class="font-numeral">{{ record.id }}</NuxtLink>
                    </div>
                  </td>
                  <td>
                  </td>
                  <td>
                    <ul class="list-photo">
                      <li 
                        v-for="(photo, i) in photoLists(record)" 
                        :key="`photo-${record.id}-${i}`" 
                        class="photo-item">
                        <div class="photo" :style="`background-image: url(${linkImage(photo, 92)})`"></div>
                      </li>
                      <!-- <li v-if="hasMorePhoto(record)" class="photo-item">
                        <div class="more">+</div>
                      </li> -->
                    </ul>
                  </td>
                  <td>
                    <span v-if="_.eq(record.gender, 'male')" class="text-info">
                      <i class="fa-regular fa-mars"></i>
                    </span>
                    <span v-else-if="_.eq(record.gender, 'female')" class="text-danger">
                      <i class="fa-regular fa-venus"></i>
                    </span>
                  </td>
                  <td>
                    <div class="mb-0">
                      <span class="font-weight-bold font-special text-dark">{{ _.get(record, 'creator.display_name') }}</span>
                    </div>
                    <div class="font-size-sm font-numeral">
                      {{ UIRenderDateTime(record.created_at) }}
                    </div>
                  </td>
                  <td>
                    <div class="table-action">
                      <NuxtLink :to="linkTo(`/army/photo/${record.id}`)" class="btn btn-sm btn-light-primary">
                        <i class="fa-regular fa-images-user"></i>
                      </NuxtLink>
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
// import _ from 'lodash'
import { mapState, mapGetters, mapActions } from 'vuex'

import fetchMixin from '~/mixins/fetch'

export default {
  name: 'ArmyPhoto',
  components: {},
  mixins: [fetchMixin],
  layout: 'admin',
  props: {},
  data () {
    return {
      photoLimit: 10,
      filters: {
        id: null,
        page: 1,
        // user_id: ''
      },
    }
  },
  computed: {
    ...mapState('auth', [
      'user'
    ]),
    ...mapGetters('admin-army-photo', [
      'records',
      'stats',
      'pagination'
    ]),
  },
  created () {},
  beforeDestroy () {
  },
  mounted () {
  },
  methods: {
    ...mapActions('admin-army-photo', [
      'getPhotos',
      'getStats'
    ]),
    photos (record) {
      const photos = this._.get(record, 'payload.photos')
      return photos
    },
    photoLists (record) {
      const photos = this.photos(record)
      const photoLists = this._.slice(photos, 0, this.photoLimit)

      return photoLists
    },
    hasMorePhoto (record) {
      const photoSize = this._.size(this.photos(record))
      const photoListSize = this._.size(this.photoLists(record))

      return !this._.eq(photoSize, photoListSize)
    },
    generateStats (gender, ageKey, key) {
      const data = this._.get(this.stats, `${gender}.${ageKey}`)
      
      if(!data) return 0

      if(key === 'ready') {
        const unset = parseInt(this._.get(data, 'unset'))
        const available = parseInt(this._.get(data, 'available'))
        return available - unset
      }

      return this._.get(data, key)
    },
    addStatsClass (gender, ageKey, key) {
      const stats = this.generateStats(gender, ageKey, key)
      
      if(stats > 0) return 'text-success'

      return stats < 0 ? 'text-danger' : ''
    },

    /**
     * Data manager work with api
     */
    async dataManager (params, from = null) {
      await this.getPhotos(params)
      await this.getStats()
      this.handleAfterLoaded()
    },
  },
}
</script>