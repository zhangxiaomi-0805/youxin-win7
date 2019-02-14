let fs = require('fs')
export default function getFile (path) {
  // 根本绝对路径获取文件对象
  let mime = require('mime')
  return new Promise((resolve, reject) => {
    // 先获取文件信息
    fs.stat(path, (err, stats) => {
      if (err) {
        reject(err)
        return
      }
      if (!stats.isFile) {
        return
      }
      var mimetype = null
      try {
        mimetype = mime.getType(path)
      } catch (err) { return }
      // 读取文件流生成文件
      var readStream = fs.createReadStream(path)
      var blobParts
      readStream.on('open', (fd) => {
        blobParts = []
      })
      readStream.on('data', (data) => {
        var blob = new Blob([data], { type: mimetype })
        // var md5Value = crypto.createHash('md5').update(data, 'utf8').digest('hex');
        blobParts.push(blob)
      })
      readStream.on('end', () => {
        let index = path.lastIndexOf('\\')
        let filename = index !== -1 ? path.substring(index + 1, path.length) : path
        let file = new File(blobParts, filename, { type: mimetype })
        resolve(file)
      })
      readStream.on('error', (err) => {
        reject(err)
      })
    })
  })
}
