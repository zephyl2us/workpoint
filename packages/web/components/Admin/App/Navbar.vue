<template>
  <div :class="['app__navbar', addNavbarActiveClass()]">
    <div class="navbar-header">
      <div class="d-flex align-items-center">
        <AppLogo class="mr-2"></AppLogo>
        <h4 class="">Workpoint</h4>
      </div>
      <button class="btn btn-navbar-toggle ml-auto d-lg-none" @click="toggleNavbar(false)">
        <i class="fa-light fa-bars"></i>
      </button>
    </div>
    <div v-bar class="navbar-body">
      <nav class="navbar-nav">
        <div 
          v-for="(navs, key) in navigations" 
          :key="`navigation-${key}`" 
          class="nav-menu">

          <label class="nav-label">{{ $t(`nav.${key}`) }}</label>

          <template v-for="nav in navs">

            <div 
              v-if="hasChildren(nav)" 
              :key="`nav-group-${nav.name}`" 
              class="nav-group">

              <!-- <NuxtLink 
                v-if="nav.path"
                :to="getLink(nav)"
                class="nav-item"
                :class="addNavActiveClass(nav)">
                <i v-if="nav.icon" class="icon" :class="[addNavIconClass(nav)]"></i>
                <span class="label">{{ $t(getName(nav)) }}</span>
              </NuxtLink> -->
              <div 
                class="nav-item" 
                :class="addNavActiveClass(nav)">
                <i v-if="nav.icon" class="icon"  :class="[addNavIconClass(nav)]"></i>
                <span class="label">{{ $t(getName(nav)) }}</span>
              </div>

              <NuxtLink 
                v-for="navChild in nav.children" 
                :key="`nav-${navChild.name}`" 
                :to="getLink(navChild)" 
                class="nav-child"
                :class="addNavActiveClass(navChild)">
                <!-- <i v-if="navChild.icon" class="icon" :class="[addNavIconClass(navChild)]"></i> -->
                <span class="label">{{ $t(getName(navChild)) }}</span>
              </NuxtLink>
            </div>
            <NuxtLink 
              v-else 
              :key="`nav-${nav.name}`" 
              :to="getLink(nav)" 
              class="nav-item"
              :class="addNavActiveClass(nav)">
              <i v-if="nav.icon" class="icon" :class="[addNavIconClass(nav)]"></i>
              <span class="label">{{ $t(getName(nav)) }}</span>
              <BadgeAlert :name="nav.name"></BadgeAlert>
            </NuxtLink>
          </template>
        </div>
      </nav>
    </div>
    <div class="navbar-footer">Footer</div>
    <div class="navbar-backdrop" @click="toggleNavbar(false)"></div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

