<template lang="pug">
  b-navbar.nav(toggleable='md', type='dark')
    b-navbar-brand(href='/')
      Logo
    b-navbar-toggle(target='nav_collapse')
    b-collapse#nav_collapse(is-nav='')
      b-navbar-nav.ml-auto
        b-nav-item(href='https://github.com/cscape') Cyberscape
</template>

<script>
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  }
}
</script>

<style scoped>
.nav {
  background-color: #ff2222;
}
</style>
