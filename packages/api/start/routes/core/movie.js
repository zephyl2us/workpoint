'use strict'

const Route = use('Route')

Route.group(() => {

  // Route.get('search', 'MovieController.search')
  // Route.get('tmdb/search', 'TmdbController.search')
  // Route.get('tmdb/person', 'TmdbController.syncPerson')
  // Route.get('tmdb/:id', 'TmdbController.syncMovie')

}).namespace('Movie').prefix('movie') //.middleware('auth')


Route.group(() => {

  Route.get('film', 'MovieController.index')
    .middleware(['acl:movie.film.view'])
  Route.get('film/:id', 'MovieController.view')
    .middleware(['acl:movie.film.view'])
  Route.patch('film/:id', 'MovieController.update')
    .middleware(['acl:movie.film.edit'])
  Route.get('film/:id/media/:resolution', 'MovieController.media')
    .middleware(['acl:movie.film.view'])
  Route.post('film/:id/transcode', 'MovieController.transcode')
    .middleware(['acl:movie.film.transcode'])
  // Route.post('sync/source', 'MovieController.syncSource')

  Route.get('collection', 'CollectionController.index')
    .middleware(['acl:movie.film.view'])
  Route.get('company', 'CompanyController.index')
    .middleware(['acl:movie.company.view'])
  Route.get('genre', 'GenreController.index')
    .middleware(['acl:movie.genre.view'])
  Route.get('person', 'PersonController.index')
    .middleware(['acl:movie.person.view'])

  Route.get('source', 'SourceController.index')
    .middleware(['acl:movie.source.view'])
  Route.post('source/sync', 'SourceController.sync')
    .middleware(['acl:movie.source.sync'])
  Route.post('source/link/:id', 'SourceController.link')
    .middleware(['acl:movie.source.movie_link'])

  Route.get('tmdb/search', 'TmdbController.search')
  Route.post('tmdb/sync/movie/:id', 'TmdbController.syncMovie')
  Route.post('tmdb/sync/movie/:id/credit', 'TmdbController.syncCredit')
  Route.post('tmdb/sync/person/:id', 'TmdbController.syncPerson')

})
.namespace('Core/Movie')
.prefix('core/movie')
.middleware(['auth', 'shield:core'])