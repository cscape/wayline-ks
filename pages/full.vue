<template lang="pug">
  section.flex-column.d-flex(style='height: 100vh;')
    Nav(:dark='true')
    b-container.full-contain.flex-fill(fluid)
      .map-container.row(ref='mpContain')
        l-map.main-map(:zoom='mapc.zoom' :center='mapc.center' @update:zoom='updateZoom' @update:center='updateCenter' ref='primaryMap')
          //- l-feature-group(name='TSO Miami Beach')
          //- l-polyline(v-for='route in TSO_RouteData' :key='route._id' :lat-lngs='ROUTE' :stroke='true' :color='"#" + rgb2Hex(route.color)')
          l-layer-group(layer-type='overlay' v-for='route in TSO_RouteData' :key='route.id' :name='route.name')
            l-polyline(:visible='true' :lat-lngs='route.polyline' :fill='false' :stroke='true' :weight='4' :color='"#" + rgb2Hex(route.color)')
            l-marker(v-if='TSO_Locations[route.id] != null' v-for='unit in TSO_Locations[route.id]'
              :key='unit.id' :lat-lng='[unit.lat, unit.long]')
              l-icon(:icon-url='`/color_point.svg?${rgb2Hex(route.color)}`' :icon-anchor='[7, 7]' :icon-size='[14, 14]')
      .ctrls
        .strongctrl
          p.mb-1.mini-emphasis {{ TSO_RouteData.length > 0 ? 'Actions' : 'Loading routes...' }}
          //- button(@click='fetchAllRoutes()') Update all routes
          button(v-if='TSO_RouteData.length > 0' @click='toggleLocationPoller()' :class='pollingInterval != null ? "activated" : ""') Live Refresh ({{ pollingInterval == null ? 'Off' : 'On' }})
          button(v-if='TSO_RouteData.length > 0 && pollingInterval == null' @click='fetchAllLocations()') Refresh
        //- .routes(v-if='TSO_RouteData.length > 0')
          p.pt-3.mb-1.mini-emphasis Update Routes
          button(v-for='route in TSO_RouteData' :key='route.id' @click='fetchLocations(route.id)') {{ route.name }}
</template>

<script>
import Nav from '~/components/Nav.vue'
import axios from 'axios'
import Vue from 'vue'
import TSOMobile from '~/libs/tso.js'
import Polyline from 'google-polyline'
import BingLayer from 'leaflet-bing-layer'

const { PublicTransportation } = TSOMobile
const rgb2Hex = rgb => rgb.map(n => ('00' + n.toString(16)).slice(-2)).join('')

export default {
  components: { Nav },
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
    // this.$refs.mpContain.style.height = this.$refs.mpContain.clientWidth + 'px'
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
      this.fetchAllRoutes()
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
    async fetchAllLocations() {
      this.TSO_RouteData.forEach(r => this.fetchLocations(r.id))
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
@keyframes pulse {
  0% { background-color: #EA005E; border-color: #EA005E; }
  100% { background-color: #EDBED3; border-color: #EDBED3; }
}
.leaflet-container {
  background-color:#121212;
}
.full-contain {
  position: relative;
}
.ctrls {
  position: absolute;
  z-index: 1000;
  bottom: 24pt;
  left: 24pt;
}
.map-container {
  position: relative;
  width: auto;
  height: 100%;
}
.main-map {
  height: 100%;
}
.ctrls button {
  -webkit-appearance: none;
  appearance: none;
  background-color: #000;
  border: 2pt solid #EA005E;
  color: #EA005E;
  outline: 2pt solid #000;
  font-weight: 500;
  margin: 0 2pt 2pt 0;
  font-size: 0.9em;
  transition: border-color 0.25s ease, background-color 0.25s ease;
}
.ctrls button:active, .ctrls button:active:focus {
  transition: none;
  background-color: #EA005E;
  color: #000;
  border-color: #000;
  outline: 1pt dotted #EA005E;
}
.ctrls button.activated {
  background-color: #EA005E;
  border-color: #EA005E;
  color: #000;
  animation-name: pulse;
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  animation-direction: alternate-reverse;
  animation-timing-function: ease-in-out;
  animation-delay: 0.2s;
}
.ctrls button:focus {
  outline: none;
}
</style>