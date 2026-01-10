import webpack from 'webpack'
// const development = process.env.NODE_ENV !== 'production'

const meta = [
  { charset: 'utf-8' },
  { name: 'viewport', content: 'initial-scale=1, user-scalable=no, width=device-width, height=device-height, viewport-fit=cover' },
  { hid: 'description', name: 'description', content: '' },
  { name: 'format-detection', content: 'telephone=no' }
]

// Security Policy for request http over https on Production
// if(!development) {
//   meta.push({ 'http-equiv': 'Content-Security-Policy', content: 'upgrade-insecure-requests'})
// }

const config = {
  server: {
    host: process.env.HOST,
    port: process.env.PORT,
  },

  env: {
    pusherAppKey: process.env.PUSHER_APP_KEY,
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Workpoint',
    htmlAttrs: {
      lang: 'en',
    },
    meta,
    // meta: [
    //   { charset: 'utf-8' },
    //   { name: 'viewport', content: 'initial-scale=1, user-scalable=no, width=device-width, height=device-height, viewport-fit=cover' },
    //   { hid: 'description', name: 'description', content: '' },
    //   { name: 'format-detection', content: 'telephone=no' }
    // ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    // '~/assets/scss/plugins/avatar',
    '~/assets/scss/plugins/flag-icon.scss',
    '~/assets/scss/plugins/fontawesome.scss',
    '~/assets/scss/plugins/fontkanit.scss',
    '~/assets/scss/plugins/fontlato.scss',
    // '~/assets/scss/plugins/fontbank',
    // '~/assets/scss/plugins/vuebar',
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    // '~/plugins/auth-next.js',
    // '~/plugins/lodash',
    '~/plugins/vue-clipboard',
    '~/plugins/vue-datepicker',
    // '~/plugins/vue-dialog',
    '~/plugins/vue-lodash',
    '~/plugins/vue-inject',
    '~/plugins/vue-movie',
    // '~/plugins/vue-multiselect',
    '~/plugins/vue-numeral',
    '~/plugins/vue-scrollbar',
    '~/plugins/vue-upload',
    '~/plugins/vue-validate',
    '~/plugins/gtag.js',
    { src: '~/plugins/axios.js', ssr: false },
    { src: '~/plugins/vue-apexchart.js', ssr: false },
    { src: '~/plugins/vue-iframe', ssr: false },
    { src: '~/plugins/vue-paginate', ssr: false },
    { src: '~/plugins/vue-pusher', ssr: false },
    { src: '~/plugins/vuex-persist', ssr: false },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: false,

  // Global component build module
  globalComponents: {
    ignoreNameDetection: true
  },
  // Config build module moment
  moment: {
    defaultLocale: 'th',
    locales: ['th']
  },
  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    '@nuxtjs/i18n',
    '@nuxtjs/toast',
  ],
  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    '@nuxtjs/global-components',
    '@nuxtjs/moment',
  ],

  /**
   * Toast module options
   */
  toast: {
    theme: 'app__noti-tosted',
    position: 'top-right',
    duration: 3000,
    containerClass: 'app__noti',
    iconPack: 'custom-class',
    keepOnHover: true,
    closeOnSwipe: true,
    singleton: true,
    register: [
      {
        name: 'csuccess',
        message: message => message,
        options: {
          type: 'success',
          icon: 'fa-regular fa-circle-check'
        }
      },
      {
        name: 'cerror',
        message: message => message,
        options: {
          type: 'error',
          icon: 'fa fa-exclamation'
        }
      },
      {
        name: 'cinfo',
        message: message => message,
        options: {
          type: 'info',
          icon: 'fa fa-info'
        }
      },
      {
        name: 'cwarning',
        message: message => message,
        options: {
          type: 'warning',
          icon: 'fa fa-radiation'
        }
      }
    ]
  },

  // Axios config
  axios: {
    // baseURL: 'http://127.0.0.1:3000',
    baseUrl: process.env.API_URL || 'http://127.0.0.1:3000'
  },

  // Auth config
  auth: {
    plugins: [
      '~/plugins/auth.js',
    ],
    rewriteRedirects: true, // this is the default option
    redirect: {
      login: '/auth/login',
      logout: false,
      home: '/auth/redirect',
      callback: false,
    },
    strategies: {
      local: {
        // scheme: '~/plugins/auth-next.js',
        token: {
          property: 'token',
          global: true,
          // required: true,
          type: 'Bearer',
          maxAge: 0,
          // maxAge: 24 * (60 * 60)
        },
        user: {
          property: 'user',
          // autoFetch: true
        },
        endpoints: {
          login: { url: '/core/auth/login', method: 'post' },
          user: { url: '/core/auth/me', method: 'get' },
          logout: false
        }
      }
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    // https://nuxtjs.org/docs/configuration-glossary/configuration-build/
    // analyze: true,
    babel: {
      compact: true,
    },
    loaders: {
      scss: {
        sassOptions: {
          quietDeps: true,
          silenceDeprecations: ['import', 'legacy-js-api', 'global-builtin', 'if-function']
        }
      }
    },
    splitChunks: {
      layouts: true
    },
    transpile: [
      'vee-validate/dist/rules'
    ],
    // You can extend webpack config here
    // cssSourceMap: true,
    // You can extend webpack config here
    // extractCSS: true,
    // vendor: [
    //   'axios',
    //   'jquery',
    //   'bootstrap',
    //   'vue-apexchart',
    //   'vue2-datepicker',
    // ],
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
      })
    ]
  },

  // i18n config
  i18n: {
    locales: [
      {
        code: 'th',
        name: 'ภาษาไทย',
        file: 'th.js'
      },
      {
        code: 'us',
        name: 'English',
        file: 'en.js'
      },
    ],
    lazy: true,
    langDir: 'lang/',
    defaultLocale: 'th',
    vueI18n: {
      fallbackLocale: 'th'
    },
    strategy: 'no_prefix',
    rootRedirect: null,
    detectBrowserLanguage: {
      // If enabled, a cookie is set once a user has been redirected to his
      // preferred language to prevent subsequent redirections
      // Set to false to redirect every time
      useCookie: true,
      // Set to override the default domain of the cookie. Defaults to host of the site.
      cookieDomain: null,
      // Cookie name
      cookieKey: 'i18n_redirected',
      // Set to always redirect to value stored in the cookie, not just once
      alwaysRedirect: false,
      // If no locale for the browsers locale is a match, use this one as a fallback
      fallbackLocale: 'th'
    }
  },

  router: {
    middleware: ['auth'],
    linkActiveClass: 'link-active',
    linkExactActiveClass: 'link-exact-active',
    extendRoutes(routes, resolve) {
    },
  }
}

export default config