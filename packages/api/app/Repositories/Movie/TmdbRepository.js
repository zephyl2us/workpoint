'use strict'

const _ = use('lodash')
const moment = use('moment')
const Env = use('Env')
const rp = use('request-promise')
const Bull = use('Bull')
const MovieTmdbCompanyJob = use('App/Jobs/MovieTmdbCompany')
const MovieTmdbCollectionJob = use('App/Jobs/MovieTmdbCollection')
const MovieTmdbPersonJob = use('App/Jobs/MovieTmdbPerson')
const MovieTmdbVideoJob = use('App/Jobs/MovieTmdbVideo')


class TmdbRepository {

  static get inject() {
    return [
			'App/Repositories/Movie/TmdbRequestRepository',
			'App/Repositories/Movie/MovieRepository',
			'App/Repositories/Movie/GenreRepository',
			'App/Repositories/Movie/CompanyRepository',
			'App/Repositories/Movie/CollectionRepository',
			'App/Repositories/Movie/PersonRepository',
      
    ]
  }

  constructor(TmdbRequestRepository, MovieRepository, GenreRepository, CompanyRepository, CollectionRepository, PersonRepository) {
    this.RequestRepository = TmdbRequestRepository
    this.MovieRepository = MovieRepository
    this.GenreRepository = GenreRepository
    this.CompanyRepository = CompanyRepository
    this.CollectionRepository = CollectionRepository
    this.PersonRepository = PersonRepository
  }

  // async request(path, params) {
  //   const requestUrl = `${this.apiUrl}${path}`
  //   let requestOptions = {
  //     method: 'GET',
  //     uri: requestUrl,
  //     headers: {
  //       accept: 'application/json',
  //       authorization: this.token
  //     },
  //     qs: _.assign({
  //       language: 'en-US'
  //     }, params),
  //     json:true
  //   }

  //   // console.log(requestOptions)

  //   const result = await rp(requestOptions)
  //   .then(res => {
  //     return res
  //   }).error(e => {
  //     return false
  //   })

  //   return result
  // }

  // async requestMovieById (id, params = {}) {
  //   const path = `movie/${id}`

  //   const request = await this.request(path, params)
  //   return request
  // }

  // async requestCompanyById (id, params = {}) {
  //   const path = `company/${id}`

  //   const request = await this.request(path, params)
  //   return request
  // }

  // async requestCreditsByMovieId (id, params = {}) {
  //   const path = `movie/${id}/credits`

  //   const request = await this.request(path, params)
  //   return request
  // }

  // async requestPersonById (id, params = {}) {
  //   const path = `person/${id}`

  //   const request = await this.request(path, params)
  //   return request
  // }

  async createMovieGenresByMovieId (movieId, data) {
    const refIds = _.map(data, (genre) => genre.id)

    let genres = await this.GenreRepository.browse({ filter: {
      ref_ids: refIds
    }}).fetch()

    genres = genres.toJSON()

    const genreRefIds = _.map(genres, (genre) => genre.ref_id)

    for (let i in data) {
      const movieGenre = data[i]
      
      if(!_.includes(genreRefIds, movieGenre.id)) {
        let genre = await this.GenreRepository.create({
          ref_id: movieGenre.id,
          name: _.get(movieGenre, 'name')
        })

        genre = genre.toJSON()
        genres.push(genre)
      }

      const genreIndex = _.findIndex(genres, ['ref_id', movieGenre.id])

      const genre = genres[genreIndex]

      const createGenre = await this.MovieRepository.createGenre(movieId, genre.id)
    }
  }

