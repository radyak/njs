var fs = require('fs')
var path = require('path')

const listFilesRecursively = function (dir, filelist = []) {
  if (!fs.existsSync(dir)) {
    dir = path.join(process.cwd(), dir)
  }

  fs.readdirSync(dir).forEach(file => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? listFilesRecursively(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file))
  })
  return filelist
}

var FileUtil = {
  listFilesRecursively: listFilesRecursively
}

module.exports = FileUtil
