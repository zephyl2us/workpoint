'use strict'

import _ from 'lodash'
import Vue from 'vue'
import numeral from 'numeral'

Vue.prototype.$numeral = numeral

Vue.filter('mumeral', function (value, format = '0.0') {
  return numeral(value).format(format);
})

Vue.filter('national', function (value, chars='-') {
  if(value.length !== 13) {
    return ''
  }

  const numbers = _.split(value, '')

  numbers.splice(12, 0, chars)
  numbers.splice(10, 0, chars)
  numbers.splice(5, 0, chars)
  numbers.splice(1, 0, chars)

  value = _.join(numbers, '')

  return value
})


Vue.filter('nationalUnderPicture', function (value, chars='-') {
  if(value.length !== 14) {
    return ''
  }

  const numbers = _.split(value, '')

  numbers.splice(6, 0, chars)
  numbers.splice(4, 0, chars)

  value = _.join(numbers, '')

  return value
})
