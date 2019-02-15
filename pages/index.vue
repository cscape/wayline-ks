<template lang="pug">
  section
    Nav
    b-container
      b-row
        b-col.pt-4(cols='12' md='4')
          //- p.mini-emphasis.text-black-50 Navigation
          ul.nav-list
            li(v-for="(value, key, index) in Navigation" :key="key.id")
              NuxtLink(:to='value' v-html='key'
                v-if='typeof value === "string"')
              div(v-if='typeof value !== "string"')
                p.pt-3.mb-1.mini-emphasis(v-html='key')
                ul.nav-list
                  li(v-for="(v, k, i) in value" :key='k.id')
                    NuxtLink(:to='v' v-html='k')
        b-col.pt-4(cols='12' md='8')
          NuxtChild(:key='$route.params.id')
</template>

<script>
import Nav from '~/components/Nav.vue'
import Navigation from '~/assets/navigation.json'

export default {
  components: {
    Nav
  },
  data() {
    return {
      Navigation
    }
  }
}
</script>

<style>
.mini-emphasis {
  font-size: 0.8em;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  font-weight: 500;
  color: #BFBFBF;
}

.nav-list {
  list-style: none;
  padding-left: 0;
}
</style>
