<template>
  <li v-on-clickaway="hideDropdown" class="nav-item dropdown">
    <button class="nav-btn" @click="showDropdown()">
      <i class="fi fi-th mr-1"></i>
      <span class="d-none d-sm-inline">ภาษาไทย</span>
    </button>
    <div 
      style="min-width: 5rem"
      :class="['dropdown-menu', addClassDropdown()]">
      <button class="dropdown-item">
        <i class="fi fi-th mr-1"></i>
        <span>ภาษาไทย</span>
      </button>
      <button class="dropdown-item">
        <i class="fi fi-us mr-1"></i>
        <span>English</span>
      </button>
      <!-- <button class="dropdown-item">
        <i class="fi fi-mm mr-1"></i>
        <span>မြန်မာ</span>
      </button>
      <button class="dropdown-item">
        <i class="fi fi-la mr-1"></i>
        <span>ລາວ</span>
      </button> -->
    </div>
  </li>
</template>

<script>
import dropdownMixin from '~/mixins/dropdown'

export default {
  name: 'TopbarLanguage',
  mixins: [
    dropdownMixin
  ],
  data () {
    return {
      dropdownName: 'language'
    }
  }
}
</script>