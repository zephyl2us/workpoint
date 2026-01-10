'use strict'

import Vue from 'vue'
import { directive as VueClickaway } from 'vue-clickaway'
// import { _ } from 'vue/types/umd'
import { mapGetters } from 'vuex'

Vue.mixin({
	directives: {
		onClickaway: VueClickaway,
	},
	computed: {
		...mapGetters('user', [
			'permission'
		]),
		hasRecord () {
			return !!this._.size(this.record)
		},
		hasRecords () {
			return !!this._.size(this.records)
		}
	},
	mounted () {
	},
  methods: {
		linkTo (path) {
      const baseUrl = '/admin'
      return baseUrl + path
		},
		linkImage (path, size = 0) {
			const baseUrl = this.$axios.defaults.baseURL
			let imageUrl = `${baseUrl}/image/`

			if(size) {
				imageUrl += `w${size}/`
			}
      // const baseUrl = '/'
      return `${imageUrl}${path}`
		},

		hasPermission (permission) {
			return !!this._.result(this.permission, permission)
		},

		slugToFlag (slug) {
			const flags = {
				glo:								'th',
				gsb:								'gsb',
				baac:								'bacc',

				laos:								'la',
				laos_star:					'la',
				malaysia:						'my',
				vietnam:						'vn',
				vietnam_special:		'vn',
				vietnam_vip:				'vn',
				thai_morning:				'th',
				thai_noon:					'th',
				thai_afternoon:			'th',
				thai_evening:				'th',
				japan_morning:			'jp',
				japan_afternoon:		'jp',
				hongkong_morning:		'hk',
				hongkong_afternoon:	'hk',
				china_morning:			'cn',
				china_afternoon:		'cn',
				korea:							'kr',
				taiwan:							'tw',
				singapore:					'sg',
				india:							'in',
				egypt:							'eg',
				germany:						'de',
				england:						'gb',
				russia:							'ru',
				america:						'us',
				
				yeekee_15:					'',
				yeekee_10:					'',
				yeekee_5:						'',
			}

			return this._.get(flags, slug)
		},

		zoneToFlag (zone) {
			const flags = {
				thai_glo:						'th',
				thai_gsb:						'gsb',
				thai_baac:					'bacc',

				laos:								'la',
				malaysia:						'my',
				vietnam:						'vn',
				thai:				        'th',
				japan:							'jp',
				hongkong:						'hk',
				china:							'cn',
				korea:							'kr',
				taiwan:							'tw',
				singapore:					'sg',
				india:							'in',
				egypt:							'eg',
				germany:						'de',
				england:						'gb',
				russia:							'ru',
				america:						'us',
				
				lottoone:           '',
				ltobet:             '',
				dnabet:             '',
				huay:               '',
				huay95:             '',
				kklotto:            '',
				thailotto:          '',
				yeslotto:           '',
				movewin:            '',
				deejai:             '',
				settee:             '',
				jaywaii:            '',
				jaosuo:             '',
				huaylive:           '',
				corehuayplus:       '',
				x4rich:             '',
				rachahuay:          '',
				lot9999:            '',
				huay2525:           '',
				lottotor:           '',
				lottovip:           '',
				ruay:               '',
				teng1:              '',
				masurebet:          '',
				tamjaibet:          '',
				cat999:             '',
				ruamchoke:          '',
				cat888:             '',
				heng168:            '',
				siamlotto:          '',
				lotto77:            '',
				luxnumber:          '',
				huaylike:           '',
				maruay159:          '',
				lottorich28:        '',
				kerry899:           '',
				uwin789:            '',
				arawan:             '',
				akelottobet:        '',
				lottothaibet:       '',
				lotto8gold:         '',
				lottoheng168:       '',
				guay77:             '',
				choke77:            '',
				ruaychoke:          '',
				huay9898:           '',
				haichoke:           '',
				jakchoke:           '',
				taweechoke:         '',
				lotto432:           '',
			}

			return this._.get(flags, zone)
		},

    addFlagIconClass (category) {
			const type = this._.get(category, 'type')
			const slug = this._.get(category, 'slug')

      if(this._.eq(type, 'yeekee')) {
        return ``
      }

      return `fi fi-${this.slugToFlag(slug)}`
    },

    isoDayOfWeek (day, format = 'ddd') {
      return this.$moment().isoWeekday(day).format(format)
    },

    timeFromNow (timestamp) {
      return this.$moment(timestamp).fromNow()
    },

    dayOfWeek (year, week) {
      const startDate = this.$moment(year).add('weeks', (week - 1)).startOf('week').add('day', 1)
			
      // eslint-disable-next-line prefer-const
      let days = []

      for(let i = 0; i < 7; i++) {
        days.push(this.$moment(startDate).add('day', i).format('YYYY-MM-DD'))
        // console.log(moment(startDate).add('day', i).format('YYYY-MM-DD'))
      }

      return days
    },

    /**
     * Render number
     */
    UIRenderNumber (number, format = '0,0[.]000') {
			return this.$numeral(number).format(format)
		},
		/**
		 * Render number in front
		 */
		UIRenderHumanNumber (number) {
			const final = this.UIRenderNumber(number, '0,0[.]00')
			return this._.eq(final, 'NaN') ? 0 : final
		},
		/**
		 * Render number in front and check acl
		 */
		UIRenderHumanNumberButHide (number) {
			if (!this.allows('secret_number.view')) {
				return '******'
			}
			return this.UIRenderHumanNumber(number)
		},
    /**
     * Render number, but not null
     */
    UIRenderNumberNotNull (number) {
      if (this._.isNull(number)) {
        return
      }
      return this.UIRenderNumber(number)
		},
		/**
     * Render number, but not null
     */
    UIRenderHumanNumberNotNull (number) {
      if (this._.isNull(number)) {
        return
      }
      return this.UIRenderHumanNumber(number)
    },
		/**
		 * Render number to 1200000 -> 1.2m
		 */
		UIRenderNumberShort (number) {
			if (this._.isNull(number)) {
        return
      }
			return this.$numeral(number).format('0.0a')
		},
    /**
     * Render date format
     */
    UIRenderDate (date, format = 'YYYY-MM-DD') {
			if (!date) {
				return '-'
			}
      return this.$moment(date).format(format)
    },
    /**
     * Render datetine format
     */
    UIRenderDateTime (datetime) {
			if (!datetime) {
				return '-'
			}
      return this.$moment(datetime).format('YYYY-MM-DD HH:mm:ss')
		},
		/**
		 * Render Thai date style
		 */
		UIRenderThaiDate (date) {
			if (!date) {
				return '-'
			}
			return this.$moment(date).format('D MMM YYYY')
		},
		/**
		 * Render Thai date time style
		 */
		UIRenderThaiDateTime (datetime) {
			if (!datetime) {
				return '-'
			}
			return this.$moment(datetime).format('D MMM YYYY HH:mm')
		},
		/**
		 * Render Thai Date Long month
		 */
		UIRenderThaiOptionDate (date) {
			if (!date) {
				return '-'
			}
			return this.$moment(date).format('D MMMM, (dddd)')
		},
    /**
     * Render timeago
     */
    UIRenderTimeAgo (datetime) {
			// console.log(datetime)
			if (!datetime) {
				return '-'
			}
      return this.$moment(datetime).fromNow()
		},

		/**
		 * Random string.
		 */
		randomString (length = 10, option) {
			const upperCase = !!this._.get(option, 'upper_case')
			const lowerCase = !!this._.get(option, 'lower_case')
			const number = !!this._.get(option, 'number')
			const symbol = !!this._.get(option, 'symbol')

			const updateCaseCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
			const lowerCaseCharacters = 'abcdefghijklmnopqrstuvwxyz'
			const numberCharacters = '0123456789'
			const symbolCaseCharacters = `!@#$%^&*()-_+=`

			let character = ''
			let characterWithSymbol = ''

			if(upperCase) {
				character += updateCaseCharacters
			}
			if(lowerCase) {
				character += lowerCaseCharacters
			}
			if(number) {
				character += numberCharacters
			}
			if(!character) {
				character = updateCaseCharacters + lowerCaseCharacters + numberCharacters
			}

			characterWithSymbol = character + (symbol ? symbolCaseCharacters : '')

			let result = ''
			for(let i = 0; i < length; i++) {
				if(i === 0 || i === (length - 1)) {
					result += character.charAt(Math.floor(Math.random() * character.length))
				} else {
					result += characterWithSymbol.charAt(Math.floor(Math.random() * characterWithSymbol.length))
				}
			}

			return result
		},

    inputOnlyNumber (e) {
      const charCode = (e.which) ? e.which : e.keyCode
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        e.preventDefault()
      } else {
        return true
      }
    },
		

		__fakeChartData (range = 10, start = 10, end = 100) {
			const data = this._.times(range, () => this._.random(start, end))
			return data
		},

		async handleOnLogout () {
      await this.$auth.logout()
			window.location.href = `/auth/login`
		}
	},
})

export default function (context) {
  // Somethign to implement
}
