<template>
  <Modal v-if="movie.id" ref="movieQuickEdit" :on-close="onClose" :size="'lg'" :escape-close="true">
    <template #title>
      <h5 class="modal-title">แก้ไขภาพยนตร์ - {{ _.get(movie, 'original_title') }}</h5>
    </template>
    <template #body>
      <ValidationObserver :ref="formRef" v-slot="{ handleSubmit }">
        <form @submit.prevent="handleSubmit(onSubmit)">
          <div class="modal-body">
            <div class="form-group row">
              <label class="col-form-label col-sm-4 col-md-3">
                <span>เปิดใช้งาน</span>
              </label>
              <div class="col-sm-8 col-md-9 col-lg-7">
                <div class="custom-control custom-switch" style="padding-top: 7px; padding-bottom: 7px;">
                  <input id="isEnable" v-model="input.is_enable" type="checkbox" class="custom-control-input">
                  <label class="custom-control-label" for="isEnable"></label>
                </div>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-form-label col-sm-4 col-md-3">{{ $t('validation.names.slug') }}</label>
              <div class="col-sm-8 col-md-6">
                <div class="input-group">
                  <input v-model="input.slug" type="text" class="form-control">
                  <div class="input-group-append">
                    <button type="button" class="btn btn-light-secondary" @click="onClickSlugGenerate()">
                      <i class="fa-sharp fa-light fa-link-horizontal"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- <TextInput 
              v-model="input.slug"
              type="text" 
              name="slug"
              :rules="`min:2|max:80`"
              :value="input.slug">
            </TextInput> -->
            <TextInput 
              v-model="input.original_title"
              type="text" 
              name="original_title"
              :rules="`min:2|max:80`"
              :value="input.original_title">
            </TextInput>
            <TextInput 
              v-model="input.title"
              type="text" 
              name="title"
              :rules="`min:2|max:80`"
              :value="input.title">
            </TextInput>
            <TextAreaInput 
              v-model="input.original_overview"
              type="text" 
              name="original_overview"
              :value="input.original_overview">
            </TextAreaInput>
            <TextAreaInput 
              v-model="input.overview"
              type="text" 
              name="overview"
              :value="input.overview">
            </TextAreaInput>
          </div>
          <div class="modal-footer">
            <button type="button" :class="['btn btn-light-secondary mr-3', addClassDisabledOnSubmitted]" @click="onReset">
              {{ $t('message.reset') }}
            </button>
            <button type="submit" :class="['btn btn-primary', addClassDisabledOnSubmitted]">
              <i class="fa fa-save mr-2"></i> {{ $t('message.save') }}
            </button>
          </div>
        </form>
      </ValidationObserver>
    </template>
  </Modal>
</template>

<script>
import _ from 'lodash'

import { mapGetters, mapActions, mapMutations } from 'vuex'

import formMixin from '~/mixins/form'

export default {
  name: 'QuickEditModal',
  components: {},
  mixins: [formMixin],
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
      formRef: 'editMovie',
      input: {
        is_enable: null,
        slug: null,
        original_title: null,
        original_overview: null,
        title: null,
        overview: null,
      }
    }
  },
  computed: {
    ...mapGetters('admin-movie', [
      'record',
      'responseSuccess',
      'responseError'
    ]),
  },
  watch: {
    'record': {
      handler (data) {
        this.setDefaultMovie()
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
		this.refId = this.movie.id
		this.fetchRecord()
  },
  methods: {
		...mapActions('admin-movie', [
			'getMovieById',
      'updateMovie',
		]),
		...mapMutations('admin-movie', [
		]),
    fetchRecord () {
      this.getMovieById(this.refId)
    },
    setDefaultMovie () {
      const record = _.cloneDeep(this.record)

      this.input.is_enable = _.get(record, 'is_enable')
      this.input.slug = _.get(record, 'slug')
      this.input.original_title = _.get(record, 'original_title')
      this.input.original_overview = _.get(record, 'original_overview')
      this.input.title = _.get(record, 'title')
      this.input.overview = _.get(record, 'overview')
    },
    onClickSlugGenerate () {
      const originalTitle = this._.get(this.record, 'original_title')
      // const title = this._.get(this.record, 'title')

      let slug = `${originalTitle}`

      const releaseDate = this._.get(this.record, 'release_date')
      if(releaseDate) {
        const year = this.$moment(releaseDate).format('YYYY')
        slug += `-${year}`
      }

      slug = this._.snakeCase(slug)
      slug = this._.replace(slug, /_/g, '-')

      this.input.slug = slug
    },
    onSubmit: _.debounce(function () {
      this.submitting()

      const input = this._.assign({}, this.input, {
        id: this.refId
      })

      input.is_enable = input.is_enable ? 1 : 0

      this.updateMovie(input)
    }, 1000, { leading: true }),
    onReset () {
      this.setDefaultMovie()
    }
  },
}
</script>