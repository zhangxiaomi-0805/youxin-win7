import {getPinyin} from './pinyin'

function ListSort (list) {
  let arr = [...list]
  arr.forEach((item) => {
    let initial = item.alias || item.nick || item.name
    initial = getPinyin(initial)
    item.initial = initial[0]
  })
  let sortArr = arr.sort(function (a, b) {
    return a.initial.localeCompare(b.initial)
  })
  return sortArr
}
export default ListSort
