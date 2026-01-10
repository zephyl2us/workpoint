<template>
  <li v-on-clickaway="hideDropdown" class="nav-item dropdown">
    <button class="nav-btn" @click="showDropdown()">
      <i class="icon far fa-bell"></i>
      <BadgeAlert :name="'notification'" :variant="'badge-primary'"></BadgeAlert>
    </button>
    <div :class="['dropdown-menu dropdown-menu-media', addClassDropdown()]">
      <section class="dropdown-header">
        <h4 class="notification-title mb-0 mr-auto">{{ $t(`noti.notifications`) }}</h4>
        <span 
          v-if="unreadNotification" 
          class="badge badge-primary badge-pill">{{ $t(`noti.unread`, { count: unreadNotification }) }}</span>
      </section>
      <section v-bar class="dropdown-body">
        <div class="">
          <div style="height: 1000px;">Test Scrolling</div>
        </div>
      </section>
      <section class="dropdown-footer">
        <button type="button" class="btn btn-primary btn-block">{{ $t(`noti.read_all_notifications`) }}</button>
      </section>
    </div>
  </li>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
import dropdownMixin from '~/mixins/dropdown'
import BadgeAlert from '~/components/Admin/App/BadgeAlert'

export default {
  name: 'TopbarNofication',
  components: {
    BadgeAlert
  },
  mixins: [
    dropdownMixin
  ],
  data () {
    return {
      dropdownName: 'notification',
    }
  },
  computed: {
    ...mapGetters('admin', [
      'countAlerts'
    ]),
    unreadNotification () {
      const key = this.dropdownName
      const count = _.get(this.countAlerts, key)
      return count || 0
    },
  },
}
</script>

<style>
</style>