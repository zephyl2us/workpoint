'use strict'

const md5 = require('md5')

const _ = use('lodash')
const moment = use('moment')
const Env = use('Env')
const Bull = use('Bull')
const Drive = use('Drive')
const Helpers = use('Helpers')
const util = require('util')
const langdetect = use('langdetect')
const Database = use('Database')
// const BullTestJob = use('App/Jobs/BullTest')

class KritController {

	// async bullTest () {
	// 	const data = {
	// 		bull: 'Test Data'
	// 	}

	// 	Bull.add(BullTestJob.key, data)

	// 	const delayAsSeconds = 5 * 1000
		
	// 	Bull.schedule(BullTestJob.key, data, delayAsSeconds)
	
	// 	return 'Bull Test'
	// }

	async syncOneUser ({ request, response }) {

    const pageSize = 5000
    let page = 1
    let totalProcessed = 0

    while (true) {
      const stats = await Database
        .connection('mysql_one')
        .select('*')
        .from('user_stats')
        .forPage(page, pageSize)

      if (stats.length === 0) break

			// if (page > 1) break

      // ดึง user ที่เกี่ยวข้องทั้งหมดในรอบนี้
      const userIds = stats.map(s => s.user_id)
      const users = await Database
        .connection('mysql_one')
        .select('*')
        .from('users')
        .whereIn('id', userIds)

      // รวมข้อมูล
      const merged = stats.map(stat => {
        const user = users.find(u => u.id === stat.user_id)
        return {

          one_user_id: stat.user_id,
					master_user_id: user.master_user_id,
					agent_user_id: user.agent_user_id,
          username: user ? user.username : null,
					role: user.role,
					first_name: user.first_name,
					last_name: user.last_name,
					date_of_birth: user.date_of_birth,
					mobile: user.mobile,
					login_count: user.login_count,
					last_login_at: user.last_login_at,

					deposit: stat.deposit,
					withdraw: stat.withdraw,
					bet_credit: stat.bet_credit,
					bet_rolling: stat.bet_rolling,
					result_bet_credit: stat.result_bet_credit,
					bet_lotto_government: stat.bet_lotto_government,
					bet_lotto_stock: stat.bet_lotto_stock,
					bet_lotto_yeekee: stat.bet_lotto_yeekee,
					bet_game_paoyingchub: stat.bet_game_paoyingchub,
					bet_game_huakoi: stat.bet_game_huakoi,
					af_bet_lotto_government: stat.af_bet_lotto_government,
					af_bet_lotto_stock: stat.af_bet_lotto_stock,
					af_bet_lotto_yeekee: stat.af_bet_lotto_yeekee,
					af_bet_game_paoyingchub: stat.af_bet_game_paoyingchub,
					af_bet_game_huakoi: stat.af_bet_game_huakoi,
					af_bet_credit: stat.af_bet_credit,
					af_bet_rolling: stat.af_bet_rolling,
					settlement: stat.settlement,
					betall: stat.betall,
					revenue_income: stat.revenue_income,
					revenue_outcome: stat.revenue_outcome,
					revenue_settlement: stat.revenue_settlement,
					rolling: stat.rolling,
					revenue_commission: stat.revenue_commission,
					revenue_af: stat.revenue_af,
					
					deposit_times: stat.deposit_times,
					withdraw_times: stat.withdraw_times,
					latest_update_bet: stat.latest_update_bet,
					latest_deposit: stat.latest_deposit,
					latest_withdraw: stat.latest_withdraw,

          // user_id: stat.user_id,
          // username: user ? user.username : null,
          // deposit: stat.deposit,
          // withdraw: stat.withdraw,
          // betall: stat.betall
        }
      }).filter(r => r.username) // ตัดที่ไม่มี user

      // insert ทีละ batch (หรือจะใช้ insertMany ก็ได้)
      for (const row of merged) {
				console.log(row)
        await Database
          .connection('mysql')
          .table('ext_one_users')
          .insert(row)
      }

      totalProcessed += merged.length
      console.log(`Synced page ${page}, total ${totalProcessed}`)

      page++
    }

    return response.send({ status: 'done', totalProcessed })
	}

