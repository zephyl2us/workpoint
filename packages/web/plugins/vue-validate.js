'use strict'

import Vue from 'vue'
import { extend, localize, ValidationObserver, ValidationProvider } from 'vee-validate'
import * as rules from 'vee-validate/dist/rules'

import en from '~/lang/en/validation'
import th from '~/lang/th/validation'

extend('decimal', {
  validate: (value, args) => {
		if (/^\d+$/.test(value)) {
			return true
		}
		value = String(value)

		// eslint-disable-next-line no-useless-escape
		const pattern = `^[-+]?[0-9]+\.([0-9]{1,${args.length}})$`
		const re = new RegExp(pattern, 'g')
		const found = value.match(re)
		if (!found) {
			return false
		}
		return true
	},
	params: ['length'],
  // message: `The {_field_} field must be number at most {length} decimals`
})

extend('decimal_with_negative', {
  validate: (value, args) => {
		// Allow nagative to make infinity value
		if (Math.sign(value) === -1) {
			return true;
		}

		if (/^\d+$/.test(value)) {
			return true
		}
		value = String(value)

		// eslint-disable-next-line no-useless-escape
		const pattern = `^[-+]?[0-9]+\.([0-9]{1,${args.length}})$`
		const re = new RegExp(pattern, 'g')
		const found = value.match(re)
		if (!found) {
			return false
		}
		return true
	},
	params: ['length']
})

extend('password_strong', {
  validate: (value, args) => {
		value = String(value)
		const pattern = `^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{6,30}$`
		const re = new RegExp(pattern, 'g')
		const found = value.match(re)
		console.log('found', found)
		if (!found) {
			return false
		}
		return true
	},
	params: ['length']
})

Vue.component('ValidationObserver', ValidationObserver)
Vue.component('ValidationProvider', ValidationProvider)

localize({ en, th })

Object.keys(rules).forEach(rule => {
  // eslint-disable-next-line import/namespace
  extend(rule, rules[rule])
})

export default (context) => {
  const defaultLocale = context.app.i18n.defaultLocale
	const detectLocale = context.app.i18n.getLocaleCookie()

  localize(detectLocale || defaultLocale)
}
