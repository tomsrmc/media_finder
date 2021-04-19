const fs = require('fs-extra')
const cliProgress = require('cli-progress')

const { tempFolder } = JSON.parse(
    fs.readFileSync('./config.json')
)

const restore = async () => {
    const mapsDir = `${tempFolder}\\maps`
    let maps = fs.readdirSync(`${mapsDir}`)
    if (maps.length < 1) {
        console.log('no location maps found')
    }
    for (let i = 0; i < maps.length; i++) {
        const jsonPath = `${mapsDir}\\${maps[i]}`
        console.log(`reading: ${jsonPath}`)
        const file = fs.readFileSync(jsonPath)
        const record = JSON.parse(file)
        const initialItems = record.fromTo.length
        const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        const nFiles = record.fromTo.length
        bar1.start(nFiles, 0);

        for (let l = nFiles - 1; l > -1; l--) {
            //await new Promise(r => setTimeout(r, 100));
            try {
                const entry = record.fromTo[l]
                //console.log('\x1b[36m%s\x1b[0m', ` returning file to ${entry[0]}`); 
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
            catch (err) {
                console.log(err)
            }
            bar1.update(nFiles - record.fromTo.length)
        }
        bar1.stop()
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