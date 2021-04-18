const fs = require('fs-extra')
const tempFolder = "C:\\Temp"

const restore = async () => {
    let locs = fs.readdirSync(`${tempFolder}\\locs`)
    if (locs.length < 1) {
        console.log('no location maps found')
    }
    for (let i = 0; i < locs.length; i++) {

        const jsonPath = `${tempFolder}\\locs\\${locs[i]}`
        console.log(`reading: ${jsonPath}`)
        const file = fs.readFileSync(jsonPath)
        const record = JSON.parse(file)
        const initialItems = record.fromTo.length
        for (let l = record.fromTo.length - 1; l > -1; l--) {
            const entry = record.fromTo[l]
            const moveSuccess = await new Promise((resolve) => {
                fs.move(entry[1], entry[0], (err) => {
                    if (err) {
                        console.error(err)
                        resolve(false)
                    }
                    resolve(true)
                })
            })
            if (moveSuccess) {
                record.fromTo.splice(l, 1)
            }
        }
        const remaining = record.fromTo.length
        if (remaining > 0) {
            const json = JSON.stringify(record)
            fs.writeFileSync(jsonPath, json)
            console.log(`${initialItems - remaining} files moved, ${remaining} remaining`)
        }
        else {
            fs.removeSync(jsonPath)
            console.log(`${initialItems - remaining} files moved, map deleted`)
        }
    }
}

restore()