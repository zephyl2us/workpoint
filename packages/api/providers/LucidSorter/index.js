'use strict'

/*
 * adonis-lucid-filter
 *
 * (c) Lookin Anton <lookin@lookinlab.ru>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const GE = require('@adonisjs/generic-exceptions')

class LucidSorter {
  register (Model, ModelSorter) {
    Model.ModelSorter = ModelSorter

    Model.queryMacro('sorter', function (input = {}, Sorter = null) {
      Sorter = Sorter || Model.ModelSorter

      if (typeof (Sorter) !== 'function') {
        throw new GE
          .InvalidArgumentException('Make sure to pass ModelSorter as 2nd parameter to Sorterable trait or function Sorter')
      }
      const modelSorter = new Sorter(this, input)
      return modelSorter.handle()
    })
  }
}
module.exports = LucidSorter
