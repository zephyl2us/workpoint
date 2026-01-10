// eslint-disable-next-line import/no-named-as-default
import VuexPersistence from 'vuex-persist'

// const vuexLocal = new VuexPersistence({
//   storage: window.localStorage,
//   reducer: (state) => {
//     return {
//       user: {
//         sessionToken: state.user.sessionToken,
//       },
//     }
//   }
// })

// export const state = () => ({
//   auth: null,
// })

// export const mutations = {
//   RESTORE_MUTATION: (state, savedState) => {
//     Object.assign(state, savedState)
//   },
// }

// export const plugins = [vuexLocal.plugin]

export default ({ store }) => {
  window.onNuxtReady(() => {
    new VuexPersistence({
      key: 'persistTransport',
      strictMode: false,
      storage: window.localStorage,
      reducer: (state) => {
        return {
          user: {
            sessionToken: state.user.sessionToken,
          },
        }
      }
    }).plugin(store)
  })
}