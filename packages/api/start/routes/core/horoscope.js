'use strict'

const Route = use('Route')

Route.group(() => {
  
  Route.get('search', 'HoroscopeController.search')

  //test api [auth] *bypass

  Route.get('/', 'HoroscopeController.index')
  Route.post('/', 'HoroscopeController.create')
  Route.patch('/:id', 'HoroscopeController.update')
  Route.delete('/:id', 'HoroscopeController.delete')

  Route.get('log', 'HoroscopeLogController.index')
  Route.post('tag', 'HoroscopeTagController.create')


})
.namespace('Horoscope')
.prefix('horoscope')


Route.group(() => {

  // Route.post('/', 'HoroscopeController.create')
  // Route.patch('/:id', 'HoroscopeController.update')
  // Route.delete('/:id', 'HoroscopeController.delete')

  // Route.get('log', 'HoroscopeLogController.index')
  // Route.post('tag', 'HoroscopeTagController.create')

})
.namespace('Core/Horoscope')
.prefix('core/horoscope')
.middleware(['auth', 'shield:core'])