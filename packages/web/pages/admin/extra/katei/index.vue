<template>
  <div>
    <header class="content-header">
      <h3 class="header-title">{{ $t(`extra.katei_outing_reward`) }}</h3>
      <div class="header-action">
        <NuxtLink :to="`/admin/extra/katei/reward`" target="_blank" class="btn btn-primary">Display</NuxtLink>
      </div>
    </header>
    <div class="app__body">
      <div class="card">
        <ValidationObserver :ref="formRef" v-slot="{ handleSubmit }">
          <form @submit.prevent="handleSubmit(onSubmit)">
            <div class="card-body border-bottom py-4">
              <h4 class="mb-4">รางวัลที่ 3 - {{ input.reward_3.label }}</h4>
              <div class="form-group row">
                <label class="col-form-label col-sm-4 col-md-3">
                  <span>หมายเลข</span>
                </label>
                <div class="col-sm-4 col-md-3">
                  <div class="input-group">
                    <input v-model="input.reward_3.number" type="text" class="form-control" maxlength="8">
                  </div>
                </div>
              </div>
              <div class="form-group row">
                <label class="col-form-label col-sm-4 col-md-3">
                  <span>ชื่อ</span>
                </label>
                <div class="col-sm-4 col-md-3">
                  <div class="input-group">
                    <input v-model="input.reward_3.name" type="text" class="form-control">
                  </div>
                </div>
              </div>
            </div>

            <div class="card-body border-bottom py-4">
              <h4 class="mb-4">รางวัลที่ 2 - {{ input.reward_2.label }}</h4>
              <div class="form-group row">
                <label class="col-form-label col-sm-4 col-md-3">
                  <span>หมายเลข</span>
                </label>
                <div class="col-sm-4 col-md-3">
                  <div class="input-group">
                    <input v-model="input.reward_2.number" type="text" class="form-control" maxlength="8">
                  </div>
                </div>
              </div>
              <div class="form-group row">
                <label class="col-form-label col-sm-4 col-md-3">
                  <span>ชื่อ</span>
                </label>
                <div class="col-sm-4 col-md-3">
                  <div class="input-group">
                    <input v-model="input.reward_2.name" type="text" class="form-control">
                  </div>
                </div>
              </div>
            </div>

            <div class="card-body border-bottom py-4">
              <h4 class="mb-4">รางวัลที่ 1 - {{ input.reward_1.label }}</h4>
              <div class="form-group row">
                <label class="col-form-label col-sm-4 col-md-3">
                  <span>หมายเลข</span>
                </label>
                <div class="col-sm-4 col-md-3">
                  <div class="input-group">
                    <input v-model="input.reward_1.number" type="text" class="form-control" maxlength="8">
                  </div>
                </div>
              </div>
              <div class="form-group row">
                <label class="col-form-label col-sm-4 col-md-3">
                  <span>ชื่อ</span>
                </label>
                <div class="col-sm-4 col-md-3">
                  <div class="input-group">
                    <input v-model="input.reward_1.name" type="text" class="form-control">
                  </div>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <div class="form-group row">
                <div class="d-flex col-sm-8 offset-sm-4 col-md-6 offset-md-3">
                  <button type="button" class="btn" :class="[addCurtainButtonClass()]" @click="onClickCurtainToggle()">
                    <span v-if="input.curtain_open" class="">ปิดม่าน</span>
                    <span v-else class="">เปิดม่าน</span>
                  </button>
                </div>
                <div class="d-flex col-sm-8 offset-sm-4 col-md-6 offset-md-3 mt-3">
                  <div class="btn-group w-100">
                    <!-- <button type="button" class="btn" :class="[addStatusClass(0)]" @click="onClickStatus(0)">
                      <span class="">ปิด</span>
                    </button> -->
                    <button type="button" class="btn" :class="[addStatusClass(3)]" @click="onClickStatus(3)">
                      <span class="">รางวัลที่ 3</span>
                    </button>
                    <button type="button" class="btn" :class="[addStatusClass(2)]" @click="onClickStatus(2)">
                      <span class="">รางวัลที่ 2</span>
                    </button>
                    <button type="button" class="btn" :class="[addStatusClass(1)]" @click="onClickStatus(1)">
                      <span class="">รางวัลที่ 1</span>
                    </button>
                    <button type="button" class="btn" :class="[addStatusClass(9)]" @click="onClickStatus(9)">
                      <span class="">รางวัลรวม</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </ValidationObserver>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapGetters, mapActions } from 'vuex'

import formMixin from '~/mixins/form'

export default {
  name: 'BlankPage',
  components: {},
  mixins: [formMixin],
  layout: 'admin',
  props: {},
  data () {
    return {
      formRef: 'kateiOuting',
      isFetch: true,
      input: {
        curtain_open: false,
        reward_status: 0,
        reward_1: {
          label: null,
          number: null,
          name: null,
        },
        reward_2: {
          label: null,
          number: null,
          name: null,
        },
        reward_3: {
          label: null,
          number: null,
          name: null,
        }
      },
    }
  },
  computed: {
    ...mapGetters('admin-extra-katei', [
      'reward',
      'responseError',
      'responseSuccess'
    ]),
  },
  watch: {
    /**
     * Handle after created
     */
    'responseSuccess': {
      handler (response) {
        if (response.status === 'success') {
          setTimeout(() => {
          }, 100)
        }
      }
    },
    // 'responseError': {
    //   handler (response) {
    //     console.log(`error:`, response)
    //   }
    // }
    'reward': {
      handler (data) {
        if(this._.has(data, 'reward_status')) {
          this.isFetch = true
          this.input = this._.cloneDeep(this._.pick(data, [
            'curtain_open', 'reward_status',
            'reward_1', 'reward_2', 'reward_3'
          ]))
        }
      },
      deep: true
    },
    'input': {
      handler (item) {
        this.onSubmit()
      },
      deep: true
    },
  },
  created () {},
  mounted () {
    this.getReward()
  },
  methods: {
    ...mapActions('admin-extra-katei', [
      'getReward',
      'updateReward'
    ]),

    onSubmit: _.debounce(function () {
      if(this.isFetch) {
        this.isFetch = false
        return
      }

      this.submitting()

      const input = this._.assign({}, this.input, {
        timestamp: this.$moment().valueOf()
      })

      this.updateReward(input)
    }, 200, { leading: true }),

    addCurtainButtonClass () {
      return this.input.curtain_open ? 'btn-secondary' : 'btn-danger'
    },

    addStatusClass (value) {
      return this._.eq(this.input.reward_status, value) ? 'btn-primary' : 'btn-secondary'
    },

    onClickCurtainToggle () {
      if(this.input.reward_status === 0) {
        this.input.curtain_open = false
        return
      }

      this.input.curtain_open = !this.input.curtain_open
    },

    onClickStatus (value) {
      if(this.input.curtain_open) {
        return
      }

      this.input.reward_status = value
    }
  },
}
</script>