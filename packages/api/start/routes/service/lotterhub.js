'use strict'

const Route = use('Route')

Route.group(() => {
  Route.get('stock/:date', 'LotterhubController.stock')
  Route.get('yeekee/:zone/:slug/:date', 'LotterhubController.yeekee')
})
.prefix('service/lotterhub')
.namespace('Service')
// .middleware(['movie'])
