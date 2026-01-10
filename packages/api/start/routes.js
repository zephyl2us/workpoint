'use strict'
const Env = use('Env')

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/**
* Example
*/
require('./routes/example')

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

// Route.group(() => {
  Route.on('/').render('welcome')
  Route.on('/example/player').render('example.player')
// }).domain(Env.get('DOMAIN_WORKPOINT'))

require('./routes/auth')

require('./routes/core/account')
require('./routes/core/army')
require('./routes/core/horoscope')
require('./routes/core/lottery')
require('./routes/core/movie')
require('./routes/core/user')
require('./routes/core/ltobet')
require('./routes/core/extension')

require('./routes/core/extra')

require('./routes/mobile/auth')
require('./routes/mobile/huayscanner')

require('./routes/movie/movie')

require('./routes/service/lotterhub')
require('./routes/image')
