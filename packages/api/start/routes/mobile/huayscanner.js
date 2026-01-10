'use strict'

const Route = use('Route')

Route.group(() => {
  // Route.get('category', 'LotteryCategoryController.index')
  Route.get('zone', 'LotteryController.zone')
  Route.get('category', 'LotteryController.category')

  Route.get('government', 'LotteryController.government')
  Route.get('government/:slug', 'LotteryController.governmentSlug')
  Route.get('stock', 'LotteryController.stock')
  Route.get('stock/:slug', 'LotteryController.stockSlug')
  Route.get('yeekee/:zone', 'LotteryController.yeekeeZone')
  Route.get('yeekee/:zone/:slug', 'LotteryController.yeekeeSlug')
  //   .validator('LotteryView')

  // Route.get(':id', 'LotteryController.government')

  Route.get('compare/rate', 'LotteryZoneController.rates')
})
.prefix('v1/huay_scanner')
.namespace('Mobile/HuayScanner')
// .middleware(['auth','security'])