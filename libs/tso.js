const axios = require('axios')
const {
  PubTransLocations, PubTransNearby, PubTransNews, PubTransRouteStops, PubTransRoutes
} = require('@wayline/transformer').TSOMobile
const basefeed = require('@wayline/config').basefeeds.TSOMobile

const buildURL = (keys = {}) => {
  const _ = (Date.now() << 5).toString(16) // Just a timestamp, binary-shifted and encoded in hex
  const url = new URL(basefeed)
  url.pathname = '/PubTrans/GetModuleInfoPublic'
  url.search = new URLSearchParams({ ...keys, _ }) // serializes object{} into query string
  return url.href
}

const TSOMobile = {
  PublicTransportation: {
    GetRoutes: async (companyId, lang = 'en') => {
      const { data } = await axios.get(buildURL({
        Key: 'ROUTES', id: companyId, lan: lang
      }))
      return PubTransRoutes(JSON.parse(data))
    },
    GetNews: async (companyId, lang = 'en') => {
      const { data } = await axios.get(buildURL({
        Key: 'NEWS', id: companyId, lan: lang
      }))
      return PubTransNews(JSON.parse(data))
    },
    GetNearbyStops: async (companyId, latitude, longitude, lang = 'en') => {
      const { data } = await axios.get(buildURL({
        // "Where Am I" (WAI)
        Key: 'WAI_NEAREST_STOPS', id: companyId, f1: latitude, f2: longitude, lan: lang
      }))
      return PubTransNearby(JSON.parse(data))
    },
    GetRouteStops: async (companyId = -1, routeId, lang = 'en') => {
      // companyId isn't used at all, only here for API consistency
      const { data } = await axios.get(buildURL({
        Key: 'ROUTE_STOPS_AND_UNITS', id: routeId, lan: lang
      }))
      return PubTransRouteStops(JSON.parse(data))
    },
    GetLocations: async (companyId = -1, routeId, lang = 'en') => {
      // companyId isn't used at all, only here for API consistency
      const { data } = await axios.get(buildURL({
        Key: 'UNITS_LOCATION_ROUTE', id: routeId, lan: lang
      }))
      return PubTransLocations(JSON.parse(data))
    }
    // TODO: Add STOPINFO_WITHOVERLAPS api
  }
}

module.exports = TSOMobile
