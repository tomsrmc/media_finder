
const klawSync = require('klaw-sync')
const fs = require('fs-extra')
const isImage = require('is-image');
const isVideo = require('is-video');
const moment = require('moment')
const cliProgress = require('cli-progress');
const { nanoid } = require('nanoid')

const { tempFolder, targetFolder, findImage, findVideo } = JSON.parse(
    fs.readFileSync('./config.json')
)


const findAndMove = async () => {

    const mapsDir = `${tempFolder}\\maps`
    const mediaDir = `${tempFolder}\\media`

    if (!fs.existsSync(mapsDir)) {
        fs.mkdirSync(mapsDir);
    }
    if (!fs.existsSync(mediaDir)) {
        fs.mkdirSync(mediaDir);
    }

    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    const maps = {
        fromTo: []
    }
    let items = klawSync(targetFolder, {
        nodir: true,
        traverseAll: true
    })

    bar1.start(items.length, 0);


    for (let i = 0; i < items.length; i++) {

        //await new Promise(r => setTimeout(r, 10));
        const item = items[i]
        //console.log('\x1b[36m%s\x1b[0m', ` processing ${item.path}`); 
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

        bar1.update(i + 1)
    
    }
  
    bar1.stop()

    console.log(`found and moved ${maps.fromTo.length} items`)
    if (maps.fromTo.length > 0) {
        let json = JSON.stringify(maps);
        fs.writeFileSync(`${mapsDir}\\locMap_${moment().format('YYYYMMDDHHmmss')}.json`, json);

    }
}
findAndMove()