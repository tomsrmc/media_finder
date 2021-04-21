const restore = require('.')
const fs = require('fs-extra')

const config = JSON.parse(
    fs.readFileSync('./config.json')
)

restore(config)