// import _ from 'lodash'
import BadgeAlert from './BadgeAlert'
export default {
  name: 'NavBar',
  components: {
    BadgeAlert
  },
  data () {
    return {
      baseUrl: '/admin',
      defaultNavigations: {
        main: [
          {
            name: 'main_dashboard',
            path: '/dashboard',
            icon: 'chart-line',
            permission: '',
          },
          // {
          //   name: 'main_server',
          //   path: '/server',
          //   icon: 'server',
          //   permission: '',
          // }
        ],
        // member: [
        //   {
        //     name: 'member_all',
        //     path: '/member',
        //     path_except: '/member/review',
        //     icon: 'users',
        //     permission: '',
        //   },
        //   {
        //     name: 'member_review',
        //     path: '/member/review',
        //     icon: 'user-clock',
        //     permission: '',
        //   }
        // ],
        movie: [
          {
            name: 'movie_film',
            path: '/movie/film',
            icon: 'clapperboard-play',
            permission: 'movie.film.view',
          },
          {
            name: 'movie_collection',
            path: '/movie/collection',
            icon: 'album-collection',
            permission: 'movie.collection.view',
          },
          {
            name: 'movie_genre',
            path: '/movie/genre',
            icon: 'object-subtract',
            permission: 'movie.genre.view',
          },
          {
            name: 'movie_person',
            path: '/movie/person',
            icon: 'people-group',
            permission: 'movie.person.view',
          },
          {
            name: 'movie_company',
            path: '/movie/company',
            icon: 'camera-movie',
            permission: 'movie.company.view',
          },
          {
            name: 'movie_source',
            path: '/movie/source',
            icon: 'film',
            permission: 'movie.source.view',
          },
        ],
        lottery: [
          // {
          //   name: 'lottery_government',
          //   path: '/lottery/government',
          //   icon: 'landmark-flag',
          //   permission: '',
          // },
          {
            name: 'lottery_stock',
            path: '/lottery/stock',
            icon: 'chart-candlestick',
            permission: 'lottery.stock.view',
          },
          {
            name: 'lottery_yeekee',
            path: '/lottery/yeekee',
            icon: 'bell-school',
            permission: 'lottery.yeekee.view',
          },
        ],
        army: [
          {
            name: 'army_ant',
            path: '/army/ant',
            icon: 'bugs',
            permission: 'army.ant.view',
          },
          {
            name: 'army_photo',
            path: '/army/photo',
            icon: 'images-user',
            permission: 'army.photo.view',
          },
          {
            name: 'army_bot',
            path: '/army/bot',
            icon: 'robot',
            permission: 'army.bot.view',
          },
          {
            name: 'army_proxy',
            path: '/army/proxy',
            icon: 'chart-network',
            permission: 'army.proxy.view',
          },
          // {
          //   name: 'army_diffusion',
          //   path: '/army/diffusion',
          //   icon: 'microchip-ai',
          //   permission: 'army.diffusion.view',
          // },
        ],
        extra: [
          {
            name: 'extra_katei',
            path: '/extra/katei',
            icon: 'sushi',
            permission: 'extra.katei.view',
          },
          {
            name: 'extra_one',
            path: '/extra/one',
            icon: 'square-1',
            permission: 'extra.one.view',
          },
        ],
        setting: [
          {
            name: 'setting_user',
            path: '/setting/user',
            icon: 'user-headset',
            permission: 'setting.user.view',
          },
          {
            name: 'setting_lottery',
            path: '/setting/lottery',
            icon: 'bell-school',
            permission: 'setting.lottery.view',
          },
        ],
      }
    }
  },
  computed: {
    ...mapGetters('user', [
      'permission'
    ]),
    ...mapGetters('admin', [
      'isNavbarActive'
    ]),
    navigations () {
      const navigations = {}

      this._.each(this.defaultNavigations, (navs, i) => {

        const tmpNavs = []
        this._.each(navs, (nav, j) => {
          if(nav.permission) {
            const hasPermission = this._.get(this.permission, nav.permission)
            if(!hasPermission) {
              return true
            }
          }

          const children = this._.get(nav, 'children')
          const childs = []
          if(this._.size(children)) {

            this._.each(children, (child, k) => {
              if(child.permission) {
                const hasChildPermission = this._.get(this.permission, child.permission)
                if(!hasChildPermission) {
                  return true
                }
              }
              childs.push(child)
            })

            if(this._.size(childs)) {
              const newNav = this._.clone(nav)
              newNav.children = childs
              tmpNavs.push(newNav)
            }
          } else {
            tmpNavs.push(nav)
          }
        })

        if(this._.size(tmpNavs)) {
          navigations[i] = tmpNavs
        }
      })

      return navigations
    },
  },
  watch: {
    '$route': {
      handler (value) {
        if(this.isNavbarActive) {
          this.toggleNavbar(false)
        }
      }
    }
  },
  methods: {
    ...mapMutations('admin', [
      'toggleNavbar'
    ]),
    hasChildren (nav) {
      return this._.size(nav.children)
    },
    getLink (nav) {
      const baseUrl = this.baseUrl
      const path = this._.get(nav, 'path')
      return baseUrl + path
    },
    getName (nav) {
      const name = this._.get(nav, 'name')
      return `nav.${name}`
    },
    addNavbarActiveClass () {
      return this.isNavbarActive ? 'active' : ''
    },
    addNavIconClass (nav) {
      const icon = this._.get(nav, 'icon')
      return icon ? `fa-duotone fa-${icon}` : ''
    },
    addNavActiveClass (nav) {
      const baseUrl = this.baseUrl
      const currentPath = this._.get(this.$route, 'path')
      const path = this._.get(nav, 'path')
      const pathExcept = this._.get(nav, 'path_except')

      if(pathExcept) {
        let pathExcepts = pathExcept
        if(!this._.isArray(pathExcept)) {
          pathExcepts = [pathExcept]
        }

        let isExcept = false
        this._.each(pathExcepts, (value) => {
          const regexp = new RegExp(`^${baseUrl}${pathExcept}(?=\\/|\\?|$)`)
          if(currentPath.match(regexp)) {
            isExcept = true
          }
        })

        if(isExcept) return ''
      }

      const regexp = new RegExp(`^${baseUrl}${path}(?=\\/|\\?|$)`)

      return currentPath.match(regexp) ? 'active' : ''
    }
  }
}
</script>