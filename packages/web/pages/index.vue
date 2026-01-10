<template>
  <div class="app__landing">
    <AppLogo></AppLogo>
  </div>
</template>

<script>
  export default {
    name: 'WorkpointProject',
    auth : 'guest',
  }
</script>

<style scoped>
  .app__landing {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #664dc9;
    background: linear-gradient(180deg, rgba(110,77,201,1) 0%, rgba(102,77,201,1) 49%, rgba(79,77,201,1) 100%);
    width: 100vw;
    height: 100vh;
  }

  .app__logo {
    fill: white;
    width: 40vw;
    height: 40vw;
    max-width: 400px;
    max-height: 400px;
    /* max-height: ; */
  }
</style>
