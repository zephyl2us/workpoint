'use strict'

const fs = use('fs')
const Env = use('Env')
const _ = use('lodash')
const moment = use('moment')
const Helpers = use('Helpers')
const rp = use('request-promise')
const crypto = require('crypto')
// const traverse = use('traverse')

const Helper = exports = module.exports = {}

/**
 * Helper to check development mode.
 */
Helper.isDevMode = function () {
	// return true
	return Env.get('NODE_ENV') === 'development'
}

/**
 * Helper to check db debug mode.
 */
Helper.isDebugDb = function () {
	return Env.get('DEBUG_DB') === 'true'
}

/**
 * Helper to check job debug mode.
 */
Helper.isDebugJob = function () {
	return Env.get('DEBUG_JOB') === 'true'
}

/**
 * Return mysql datetime
 */
Helper.mysqlDateTime = function () {
	return moment(new Date).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * Return mysql date
 */
Helper.mysqlDate = function () {
	return moment(new Date).format('YYYY-MM-DD')
}

/**
 * Swicth
 */
Helper.clusterDb = (className, options = { mode: 'write' }) => {
	let model = use(`App/Models/${className}`)
	if (_.eq(options.mode, 'read')) {
		return use(`App/Models/Read/${className}`)
	}
	return model
}

/**
 * Change array to object [1, 2] -> {1: 2}
 */
Helper.arrayToObjectPairs = function (array) {
	return _.reduce(array, (result, o, i, orig) => {
		if (i & 1) {
			result[orig[i - 1]] = o
		}
		return result
	}, {})
}

/**
 * Convert split to object pairs.
 */
Helper.convertSplitterToObject = function (data, splitter = '|') {
	if (!_.isString(data)) return
	const nodes = data.split(splitter)
	return this.arrayToObjectPairs(nodes)
}

/**
 * Return mysql datetime
 */
Helper.mysqlDateTime = function () {
	return moment(new Date).format('YYYY-MM-DD HH:mm:ss')
}

Helper.sorting = (number, slug) => {
	let numberTemp = number

	if (slug === 'three_mix') {
		if (number.length === 3) {
			let one = number.charAt(0)
			let two = number.charAt(1)
			let three = number.charAt(2)
			let newNumber = ''
			if (one <= two && one <= three) {
				newNumber = `${one}${two}${three}`
			}
			if (two <= one && two <= three) {
				newNumber = `${two}${one}${three}`
			}
			if (three <= one && three <= two) {
				newNumber = `${three}${one}${two}`
			}

			one = newNumber.charAt(0)
			two = newNumber.charAt(1)
			three = newNumber.charAt(2)

			if (two <= three) {
				newNumber = `${one}${two}${three}`
			}
			if (three <= two) {
				newNumber = `${one}${three}${two}`
			}
			return newNumber
		}
	}
	return numberTemp
}

/**
 * Random provate proxy.
 */
Helper.privateProxy = () => {
	const defaultProxies = [
		Env.get('PROXY_01_ENDPOINT') || null,
		Env.get('PROXY_02_ENDPOINT') || null,
		Env.get('PROXY_03_ENDPOINT') || null,
		Env.get('PROXY_04_ENDPOINT') || null,
		Env.get('PROXY_05_ENDPOINT') || null,
		Env.get('PROXY_06_ENDPOINT') || null
	]

	const proxies = []
	_.each(defaultProxies, (proxy) => {
		if(proxy) {
			proxies.push(proxy)
		}
	})

	const proxy = _.size(proxies) ? _.sample(proxies) : false

	return proxy
}

/**
 * Random string.
 */
 Helper.randomString = (length = 10) => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	const charactersLength = characters.length

	let result = ''

	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}

	return result
}

/**
 * Random number
 */
Helper.randomNumber = (length = 6) => {
	const characters = '0123456789'
	const charactersLength = characters.length

	let result = ''
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}
	return result
}

