'use strict'

import _ from 'lodash'
import { mapGetters, mapMutations } from 'vuex'

export default {
  data () {
    return {
      dropdownName: null
    }
  },
  beforeRouteLeave () {
    this.hideDropdown()
  },
  computed: {
    ...mapGetters('admin', [
      'currentDropdown'
    ]),
    isCurrentDropdown () {
      return _.eq(this.currentDropdown, this.dropdownName)
    }
  },
  methods: {
    ...mapMutations('admin', [
      'updateCurrentDropdown'
    ]),
    addClassDropdown () {
      return this.isCurrentDropdown ? 'show' : ''
    },
    showDropdown () {
      if(this.isCurrentDropdown) {
        // console.log('hideDropdown', 'showDropdown')
        this.hideDropdown()
      } else {
        setTimeout(() => {
          // console.log('showDropdown', this.dropdownName)
          this.updateCurrentDropdown(this.dropdownName)
        }, 10)
      }
    },
    hideDropdown () {
      if(this.isCurrentDropdown) {
        // console.log('hideDropdown', this.dropdownName)
        this.updateCurrentDropdown(null)
      }
    }
  },
  watch: {
    '$route': {
      handler: () => {
      }
    }
  }
}