  async createMovieCompaniesByMovieId (movieId, data) {
    const refIds = _.map(data, (company) => company.id)

    let companies = await this.CompanyRepository.browse({ filter: {
      ref_ids: refIds
    }}).fetch()

    companies = companies.toJSON()

    const companyRefIds = _.map(companies, (company) => company.ref_id)

    for (let i in data) {
      const movieCompany = data[i]
      
      if(!_.includes(companyRefIds, movieCompany.id)) {
        let company = await this.CompanyRepository.create({
          ref_id: movieCompany.id,
          name: _.get(movieCompany, 'name'),
          origin_country: _.get(movieCompany, 'origin_country'),
          logo_path: _.get(movieCompany, 'logo_path')
        })

        company = company.toJSON()
        companies.push(company)

        // Job Sync Company
        Bull.add(MovieTmdbCompanyJob.key, {
          id: movieCompany.id
        })
      }

      const companyIndex = _.findIndex(companies, ['ref_id', movieCompany.id])

      const company = companies[companyIndex]

      const createCompany = await this.MovieRepository.createCompany(movieId, company.id)
    }
  }

  async createMovieCollectionByMovieId (movieId, data) {
    if(!_.get(data, 'id')) {
      return
    }
    
    const refId = data.id

    let collection = await this.CollectionRepository.findBy('ref_id', refId)
    // collection = collection.toJSON()

    if(!_.get(collection, 'id')) {
      collection = await this.CollectionRepository.create({
        ref_id: refId,
        original_name: _.get(data, 'name'),
        poster_path: _.get(data, 'poster_path'),
        backdrop_path: _.get(data, 'backdrop_path')
      })
      collection = collection.toJSON()

      // Job Sync Collection
      Bull.add(MovieTmdbCollectionJob.key, {
        id: refId
      })
    }

    const createCollection = await this.MovieRepository.createCollection(movieId, collection.id)
  }


  async createMovieCreditsByMovieId (movieId, group, data) {

    data = _.filter(data, (person) => {
      if(_.eq('crew', group)) {
        const personDepartment = _.get(person, 'department')
        const personJob = _.get(person, 'job')
        if(!_.includes(['Writing', 'Directing'], personDepartment)) {
          return
        }

        if(_.eq('Directing', personDepartment) && !_.eq('Director', personJob)) {
          return
        }
      }
      return person
    })

    // console.log(data)

    const refIds = _.map(data, (person) => person.id)

    let people = await this.PersonRepository.browse({ filter: {
      ref_ids: refIds
    }}).fetch()

    people = people.toJSON()

    let personRefIds = _.map(people, (person) => person.ref_id)

    for (let i in data) {
      const credit = data[i]

      if(!_.includes(personRefIds, credit.id)) {
        const genders = {
          1: 'female',
          2: 'male'
        }

        const gender = _.get(genders, _.get(credit, 'gender')) || 'other'

        let person = await this.PersonRepository.create({
          ref_id: credit.id,
          original_name: _.get(credit, 'original_name'),
          profile_path: _.get(credit, 'profile_path'),
          popularity: _.get(credit, 'popularity'),
        })
        person = person.toJSON()
        people.push(person)
        personRefIds.push(credit.id)

        // Job Sync Person
        Bull.add(MovieTmdbPersonJob.key, {
          id: credit.id
        })
      }

      const personIndex = _.findIndex(people, ['ref_id', credit.id])

      const person = people[personIndex]

      let department = _.get(credit, 'department') || 'Acting'
      department = _.replace(_.lowerCase(_.replace(department, '&', 'and')), / /g, '_')

      let job = _.get(credit, 'job') || 'Actor'
      job = _.replace(_.lowerCase(job), / /g, '_')

      const createCredit = await this.MovieRepository.createOrUpdateCredit(movieId, person.id, {
        ref_id: _.get(credit, 'credit_id'),
        group: group,
        department: department,
        job: job,
        character: _.get(credit, 'character'),
        order: _.has(credit, 'order') ? credit.order + 1 : null,
      })
    }
  }

  async createMovieVideoByMovieId (movieId, data) {
    console.log(`createMovieVideoByMovieId`)
    if(!_.get(data, 'id')) {
      return
    }
    
    const refId = data.id

    Bull.add(MovieTmdbVideoJob.key, {
      id: refId
    })
    
  }

}

module.exports = TmdbRepository