Helper.validateMessage = (validate) => {
	const validateSplit = _.split(validate, '|')
	const message = _.get(validateSplit, '0')

	let response = {
		message: message
	}

	let argument = {}
	if(_.size(validateSplit) > 1) {
		const argSplit = _.split(validateSplit, ',')
		for(let i = 0; i < _.size(argSplit); i++) {
			const arg = argSplit[i]
			const split = _.split(arg, ':')
			argument[split[0]] = split[1]
		}

		response.argument = argument
	}

	return response
}

/**
 * Pagination
 */

Helper.pager = (data) => {
  const p = _.has(data, 'pages') ? data.pages : data
  const paginate = {
    'current_page': p.page,
    'per_page': p.perPage,
    'total': p.total,
    'last_page': p.lastPage
  }
  return paginate
}

/**
 * Country Code Convert
 */
Helper.iso6393ToCountry = (code) => {
	const data = {
		"afg": "Afghanistan",
		"alb": "Albania",
		"dza": "Algeria",
		"asm": "American Samoa",
		"and": "Andorra",
		"ago": "Angola",
		"aia": "Anguilla",
		"ata": "Antarctica",
		"atg": "Antigua and Barbuda",
		"arg": "Argentina",
		"arm": "Armenia",
		"abw": "Aruba",
		"aus": "Australia",
		"aut": "Austria",
		"aze": "Azerbaijan",
		"bhs": "Bahamas (the)",
		"bhr": "Bahrain",
		"bgd": "Bangladesh",
		"brb": "Barbados",
		"blr": "Belarus",
		"bel": "Belgium",
		"blz": "Belize",
		"ben": "Benin",
		"bmu": "Bermuda",
		"btn": "Bhutan",
		"bol": "Bolivia (Plurinational State of)",
		"bes": "Bonaire, Sint Eustatius and Saba",
		"bih": "Bosnia and Herzegovina",
		"bwa": "Botswana",
		"bvt": "Bouvet Island",
		"bra": "Brazil",
		"iot": "British Indian Ocean Territory (the)",
		"brn": "Brunei Darussalam",
		"bgr": "Bulgaria",
		"bfa": "Burkina Faso",
		"bdi": "Burundi",
		"cpv": "Cabo Verde",
		"khm": "Cambodia",
		"cmr": "Cameroon",
		"can": "Canada",
		"cym": "Cayman Islands (the)",
		"caf": "Central African Republic (the)",
		"tcd": "Chad",
		"chl": "Chile",
		"chn": "China",
		"cxr": "Christmas Island",
		"cck": "Cocos (Keeling) Islands (the)",
		"col": "Colombia",
		"com": "Comoros (the)",
		"cod": "Congo (the Democratic Republic of the)",
		"cog": "Congo (the)",
		"cok": "Cook Islands (the)",
		"cri": "Costa Rica",
		"hrv": "Croatia",
		"cub": "Cuba",
		"cuw": "Curaçao",
		"cyp": "Cyprus",
		"cze": "Czechia",
		"civ": "Côte d'Ivoire",
		"dnk": "Denmark",
		"dji": "Djibouti",
		"dma": "Dominica",
		"dom": "Dominican Republic (the)",
		"ecu": "Ecuador",
		"egy": "Egypt",
		"slv": "El Salvador",
		"gnq": "Equatorial Guinea",
		"eng": "english",
		"eri": "Eritrea",
		"est": "Estonia",
		"swz": "Eswatini",
		"eth": "Ethiopia",
		"flk": "Falkland Islands (the) [Malvinas]",
		"fro": "Faroe Islands (the)",
		"fji": "Fiji",
		"fin": "Finland",
		"fra": "France",
		"guf": "French Guiana",
		"pyf": "French Polynesia",
		"atf": "French Southern Territories (the)",
		"gab": "Gabon",
		"gmb": "Gambia (the)",
		"geo": "Georgia",
		"deu": "Germany",
		"gha": "Ghana",
		"gib": "Gibraltar",
		"grc": "Greece",
		"grl": "Greenland",
		"grd": "Grenada",
		"glp": "Guadeloupe",
		"gum": "Guam",
		"gtm": "Guatemala",
		"ggy": "Guernsey",
		"gin": "Guinea",
		"gnb": "Guinea-Bissau",
		"guy": "Guyana",
		"hti": "Haiti",
		"hmd": "Heard Island and McDonald Islands",
		"vat": "Holy See (the)",
		"hnd": "Honduras",
		"hkg": "Hong Kong",
		"hun": "Hungary",
		"isl": "Iceland",
		"ind": "India",
		"idn": "Indonesia",
		"irn": "Iran (Islamic Republic of)",
		"irq": "Iraq",
		"irl": "Ireland",
		"imn": "Isle of Man",
		"isr": "Israel",
		"ita": "Italy",
		"jam": "Jamaica",
		"jpn": "Japan",
		"jey": "Jersey",
		"jor": "Jordan",
		"kaz": "Kazakhstan",
		"ken": "Kenya",
		"kir": "Kiribati",
		"prk": "Korea (the Democratic People's Republic of)",
		"kor": "Korea (the Republic of)",
		"kwt": "Kuwait",
		"kgz": "Kyrgyzstan",
		"lao": "Lao People's Democratic Republic (the)",
		"lva": "Latvia",
		"lbn": "Lebanon",
		"lso": "Lesotho",
		"lbr": "Liberia",
		"lby": "Libya",
		"lie": "Liechtenstein",
		"ltu": "Lithuania",
		"lux": "Luxembourg",
		"mac": "Macao",
		"mdg": "Madagascar",
		"mwi": "Malawi",
		"mys": "Malaysia",
		"mdv": "Maldives",
		"mli": "Mali",
		"mlt": "Malta",
		"mhl": "Marshall Islands (the)",
		"mtq": "Martinique",
		"mrt": "Mauritania",
		"mus": "Mauritius",
		"myt": "Mayotte",
		"mex": "Mexico",
		"fsm": "Micronesia (Federated States of)",
		"mda": "Moldova (the Republic of)",
		"mco": "Monaco",
		"mng": "Mongolia",
		"mne": "Montenegro",
		"msr": "Montserrat",
		"mar": "Morocco",
		"moz": "Mozambique",
		"mmr": "Myanmar",
		"nam": "Namibia",
		"nru": "Nauru",
		"npl": "Nepal",
		"nld": "Netherlands (the)",
		"ncl": "New Caledonia",
		"nzl": "New Zealand",
		"nic": "Nicaragua",
		"ner": "Niger (the)",
		"nga": "Nigeria",
		"niu": "Niue",
		"nfk": "Norfolk Island",
		"mnp": "Northern Mariana Islands (the)",
		"nor": "Norway",
		"omn": "Oman",
		"pak": "Pakistan",
		"plw": "Palau",
		"pse": "Palestine, State of",
		"pan": "Panama",
		"png": "Papua New Guinea",
		"pry": "Paraguay",
		"per": "Peru",
		"phl": "Philippines (the)",
		"pcn": "Pitcairn",
		"pol": "Poland",
		"prt": "Portugal",
		"pri": "Puerto Rico",
		"qat": "Qatar",
		"mkd": "Republic of North Macedonia",
		"rou": "Romania",
		"rus": "Russian Federation (the)",
		"rwa": "Rwanda",
		"reu": "Réunion",
		"blm": "Saint Barthélemy",
		"shn": "Saint Helena, Ascension and Tristan da Cunha",
		"kna": "Saint Kitts and Nevis",
		"lca": "Saint Lucia",
		"maf": "Saint Martin (French part)",
		"spm": "Saint Pierre and Miquelon",
		"vct": "Saint Vincent and the Grenadines",
		"wsm": "Samoa",
		"smr": "San Marino",
		"stp": "Sao Tome and Principe",
		"sau": "Saudi Arabia",
		"sen": "Senegal",
		"srb": "Serbia",
		"syc": "Seychelles",
		"sle": "Sierra Leone",
		"sgp": "Singapore",
		"sxm": "Sint Maarten (Dutch part)",
		"svk": "Slovakia",
		"svn": "Slovenia",
		"slb": "Solomon Islands",
		"som": "Somalia",
		"zaf": "South Africa",
		"sgs": "South Georgia and the South Sandwich Islands",
		"ssd": "South Sudan",
		"esp": "Spain",
		"lka": "Sri Lanka",
		"sdn": "Sudan (the)",
		"sur": "Suriname",
		"sjm": "Svalbard and Jan Mayen",
		"swe": "Sweden",
		"che": "Switzerland",
		"syr": "Syrian Arab Republic",
		"twn": "Taiwan (Province of China)",
		"tjk": "Tajikistan",
		"tza": "Tanzania, United Republic of",
		"tha": "Thailand",
		"tls": "Timor-Leste",
		"tgo": "Togo",
		"tkl": "Tokelau",
		"ton": "Tonga",
		"tto": "Trinidad and Tobago",
		"tun": "Tunisia",
		"tur": "Turkey",
		"tkm": "Turkmenistan",
		"tca": "Turks and Caicos Islands (the)",
		"tuv": "Tuvalu",
		"uga": "Uganda",
		"ukr": "Ukraine",
		"are": "United Arab Emirates (the)",
		"gbr": "United Kingdom of Great Britain and Northern Ireland (the)",
		"umi": "United States Minor Outlying Islands (the)",
		"usa": "United States of America (the)",
		"ury": "Uruguay",
		"uzb": "Uzbekistan",
		"vut": "Vanuatu",
		"ven": "Venezuela (Bolivarian Republic of)",
		"vnm": "Viet Nam",
		"vgb": "Virgin Islands (British)",
		"vir": "Virgin Islands (U.S.)",
		"wlf": "Wallis and Futuna",
		"esh": "Western Sahara",
		"yem": "Yemen",
		"zmb": "Zambia",
		"zwe": "Zimbabwe",
		"ala": "Åland Islands",
 	}

	return _.get(data, code) || 'Unknow'
}