	async adsPowerToGoLogin ({ request, response }) {
		const users = await this.getProfileData()

		const ArmyAntRepository = make('App/Repositories/ArmyAntRepository')
		const GoLoginRepository = make('App/Repositories/GoLoginRepository')
		
		const filter = {
			gologin_id: false
		}

    let ants = await ArmyAntRepository
			.browse({ filter: filter, sort: 'id|asc' })
			// .where('id', 206)
			.limit(200)
			.fetch()

		ants = ants.toJSON()

		for(let i = 0; i < _.size(ants); i++) {
			const antData = ants[i]
			const adsPowerId = _.get(antData, 'adspower_id')

			if(!adsPowerId) {
				console.log(`#${antData.id} : No AdsPower Id`)
				continue
			}

			const farmData = _.get(users, adsPowerId)
			console.log(farmData)

			if(!_.has(farmData, 'name')) {
				console.log(`#${antData.id} : No AdsPower Name`)
				continue
			}

			farmData.name = `[${antData.id}] ${antData.first_name_en} ${antData.last_name_en}`
			const createUser = await GoLoginRepository.createUser(farmData)
	
			const goLoginId = _.get(createUser, 'id')

			if(!goLoginId) {
				console.log(`#${antData.id} : Cann't Create Farm`)
				continue
			}

			// await new Promise(r => setTimeout(r, 2000))

			// if(farmData.cookie) {
			// 	const addCookie = await GoLoginRepository.addCookieToProfile({
			// 		profile_id: goLoginId,
			// 		cookie: farmData.cookie
			// 	})
			// }

			if(farmData.folder_id && farmData.folder_id !== '0') {
				const addToFolder = await GoLoginRepository.addProfileToFolder({
					folder_id: farmData.folder_id,
					profile_id: goLoginId
				})
			}

			if(_.size(farmData.tags)) {
				for(let i = 0; i < _.size(farmData.tags); i++) {
					const tag = farmData.tags[i]
					const addTag = await GoLoginRepository.addTagToProfile({
						title: tag.title,
						color: tag.color,
						profile_id: goLoginId
					})
				}
			}

			// await GoLoginRepository.runOnCloud({
			// 	profile_id: goLoginId
			// })

			const ant = await ArmyAntRepository.findBy('id', antData.id)
			await ArmyAntRepository.update(ant, {
				gologin_id: goLoginId
			})
		}

		return response.ok('ok')
	}

	async cookieToGoLogin ({ request, response }) {
		const users = await this.getProfileData()

		const ArmyAntRepository = make('App/Repositories/ArmyAntRepository')
		const GoLoginRepository = make('App/Repositories/GoLoginRepository')
		
		const filter = {
			gologin_id: true,
			tiktok_enable: 0
		}

    let ants = await ArmyAntRepository
			.browse({ filter: filter, sort: 'id|asc' })
			// .where('id', 206)
			.limit(300)
			.fetch()

		ants = ants.toJSON()

		for(let i = 0; i < _.size(ants); i++) {
			const antData = ants[i]
			const adsPowerId = _.get(antData, 'adspower_id')

			if(!adsPowerId) {
				console.log(`#${antData.id} : No AdsPower Id`)
				continue
			}

			const farmData = _.get(users, adsPowerId)
			console.log(farmData)

			const goLoginId = _.get(antData, 'gologin_id')

			if(!goLoginId) {
				console.log(`#${antData.id} : Cann't find ant`)
				continue
			}

			// await new Promise(r => setTimeout(r, 2000))

			if(farmData.cookie) {
				const addCookie = await GoLoginRepository.addCookieToProfile({
					profile_id: goLoginId,
					cookie: farmData.cookie
				})
			}

			const ant = await ArmyAntRepository.findBy('id', antData.id)
			await ArmyAntRepository.update(ant, {
				tiktok_enable: 1
			})
		}

		return response.ok('ok')
	}
	
