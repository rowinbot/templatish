const fs = require('fs')
const path = require('path')

const REDISH = string => '\x1b[31m' + string + '\x1b[0m'

const removeDirectory = (dirPath, removeSelf) => {
  return new Promise((onSuccess, onError) => {
    if (removeSelf === undefined) removeSelf = true

    try {
      var files = fs.readdirSync(dirPath)
    } catch (e) {
      console.error(REDISH(e))
    }

    if (files !== undefined && files.length > 0)
      for (var i = 0; i < files.length; i++) {
        var filePath = path.join(dirPath, files[i])

        if (fs.statSync(filePath).isFile()) fs.unlinkSync(filePath)
        else removeDir(filePath)
      }

    if (removeSelf) {
      try {
        fs.rmdirSync(dirPath)
        onSuccess(true)
      } catch (e) {
        onError(false)
      }
    }
  })
}

module.exports = removeDirectory