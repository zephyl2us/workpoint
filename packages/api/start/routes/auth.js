'use strict'

const Route = use('Route')

Route.group(() => {

  Route.post(':app/auth/login', 'IndexController.login')
  // Route.post('logout', 'IndexController.logout')

  Route.get(':app/auth/me', 'IndexController.me')
    .middleware(['auth'])

})
.namespace('Auth')
// .prefix('core/auth')