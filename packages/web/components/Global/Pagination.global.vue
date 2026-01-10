<template>
	<div class="page-container">
		<div class="page-counter mr-auto p-2 align-middle">
			<span>จำนวนทั้งหมด {{ UIRenderNumber(pagination.total) }} รายการ </span>
		</div>
		<div class="page-items">
			<VuePaginate
				v-show="!conditionToHidden"
				v-model="page"
				:page-count="pageCount"
				:click-handler="handleOnClick"
				:prev-text="'Prev'"
				:next-text="'Next'"
				:container-class="containerClass"
				:page-class="'page-item'"
				:page-link-class="'page-link'"
				:prev-class="'page-item'"
				:prev-link-class="'page-link'"
				:next-class="'page-item'"
				:next-link-class="'page-link'">
			</VuePaginate>
		</div>
	</div>
</template>
<script>
export default {
  name: 'AppPagination',
  props: {
    pagination: {
      required: true,
			type: Object
    },
    onPageChange: {
      required: true,
      type: Function
		},
		className: {
			type: String,
			default: 'noclass'
		},
		hideOnSingle: {
			type: Boolean,
			default: false
		}
  },
  data () {
    return {
      page: 1,
      pageCount: 1
    }
	},
	computed: {
		containerClass () {
			return `pagination ${this.className}`
		},
		/**
		 * Hide pagination, if only single page
		 */
		conditionToHidden () {
			return this.hideOnSingle && this.pageCount <= 1
		}
	},
  watch: {
    'pagination': {
      handler (pagination) {
				// console.log(pagination)
				this.page = parseInt(pagination.current_page)
        this.pageCount = this._.isNaN(pagination.last_page) ? 0 : parseInt(pagination.last_page)
			},
			immediate: true
    },
  },
  methods: {
    handleOnClick (page) {
      this.onPageChange(page)
    }
  },
}
</script>
