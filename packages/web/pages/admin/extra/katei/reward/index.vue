<template>
  <div class="katei__wrapper">
    <div class="katei__curtain katei__curtain-left" :class="[addCurtainClass()]"></div>
    <div class="katei__curtain katei__curtain-right" :class="[addCurtainClass()]"></div>

    <div class="katei__logo"></div>

    <template v-if="isReward1 || isReward2 || isReward3" >
      <div class="">
        <div class="katei__reward">
          <div class="katei__reward-star" :class="[`katei__reward-star-${status}`, addClassRotation()]"></div>
          <div class="katei__reward-icon" :class="`katei__reward-icon-${status}`"></div>
          <div class="katei__reward-label">
            <span :class="`katei__reward-text-${status}`">รางวัลที่ {{ status }}</span>
            {{ _.get(reward, `reward_${status}.label`) }}
          </div>
        </div>
        <div v-if="numbers" class="katei__number-list">
          <div v-for="(number, index) in numbers" :key="`number-${index}`" class="katei__number-item">
            <span v-if="number">{{ number }}</span>
            <img v-else :src="`/assets/katei/outing2024/icon-food-${index + 1}.png`" class="katei__number-icon">
          </div>
        </div>
      </div>
    </template>
    <div v-else-if="isRewardFinal" class="">
      <div class="">
        <div class="katei__reward">
          <div class="katei__reward-star" :class="[`katei__reward-star-1`, `star-rotate`]"></div>
          <div class="katei__reward-icon" :class="`katei__reward-icon-1`"></div>
          <div class="katei__reward-label">
            <span class="katei__reward-text-1">รางวัลที่ 1</span>
            {{ _.get(reward, `reward_1.label`) }}
          </div>
          <div class="katei__reward-podium" :class="`katei__reward-podium-1`">
            {{ _.get(reward, `reward_1.number`) }}
          </div>
        </div>
        <div class="katei__reward katei__reward-left">
          <div class="katei__reward-star" :class="[`katei__reward-star-2`]"></div>
          <div class="katei__reward-icon" :class="`katei__reward-icon-2`"></div>
          <div class="katei__reward-label">
            <span class="katei__reward-text-2">รางวัลที่ 2</span>
            {{ _.get(reward, `reward_2.label`) }}
          </div>
          <div class="katei__reward-podium" :class="`katei__reward-podium-2`">
            {{ _.get(reward, `reward_2.number`) }}
          </div>
        </div>
        <div class="katei__reward katei__reward-right">
          <div class="katei__reward-star" :class="[`katei__reward-star-3`]"></div>
          <div class="katei__reward-icon" :class="`katei__reward-icon-3`"></div>
          <div class="katei__reward-label">
            <span class="katei__reward-text-3">รางวัลที่ 3</span>
            {{ _.get(reward, `reward_3.label`) }}
          </div>
          <div class="katei__reward-podium" :class="`katei__reward-podium-3`">
            {{ _.get(reward, `reward_3.number`) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'BlankPage',
  components: {},
  mixins: [],
  // middleware: ['auth'],
  auth: false,
  // layout: 'admin',
  props: {},
  data () {
    return {
      // isCurtainOpen: false
    }
  },
  computed: {
    ...mapGetters('admin-extra-katei', [
      'reward'
    ]),
    isCurtainOpen () {
      return !!this._.get(this.reward, 'curtain_open')
    },
    isRewardFinal () {
      return this._.eq(this._.get(this.reward, 'reward_status'), 9)
    },
    isReward1 () {
      return this._.eq(this._.get(this.reward, 'reward_status'), 1)
    },
    isReward2 () {
      return this._.eq(this._.get(this.reward, 'reward_status'), 2)
    },
    isReward3 () {
      return this._.eq(this._.get(this.reward, 'reward_status'), 3)
    },
    status () {
      return this._.get(this.reward, 'reward_status')
    },
    splitNumbers () {
      const status = this.status

      if(!this._.includes([1, 2, 3], status)) {
        return false
      }

      const reward = this._.get(this.reward, `reward_${status}`)
      const number = this._.get(reward, `number`)
      const splitNumbers = this._.split(number, '')

      return splitNumbers
    },
    numbers () {
      const splitNumbers = this.splitNumbers

      const numbers = []

      for(let i = 0; i < 8; i++) {
        const number = this._.get(splitNumbers, i)
        if(number) {
          numbers.push(number)
        } else {
          numbers.push(false)
        }
      }

      return numbers
    },
    isCompleteNumber () {
      const splitNumbers = this.splitNumbers
      return this._.size(splitNumbers) === 8
    }
  },
	beforeDestroy () {
    this.$pusher.unsubscribe(`extra.katei`)
  },
  created () {

  },
  mounted () {
    this.getReward()

    const channel = this.$pusher.subscribe(`extra.katei`)

    channel.bind('update', (data) => {
      // console.log(data)
      this.receiveReward({
        reward: data
      })
    })
  },
  methods: {
    ...mapActions('admin-extra-katei', [
      'getReward',
    ]),
    ...mapMutations('admin-extra-katei', [
      'receiveReward',
    ]),

    addCurtainClass () {
      return this.isCurtainOpen ? 'open' : ''
    },

    addClassRotation () {
      return this.isCompleteNumber ? 'star-rotate' : ''
    }
  },
}
</script>

<style lang="scss">
@import "@/assets/scss/katei.scss";
</style>