	async getProfileData () {
		const fs = require('fs')
		const dataFile = `./data/adspower_20231124.csv`
		
		if (!fs.existsSync(dataFile)){
			console.log('no data')
			return
		}

    const userFile = fs.readFileSync(dataFile, 'utf8')
		const files = userFile.split("\n")

		const size = _.size(files)
		let records = []
		let users = {}
		for(let i = 0; i < size; i++) {
			const index = size - 1 - i
			let data = files[index]

			const regex = /,,"\[?.*\]"$/g
			const found = data.match(regex)

			// console.log(data)
			let cookie = null
			if(found) {
				data = _.replace(data, found, ',,,')
				cookie = _.replace(found, ',,"[', '[')
				cookie = _.replace(cookie, ']",', ']')
				cookie = _.replace(cookie, new RegExp("\"\"","g"), '"')
				cookie = _.replace(cookie, new RegExp("\\\\","g"), '\\')
				cookie = _.replace(cookie, new RegExp("\"$", "g"), '')

				const cookies = JSON.parse(cookie)

				_.each(cookies, (c, i) => {
					c.expirationDate = c.expires

					_.unset(c, 'expires')

					cookies[i] = c
				})

				cookie = cookies
			}

			const largeCookie = /Cookie too large and exceeds Excel\'s grid limits$/g
			const findLargeCookie = data.match(largeCookie)

			let isLargeCookie = false
			if(findLargeCookie) {
				isLargeCookie = true
				data = _.replace(data, 'Cookie too large and exceeds Excel\'s grid limits', ',')
			}
			data = _.replace(data, ',,,,,,', '')

			// console.log(data)
			const dataSplit = _.split(data, ',')

			const group = _.get(dataSplit, 2)
			let folderId = '0'
			if(group === 'NEW') {
				folderId = 'NEW'
			} else if(isLargeCookie) {
				folderId = 'Cookie'
			} else if(group === 'NBC') {
				folderId = 'NBC'
			} else if(group === 'TMB') {
				folderId = 'TMB'
			} else if(group === 'EMP') {
				folderId = 'EMP'
			} else {
				folderId = 'Ungrouped'
			}

			// console.log(dataSplit)

			const tags = []
			const dataSlice = dataSplit.slice(4)
			// console.log(dataSlice)
			_.each(dataSlice, (value) => {
				value = _.replace(value, new RegExp("\"","g"), '')
				// console.log(value)

				let tag = null
				if(value === 'Gmail') {
					tag = {
						id: "655fe486b1edfb8a5f9e1d0a",
						title: "Gmail",
						color: "lime"
					}
				} else if(value === 'Facebook') {
					tag = {
						id: "655fe48db1edfb8a5f9e7c35",
						title: "FB",
						color: "lime"
					}
				} else if(value === 'Instagram') {
					tag = {
						id: "655fe495b1edfb8a5f9efd0f",
						title: "IG",
						color: "lime"
					}
				} else if(value === 'Tiktok') {
					tag = {
						id: "655fe49cb1edfb8a5f9f6c21",
						title: "TT",
						color: "lime"
					}
				} else if(value === '_______ Gmail') {
					tag = {
						id: "655fe4c6b1edfb8a5fa1da68",
						title: "Gmail Appeal",
						color: "yellow"
					}
				} else if(value === '_______ FB') {
					tag = {
						id: "655fe4dab1edfb8a5fa32423",
						title: "FB Appeal",
						color: "yellow"
					}
				} else if(value === '_______ IG') {
					tag = {
						id: "655fe575b1edfb8a5fac8611",
						title: "IG Appeal",
						color: "yellow"
					}
				} else if(value === 'Bot ______') {
					tag = {
						id: "655fe59ab1edfb8a5faec4ea",
						title: "DIGGER",
						color: "lilac"
					}
				} else if(value === 'ban') {
					tag = {
						id: "655fe530b1edfb8a5fa83656",
						title: "BAN",
						color: "peach"
					}
				}

				if(tag) {
					tags.push(tag)
				}
			})

			const record = {
				name: _.get(dataSplit, 3),
				browserType: "chrome",
				os: "android",
				navigator: {
					userAgent: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
					resolution: "384x857",
					language: "en-GB,en-US;q=0.9,en;q=0.8",
					platform: "Android OS",
					doNotTrack: true
				},
				proxyEnabled: false,
				proxy: {
					mode: "http",
					host: "",
					port: 0,
					username: "",
					password: ""
				},
				timezone: {
					enabled: true,
					fillBasedOnIp: true,
					timezone: "Asia/Bangkok"
				},
				fonts: {
					families: [
						"Roboto"
					]
				},
				updateExtensions: true,

				folder_id: folderId,
				cookie: cookie,
				tags: tags,
			}

			const id = _.get(dataSplit, 1)
			users[id] = record
		}

		return users
	}

