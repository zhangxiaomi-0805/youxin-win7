/**
 * 文件操作模块
 */
const fs = require('fs')
const path = require('path')
const request = require('request')

let OperateFs = function () {}

/**
 * 下载图片
 * @param name   唯一标识
 * @param file   文件对象
 * @param done   完成回调
 */
OperateFs.prototype.createDefaltDir = async function ({name, msg, done}) {
  try {
    let { file } = msg || {}
    let fileDir = path.join(process.cwd(), 'images')
    let accid = localStorage.getItem('uid')
    let readRes = await this.readDir(fileDir)
    if (readRes === 1) {
      // 不存在该目录
      let creatRes = await this.createDir(fileDir)
      if (creatRes === 1) {
        // 创建成功
        fileDir = path.join(fileDir, accid)
        let creatRes1 = await this.createDir(fileDir)
        if (creatRes1 === 1 && name) {
          fileDir = path.join(fileDir, name + '.' + file.name.split('.')[1])
          this.writeFile({file, fileDir, msg, done})
        }
      }
      return false
    }

    // 存在该目录
    fileDir = path.join(fileDir, accid)
    let readRes1 = await this.readDir(fileDir)
    if (readRes1 === 1) {
      // 不存在该目录
      let creatRes1 = await this.createDir(fileDir)
      if (creatRes1 === 1 && name) {
        fileDir = path.join(fileDir, name + '.' + file.name.split('.')[1])
        this.writeFile({file, fileDir, msg, done})
      }
      return false
    }

    // 存在该目录
    if (name) {
      fileDir = path.join(fileDir, name + '.' + file.name.split('.')[1])
      let readFileRes = await this.readFile(fileDir)
      if (readFileRes === 1) {
        // 无此文件
        this.writeFile({file, fileDir, msg, done})
      }
    }
  } catch (error) { console.log(error) }
}

/**
 * 读取目录
 */
OperateFs.prototype.readDir = (fileDir) => {
  return new Promise((resolve) => {
    fs.readdir(fileDir, (error) => {
      if (error) resolve(1)
      else resolve(2)
    })
  })
}

/**
 * 创建目录
 */
OperateFs.prototype.createDir = (fileDir) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(fileDir, {}, (error) => {
      if (error) reject(error)
      else resolve(1)
    })
  })
}

/**
 * 读取文件
 */
OperateFs.prototype.readFile = (fileDir) => {
  return new Promise((resolve) => {
    fs.readFile(fileDir, (error) => {
      if (error) resolve(1)
      else resolve(2)
    })
  })
}

/**
 * 写文件
 */
OperateFs.prototype.writeFile = ({file, fileDir, msg, done}) => {
  console.log(fileDir)
  let writeStream = fs.createWriteStream(fileDir)
  let readStream = request(file.url)
  readStream.pipe(writeStream)

  readStream.on('end', () => {
    console.log('文件下载成功')
  })
  readStream.on('error', (err) => { throw err })

  writeStream.on('finish', () => {
    done && done(fileDir, msg)
    writeStream.end()
  })
}

export default new OperateFs()
