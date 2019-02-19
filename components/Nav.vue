<template lang="pug">
  b-navbar.nav(toggleable='md', type='dark', :style='{ backgroundColor: dark === true ? "#121212" : "ff2222" }')
    NuxtLink(to='/')
      b-navbar-brand.mr-4
        Logo
    b-navbar-toggle(target='nav_collapse')
    b-collapse#nav_collapse(is-nav='')
      b-navbar-nav
        b-nav-item(to='/welcome') Kitchen Sink
        b-nav-item(to='/full') Full View
      b-navbar-nav.ml-auto
        b-navbar-brand.mr-2(href='https://github.com/cscape')
          img.d-block(height='18' src='https://cyberscape.co/splash.svg')
</template>

<script>
import Logo from '~/components/Logo.vue'

export default {
  props: ['dark'],
  components: {
    Logo
  }
}
</script>

<style scoped>
.nav {
  background-color: #ff2222;
}
.navbar-nav .nav-link {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  font-weight: 500;
}
</style>
