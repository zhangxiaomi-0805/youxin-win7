/**
 * 搜索列表数据来源
 */
import store from '../../store'
import util from '../../utils'
import Fetch from '../../utils/fetch.js'
var SearchData = {}

SearchData.getContactlists = function (name, limit, userId, $this) {
  /*
  * 模糊搜索成员
  * @params  name: 用户名称-名称匹配搜索
  * @params  limit: 查询展示的条数 默认为5
  * @params  userId: 查询起始的用户id(上次返回的最后一个id) 默认为0
  */
  return new Promise((resolve, reject) => {
    Fetch.post('api/appPc/user/search', {
      name, limit, userId
    }, $this).then(ret => {
      if (ret) resolve(ret)
    }).catch(err => reject(err))
  })
}

SearchData.getTeamMembersList = function (teamlimitNum, value, callback) {
  // 获取群列表
  return new Promise(async (resolve, reject) => {
    let teamlistTemp = []
    let grouplist = store.state.teamlist.filter(item => {
      return item.valid && item.validToCurrentUser
    })
    // 群组搜索
    for (let i in grouplist) {
      let group = Object.assign({}, grouplist[i])
      let noCheckMore = teamlistTemp.length <= teamlimitNum
      if (group.name.indexOf(value) > -1) {
        if (noCheckMore) {
          if (teamlistTemp.length === 5 && teamlimitNum === 5) callback()
          else teamlistTemp.push(group)
        }
      } else {
        let members = []
        try {
          members = await this.getTeamMembers(group.teamId)
        } catch (error) { reject(error) }
        for (let i in members) {
          let user = {}
          if (members[i].account) {
            if (store.state.userInfos[members[i].account] === undefined) {
              try {
                user = await this.getMemberInfo(members[i].account)
              } catch (error) { reject(error) }
            } else {
              user = store.state.userInfos[members[i].account]
            }
          }
          if (user.nick && user.nick.indexOf(value) > -1) {
            if (noCheckMore) {
              if (teamlistTemp.length === 5 && teamlimitNum === 5) callback()
              else {
                let team = Object.assign(group, {contain: user.nick})
                teamlistTemp.push(team)
              }
            }
            break
          }
        }
      }
    }
    resolve(teamlistTemp)
  })
}

SearchData.getTeamMembers = function (teamId) {
  // 获取群成员
  return new Promise((resolve, reject) => {
    let nim = store.state.nim
    nim.getTeamMembers({
      teamId,
      done: (error, obj) => {
        if (!error) resolve(obj.members)
        else reject(error)
      }
    })
  })
}

SearchData.getMemberInfo = function (account) {
  // 获取成员信息
  return new Promise((resolve, reject) => {
    let nim = store.state.nim
    nim.getUser({
      account,
      done: (error, user) => {
        if (!error) resolve(user)
        else reject(error)
      }
    })
  })
}

SearchData.getRecordsData = function (recordlimitNum, value, callback) {
  /**
   * 主搜索框
   * 获取列表展示内容数据
   */
  return new Promise(async (resolve, reject) => {
    let recordlistTemp = []
    let sessionlist = store.state.sessionlist
    for (let i in sessionlist) {
      let noCheckMore = recordlistTemp.length <= recordlimitNum
      if (noCheckMore) {
        if (recordlistTemp.length === 5 && recordlimitNum === 5) callback()
        else {
          let records = []
          try {
            records = await this.getRecords(sessionlist[i], value)
          } catch (error) { reject(error) }
          if (records.length > 0) {
            let recordObj = { recordNum: records.length }
            recordObj = Object.assign(recordObj, sessionlist[i])
            recordlistTemp.push(recordObj)
          }
        }
      }
    }
    resolve(recordlistTemp)
  })
}

SearchData.getRecords = function (session, value) {
  /**
   * 主搜索框
   * 获取匹配的列表
   */
  return new Promise((resolve, reject) => {
    let nim = store.state.nim
    nim.getLocalMsgs({
      sessionId: session.id,
      desc: true,
      limit: 100,
      types: ['text'],
      keyword: value,
      done: (error, obj) => {
        if (!error) resolve(obj.msgs)
        else reject(error)
      }
    })
  })
}

SearchData.getRecordsDetailData = function (obj, searchValue, sessionId) {
  /**
   * 聊天记录详情
   * 获取列表展示内容数据
   */
  return new Promise(async (resolve, reject) => {
    let recordlist = await SearchData.getRecordsDetail(obj, searchValue, true, 20, sessionId)
    for (let i in recordlist) {
      let userInfo = {}
      if (store.state.userInfos[recordlist[i].from] === undefined) {
        try {
          userInfo = await this.getMemberInfo(recordlist[i].from)
        } catch (error) { reject(error) }
      } else {
        userInfo = store.state.userInfos[recordlist[i].from]
      }
      recordlist[i].avatar = userInfo.avatar
      recordlist[i].name = userInfo.name || recordlist[i].fromNick
      recordlist[i].updateTimeShow = util.formatDate(recordlist[i].time, true)
    }
    resolve(recordlist)
  })
}

SearchData.getRecordsDetail = function (obj, keyword, desc, limit, sessionId) {
  /**
   * 聊天记录详情
   * 获取匹配到的聊天记录
   */
  return new Promise((resolve, reject) => {
    let nim = store.state.nim
    let Params = {
      sessionId,
      desc,
      limit,
      done: (error, obj) => {
        if (!error) resolve(obj.msgs)
        else reject(error)
      }
    }
    if (obj) Params = Object.assign(Params, obj)
    if (keyword) Params = Object.assign(Params, {keyword, types: ['text']})
    nim.getLocalMsgs(Params)
  })
}

export default SearchData