	async adsPowerData ({ request, response }) {
		const fs = require('fs')
		const dataFile = `./data/user_adspower.csv`
		
		if (!fs.existsSync(dataFile)){
			console.log('no data')
			return
		}

    const userFile = fs.readFileSync(dataFile, 'utf8')
		const files = userFile.split("\n")

		const size = _.size(files)
		let records = []
		let users = {}
		for(let i = 0; i < size; i++) {
			const index = size - 1 - i
			let data = files[index]

			const regex = /,,"\[?.*\]",/g
			const found = data.match(regex)

			// console.log(data)
			let cookie = ''
			if(found) {
				data = _.replace(data, found, ',,,')
				cookie = _.replace(found, ',,"[', '[')
				cookie = _.replace(cookie, ']",', ']')
				cookie = _.replace(cookie, new RegExp("\"\"","g"), '"')
			}
			const dataSplit = _.split(data, ',')

			const group = _.get(dataSplit, 2)
			let groupId = '0'
			if(group === 'NBC') {
				groupId = '3265160'
			} else if(group === 'TMB') {
				groupId = '3265158'
			} else if(group === 'EMP') {
				groupId = '3265156'
			}

			const record = {
				name: _.get(dataSplit, 3),
				group_id: groupId,
				cookie: cookie,
				user_proxy_config: {
					proxy_soft: 'no_proxy'
				},
				fingerprint_config: {
					automatic_timezone: '1',
					language: ['en-US','en','th-TH','th'],
					ua: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
					screen_resolution: '1440_3088'
				}
			}

			const id = _.get(dataSplit, 1)
			users[id] = record
		}

		const ArmyAntRepository = make('App/Repositories/ArmyAntRepository')
		const AdsPowerRepository = make('App/Repositories/AdsPowerRepository')
		
		const filter = {
			tiktok_enable: 0
		}

    let ants = await ArmyAntRepository
			.browse({ filter: filter, sort: 'id|asc' })
			.limit(100)
			.fetch()
		// for()

		ants = ants.toJSON()
		// console.log(ants)

		for(let i = 0; i < _.size(ants); i++) {
			const antData = ants[i]
			const adsPowerId = _.get(antData, 'adspower_id')

			if(!adsPowerId) {
				console.log(`#${antData.id} : No AdsPower Id`)
				continue
			}

			const farmData = _.get(users, adsPowerId)

			if(!_.has(farmData, 'name')) {
				console.log(`#${antData.id} : No AdsPower Name`)
				continue
			}

			// const farmData = {
			// 	name: `${firstName} ${lastName}`,
			// 	group_id: '0',
			// 	user_proxy_config: {
			// 		proxy_soft: 'no_proxy'
			// 	},
			// 	fingerprint_config: {
			// 		automatic_timezone: '1',
			// 		language: ['en-US','en','th-TH','th'],
			// 		ua: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
			// 		screen_resolution: '1440_3088'
			// 	}
			// }
			
			const createFarm = await AdsPowerRepository.createUser(farmData)
	
			const farmId = _.get(createFarm, 'data.id')

			if(!farmId) {
				console.log(`#${antData.id} : Cann't Create Farm`)
				continue
			}

			const ant = await ArmyAntRepository.findBy('id', antData.id)
			await ArmyAntRepository.update(ant, {
				adspower_id: farmId,
				tiktok_enable: 1
			})
		}

		return response.ok('ok')
	}

