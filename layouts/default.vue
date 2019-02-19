<template lang="pug">
  #app
    nuxt
    vue-progress-bar
</template>

<script>
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import VueProgressBar from 'vue-progressbar'

Vue.use(VueProgressBar, {
  color: '#F2F2F2',
  failedColor: '#EA005E',
  height: '4px'
})

Vue.use(BootstrapVue)

export default {
}
</script>
