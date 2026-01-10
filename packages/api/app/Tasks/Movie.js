'use strict'

const Task = use('Task')
const rp = use('request-promise')

class Movie extends Task {
  static get schedule () {
    return '0 */1 * * * *'
  }

  async handle () {
    const url = `https://api.themoviedb.org/3/discover/movie`
    try {
      const options = {
        method: 'GET',
        uri: url,
        headers: {
          accept: 'application/json',
          authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2YTY4YjI4MmQ1M2Y3MWI2NWYyZGIyNTQzOWY2OTMzNCIsInN1YiI6IjY0ODQ5MmZhYmYzMWYyNTA1ODgxNjAwMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.xnDlTfEpsQUGE0BrYzc_l9X-g5x3vF0yDIlSmfmWUTw`
        }
      }

      const result = await rp(options)
      .then(function (res) {
        return res
      }).error(function (e) {
        return e
      })

      console.log(result)
      
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = Movie
