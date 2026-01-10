'use strict'

const _ = use('lodash')
const moment = use('moment')
const Env = use('Env')
const rp = use('request-promise')


class TmdbRepository {

  static get inject() {
    return []
  }

  constructor() {
    this.apiUrl = 'https://api.themoviedb.org/3/'
    this.token = `Bearer ${Env.get('MOVIE_TMDB_API_KEY')}`
  }

  async request(path, params) {
    const requestUrl = `${this.apiUrl}${path}`
    console.log(requestUrl)
    let requestOptions = {
      method: 'GET',
      uri: requestUrl,
      headers: {
        accept: 'application/json',
        authorization: this.token
      },
      qs: _.assign({
        language: 'en-US'
      }, params),
      json:true
    }

    // console.log(requestOptions)

    const result = await rp(requestOptions)
    .then(res => {
      return res
    }).error(e => {
      return false
    })

    return result
  }

  async requestMovieById (id, params = {}) {
    const path = `movie/${id}`

    const request = await this.request(path, params)
    return request
  }

  async requestMovieVideoById (id, params = {}) {
    const path = `movie/${id}/videos`

    const request = await this.request(path, params)
    return request
  }

  async requestCompanyById (id, params = {}) {
    const path = `company/${id}`

    const request = await this.request(path, params)
    return request
  }

  async requestCollectionById (id, params = {}) {
    const path = `collection/${id}`

    const request = await this.request(path, params)
    return request
  }

  async requestCreditsByMovieId (id, params = {}) {
    const path = `movie/${id}/credits`

    const request = await this.request(path, params)
    return request
  }

  async requestPersonById (id, params = {}) {
    const path = `person/${id}`

    const request = await this.request(path, params)
    return request
  }
}

module.exports = TmdbRepository