	async adsPower ({ request, response }) {
		const AdsPowerRepository = make('App/Repositories/AdsPowerRepository')

		const options = {
			path: '/api/v1/user/list'
		}

		// console.log('adsPower')
		// const data = {
		// 	page: 2,
		// 	page_size: 50
		// }
		// const result = await AdsPowerRepository.fetchUser(data)

		const data = {
			server: 'adspower-01',
			name: 'First Last',
			group_id: "0",
			user_proxy_config: {
				proxy_soft: 'no_proxy'
			}
		}
		const result = await AdsPowerRepository.createUser(data)


		return response.ok(result)
	}

	async movieActive ({ request, response }) {
		const MovieRepository = make('App/Repositories/Movie/MovieRepository')

		const filter = {
			is_enable: false
		}

    let movies = await MovieRepository
			.browse({ filter: filter })
			.with('medias')
			.limit(3000)
			.fetch()

		movies = movies.toJSON()

		for(let i = 0; i < _.size(movies); i++) {
			const movie = movies[i]
			const movieId = movie.id
			const medias = _.get(movie, 'medias')

			if(!_.size(medias)) {
				console.log(`${movieId} Skip: No Media`)
				continue
			}

			if(_.get(movie, 'slug')) {
				console.log(`${movieId} Skip: Exists Slug`)
				continue
			}

      const originalTitle = _.get(movie, 'original_title')
      // const title = _.get(movie, 'title')

      let slug = `${originalTitle}`

      const releaseDate = _.get(movie, 'release_date')
      if(releaseDate) {
        const year = moment(releaseDate).format('YYYY')
        slug += `-${year}`
      }

			slug = _.toLower(slug)
			slug = _.lowerCase(slug)
      // slug = _.snakeCase(slug)
      slug = _.replace(slug, / /g, '-')

			const movieBySlug = await MovieRepository.findBy('slug', slug)

			const movieBySlugId = _.get(movieBySlug, 'id')
			if(movieBySlugId) {
				if(movieBySlugId != movieId) {
					console.log(`${movieId} Skip: Duplicated Slug (${slug})`)
					continue
				}
			}

			const findMovie = await MovieRepository.findBy('id', movieId)

			const data = {
				is_enable: 1,
				slug: slug
			}

			const updated = await MovieRepository.update(findMovie, data)
			if(!updated) {
				console.log(`${movieId} Error: Cann't Update`)
			}

			console.log(`${movieId} Updated`)
		}

		return true
	}

	async puppeteer ({ request, response }) {
		const ResultAuthRepository = make('App/Repositories/Lottery/ResultAuthRepository')
		const ResultYeekeeRepository = make('App/Repositories/Lottery/ResultYeekeeRepository')

		// const result = await ResultAuthRepository.ruamchoke()
		// const result = await ResultYeekeeRepository.ruamchoke('2023-08-22')

		// const result = await ResultAuthRepository.ruaychoke()
		// const result = await ResultYeekeeRepository.ruaychoke('2023-08-22')

		// const result = await ResultAuthRepository.haichoke()
		// const result = await ResultYeekeeRepository.haichoke('2023-08-22')

		// const result = await ResultAuthRepository.jakchoke()
		// const result = await ResultYeekeeRepository.jakchoke('2023-08-22')

		// const result = await ResultAuthRepository.taweechoke()
		const result = await ResultYeekeeRepository.taweechoke('2023-08-22')

		// console.log(result)
		return result
	}


	async loggly ({ request, response }) {

		const LogRepository = make('App/Repositories/LogRepository')

		const dataLogs = {
			title: 'TestProcess-job',
			path: 'app/Jobs',
			channel: 'kue',
			message: 'Message',
			data: { date: 'test' },
			params: { params: 'test' }
		}
		LogRepository.fire(dataLogs)
	}

