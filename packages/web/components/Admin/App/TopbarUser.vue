<template>
  <li v-on-clickaway="hideDropdown" class="nav-item dropdown">
    <button class="nav-btn" @click="showDropdown()">
      <div class="d-none d-sm-flex flex-column align-items-end mr-2">
        <p class="font-weight-bold font-family-special">Administrator</p>
        <small class="text-muted">{{ $t(`role.admin`) }}</small>
      </div>
      <UserAvatar></UserAvatar>
    </button>
    <nav 
      :class="['dropdown-menu', addClassDropdown()]">
      <!-- <NuxtLink to="/admin/account/profile" class="dropdown-item">
        <i class="fa-light fa-user mr-2"></i>
        <span>{{ $t(`nav.profile`) }}</span>
      </NuxtLink> -->
      <NuxtLink to="/admin/account/security" class="dropdown-item">
        <i class="fa-light fa-lock-keyhole mr-2"></i>
        <span>{{ $t(`nav.security`) }}</span>
      </NuxtLink>
      <!-- <NuxtLink to="/admin/manual" class="dropdown-item">
        <i class="fa-light fa-book mr-2"></i>
        <span>{{ $t(`nav.manual`) }}</span>
      </NuxtLink> -->
      <div class="dropdown-divider"></div>
      <span class="dropdown-item cursor-pointer" @click="handleOnLogout()">
        <i class="fa-light fa-arrow-right-from-bracket mr-2"></i>
        <span>{{ $t(`nav.logout`) }}</span>
      </span>
    </nav>
  </li>
</template>

<script>
import dropdownMixin from '~/mixins/dropdown'

export default {
  name: 'TopbarUser',
  mixins: [
    dropdownMixin
  ],
  beforeRouteEnter (to, from) {
    // console.log('beforeRouteLeave')
  },
  data () {
    return {
      dropdownName: 'user'
    }
  },
  watch: {
		'$route': {
			handler (value) {
				this.hideDropdown()
			}
		},
  },
  methods: {
    // async handleDoLogout () {
    //   await this.$auth.logout()
    // }
  }
}
</script>