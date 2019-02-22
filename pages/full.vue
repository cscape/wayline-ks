<template lang="pug">
  section.flex-column.d-flex(style='height: 100vh;')
    Nav(:dark='true')
    b-container.full-contain.flex-fill.d-flex(fluid)
      .map-container.flex-fill.row(ref='mpContain')
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
          button(v-if='TSO_RouteData.length > 0' @click='toggleLocationPoller(); $refs.primaryMap.mapObject._onResize()' :class='pollingInterval != null ? "activated" : ""') Live Refresh ({{ pollingInterval == null ? 'Off' : 'On' }})
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
      
      // map.locate({ watch: true, enableHighAccuracy: true })
      // map.on('locationfound', e => (this.mapc.geolocPosition = e.latlng))
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
    prc (num) {
      return Math.round((1 / Number(prc)) * 100)
    },
    async fetchAllRoutes() {
      this.$Progress.start()
      const allChunks = this.TSO_COMPANIES.length
      for (let i = 0; i < allChunks; i += 1) {
        const routeData = await this.fetchRoute(this.TSO_COMPANIES[i])
        this.TSO_RouteData.push(...routeData)
        this.$Progress.increase((1 / allChunks) * 100)
        continue
      }
      this.$Progress.finish()
    },
    async fetchRoute(companyId) {
      const rt = await PublicTransportation.GetRoutes(companyId)
      const pr = rt.map(o => ({ ...o, polyline: this.decodePolyline(o.path).map(p => L.latLng(...p)) }))
      return pr
    },
    async fetchAllLocations(stump = false) {
      if (!stump) this.$Progress.start()
      let k = 0;
      const runner = async () => {
        if (k >= this.TSO_RouteData.length) return true
        await this.fetchLocations(this.TSO_RouteData[k].id)
        if (!stump) this.$Progress.increase(Math.floor(1 / this.TSO_RouteData.length) * 100)
        k += 1
        await runner()
      }
      await runner()
      if (!stump) this.$Progress.finish()
      return true
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
    async toggleLocationPoller() {
      if (this.pollingInterval == null) {
        this.fetchAllLocations(true)
        this.pollingInterval = setInterval(() => { this.fetchAllLocations(true) }, 10000)
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
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
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
  /* animation-name: pulse; */
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  animation-direction: alternate-reverse;
  animation-timing-function: ease-in-out;
}
.ctrls button:focus {
  outline: none;
}
</style>

<style>
.leaflet-container .leaflet-control-attribution * {
  color: #FFF;
}
.leaflet-container .leaflet-control-attribution {
  background-color: #101010;
  color: #FFF;
  opacity: 0.35;
  padding: 2pt 6pt;
}

.leaflet-control-zoom > a:hover {
  background-color: #2B2B2B;
  color: #F2F2F2;
}

.leaflet-control-zoom > a {
  background-color: #121212;
  box-shadow: none !important;
  border: 1px solid #F2F2F2 !important;
  border-width: 1px !important;
  color: #F2F2F2;
  border-radius: 100% !important;
  width: 36px !important;
  height: 36px !important;
  line-height: 35px !important;
  font-size: 20px !important;
  margin-bottom: 8pt;
  text-indent: 0px;
}

.leaflet-left.leaflet-top .leaflet-control {
  margin: 24pt 0 0 24pt;
}
.leaflet-touch .leaflet-control-layers, .leaflet-touch .leaflet-bar {
  border: none;
}
</style>

