'use strict'

const Route = use('Route')

Route.group(() => {
  Route.get('/', 'IndexController.index')
  Route.get('view/:slug', 'IndexController.view')
  Route.get('genre/:slug', 'IndexController.genre')
  Route.get('search', 'IndexController.search')
  Route.get('image/:size/:name', 'IndexController.image')
})
.prefix('v1/movie/:domain')
.namespace('Movie')
.middleware(['movie'])
