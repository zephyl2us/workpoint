<template>
  <div 
    class="image-manager"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop">
    <div v-if="hasPhotoList || hasImage" class="image-container">
      <div v-for="(photo, index) in photoLists" :key="`photo-${index}`" class="image">
        <div class="delete"><i class="fa-solid fa-xmark-large"></i></div>
        <div class="fill" :style="`background-image: url('${photo}');`"></div>
      </div>
      <div v-for="(image, index) in images" :key="`image-${index}`" class="image">
        <div class="delete" @click="onDelete(index)"><i class="fa-solid fa-xmark-large"></i></div>
        <div class="fill" :style="`background-image: url('${image.url}');`"></div>
      </div>
    </div>
    <div 
      class="image-drag-area"
      :class="[addClassDragAreaFluid()]"
      @click="onClickSelectFile()">
      <div v-if="isDragging" class="drag-content">
        <i class="icon fa-duotone fa-upload"></i>
        <span class="label">วางภาพที่นี่</span>
      </div>
      <div v-else class="drag-content">
        <i class="icon fa-duotone fa-upload"></i>
        <span class="label">ลากและวางภาพที่นี่</span>
      </div>
      <input ref="uploadInput" type="file" multiple class="image-manager-input" @change="onFileSelected">
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageManager',
  props: {
    id: {
      type: String,
      required: true
    },
    photos: {
      type: Array,
      default: null
    }
  },
  data () {
    return {
      isDragging: false,
      images: [],
      isUploading: false,
      uploadingImages: [],
      photoLists: []
    }
  },
  computed: {
    hasPhotoList () {
      return !!this._.size(this.photoLists)
    },
    hasImage () {
      return !!this._.size(this.images)
    }
  },
  watch: {
    photos: {
      handler (value) {
        // console.log(value)
        const photos = []
        this._.each(value, (photo) => {
          photos.push(this.linkImage(photo))
        })

        this.photoLists = photos
      }
    },
    images: {
      handler (value) {
        console.log(value)
      }
    }
  },
  methods: {
    addClassDragAreaFluid () {
      return !this.hasImage ? 'image-drag-area-fluid' : ''
    },
    onClickSelectFile () {
      this.$refs.uploadInput.click()
    },
    onFileSelected (event) {
      // console.log('onFileSelected')

      const files = event.target.files
      if(files.length === 0) return

      // console.log(files)
      this.onUploadFiles(files)
    },
    async onUploadFiles (files) {
      if(files.length === 0) return

      for(let i = 0; i < files.length; i++) {
        if(files[i].type.split("/")[0] !== "image") continue
        if(!this.images.some((e) => e.name === files[i].name)) {
          this.images.push({
            name: files[i].name,
            url: URL.createObjectURL(files[i])
          })

          const file = files[i]
          const formData = new FormData()
          formData.append('id', this.id)
          formData.append('file', file)

          this.isUploading = true
          this.uploadingImages[i] = 0

          const { data } = await this.$axios.put('/core/army/photo/upload', formData, {
            onUploadProgress: ({ total, loaded }) => {
              console.log(`${loaded} ${total} : ${((loaded / total) * 100).toFixed(2)}`)
            }
          })

          console.log(data)
          this.uploadingImages[i] = 0
          this.isUploading = false
        }
      }
    },
    onDragOver (event) {
      // console.log(`onDragOver`)
      event.preventDefault()
      
      this.isDragging = true
      event.dataTransfer.dropEffect = "copy"
    },
    onDragLeave (event) {
      // console.log(`onDragLeave`)
      event.preventDefault()
      this.isDragging = false
    },
    onDrop (event) {
      // console.log(`onDrop`)
      event.preventDefault()
      this.isDragging = false

      const files = event.dataTransfer.files

      this.onUploadFiles(files)

      // for(let i = 0; i < files.length; i++) {
      //   if(files[i].type.split("/")[0] !== "image") continue
      //   if(!this.images.some((e) => e.name === files[i].name)) {
      //     this.images.push({
      //       name: files[i].name,
      //       url: URL.createObjectURL(files[i])
      //     })
      //   }
      // }

      // this.onFileSelected()
    },
    onDelete (index) {
      this.images.splice(index, 1)
    }
  }
}
</script>