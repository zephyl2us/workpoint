'use strict'

import Vue from 'vue'

Vue.mixin({
	directives: {
	},
	computed: {
	},
	mounted () {
	},
  methods: {
		getMovieImageUrl (path, size = 'original') {
			const width = `w${size}`
			const endpoint = `https://image.tmdb.org/t/p/`

			const fullPath = `${endpoint}${width}${path}`

			return fullPath
		},

		addMoviePosterStyle (path, size = 'original') {
			const style = {
				backgroundImage: `url(${this.getMovieImageUrl(path, size)})`
			}

			// console.log(style)
			return style
		},


    UIRenderFileSize (size) {
			if(!size) {
				return 
			}
			
			size = Math.floor(size / 1024 / 1024)
      size = size * 1000 / 1024
      if(size >= 1000) {
        return `${this.UIRenderNumber((size / 1000), '0,0.00')} GB`
      }

      return `${this.UIRenderNumber(size, '0,0')} MB`
    },
    UIRenderBitRate (rate) {
			if(!rate) {
				return 
			}
			
			rate = Math.floor(rate / 1024)
      rate = rate * 1000 / 1024
      if(rate >= 1000) {
        return `${this.UIRenderNumber((rate / 1000), '0,0.00')} Mbps`
      }

      return `${this.UIRenderNumber(rate, '0,0')} Kbps`
    },
	}
})

export default function (context) {
  // Somethign to implement
}
