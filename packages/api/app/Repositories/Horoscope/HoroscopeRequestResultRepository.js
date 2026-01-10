'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = use('App/Helper')
const rp = use('request-promise')
const puppeteer = use('puppeteer')

class HoroscopeRequestResultRepository {

  static get inject() {
    return [
      'App/Repositories/Horoscope/HoroscopeFunctionRepository',
    ]
  }

  constructor(HoroscopeFunctionRepository) {
    this.HoroscopeFunctionRepository = HoroscopeFunctionRepository
  }

  async requestMyhora(param) {
    const browser = await puppeteer.launch({ headless: "new" });

    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36')
      await page.setViewport({ width: 1080, height: 1024 });

      await page.goto(`https://www.myhora.com/%E0%B8%94%E0%B8%B9%E0%B8%94%E0%B8%A7%E0%B8%87-%E0%B8%97%E0%B8%B3%E0%B8%99%E0%B8%B2%E0%B8%A2%E0%B8%9D%E0%B8%B1%E0%B8%99.aspx?dream=${param}`, {
        waitUntil: 'load',
        timeout: 5000
      });
      await page.waitForSelector('#p_display_result div.dn', { timeout: 5000 });
      
      const wordLists = await page.$$('#p_display_result div.dn')
      const predictLists = await page.$$('#p_display_result div.dx')
      const luckyNumberLists = await page.$$('#p_display_result div.dx + div')
      return {
        words: wordLists,
        predicts: predictLists,
        lucky_numbers: luckyNumberLists,
        browser: browser
      }

    } catch (e) {
      console.log(e);
      if (browser) await browser.close();
      
    }
  }

  async getMyhora(param) {
    const describeRegex = /br>(\W+)/g
    const predictRegex = /<\/u>(\W+)/g
    const data = await this.requestMyhora(param)
    const browser = data.browser
    try {
      const obj = data.words

      for(let i in obj) {
        const wordElement = data.words[i]
        const predictElement = data.predicts[i]
        const luckyNumberElement = data.lucky_numbers[i]
  
        const word = await wordElement.$eval('a', e => e.textContent.trim())
        const text = await predictElement.evaluate((e) => {
          return e.innerHTML
        })

        let describes = text.match(describeRegex)
        let predicts = text.match(predictRegex)

        _.each(describes, (describe, i) => {
          describes[i] = _.trim(_.replace(describe, /[\<\>\/\\brun]/g, ''))
        })

        _.each(predicts, (predict, i) => {
          predicts[i] = _.trim(_.replace(predict, /[\<\>\/\\brun]/g, ''))
        })

        describes = _.compact(describes)
        predicts = _.compact(predicts)

        _.each(describes, (describe, i) => {
          describes[i] = {
            type: 'describe',
            detail: describe,
            order: i + 1
          }
        })

        _.each(predicts, (predict, i) => {
          predicts[i] = {
            type: 'predict',
            detail: predict,
            order: i + 1
          }
        })
        
        const number = await luckyNumberElement.evaluate((e) => {
          if (e.textContent) {
            const primaryNumber = e.querySelector('font.dl font.dl2:nth-child(1)').textContent.trim()
            const secondaryNumber = e.querySelector('font.dl font.dl2:nth-child(2)').textContent.trim()
            const luckyNumber = e.querySelector('font.dl3').textContent.trim()
            return {
              primary_number: primaryNumber,
              secondary_number: secondaryNumber,
              lucky_number: luckyNumber
            }
          }
          
          return null
        })
  
        const results = {
          name: word,
          describes: [
            ...describes,
            ...predicts
          ],
          ...number
        }
        await this.HoroscopeFunctionRepository.createOrUpdate(results)
      }
    } catch (error) {
      console.log(error)
      if (browser) await browser.close()
    } finally {
      if (browser) await browser.close()
    }
  }
}

module.exports = HoroscopeRequestResultRepository
