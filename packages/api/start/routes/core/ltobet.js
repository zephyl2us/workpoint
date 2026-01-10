'use strict'

const Route = use('Route')

Route.group(() => {
  
  Route.get('dashboard', 'LtobetController.dashboard')
  Route.post('login', 'LtobetController.login')
  Route.get('user/:id/revenue', 'LtobetController.revenue')
  Route.get('user/:id/affliate', 'LtobetController.affliate')
  Route.get('user/:id/downline', 'LtobetController.downline')

  //test api [auth] *bypass

})
.namespace('Ltobet')
.prefix('ltobet')


Route.group(() => {


})
.namespace('Core/Ltobet')
.prefix('core/ltobet')
.middleware(['auth', 'shield:core'])