	async getToken ({ request, response }) {
		const LotteryCategoryRepository = make('App/Repositories/LotteryCategoryRepository')

    const filter = {
			type: 'yeekee',
			zones: ['lottoone', 'ltobet', 'huay', 'dnabet'],
			is_enable: true
		}

		let categories = await LotteryCategoryRepository.browse({ filter }).fetch()

    categories = categories.toJSON()
		const categoryZones = []
		
		_.each(categories, (category) => {
			if(!_.includes(categoryZones, category.zone)) {
				categoryZones.push(category.zone)
			}
		})

		return categoryZones
	}

	
	async tmpTest ({ request, response }) {
		const SpacesRepository = make('App/Repositories/Storage/SpacesRepository')

		const image = await SpacesRepository.getImage('tmdb/bZajjYEJCYJ2tTTfsjdyXzrttki.jpg')

		return response.header('Content-type', 'image/jpeg').send(image)
	}

	async tmpImage ({ request, response }) {

		const consumers = use('node:stream/consumers')
		const filepath = 'tmdb/bZajjYEJCYJ2tTTfsjdyXzrttki.jpg'

    // if (await Drive.disk('do').exists(filepath)) {
    //   const file = await Drive.disk('do').get(filepath)
    //   const headers = {
    //     'Content-Type': file.contentType,
    //   }

		// 	// console.log(file)
    //   return response.send(file.stream, 200, headers)
    // }
		
    // return response.status(404).send('File not found')
		try {
			const SpacesRepository = make('App/Repositories/Storage/SpacesRepository')
			const objResponse = await SpacesRepository.getImage(filepath)

      response.header('Content-Type', objResponse.ContentType)
      response.header('Content-Length', objResponse.ContentLength)
      response.header('ETag', objResponse.ETag)
      //https://legacy.adonisjs.com/docs/4.1/response#_but_i_like_my_callbacks
      response.implicitEnd = false

      //https://github.com/aws/aws-sdk-js-v3/issues/1877#issuecomment-1463923284
      const buffer = await consumers.buffer(objResponse.Body)
      response.send(buffer)

		} catch (error) {
			console.error(error)
			return response.status(500).send('Internal Server Error')
		}
	}

	async exec (command) {
		const { exec } = require('child_process')
		return new Promise((resolve, reject) => {
		 exec(command, (err, stdout, stderr) => {
			if (err) {
			 console.error(`Exec: Fail to execute command ${command}`)
			 console.error(err);
			 console.error(stderr);
			 return reject(err);
			}
	 
			return resolve(stdout);
		 })
		})
	}

	async fetchMovieLibary ({ request, response }) {
		const fs = require('fs')
		const SourceRepository = make('App/Repositories/Movie/SourceRepository')

		const movieDirectory = Env.getOrFail('MOVIE_SOURCE_DIRECTORY')
		const streamDirectory = Env.getOrFail('MOVIE_STREAM_DIRECTORY')
		const tempFile = `${streamDirectory}/movie.list`
		
		if (!fs.existsSync(streamDirectory)){
			fs.mkdirSync(streamDirectory)
		}

		// const command = `find "${movieDirectory}/Inter Movie/Boxset" -type f -name "*.mkv" -ls -print > ${tempFile}`
		const command = `find "${movieDirectory}/Test" -type f -name "*.mkv" -ls -print > ${tempFile}`

		const exec = await SourceRepository.exec(command)

    const movieFile = fs.readFileSync(tempFile, 'utf8')
		const files = movieFile.split("\n")

		let movieAll = 0
		let movieCount = 0
		let yearNotfound = 0
		let resolutionNotfound = 0
		let movies = []

		for(let i = 1; i < _.size(files); i+=2) {
			movieAll++

			let ls = files[i - 1]
			ls = _.split(ls, ' /')[0]
			console.log(ls)
			const sizeFound = ls.match(/[0-9]{9,11}/g)
			const size = _.get(_.slice(sizeFound, -1), 0) || null

			const sourceFile = files[i]
			let file = sourceFile

			file = _.replace(file, movieDirectory, "")
			const paths = file.split("/")
			const path = _.join(_.slice(paths, 0, _.size(paths) - 1), '/')
			const fileName = paths[_.size(paths) - 1]

			if(fileName && path) {
				const source = {
					hash: md5(fileName),
					file: fileName,
					path: path,
					size: size
				}

				const data = SourceRepository.generateSourceDetail(source)
				// console.log(data)
				if(!data.year) {
					// console.error(fileName)
					yearNotfound++
				}
				if(!data.resolution) {
					// console.error(fileName)
					resolutionNotfound++
				}

				movieCount++
				movies.push(data)

				const sourceInfo = await this.sourceInfo(sourceFile)
				// console.log(sourceInfo)
				
				// console.log(data)
			}
		}

		const totalMovie = _.size(movies)
		// const removeCommand = `rm ${listLocation}`
		// await this.exec(removeCommand)

		return movies
	}

