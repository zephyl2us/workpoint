'use strict'

const Route = use('Route')

Route.group(() => {
  Route.get('katei/reward', 'KateiController.index')
})
.namespace('Core/Extra')
.prefix('core/extra')

Route.group(() => {
  // Route.get('katei/reward', 'KateiController.index')
  //   .middleware(['acl:extra.katei.view'])

  Route.patch('katei/reward', 'KateiController.update')
    .middleware(['acl:extra.katei.edit'])


    Route.get('one', 'OneController.index')
    .middleware(['acl:extra.one.view'])

    Route.get('campaign', 'CampaignController.index')
      .middleware(['acl:extra.campaign.view'])

    Route.get('campaign/create/one', 'CampaignController.one')
      .middleware(['acl:extra.campaign.create'])

    Route.post('campaign/create/one', 'CampaignController.storeOne')
      .middleware(['acl:extra.campaign.create'])

    Route.get('campaign/create/huay', 'CampaignController.huay')
      .middleware(['acl:extra.campaign.create'])

    Route.post('campaign/create/huay', 'CampaignController.storeHuay')
      .middleware(['acl:extra.campaign.create'])

    Route.get('campaign/:id', 'CampaignController.view')
      .middleware(['acl:extra.campaign.view'])

    Route.get('campaign/:id/summary', 'CampaignController.summary')
      .middleware(['acl:extra.campaign.create'])

    Route.patch('campaign/:id/user/:user_id/status', 'CampaignController.updateStatus')
      .middleware(['acl:extra.campaign.action'])

    Route.post('campaign/:id/user/:user_id/sms', 'CampaignController.sendSms')
      .middleware(['acl:extra.campaign.action'])

    Route.post('campaign/:id/user/:user_id/checker', 'CampaignController.checker')
      .middleware(['acl:extra.campaign.action'])

    // Route.get('one/export', 'OneController.export')
    // .middleware(['acl:extra.one.export'])

})
.namespace('Core/Extra')
.prefix('core/extra')
.middleware(['auth', 'shield:core'])


Route.group(() => {
  Route.get('one/export', 'OneController.export')

})
.namespace('Core/Extra')
.prefix('core/extra')
// .middleware(['auth', 'shield:core'])

