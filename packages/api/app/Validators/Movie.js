'use strict'

class Movie {
  static rules () {
    return {
      search: {
        query: 'required',
      },
    }
  }

  static messages () {
    return {
      'query.required' : 'query.required',
    }
  }
}

module.exports = Movie
