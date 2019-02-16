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
