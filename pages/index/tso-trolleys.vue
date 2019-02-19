<template lang="pug">
  div
    h1 All of Miami-Dade Transit
    p Note: This loads at least 80 transit routes, the auto-refresh may cause lag spikes
    .ctrls.mb-2
      .strongctrl
        p.mb-1.mini-emphasis Actions
        button(@click='fetchAllRoutes()') Update all routes
        button(v-if='TSO_RouteData.length > 0' @click='toggleLocationPoller()' :class='pollingInterval != null ? "activated" : ""') Auto-Refresh ({{ pollingInterval == null ? 'Off' : 'On' }})
      .routes(v-if='TSO_RouteData.length > 0')
        p.pt-3.mb-1.mini-emphasis Update Routes
        button(v-for='route in TSO_RouteData' :key='route.id' @click='fetchLocations(route.id)') {{ route.name }}
    .map-container.mb-5(ref='mpContain')
      l-map.main-map(:zoom='mapc.zoom' :center='mapc.center' @update:zoom='updateZoom' @update:center='updateCenter' ref='primaryMap')
        //- l-feature-group(name='TSO Miami Beach')
        //- l-polyline(v-for='route in TSO_RouteData' :key='route._id' :lat-lngs='ROUTE' :stroke='true' :color='"#" + rgb2Hex(route.color)')
        l-layer-group(layer-type='overlay' v-for='route in TSO_RouteData' :key='route.id' :name='route.name')
          l-polyline(:visible='true' :lat-lngs='route.polyline' :fill='false' :stroke='true' :color='"#" + rgb2Hex(route.color)')
          l-marker(v-if='TSO_Locations[route.id] != null' v-for='unit in TSO_Locations[route.id]'
            :key='unit.id' :lat-lng='[unit.lat, unit.long]')
            l-icon(:icon-url='`/color_point.svg?${rgb2Hex(route.color)}`' :icon-anchor='[6, 6]' :icon-size='[12, 12]')
</template>

<script>
import axios from 'axios'
import Vue from 'vue'
import TSOMobile from '~/libs/tso.js'
import Polyline from 'google-polyline'
import BingLayer from 'leaflet-bing-layer'

const { PublicTransportation } = TSOMobile
const rgb2Hex = rgb => rgb.map(n => ('00' + n.toString(16)).slice(-2)).join('')

export default {
  data() {
    return {
      TSO_COMPANIES: [30109, 21241, 22844, 2500, 24600, 26082, 31344, 31934, 24560, 21324, 34323, 49454, 34423],
      TSO_Locations: {},
      TSO_RouteData: [],
      config: {},
      pollingInterval: null,
      mapc: {
        zoom: 11,
        center: [25.769100812076502, -80.28506468050182],
        rotation: 0,
        geolocPosition: null
      }
    }
  },
  mounted() {
    this.$refs.mpContain.style.height = this.$refs.mpContain.clientWidth + 'px'
    this.$nextTick(() => {
      const map = this.$refs.primaryMap.mapObject
      map._onResize()
      L.tileLayer.bing({
        bingMapsKey: process.env.bingmaps || process.env.BINGMAPS_TOKEN,
        imagerySet: 'CanvasDark',
        detectRetina: true
      }).addTo(map)
      
      map.locate({
        watch: true,
        enableHighAccuracy: true
      })
      map.on('locationfound', e => (this.mapc.geolocPosition = e.latlng))
    })
  },
  computed: {
  },
  asyncData({ env }) {
    return {
      config: env.wayconfig,
      // bingmaps_token: env.bingmaps
    }
  },
  methods: {
    async fetchAllRoutes() {
      this.TSO_COMPANIES.forEach(async companyId => {
        const routeData = await this.fetchRoute(companyId)
        this.TSO_RouteData.push(...routeData)
      })
      return this.TSO_RouteData
    },
    async fetchRoute(companyId) {
      const rt = await PublicTransportation.GetRoutes(companyId)
      const pr = rt.map(o => ({ ...o, polyline: this.decodePolyline(o.path).map(p => L.latLng(...p)) }))
      return pr
    },
    async fetchLocations(routeId) {
      const rt = await PublicTransportation.GetLocations(null, routeId)
      this.$set(this.TSO_Locations, String(routeId), rt)
      return rt
    },
    panOver([lat, long]) {
      this.$refs.primaryMap.mapObject.flyTo([lat, long])
    },
    decodePolyline(polyline) {
      return Polyline.decode(polyline)
    },
    updateCenter(latLng) {
      this.mapc.center = Object.values(latLng) // works for objects{} and arrays
    },
    updateZoom(num) {
      this.mapc.zoom = num
    },
    rgb2Hex() {
      return rgb2Hex(...arguments)
    },
    toggleLocationPoller() {
      if (this.pollingInterval == null) {
        const fn = () => {
          this.TSO_RouteData.forEach(r => this.fetchLocations(r.id))
        }
        fn()
        this.pollingInterval = setInterval(fn, 10000)
      } else {
        clearInterval(this.pollingInterval)
        this.pollingInterval = null
      }
    }
  }
}
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: auto;
}
.main-map {
  height: 100%;
}
.ctrls button {
  -webkit-appearance: none;
  appearance: none;
  background-color: #FFF;
  border: 2pt solid currentColor;
  color: #0099BC;
  font-weight: 500;
  margin: 0 2pt 2pt 0;
  font-size: 0.9em;
}
.ctrls button:active, .ctrls button:active:focus {
  background-color: #0099BC;
  color: #FFF;
  outline: 1pt dotted #0099BC;
}
.ctrls button.activated {
  background-color: #0099BC;
  border: 2pt solid #0099BC;
  color: #FFF;
}
.ctrls button:focus {
  outline: none;
}
</style>