	async sourceInfo (sourceFile) {
		const ffmpeg = require('fluent-ffmpeg')
    return new Promise((resolve, reject) => {
			ffmpeg.ffprobe(sourceFile, (err, metadata) => {
        if (err) reject(err)
        resolve(metadata)
      })
    })
	}

	async movieTranscode ({ request, response }) {
		const appRoot = require('app-root-path')
		const fs = require('fs')
		const ffmpeg = require('fluent-ffmpeg')

		const movieDirectory = `/Volumes/Movies`
		const outputDirectory = `/Volumes/Stream`

		// const movie = {
		// 	"hash": "46f020c131989fb7ae99ece2bd05acdf",
		// 	"name": "2012 วันสิ้นโลก 1080p.BrRip.AC3Th.DTSEn [2009].mkv",
		// 	"path": "/Test/2012 วันสิ้นโลก 1080p.BrRip.AC3Th.DTSEn [2009]"
		// }

		const movie = {
			"hash": "d2c796870e4400c8ea2050174e8253bb",
			"name": "Thor The Dark World เทพเจ้าสายฟ้าโลกาทมิฬ 1080p HQ [2013].mkv",
			"path": "/Inter Movie/Boxset/Thor 2 เทพเจ้าสายฟ้าโลกาทมิฬ 1080p HQ [2013]"
		}

		const videoOptions = {
			sd: {
				size: 720,
				bit_rate: '512k',
				audio_rate: '256000'
			},
			hd: {
				size: 1280,
				bit_rate: '1024k',
				audio_rate: '384000'
			},
			fhd: {
				size: 1920,
				bit_rate: '2048k',
				audio_rate: '512000'
			}
		}

		const videoResolution = 'hd'
		const videoConfig = videoOptions[videoResolution]

		const fileInput = `${movieDirectory}${movie.path}/${movie.name}`
		const fileOutputPath = `${outputDirectory}/${movie.hash}-${videoResolution}`
		const fileOutput = `${fileOutputPath}/video.mp4`
		// const fileOutput = `${outputDirectory}${movie.hash}/1080p/video.mp4`

		if (!fs.existsSync(fileOutputPath)){
			fs.mkdirSync(fileOutputPath)
		}

		ffmpeg(fileInput)
			.outputOptions([
				// '-vf scale=-1:1080', // ตั้งค่าความละเอียดสูงสุดไม่เกิน 1080p
				'-map 0:a',
				'-map 0:v',
				'-c:a:0 aac',
				'-metadata:s:a:0 language=tha',
				'-c:a:1 aac',
				'-metadata:s:a:1 language=eng',
			])
			// .outputOptions('-scodec mov_text') // ตั้งค่าการแปลง sub title
			// .outputOptions('-map 0')
			.videoCodec('libx264')
			.videoBitrate(videoConfig.bit_rate)
			.size(`${videoConfig.size}x?`)
			.audioCodec('ac3')
			.audioBitrate(videoConfig.audio_rate)
			.format('mp4')
			.on('start', function() {
				console.log('Start convert');
			})
			.on('progress', function(progress) {
				console.log('Processing: ' + progress.percent + '% done');
			})
			.on('end', function() {
				console.log('File has been converted succesfully');
			})
			.on('error', function(err) {
				console.log('An error occurred: ' + err.message);
			})
			.save(fileOutput)

	}
}

module.exports = KritController
