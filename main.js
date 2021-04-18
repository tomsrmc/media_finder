
const klawSync = require('klaw-sync')
const fs = require('fs-extra')
const isImage = require('is-image');
const isVideo = require('is-video');
const moment = require('moment')
const targetFolder = "C:\\Users\\tsutton\\Downloads"
const tempFolder = "C:\\Temp"
const { nanoid } = require('nanoid')

const findAndMove = async () => {
    const locStore = {
        fromTo: []
    }
    let items = klawSync(targetFolder, {
        nodir: true,
        traverseAll: true
    })
    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const isMedia = isImage(item.path) || isVideo(item.path)
        if (isMedia) {
            try {
                const filename = item.path.match(/([^\\]+)$/)?.[0]

                let dest = `${tempFolder}\\media\\${filename}`

                const exists = fs.existsSync(dest)

                if (exists) {
                    const ext = dest.match(/\.[^\.]+$/)?.[0]
                    dest = dest.replace(/\.[^\.]+$/, '')
                    dest = `${dest}_${nanoid(4)}${ext}`
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
                    locStore.fromTo.push([
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
    console.log(`found and moved ${locStore.fromTo.length} items`)
    if (locStore.fromTo.length > 0) {
        let json = JSON.stringify(locStore);
        fs.writeFileSync(`${tempFolder}\\locs\\locMap_${moment().format('YYYYMMDDHHmmss')}.json`, json);

    }
}
findAndMove()