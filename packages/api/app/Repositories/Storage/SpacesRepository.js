'use strict'

const _ = use('lodash')
const Env = use('Env')
const Redis = use('Redis')
const moment = use('moment')
// var AWS = use('aws-sdk')
// var fs = use('fs')
const { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, CopyObjectCommand, DeleteObjectsCommand } = use("@aws-sdk/client-s3");
// const { getSignedUrl } = use("@aws-sdk/s3-request-presigner")

class SpacesRepository {

  static get inject() {
    return []
  }

  constructor() {
    this.key = Env.get('DO_SPACES_KEY')
    this.secret = Env.get('DO_SPACES_SECRET')
    this.endpoint = Env.get('DO_SPACES_ENDPOINT')
    this.region = Env.get('DO_SPACES_REGION')
    this.bucket = Env.get('DO_SPACES_BUCKET')
  }

  async s3Client () {
    const s3 = new S3Client({
      forcePathStyle: false, // Configures to use subdomain/virtual calling format.
      endpoint: this.endpoint,
      region: this.region,
      credentials: {
        accessKeyId: this.key,
        secretAccessKey: this.secret
      }
    })

    return s3
  }

  async getImage (fileName) {
    const s3Client = await this.s3Client()

    const params = {
      Bucket: this.bucket,
      Key: fileName
    }

    try {
      const getObjectResponse = await s3Client.send(new GetObjectCommand(params))
      const buffers = []
      const imgBuffer = await new Promise((resolve, reject) => {
        getObjectResponse.Body.on('data', chuck => {
          buffers.push(chuck)
        })
        getObjectResponse.Body.on('end', () => {
          const mergedBuffer = Buffer.concat(buffers)
          resolve(mergedBuffer)
        })
        getObjectResponse.Body.on('error', (error) => {
          reject(error)
        })
      })
      return imgBuffer
    } catch(e) {
      console.log(e.Code)
    }
  }

  async s3send(command, options = {}) {
    const s3Client = await this.s3Client()

    const params = {
      Bucket: this.bucket,
      ...options
    }
    try { 
      switch (_.toLower(command)) {
        case 'upload':
          return await s3Client.send(new PutObjectCommand(params))
        case 'list':
          return await s3Client.send(new ListObjectsV2Command(params))
        case 'copy':
          return await s3Client.send(new CopyObjectCommand(params))
        case 'deletes':
          return await s3Client.send(new DeleteObjectsCommand(params))
        default:
          break;
      }
    } catch (e) {
      console.log(e)
      return false
    }
  }
}

module.exports = SpacesRepository
