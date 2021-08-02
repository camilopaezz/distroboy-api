const express = require('express')
const multer = require('multer')
const cors = require('cors')
const fs = require('fs/promises')
const { nanoid } = require('nanoid')
const tags = require('node-id3')

const app = express()

app.use('/songs', express.static('my-uploads'))
app.use(express.json())
app.use(cors())

const uploads = multer()

app.post(
  '/api/process',
  uploads.fields([
    { name: 'sound', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  async (req, res) => {
    const { name, author, album } = req.body

    const song = req.files.sound[0]
    const cover = req.files.cover[0]
    
    const songId = nanoid()
    const songName = songId + '.mp3'
    
    await fs.writeFile(`/tmp/${songName}`, song.buffer)

    tags.removeTags(`/tmp/${songName}`)

    const cleanSong = await fs.readFile(`/tmp/${songName}`)

    const songWithData = tags.write({
      album,
      title: name,
      artist: author,
      image: {
        mime: cover.mimetype,
        type: {
          id: 1,
          name: 'front cover'
        },
        description: 'cover',
        imageBuffer: cover.buffer
      }
    }, cleanSong)

    await fs.writeFile(`./my-uploads/${songName}`, songWithData)

    res
      .json({
        status: 'successfully send',
        x: songName,
        error: null
      })
      .status(200)
  }
)

app.listen(3005, () => console.log('Waiting for it'))
