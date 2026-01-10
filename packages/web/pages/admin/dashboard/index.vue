<template>
  <main>
    Test
    <!-- {{ numbers }} -->
  </main>
</template>

<script>

export default {
  name: 'DashboardIndex',
  layout: 'admin',
  // components: {},
  // mixins: [],
  props: {},
  data () {
    return {
      numbers: []
    }
  },
  computed: {},
  created () {},
  mounted () {
    // eslint-disable-next-line prefer-const
    // let numbers = []
    // const startNumber = parseInt('012345678')
    // const endNumber = parseInt('123456789')

    // let currentNumber = startNumber

    // do {
    //   const splitNumber = this._.split(currentNumber + '', '')
    //   // console.log(splitNumber)

    //   let canAddNumber = true
    //   this._.each(splitNumber, (number, index) => {
    //     if(index === 0) return
    //     const pastNumber = parseInt(splitNumber[index - 1])

    //     // console.log(parseInt(number), pastNumber, parseInt(number) <= pastNumber)

    //     if(parseInt(number) <= pastNumber) {
    //       canAddNumber = false
    //       return false
    //     }
    //   })

    //   if(canAddNumber) {
    //     numbers.push(this._.padStart(currentNumber, 8, '0'))
    //   }

    //   currentNumber++
    // } while (currentNumber <= endNumber)

    // console.log(numbers)
    // this.numbers = numbers
  },
  methods: {},
}
</script>