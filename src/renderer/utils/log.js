/**
 * 本地保存日志
 *
 * 日志主要保存 登录（包括云信）
 * 一些接口调用的状态
 * 重要的是 错误的保存
 *
 * 日志文件 log_{date}.log
 * 日志格式  [时间] [进程] [类型] [内容]
 *         [00:00:00] [main process] [error] [content] {[row] [col]}
 *
 *  类型主要有 ajax / nim / error
 *  如果 type 是错误 就记录错误的 位置, 这个位置是打包后的, 需要配合 sourcemap 解析
 *
 *  判断环境：Electron 保存本地 / Web 默认不处理
 *
 *  日志保存三天, 登录检查本地日志三天前的 直接删除
 *
 * @author zjz
 */

import fs from 'fs'
import path from 'path'
import electron from 'electron'
import _u from './global.js'

function isRenderer () {
  // running in a web browser
  if (typeof process === 'undefined') return true

  // node-integration is disabled
  if (!process) return true

  // We're in node.js somehow
  if (!process.type) return false

  return process.type === 'renderer'
}

var Logger = {}
/**
 * 解析传进来的 msg 到标准格式
 * opts.type
 * opts.content
 * opts.row
 * opts.col
 */
Logger.output = function (opts) {
  // if(Logger.isZiping) return;
  // if(__WEB__) return;
  var logMsg = []
  var timeStr = _u._$format(new Date(), 'yyyy_MM_dd HH:mm:ss')
  var date = timeStr.split(' ')[0]
  var time = timeStr.split(' ')[1]

  logMsg.push('[' + time + ']')
  logMsg.push(isRenderer() ? '[render process]' : '[main process]')
  logMsg.push('[' + opts.type + ']')
  logMsg.push('[' + opts.content + ']')

  if (opts.type === 'error') {
    logMsg.push('[ row ' + opts.row + ']')
    logMsg.push('[ col ' + opts.col + ']')
  }

  logMsg.push('\n')

  console.log(logMsg)

  return Logger.write({
    date: date,
    logMsg: logMsg.join('')
  })
}

/**
 * 日志信息写入文件
 * opts.date
 * opts.logMsg
 */
Logger.write = function (opts) {
  var app = isRenderer() ? electron.remote.app : electron.app
  var userPath = app.getPath('userData')
  var position = path.join(userPath, 'log_' + opts.date + '.log')

  return new Promise(function (resolve, reject) {
    fs.access(position, function (err) {
      if (err) {
        fs.writeFile(position, opts.logMsg, 'utf8', function (err) {
          if (err) {
            reject(err)
            return
          }
          resolve()
        })
      } else {
        fs.appendFile(position, opts.logMsg, 'utf8', function (err) {
          if (err) {
            reject(err)
            return
          }
          resolve()
        })
      }
    })
  })
}

export default Logger
