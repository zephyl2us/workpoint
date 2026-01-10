'use strict'

const Route = use('Route')

Route.group(() => {
  Route.get('category', 'LotteryCategoryController.index')
    // .middleware(['acl:setting.lottery.view'])
  Route.patch('category/:id', 'LotteryCategoryController.update')
    .middleware(['acl:setting.lottery.edit'])

  Route.get('government', 'LotteryController.government')
    .middleware(['acl:lottery.government.view'])
  Route.get('stock', 'LotteryController.stock')
    .middleware(['acl:lottery.stock.view'])
  Route.get('yeekee', 'LotteryController.yeekee')
    .middleware(['acl:lottery.yeekee.view'])
  Route.get('yeekee/:zone/:slug', 'LotteryController.yeekeeSlug')
    .middleware(['acl:lottery.yeekee.view'])
  Route.get('yeekee/:zone', 'LotteryController.yeekeeZone')
    .middleware(['acl:lottery.yeekee.view'])
  Route.get('zone/:zone/rate', 'LotteryController.zoneRate')
    .middleware(['acl:lottery.yeekee.lottery_rate'])
  Route.patch('zone/:zone/rate', 'LotteryController.updateZoneRate')
    .middleware(['acl:lottery.yeekee.lottery_rate'])
  //   .validator('LotteryView')


  // Route.get(':id', 'LotteryController.government')
})
.namespace('Core/Lottery')
.prefix('core/lottery')
.middleware(['auth', 'shield:core'])