
const klawSync = require('klaw-sync')
const fs = require('fs-extra')
const isImage = require('is-image');
const isVideo = require('is-video');
const moment = require('moment')

const { nanoid } = require('nanoid')

const { tempFolder, targetFolder, findImage, findVideo } = JSON.parse(
    fs.readFileSync('./config.json')
)

const mapsDir = `${tempFolder}\\maps`
const mediaDir = `${tempFolder}\\media`

if (!fs.existsSync(mapsDir)){
    fs.mkdirSync(mapsDir);
}
if (!fs.existsSync(mediaDir)){
    fs.mkdirSync(mediaDir);
}

const findAndMove = async () => {
    const maps = {
        fromTo: []
    }
    let items = klawSync(targetFolder, {
        nodir: true,
        traverseAll: true
    })
    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        console.log(`processing ${item.path}`)
        const isMedia = (findImage && isImage(item.path)) || (findVideo && isVideo(item.path))
        if (isMedia) {
            try {
                const filename = item.path.match(/([^\\]+)$/)?.[0]

                let dest = `${mediaDir}\\${filename}`

                const exists = fs.existsSync(dest)

                if (exists) {
                    const ext = dest.match(/\.[^\.]+$/)?.[0]
                    dest = dest.replace(/\.[^\.]+$/, '')
                    dest = `${dest}_${nanoid(6)}${ext}`
                    console.log(dest)
                }

                const moveSuccess = await new Promise((resolve) => {
                    fs.move(item.path, dest, err => {
                        if (err) {
                            console.error(err)
                            resolve(false)
                        }
                        resolve(true)
                    })
                })
                if (moveSuccess) {
                    maps.fromTo.push([
                        item.path,
                        dest
                    ])
                }

            }
            catch (err) {
                console.log(err)
            }
        }
    }
    console.log(`found and moved ${maps.fromTo.length} items`)
    if (maps.fromTo.length > 0) {
        let json = JSON.stringify(maps);
        fs.writeFileSync(`${mapsDir}\\locMap_${moment().format('YYYYMMDDHHmmss')}.json`, json);

    }
}
findAndMove()