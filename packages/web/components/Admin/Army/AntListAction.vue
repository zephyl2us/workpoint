<template>
  <div v-on-clickaway="hideDropdown" class="dropdown ml-2">
    <button class="btn btn-sm btn-light-secondary" @click="showDropdown()">
      <i class="fa-solid fa-ellipsis-vertical"></i>
    </button>
    <nav 
      :class="['dropdown-menu', addClassDropdown()]">
      <!-- <NuxtLink to="/admin/account/profile" class="dropdown-item">
        <i class="fa-light fa-user mr-2"></i>
        <span>{{ $t(`nav.profile`) }}</span>
      </NuxtLink>
      <NuxtLink to="/admin/account/security" class="dropdown-item">
        <i class="fa-light fa-lock-keyhole mr-2"></i>
        <span>{{ $t(`nav.security`) }}</span>
      </NuxtLink> -->
      <span class="dropdown-item cursor-pointer" @click="onClickIdCard">
        <i class="fa-light fa-id-card mr-2"></i>
        <span>บัตรประชาชน</span>
      </span>
      <template v-if="hasPermission('army.ant.delete')">
        <div class="dropdown-divider"></div>
        <span class="dropdown-item cursor-pointer" @click="onClickDelete">
          <i class="fa-light fa-trash-can mr-2"></i>
          <span>ลบ</span>
        </span>
      </template>
    </nav>
  </div>
</template>

<script>
import dropdownMixin from '~/mixins/dropdown'

export default {
  name: 'AntListAction',
  mixins: [
    dropdownMixin
  ],
  props: {
    record: {
      type: Object,
      required: true
		},
    onDelete: {
      type: Function,
      required: true
    },
    onIdCard: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      dropdownName: `ant-action-${this.record.id}`
    }
  },
  computed: {
  },
  watch: {
  },
  created() {
  },
  methods: {
    onClickIdCard () {
      this.hideDropdown()
      this.onIdCard(this.record)
    },
    onClickDelete () {
      this.hideDropdown()
      this.onDelete(this.record)
    }
  }
}
</script>
