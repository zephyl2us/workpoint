'use strict'

class Horoscope {
  static rules () {
    return {
      tag_create: {
        horoscope_id: 'required|has:horoscopes,id',
        tag: 'required',
      },
      word_update: {
        id: 'required|has:horoscopes,id',
        name: 'required',
        describes: 'required|objValid:type,detail,order',
        tags: 'arrayIs:string'
      },
      word_create: {
        name: 'required',
        describes: 'required|objValid:type,detail,order',
        primary_number: 'integer',
        secondary_number: 'integer',
        tags: 'arrayIs:string'
      },
      word_delete: {
        id: 'required|has:horoscopes,id'
      }
    }
  }

  static messages () {
    return {
      'id.required' : 'id.required',
      'id.has' : 'id.has',
      'name.required' : 'name.required',
      'describes.required' : 'describes.required',
      'describes.objValid' : 'describes.objValid',
      'tags.arrayIs' : 'tags.arrayIs {{ argument.0 }}',
      'horoscope_id.required' : 'horoscope_id.required',
      'horoscope_id.has' : 'horoscope_id.has',
      'tag.required' : 'tag.required',
    }
  }
}

module.exports = Horoscope
