<template lang="pug">
  div
    span Miami beach trolley stuff...
    span {{config}}
</template>

<script>
import axios from 'axios'
import Vue from 'vue'
import VueLayers from 'vuelayers'
import 'vuelayers/lib/style.css'

Vue.use(VueLayers)

export default {
  data() {
    return {
    }
  },
  asyncData({ env }) {
    return { config: env.wayconfig }
  },
  methods: {
    async fetchRoute() {
      await axios.get()
    }
  }
}
</script>
