<template>
  <Modal v-if="record.id" ref="antPhotoSync" :on-close="onClose" :size="'lg'" :escape-close="true">
    <template #title>
      <h5 class="modal-title">{{ _.get(record, 'first_name_en') }} {{ _.get(record, 'last_name_en') }}</h5>
    </template>
    <template #body>
      <div class="modal-body">
        <!-- <div class="input-group mb-3">
          <input 
            v-model="input.gender" 
            type="number" 
            class="form-control form-control-lg" 
            style="max-width: 120px;"
            :placeholder="$t(`movie.release_year`)">
          <input 
            v-model="input.age_range" 
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
        </div> -->

        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th style="min-width: 84px;" class="pl-3">#</th>
                <th style="min-width: 40px;"></th>
                <th width="100%">รูปภาพ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <template v-if="hasRecords">
                <tr v-for="(photoRecord, index) in records" :key="`record-${index}`">
                  <td>
                    <div class="mb-0">
                      <span class="font-numeral">{{ photoRecord.id }}</span>
                    </div>
                  </td>
                  <td>
                    <span v-if="_.eq(photoRecord.gender, 'male')" class="text-info">
                      <i class="fa-regular fa-mars"></i>
                    </span>
                    <span v-else-if="_.eq(photoRecord.gender, 'female')" class="text-danger">
                      <i class="fa-regular fa-venus"></i>
                    </span>
                  </td>
                  <td>
                    <ul class="list-photo">
                      <li 
                        v-for="(photo, i) in photoLists(photoRecord)" 
                        :key="`photo-${photoRecord.id}-${i}`" 
                        class="photo-item">
                        <div class="photo" :style="`background-image: url(${linkImage(photo, 92)})`"></div>
                      </li>
                      <!-- <li v-if="hasMorePhoto(photoRecord)" class="photo-item">
                        <div class="more">+</div>
                      </li> -->
                    </ul>
                  </td>
                  <td>
                    <div class="d-flex justify-content-end">
                      <ConfirmOrCancel :size="'sm'" :min-width="34" :confirm-html="'เพิ่ม'" :on-confirm="onAddPhoto" :confirm-data="{ id: photoRecord.id}">
                        <template #button="{ onClick }">
                          <button class="btn btn-sm btn-light-secondary" @click="onClick">
                            <i class="fa-regular fa-link"></i>
                          </button>
                        </template>
                      </ConfirmOrCancel>
                    </div>
                  </td>
                </tr>
              </template>
              <!-- <tr v-else>

              </tr> -->
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import formMixin from '~/mixins/form'

export default {
  name: 'PhotoModal',
  components: {},
  mixins: [formMixin],
  props: {
    record: {
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
      formRef: 'syncPhoto',
      photoLimit: 6,
      refId: null,
      input: {
        gender: null,
        age_range: null
      }
    }
  },
  computed: {
    ...mapGetters('admin-army-photo', [
      'records',
      'responseError',
      'responseSuccess'
    ]),
  },
  watch: {
    'record': {
      handler (data) {
        // this.setDefaultAnt()
      }
    },
    /**
     * Handle after edit
     */
    'responseSuccess': {
      handler (response) {
        if (response.status === 'success') {
          // const data = this._.get(response, 'record')
          console.log(response)
          // this.receiveUpdateCategory(data)

          setTimeout(() => {
            this.onClose()
          }, 100)
        }
      }
    },
    'responseError': {
      handler (response) {
        console.log(`error:`, response)
        this.onClose()
      }
    },
  },
	beforeDestroy () {
  },
  created () {},
  mounted () {
		// this.refId = this.record.id
    // this.setDefaultAnt()
    this.refId = this.record.id
    this.handleOnClickSearch()
  },
  methods: {
    ...mapActions('admin-army-photo', [
      'getPhotos',
      // 'updatePhoto',
      'syncPhoto'
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
    async onAddPhoto (record) {
      const data = {
        id: record.id,
        army_ant_id: this.refId
      }
      await this.syncPhoto(data)

      this.onClose()
    },
    async handleOnClickSearch () {
      const gender = this.record.gender
      let ageRange = null

      const birthday = this.record.birthday
      const diffYear = this.$moment().diff(birthday, 'years')
      if(diffYear < 30) ageRange = 2
      else if(diffYear < 40) ageRange = 3
      else if(diffYear < 50) ageRange = 4
      else if(diffYear < 60) ageRange = 5
      else ageRange = 6

      const params = {
        gender,
        age_range: ageRange,
        army_ant_id: false
      }

      await this.getPhotos(params)
    }
  },
}
</script>