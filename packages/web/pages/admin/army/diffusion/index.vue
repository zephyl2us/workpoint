<template>
  <div style="display: flex; flex-direction: column;">
    <header class="content-header">
      <h3 class="header-title">Stable Diffusion</h3>
    </header>
    <!-- <iframe :src="src" height="100%" style="flex: 1;"></iframe> -->
    <vue-friendly-iframe 
      :src="src" 
      class="iframe-diffusion"
      style="display: flex; flex: 1 1 100%; flex-direction: column;" 
      @load="onLoad"></vue-friendly-iframe>

    <!-- <VueIframe
      name="my-frame"
      width="150px"
      height="200px"
      :src="src"
      frame-id="myIfram"
      @load="onLoad"
    ></VueIframe> -->
  </div>
</template>

<script>

export default {
  name: 'StableDiffusion',
  components: {},
  mixins: [],
  layout: 'admin',
  props: {},
  data () {
    return {
      myIframe: null,
      src: 'http://true.zephyrus.me:7777',
    }
  },
  computed: {},
  created () {},
  mounted () {},
  methods: {
    onLoad (frame) {
    }
  },
}
</script>