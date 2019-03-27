const express = require('express')
const router = express.Router()
const TSOMobile = require('../../libs/tso-es5.js')

const sendError = (res, str) => {
  res.setHeader('Content-Type', 'application/json')
  res.status(400).json({ error: str })
}

// Lists all mounted routes on /
router.get('/', (req, res) => {
  let data = '[\n'
  router.stack.forEach((route, i, a) => {
    const includeComma = i !== a.length - 1 ? ',' : ''
    const pth = (route.path != null ? route.path : router.path)
    data += `  "${pth}"${includeComma}\n`
  })
  data += ']'
  res.setHeader('Content-Type', 'application/json')
  res.status(200).send(data)
})

router.get('/TSOMobile/:FetchFunction', async (req, res) => {
  const { PublicTransportation } = TSOMobile
  const fetchRoute = async (companyId) => {
    const rt = await PublicTransportation.GetRoutes(companyId)
    return rt.map(o => ({ ...o, polyline: o.path }))
  }
  const fetchLocations = routeId => PublicTransportation.GetLocations(null, routeId)

  switch (req.params.FetchFunction) {
    case 'routes':
      if (req.query.CompanyId == null) return sendError(res, 'Param CompanyId must be specified')
      const routes = await fetchRoute(req.query.CompanyId)
      res.status(200).json(routes)
      break
    case 'locations':
      if (req.query.RouteId == null) return sendError(res, 'Param RouteId must be specified')
      const locs = await fetchLocations(req.query.RouteId)
      res.status(200).json(locs)
      break
  }
})

router.get('/stream/TSOMobile/locations', async (req, res) => {
  if (req.query.RouteIds == null) return sendError(res, 'Param RouteIds must be specified')
  const fetchLocations = routeId => TSOMobile.PublicTransportation.GetLocations(null, routeId)
  const routes = req.query.RouteIds.split(',')

  res.writeHead(200, {
    'Content-Type': 'text/plain'
  })

  let finished = 0
  routes.forEach(async rtid => {
    const locs = await fetchLocations(rtid)
    res.write(`{"id":${rtid},"data":${JSON.stringify(locs)}}\n`)
    finished += 1
    if (finished >= routes.length) res.end()
  })
})

module.exports = router
