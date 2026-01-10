<template>
  <div class="card-lottery-yeekee card mb-3">
    <div class="table-responsive">
      <table class="table table-hover mb-0">
        <thead>
          <tr>
            <th style="min-width:80px;" class="pl-3">#</th>
            <th v-if="_.eq(type, 'stock')" width="100%">ประเภท</th>
            <template v-else>
              <th style="min-width:80px;">เวลา</th>
              <th width="100%">รอบที่</th>
            </template>
            <th style="min-width:200px;">ผล</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(lottery, index) in records" :key="`result-${index}`" :class="addEmptyLotteryClass(lottery)">
            <td scope="row" class="pl-3">
              <NuxtLink :to="`/admin/lottery/view/${lottery.id}`" class="font-numeral">{{ lottery.id }}</NuxtLink>
            </td>
            <td v-if="_.eq(type, 'stock')">
              <div class="d-flex align-items-center">
                <div class="mr-3">
                  <i :class="[addFlagIconClass(lottery.slug)]"></i>
                </div>
                <div>
                  <span class="font-weight-bold font-special text-dark">{{ $t(`lottery.slug.${lottery.slug}`) }}</span>
                  <div class="font-size-sm text-muted">
                    <span class="">{{ $moment(_.get(lottery, 'start_at')).format('MM-DD HH:mm') }}</span> -
                    <span class="">{{ $moment(_.get(lottery, 'end_at')).format('MM-DD HH:mm') }}</span>
                  </div>
                </div>
              </div>
            </td>
            <template v-else>
              <td>
                <span class="font-numeral">{{ $moment(_.get(lottery, 'end_at')).format('HH:mm') }}</span>
              </td>
              <td>
                <span class="font-weight-bold font-numeral text-dark">{{ lottery.round }}</span>
              </td>
            </template>
            <td>
              <div v-if="_.has(lottery, 'result.three_top')" class="mb-0">
                <span class="font-weight-bold font-numeral">{{ _.get(lottery, 'result.three_top') }}</span> /
                <span class="font-weight-bold font-numeral">{{ _.get(lottery, 'result.two_under') }}</span>
              </div>
              <div v-else class="mb-0">
                <span class="font-numeral text-muted">XXX</span> /
                <span class="font-numeral text-muted">XX</span>
              </div>
              <div class="font-size-sm text-muted">
                <i class="fa-light fa-clock"></i>
                <span class="">{{ _.get(lottery, 'result_at') }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>

// import { mapGetters } from 'vuex'

export default {
  name: 'LotteryList',
  components: {},
  mixins: [],
  props: {
    records: {
      type: Array,
      required: true
    },
    type: {
      type: String,
      default: 'yeekee'
    }
  },
  data () {
    return {
    }
  },
  computed: {
  },
  watch: {
  },
  created () {},
  mounted () {
  },
  methods: {
    addFlagIconClass (slug) {
      return `fi fi-${this.slugToFlag(slug)}`
    },
    addEmptyLotteryClass (lottery) {
      return !this._.has(lottery, 'id') ? 'disabled' : ''
    }
  },
}
</script>