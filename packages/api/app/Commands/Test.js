'use strict'

const { Command } = require('@adonisjs/ace')
		const chalk = require('chalk')
const _ = use('lodash')
const moment = use('moment')
const rp = use('request-promise')
const Config = use('Config')
const Bull = use('Bull')
const ArmyAntRepository = make('App/Repositories/ArmyAntRepository')
const AdsPowerRepository = make('App/Repositories/AdsPowerRepository')

const apiUrl = 'https://adspower-01.megatron.team'

class TestCommand extends Command {
  static get signature () {
    return 'test'
  }

  static get description () {
    return 'Tell something helpful about this command'
  }

  async handle (args, options) {
		const types = [
			'S', // Spades
			'H', // Red hearts
			'C', // Clubs
			'D' // Diamonds
		]

		const numbers = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']

		const trainingRound = 1

		const shoeCount = 8
		const prePullCount = 0
		const betweenPullCount = 0
		const selfCount = 10

		let playerWinCount = 0
		let bankerWinCount = 0
		let tieWinCount = 0
		let totalRound = 0

		for(let i = 0; i < trainingRound; i++) {
			const deckOfCards = []
			for(let i = 0; i < shoeCount; i++) {
				_.each(types, (type, t) => {
					_.each(numbers, (number, n) => {
						let point = 0
						if(!_.includes(['10','J','Q','K'], number)) {
							point = parseInt(number)
						}
						if(number === 'A') {
							point = 1
						}

						const symbols = {
							S: '♠', // Spades
							H: '♥', // Red hearts
							C: '♣', // Clubs
							D: '♦' // Diamonds
						}

						const data = {
							key:`${i}_${type}_${number}`,
							type: type,
							symbol: _.get(symbols, type),
							number: number,
							point: point
						}
						
						deckOfCards.push(data)
					})
				})
			}

			// console.log(_.size(deckOfCards))

			const shuffleCards = _.shuffle(deckOfCards)
			// console.log(`Deck of card:`, _.size(deckOfCards))
			const prePullCards = _.slice(shuffleCards, 0, prePullCount)
			// console.log(`Pre pull card:`, prePullCards)
			const cards = _.slice(shuffleCards, prePullCount, _.size(shuffleCards))
			// console.log(`Total Card:`, _.size(cards))

			// const pulled = _.pullAt(cards, 0)
			// console.log(pulled)
			// console.log(_.size(pulled))
			// console.log(_.size(cards))


			let round = 0
			do {
				round++
				totalRound++
	
				const stats = this.getStats(cards)

				let player1stCard = _.pullAt(cards, 0)
				player1stCard = player1stCard[0]
				const player1stPoint = player1stCard.point
	
				let player2ndCard = _.pullAt(cards, 0)
				player2ndCard = player2ndCard[0]
				const player2ndPoint = player2ndCard.point
	
				let banker1stCard = _.pullAt(cards, 0)
				banker1stCard = banker1stCard[0]
				const banker1stPoint = banker1stCard.point
	
				let banker2ndCard = _.pullAt(cards, 0)
				banker2ndCard = banker2ndCard[0]
				const banker2ndPoint = banker2ndCard.point
	
				let playerPoint = player1stPoint + player2ndPoint
				let bankerPoint = banker1stPoint + banker2ndPoint
	
				let cardCount = 4
	
				let player3rdCard = null
				let player3rdPoint = 0
				if(playerPoint < 6 && bankerPoint < 8) {
					player3rdCard = _.pullAt(cards, 0)
					player3rdCard = player3rdCard[0]
					player3rdPoint = player3rdCard.point
					playerPoint += player3rdPoint
				}
	
				let banker3rdCard = null
				let banker3rdPoint = 0
				// Option 1
				// if((bankerPoint <= 3 && _.includes([1,2,3,4,5,6,7,9,0], player3rdPoint))
				// || (bankerPoint == 4 && _.includes([2,3,4,5,6,7], player3rdPoint))
				// || (bankerPoint == 5 && _.includes([4,5,6,7], player3rdPoint))
				// || (bankerPoint == 6 && _.includes([6,7], player3rdPoint))) {
				// 	banker3rdCard = _.pullAt(cards, 0)
				// 	banker3rdCard = banker3rdCard[0]
				// 	banker3rdPoint = banker3rdCard.point
				// 	bankerPoint += banker3rdPoint
				// }

				// Option 2
				if((bankerPoint < 3 && player3rdPoint == 8)
				|| (bankerPoint < 7 && _.includes([6,7], player3rdPoint))
				|| (bankerPoint < 6 && _.includes([4,5], player3rdPoint))
				|| (bankerPoint < 5 && _.includes([2,3], player3rdPoint))
				|| (bankerPoint < 4 && _.includes([0,1,9], player3rdPoint))) {
						banker3rdCard = _.pullAt(cards, 0)
						banker3rdCard = banker3rdCard[0]
						banker3rdPoint = banker3rdCard.point
						bankerPoint += banker3rdPoint
				}
	
				const player1stText = this.getCard(player1stCard)
				const player2ndText = this.getCard(player2ndCard)
				const player3rdText = this.getCard(player3rdCard)
				const banker1stText = this.getCard(banker1stCard)
				const banker2ndText = this.getCard(banker2ndCard)
				const banker3rdText = this.getCard(banker3rdCard)
	
				playerPoint = playerPoint % 10
				bankerPoint = bankerPoint % 10
	
				let result = 'tie'
				if(playerPoint > bankerPoint) {
					result = 'player'
					playerWinCount++
				} else if(bankerPoint > playerPoint) {
					result = 'banker'
					bankerWinCount++
				} else {
					tieWinCount++
				}

				const chalk = require('chalk')
				
				let playerLog = `${playerPoint} : ${player1stText} ${player2ndText} ${player3rdText}`
				let bankerLog = `${bankerPoint} : ${banker1stText} ${banker2ndText} ${banker3rdText}`
	
				// console.log(`Shoe : ${i}`)

				// console.log(`======= Round ${round} =======`)
				// console.log(`${(result === 'player' ? chalk.green('Player') : 'Player')} : ${playerLog}`)
				// console.log(`${(result === 'banker' ? chalk.green('Banker') : 'Banker')} : ${bankerLog}`)
				// console.log(stats)
	
				// console.log(_.size(cards))
			} while (selfCount <= _.size(cards))

			// console.log(`========================`)
			// console.log(`Shoe : ${i}`)
			// console.log(`Player : ${playerWinCount} (${_.floor((playerWinCount * 100 / totalRound), 2)}%)`)
			// console.log(`Banker : ${bankerWinCount} (${_.floor((bankerWinCount * 100 / totalRound), 2)}%)`)
			// console.log(`Tie : ${tieWinCount} (${_.floor((tieWinCount * 100 / totalRound), 2)}%)`)
		}
	}

	getCard (card) {
		if(card == null) {
			return ''
		}
		return `${card.symbol}${card.number}`
	}

	getStats (cards) {
		let numberStats = {}
		_.each(cards, (card) => {
			const number = card.number

			if(_.has(numberStats, number)) {
				numberStats[number]++
			} else {
				numberStats[number] = 1
			}
		})

		// let min = 0
		let max = 0
		
		_.each(numberStats, (number) => {
			if(number > max) {
				max = number
			}

			// if(number < min && number > 0) {
			// 	min = number
			// }
		})

		const remaining = _.size(cards)
		const avaragePercent = (1 / _.size(numberStats) * 100)
		// console.log(numberStats)
		// const minPercent = (min / remaining * 100)
		const maxPercent = (max / remaining * 100)

		const data = {
			remaining: _.size(cards),
			average: _.floor(avaragePercent * 100),
			// min: minPercent,
			max: _.floor(maxPercent * 100)
		}

		return data
	}

}

module.exports = TestCommand