Helper.request = async (url, options) => {
	let requestOptions = _.assign({
		method: 'GET',
		uri: url,
		headers: {
			accept: 'application/json',
			authorization: `Bearer ${Env.get('MOVIE_TMDB_API_KEY')}`
		},
		qs: {},
		json:true
	}, options)

	const result = await rp(requestOptions)
	.then(res => {
		return res
	}).error(e => {
		return false
	})

	return result
}

Helper.wowzaEncodeUrl = (request, path) => {
	// const ip = request.header('cf-connecting-ip') || request.ip()
	// const ip = '171.96.100.239'
	const endTime = moment().add(5, 'hours').unix()
	 
	const ip = '184.22.54.220'
	const wowzaSecret = Env.get('WOWZA_SECRET')
	const wowzaApp = Env.get('WOWZA_APPICATION')
	const vodString = `${wowzaApp}/s/${path}/smil:playlist.smil?${wowzaSecret}&tokenendtime=${endTime}`
	// const vodString = `${wowzaApp}/s/${path}/smil:playlist.smil?${ip}&${wowzaSecret}&tokenendtime=${endTime}`

	const buffer = Buffer.from(vodString, 'utf-8')
	const sha256Hash = crypto.createHash('sha256')
	sha256Hash.update(buffer)

	const sha256 = sha256Hash.digest()
	let sha256String = sha256.toString('base64')
	sha256String = _.replace(_.replace(sha256String, /\+/g, '-'), /\//g, '_')

	const wowzaSecureUrl = `${wowzaApp}/s/${path}/smil:playlist.smil/playlist.m3u8?tokenhash=${sha256String}&tokenendtime=${endTime}`
	return wowzaSecureUrl
}


