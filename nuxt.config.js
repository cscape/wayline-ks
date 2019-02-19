/* eslint-disable */

require('dotenv').config()
const path = require('path')
const pkg = require('./package')

module.exports = {
  mode: 'spa',

  /*
  ** Headers of the page
  */
  head: {
    title: 'Wayline Kitchen Sink',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description },
      { name: 'theme-color', content: '#080808' },
      { name: 'application-name', content: 'Wayline' }
    ],
    link: [
      { rel: 'icon', href: '/black-icon.png' },
      { rel: 'icon', type: 'apple-touch-icon', href: '/black-icon.png' },
      { rel: 'icon', href: '/black-icon.svg' },
      { rel: 'icon', type: 'image/x-icon', href: '/black-icon.svg' },
      { rel: 'icon', type: 'shortcut icon', href: '/black-icon.svg' }
    ]
  },

  icon: {
    iconSrc: 'black-icon.png'
  },

  env: {
    bingmaps: process.env.BINGMAPS_TOKEN,
    wayconfig: require('@wayline/config')
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },

  /*
  ** Global CSS
  */
  css: [
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    // Doc: https://bootstrap-vue.js.org/docs/
    'bootstrap-vue/nuxt',
    '@nuxtjs/pwa',
    'nuxt-leaflet'
  ],
  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      config.resolve.alias['leaflet'] = path.join(__dirname, 'node_modules/leaflet')
      return

      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
