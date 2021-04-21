const findAndMove = require('.')
const fs = require('fs-extra')

const config = JSON.parse(
    fs.readFileSync('./config.json')
)

findAndMove(config)