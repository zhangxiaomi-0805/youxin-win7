class IndexedDB {
  constructor () {
    this.db = null // 初始化数据库
  }

  // 打开数据库
  openDB () {
    const accid = localStorage.getItem('uid')
    return new Promise((resolve, reject) => {
      // 判断是否已经打开数据库
      if (this.db) {
        resolve(this.db)
      } else {
        const request = window.indexedDB.open(`NICE-${accid}`)
        // 首次创建数据库
        request.onupgradeneeded = (event) => {
          const db = event.target.result
          // 设置标识为key
          db.createObjectStore('orgnizeObj', { keyPath: 'key' })
          db.createObjectStore('myDeptObj', { keyPath: 'key' })
          db.createObjectStore('contactslist', { keyPath: 'key' })
          db.createObjectStore('contactsToplist', { keyPath: 'key' })
        }
        request.onsuccess = () => {
          this.db = request.result
          resolve(request.result)
        }
        request.onerror = (err) => {
          reject(err)
        }
      }
    })
  }

  // 读取
  async getItem (name, key) {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const request = db.transaction([name], 'readwrite')
        .objectStore(name)
        .get(key || 'Object')
      request.onsuccess = (event) => {
        resolve(request.result)
      }
      request.onerror = (err) => {
        reject(err)
      }
    })
  }

  // 设置
  //  name-表名  obj-传入对象   key-表orgnizeObj不用传
  async setItem (name, obj, key) {
    const db = await this.openDB()
    // 将key值合并至对象
    const newObj = Object.assign(obj, { key: key || 'Object' })
    return new Promise((resolve, reject) => {
      const request = db.transaction([name], 'readwrite')
        .objectStore(name)
        .put(newObj)
      request.onsuccess = (event) => {
        resolve('success')
      }
      request.onerror = (err) => {
        reject(err)
      }
    })
  }

  // 删除
  async removeItem (name, key) {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const request = db.transaction([name], 'readwrite')
        .objectStore(name)
        .delete(key || 'Object')
      request.onsuccess = function (event) {
        resolve()
      }
      request.onerror = (err) => {
        console.log('数据删除失败')
        reject(err)
      }
    })
  }

  // 遍历表内所有数据
  async getAll (name) {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      let arr = []
      const request = db.transaction([name], 'readwrite')
        .objectStore(name)
        .openCursor()
      request.onsuccess = function (event) {
        let cursor = event.target.result
        if (cursor) {
          arr.push(cursor.value)
          cursor.continue()
        } else {
          resolve(arr)
        }
      }
      request.onerror = (err) => {
        console.log('数据遍历失败')
        reject(err)
      }
    })
  }

  // 清除
  async clear (name) {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const request = db.transaction([name], 'readwrite')
        .objectStore(name)
        .clear()
      request.onsuccess = function (event) {
        resolve()
      }
      request.onerror = (err) => {
        reject(err)
      }
    })
  }
}

const DB = new IndexedDB()

export default DB
