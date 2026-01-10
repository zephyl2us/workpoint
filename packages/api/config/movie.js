'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

module.exports = {
  sourceDir: Env.get('MOVIE_SOURCE_DIRECTORY'),
  tempDir: Env.get('MOVIE_TEMP_DIRECTORY'),
  stream: {},
  tmdbDelay: parseInt(Env.get('MOVIE_TEMP_API_DELAY', 0)) * 1000,
  cacheDuration: parseInt(Env.get('MOVIE_CACHE_DURATION', 0)) * 60,

  siteConfig: [
    {
      domain: 'master.movie',
      enable: true,
    },
    {
      domain: 'inter.movie',
      enable: true,
    },
  ],
  imageSize: {
    w45: {
      width: 45
    },
    w92: {
      width: 92
    },
    w154: {
      width: 154
    },
    w185: {
      width: 185
    },
    w200: {
      width: 200
    },
    w300: {
      width: 300
    },
    w342: {
      width: 342
    },
    w500: {
      width: 500
    },
    w780: {
      width: 780
    },
    w1280: {
      width: 1280
    },
    w138_and_h175_face: {
      width: 138,
      height: 175
    },
    w1920_and_h800_multi_faces: {
      width: 1920,
      height: 800
    },
    original:{}
  }
}