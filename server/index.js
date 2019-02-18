require('dotenv').config()
const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const axios = require('axios')
const app = express()

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const {
    host = process.env.$HOST || process.env.HOST || '127.0.0.1',
    port = process.env.$PORT || process.env.PORT || 3000
  } = nuxt.options.server

  app.use('/feedproxy', async (req, res) => {
    let ul
    try {
      ul = req.url.split('?')
      ul.splice(0, 1)
      ul = new URL(ul.join('')).href
    } catch (e) {
      return res.status(500).send('Invalid feed')
    }

    await axios.get(ul)
      .then(({ data }) => {
        res.send(data)
      })
      .catch(({ response }) => {
        res.status(response.status).send(response.data)
      })
  })

  app.use('/color_point.svg', (req, res) => {
    try {
      let hex = ''
      if (req.url.indexOf('?') > 0) hex = req.url.split('?')[1]
      else hex = '000000'
      const hexColor = hex.replace(/[^A-Fa-f0-9]/g, '').substring(0, 6) // only hex
      const str = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="12" height="12" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="4.75" fill="#fff" stroke="#${hexColor}" stroke-width="2.5"/></svg>`
      res.set('Content-Type', 'image/svg+xml').send(str)
    } catch (e) {
      return res.status(500).send('Invalid hex code')
    }
  })

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, () => consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  }))
}
start()
