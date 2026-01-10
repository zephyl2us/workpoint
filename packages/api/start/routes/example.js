'use strict'

const Route = use('Route')

Route.group(() => {

	Route.get('database/test', 'DatabaseController.mySqlTest')
	Route.get('queue/test', 'QueueController.bullTest')
	Route.get('pusher/test', 'PusherController.pusherTest')

	Route.get('movie/person', 'AemController.person')
	Route.get('movie/test', 'AemController.test')
	Route.get('movie/search', 'AemController.searchTmdb')
	Route.get('movie/:id', 'AemController.movieById')

	// Route.get('krit/token', 'KritController.getToken')
	// Route.get('krit/temp/test', 'KritController.tmpTest')
	// Route.get('krit/temp/image.jpg', 'KritController.tmpImage')
	// Route.get('krit/ftp_connect', 'KritController.ftpConnect')
	// Route.get('krit/movie/fetch', 'KritController.fetchMovieLibary')
	// Route.get('krit/movie/transcode', 'KritController.movieTranscode')
	// Route.get('krit/language_detect', 'KritController.languageDetect')
	// Route.get('krit/loggly', 'KritController.loggly')
	// Route.get('krit/puppeteer', 'KritController.puppeteer')
	// Route.get('krit/movie/active', 'KritController.movieActive')
	// Route.get('krit/adspower', 'KritController.adsPower')
	// Route.get('krit/adspower', 'KritController.adsPowerData')
	Route.get('krit/adspower', 'KritController.adsPowerToGoLogin')
	Route.get('krit/cookie', 'KritController.cookieToGoLogin')
	Route.get('krit/syncone', 'KritController.syncOneUser')



	// Route.get('soccer/test', 'SoccerController.test')

	Route.get('lottery/migrate', 'LotteryController.migrateExample')
	Route.get('lottery/past/result/glo', 'LotteryController.pastResultThaiGlo')

	Route.get('puppeteer', 'AemController.puppeteer')
	Route.get('scheduler', 'AemController.scheduler')
	Route.get('test', 'AemController.test')
	Route.get('govlotto', 'AemController.govLotto')
	Route.get('stock', 'AemController.stock')
	Route.get('openai', 'AemController.openai')
	Route.get('customer', 'AemController.customer')
	Route.get('spaces', 'AemController.spaces')
	Route.get('orc', 'AemController.imageToText')
	Route.get('image/:size/:name', 'AemController.getImage')
	Route.get('powerball', 'AemController.powerball')
	Route.get('dumpbot', 'AemController.dumpBotAdspower')
	Route.post('upload', 'AemController.uploadTemp')
	Route.get('getimage', 'AemController.getImage')
	Route.delete('softdelete', 'AemController.softDelete')
	Route.get('encode', 'AemController.urlEncoder')
	Route.get('sms', 'AemController.sms')
	Route.get('lottery', 'AemController.lottery')


})
	.namespace('Example')
	.prefix('example') //.middleware('auth')

// Route.get('address', 'Army/RequestController.addressAll').prefix('army')
// Route.get('generate/person', 'Army/RequestController.generatePerson').prefix('army')