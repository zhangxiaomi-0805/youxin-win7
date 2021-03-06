// 地区数据
const Area = [
  {
    'label': '加拿大〔北美洲〕',
    'code': '1',
    'usual': true
  },
  {
    'label': '美国',
    'code': '1',
    'usual': true
  },
  {
    'label': '马来西亚',
    'code': '60',
    'usual': true
  },
  {
    'label': '日本',
    'code': '81',
    'usual': true
  },
  {
    'label': '新加坡',
    'code': '65',
    'usual': true
  },
  {
    'label': '意大利',
    'code': '39',
    'usual': true
  },
  {
    'label': '中国',
    'code': '86',
    'usual': true
  },
  {
    'label': '中国台湾',
    'code': '886',
    'usual': true
  },
  {
    'label': '中国香港',
    'code': '852',
    'usual': true
  },
  {
    'label': '阿富汗',
    'code': '93'
  },
  {
    'label': '阿尔巴尼亚',
    'code': '355'
  },
  {
    'label': '阿尔及利亚',
    'code': '213'
  },
  {
    'label': '东萨摩亚',
    'code': '684'
  },
  {
    'label': '安道尔',
    'code': '376'
  },
  {
    'label': '安哥拉〔非洲〕',
    'code': '244'
  },
  {
    'label': '安圭拉',
    'code': '1264'
  },
  {
    'label': '安提瓜和巴布达',
    'code': '1268'
  },
  {
    'label': '阿根廷〔拉丁美洲〕',
    'code': '54'
  },
  {
    'label': '亚美尼亚',
    'code': '374'
  },
  {
    'label': '阿鲁巴岛（加勒比海）',
    'code': '297'
  },
  {
    'label': '澳大利亚',
    'code': '61'
  },
  {
    'label': '奥地利',
    'code': '43'
  },
  {
    'label': '阿塞拜疆',
    'code': '994'
  },
  {
    'label': '巴哈马〔拉丁美洲〕',
    'code': '1242'
  },
  {
    'label': '巴林',
    'code': '973'
  },
  {
    'label': '孟加拉国',
    'code': '880'
  },
  {
    'label': '巴巴多斯〔拉丁美洲〕',
    'code': '1246'
  },
  {
    'label': '白俄罗斯',
    'code': '375'
  },
  {
    'label': '比利时',
    'code': '32'
  },
  {
    'label': '伯利兹〔拉丁美洲〕',
    'code': '501'
  },
  {
    'label': '贝宁〔非洲〕',
    'code': '229'
  },
  {
    'label': '百慕大 (群岛)',
    'code': '1441'
  },
  {
    'label': '不丹',
    'code': '975'
  },
  {
    'label': '玻利维亚〔拉丁美洲〕',
    'code': '591'
  },
  {
    'label': '波斯尼亚',
    'code': '387'
  },
  {
    'label': '博茨瓦纳(波札那)〔非洲〕',
    'code': '267'
  },
  {
    'label': '巴西〔拉丁美洲〕',
    'code': '55'
  },
  {
    'label': '文莱',
    'code': '673'
  },
  {
    'label': '保加利亚',
    'code': '359'
  },
  {
    'label': '布基拉法索',
    'code': '226'
  },
  {
    'label': '布隆迪(蒲隆地)〔非洲',
    'code': '257'
  },
  {
    'label': '柬埔寨',
    'code': '855'
  },
  {
    'label': '喀麦隆〔非洲〕',
    'code': '237'
  },
  {
    'label': '维德角(佛得角)〔非洲〕',
    'code': '238'
  },
  {
    'label': '开曼群岛(英)〔拉丁美洲〕',
    'code': '1345'
  },
  {
    'label': '中非共和国',
    'code': '236'
  },
  {
    'label': '乍得(查德)〔非洲〕',
    'code': '235'
  },
  {
    'label': '智利〔拉丁美洲〕',
    'code': '56'
  },
  {
    'label': '哥伦比亚〔拉丁美洲〕',
    'code': '57'
  },
  {
    'label': '科摩罗〔非洲〕',
    'code': '269'
  },
  {
    'label': '刚果〔非洲〕',
    'code': '242'
  },
  {
    'label': '刚果，D.R.',
    'code': ' D.R.'
  },
  {
    'label': '库克群岛',
    'code': '682'
  },
  {
    'label': '哥斯达黎加 〔拉丁美洲〕',
    'code': '506'
  },
  {
    'label': '克罗地亚',
    'code': '385'
  },
  {
    'label': '塞浦路斯',
    'code': '357'
  },
  {
    'label': '捷克共和国',
    'code': '420'
  },
  {
    'label': '丹麦',
    'code': '45'
  },
  {
    'label': '吉布提',
    'code': '253'
  },
  {
    'label': '多米尼加(岛)〔西印度群岛〕',
    'code': '1767'
  },
  {
    'label': '多米尼加共和国〔拉丁美洲〕',
    'code': '1'
  },
  {
    'label': '厄瓜多尔〔拉丁美洲〕',
    'code': '593'
  },
  {
    'label': '埃及',
    'code': '20'
  },
  {
    'label': '萨尔瓦多〔拉丁美洲〕',
    'code': '503'
  },
  {
    'label': '赤道几内亚〔非洲〕',
    'code': '240'
  },
  {
    'label': '爱沙尼亚',
    'code': '372'
  },
  {
    'label': '埃塞俄比亚(衣索比亚)',
    'code': '251'
  },
  {
    'label': '福克兰群岛',
    'code': '500'
  },
  {
    'label': '法罗群岛',
    'code': '298'
  },
  {
    'label': '斐济',
    'code': '679'
  },
  {
    'label': '芬兰',
    'code': '358'
  },
  {
    'label': '法国',
    'code': '33'
  },
  {
    'label': '法属圭亚那〔拉丁美洲〕',
    'code': '594'
  },
  {
    'label': '波利尼西亚',
    'code': '689'
  },
  {
    'label': '加蓬(加彭)',
    'code': '241'
  },
  {
    'label': '冈比亚(甘比亚)',
    'code': '220'
  },
  {
    'label': '乔治亚州',
    'code': '1229'
  },
  {
    'label': '德国',
    'code': '49'
  },
  {
    'label': '加纳(迦纳)',
    'code': '233'
  },
  {
    'label': '直布罗陀',
    'code': '350'
  },
  {
    'label': '希腊',
    'code': '30'
  },
  {
    'label': '格陵兰岛',
    'code': '299'
  },
  {
    'label': '格林纳达〔拉丁美洲〕',
    'code': '1437'
  },
  {
    'label': '哥德洛普(岛)〔法国)〔拉丁美洲〕',
    'code': '590'
  },
  {
    'label': '关岛',
    'code': '1671'
  },
  {
    'label': '危地马拉〔拉丁美洲〕',
    'code': '502'
  },
  {
    'label': '几内亚',
    'code': '224'
  },
  {
    'label': '几内亚比绍',
    'code': '245'
  },
  {
    'label': '圭亚那〔拉丁美洲〕',
    'code': '592'
  },
  {
    'label': '海地〔拉丁美洲〕',
    'code': '509'
  },
  {
    'label': '洪都拉斯〔拉丁美洲〕',
    'code': '504'
  },
  {
    'label': '香港',
    'code': '852'
  },
  {
    'label': '匈牙利',
    'code': '36'
  },
  {
    'label': '冰岛',
    'code': '354'
  },
  {
    'label': '印度',
    'code': '91'
  },
  {
    'label': '印度尼西亚',
    'code': '62'
  },
  {
    'label': '伊拉克',
    'code': '964'
  },
  {
    'label': '爱尔兰',
    'code': '353'
  },
  {
    'label': '以色列',
    'code': '972'
  },
  {
    'label': '牙买加',
    'code': '1876'
  },
  {
    'label': '约旦',
    'code': '962'
  },
  {
    'label': '哈萨克斯坦',
    'code': '7'
  },
  {
    'label': '肯尼亚',
    'code': '254'
  },
  {
    'label': '韩国',
    'code': '82'
  },
  {
    'label': '科威特',
    'code': '965'
  },
  {
    'label': '吉尔吉斯斯坦',
    'code': '996'
  },
  {
    'label': '老挝',
    'code': '856'
  },
  {
    'label': '拉脱维亚',
    'code': '371'
  },
  {
    'label': '黎巴嫩',
    'code': '961'
  },
  {
    'label': '莱索托',
    'code': '266'
  },
  {
    'label': '利比里亚',
    'code': '231'
  },
  {
    'label': '利比亚',
    'code': '218'
  },
  {
    'label': '列支敦斯登',
    'code': '423'
  },
  {
    'label': '立陶宛',
    'code': '370'
  },
  {
    'label': '卢森堡',
    'code': '352'
  },
  {
    'label': '澳门',
    'code': '853'
  },
  {
    'label': '马其顿',
    'code': '389'
  },
  {
    'label': '马达加斯加',
    'code': '261'
  },
  {
    'label': '马拉维',
    'code': '265'
  },
  {
    'label': '马尔代夫',
    'code': '960'
  },
  {
    'label': '马里',
    'code': '223'
  },
  {
    'label': '马耳他',
    'code': '356'
  },
  {
    'label': '毛里塔尼亚',
    'code': '222'
  },
  {
    'label': '毛里求斯',
    'code': '230'
  },
  {
    'label': '墨西哥〔拉丁美洲〕',
    'code': '52'
  },
  {
    'label': '密克罗尼西亚',
    'code': '691'
  },
  {
    'label': '摩尔多瓦',
    'code': '373'
  },
  {
    'label': '摩纳哥',
    'code': '377'
  },
  {
    'label': '蒙古',
    'code': '976'
  },
  {
    'label': '黑山共和国',
    'code': '382'
  },
  {
    'label': '蒙特塞拉特岛〔美洲〕',
    'code': '1664'
  },
  {
    'label': '摩洛哥',
    'code': '212'
  },
  {
    'label': '莫桑比克',
    'code': '258'
  },
  {
    'label': '缅甸',
    'code': '95'
  },
  {
    'label': '纳米比亚',
    'code': '264'
  },
  {
    'label': '尼泊尔',
    'code': '977'
  },
  {
    'label': '荷兰',
    'code': '31'
  },
  {
    'label': '新喀里多尼亚',
    'code': '687'
  },
  {
    'label': '新西兰',
    'code': '64'
  },
  {
    'label': '尼加拉瓜〔拉丁美洲〕',
    'code': '505'
  },
  {
    'label': '尼日尔',
    'code': '227'
  },
  {
    'label': '尼日利亚',
    'code': '234'
  },
  {
    'label': '挪威',
    'code': '47'
  },
  {
    'label': '阿曼',
    'code': '968'
  },
  {
    'label': '巴基斯坦',
    'code': '92'
  },
  {
    'label': '帕劳',
    'code': '680'
  },
  {
    'label': '巴拿马',
    'code': '507'
  },
  {
    'label': '巴拉圭〔拉丁美洲〕',
    'code': '595'
  },
  {
    'label': '秘鲁',
    'code': '51'
  },
  {
    'label': '菲律宾',
    'code': '63'
  },
  {
    'label': '波兰',
    'code': '48'
  },
  {
    'label': '葡萄牙',
    'code': '351'
  },
  {
    'label': '波多黎各(岛)',
    'code': '1'
  },
  {
    'label': '卡塔尔',
    'code': '974'
  },
  {
    'label': '留尼汪(岛)',
    'code': '262'
  },
  {
    'label': '罗马尼亚',
    'code': '40'
  },
  {
    'label': '俄罗斯',
    'code': '7'
  },
  {
    'label': '卢旺达',
    'code': '250'
  },
  {
    'label': '萨摩亚',
    'code': '685'
  },
  {
    'label': '圣马力诺',
    'code': '378'
  },
  {
    'label': '圣多美和普林西比民主共和国',
    'code': '239'
  },
  {
    'label': '沙特阿拉伯',
    'code': '966'
  },
  {
    'label': '塞内加尔',
    'code': '221'
  },
  {
    'label': '塞尔维亚',
    'code': '381'
  },
  {
    'label': '塞舌耳(群岛)',
    'code': '248'
  },
  {
    'label': '塞拉利昂',
    'code': '232'
  },
  {
    'label': '新加坡',
    'code': '65'
  },
  {
    'label': '斯洛伐克',
    'code': '421'
  },
  {
    'label': '斯洛文尼亚',
    'code': '386'
  },
  {
    'label': '所罗门群岛',
    'code': '677'
  },
  {
    'label': '索马里',
    'code': '252'
  },
  {
    'label': '南非',
    'code': '27'
  },
  {
    'label': '南苏丹',
    'code': '211'
  },
  {
    'label': '西班牙',
    'code': '34'
  },
  {
    'label': '斯里兰卡',
    'code': '94'
  },
  {
    'label': '圣基茨和尼维斯',
    'code': '1869'
  },
  {
    'label': '圣卢西亚',
    'code': '1758'
  },
  {
    'label': '圣文森特和格林纳丁斯',
    'code': '1784'
  },
  {
    'label': '苏里南〔拉丁美洲〕',
    'code': '597'
  },
  {
    'label': '斯威士兰',
    'code': '268'
  },
  {
    'label': '瑞典',
    'code': '46'
  },
  {
    'label': '瑞士',
    'code': '41'
  },
  {
    'label': '台湾',
    'code': '886'
  },
  {
    'label': '塔吉克斯坦',
    'code': '992'
  },
  {
    'label': '坦桑尼亚',
    'code': '255'
  },
  {
    'label': '泰国',
    'code': '66'
  },
  {
    'label': '东帝汶',
    'code': '670'
  },
  {
    'label': '多哥',
    'code': '228'
  },
  {
    'label': '汤加',
    'code': '676'
  },
  {
    'label': '特立尼达和多巴哥',
    'code': '1868'
  },
  {
    'label': '突尼斯',
    'code': '216'
  },
  {
    'label': '土耳其',
    'code': '90'
  },
  {
    'label': '土库曼斯坦',
    'code': '993'
  },
  {
    'label': '乌干达',
    'code': '256'
  },
  {
    'label': '乌克兰',
    'code': '380'
  },
  {
    'label': '英国',
    'code': '44'
  },
  {
    'label': '乌拉圭〔南美洲〕',
    'code': '598'
  },
  {
    'label': '乌兹别克斯坦',
    'code': '998'
  },
  {
    'label': '瓦努阿图',
    'code': '678'
  },
  {
    'label': '委内瑞拉〔拉丁美洲〕',
    'code': '58'
  },
  {
    'label': '越南',
    'code': '84'
  },
  {
    'label': '赞比亚',
    'code': '260'
  },
  {
    'label': '津巴布韦',
    'code': '263'
  }
]

// 常用国家
let Usual = []
Area.map(item => {
  item.usual && Usual.push(item)
})

// 按字母排序
let AreaCopy = Object.assign([], Area)
AreaCopy.map(item => {
  item.letter = Alphabet(item.label)
})
for (let i = 0; i < AreaCopy.length; i++) {
  for (let j = 0; j < AreaCopy.length - 1 - i; j++) {
    let befSort = AreaCopy[j].letter
    let aftSort = AreaCopy[j + 1].letter
    if (befSort > aftSort) {
      let t = AreaCopy[j]
      AreaCopy[j] = AreaCopy[j + 1]
      AreaCopy[j + 1] = t
    }
  }
}

// 数据整合 [{letter: 'A', area: [{}]}]
let letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
let Region = []
for (let i = 0; i < letter.length; i++) {
  let data = { letter: letter[i], area: [] }
  for (let j = 0; j < AreaCopy.length; j++) {
    if (letter[i] === AreaCopy[j].letter[0][0].toUpperCase()) {
      data.area.push(AreaCopy[j])
    }
  }
  if (data.area.length > 0) {
    Region.push(data)
  }
}

// 中文转字母
function Alphabet (str) {
  let strChineseFirstPY = 'YDYQSXMWZSSXJBYMGCCZQPSSQBYCDSCDQLDYLYBSSJGYZZJJFKCCLZDHWDWZJLJPFYYNWJJTMYHZWZHFLZPPQHGSCYYYNJQYXXGJHHSDSJNKKTMOMLCRXYPSNQSECCQZGGLLYJLMYZZSECYKYYHQWJSSGGYXYZYJWWKDJHYCHMYXJTLXJYQBYXZLDWRDJRWYSRLDZJPCBZJJBRCFTLECZSTZFXXZHTRQHYBDLYCZSSYMMRFMYQZPWWJJYFCRWFDFZQPYDDWYXKYJAWJFFXYPSFTZYHHYZYSWCJYXSCLCXXWZZXNBGNNXBXLZSZSBSGPYSYZDHMDZBQBZCWDZZYYTZHBTSYYBZGNTNXQYWQSKBPHHLXGYBFMJEBJHHGQTJCYSXSTKZHLYCKGLYSMZXYALMELDCCXGZYRJXSDLTYZCQKCNNJWHJTZZCQLJSTSTBNXBTYXCEQXGKWJYFLZQLYHYXSPSFXLMPBYSXXXYDJCZYLLLSJXFHJXPJBTFFYABYXBHZZBJYZLWLCZGGBTSSMDTJZXPTHYQTGLJSCQFZKJZJQNLZWLSLHDZBWJNCJZYZSQQYCQYRZCJJWYBRTWPYFTWEXCSKDZCTBZHYZZYYJXZCFFZZMJYXXSDZZOTTBZLQWFCKSZSXFYRLNYJMBDTHJXSQQCCSBXYYTSYFBXDZTGBCNSLCYZZPSAZYZZSCJCSHZQYDXLBPJLLMQXTYDZXSQJTZPXLCGLQTZWJBHCTSYJSFXYEJJTLBGXSXJMYJQQPFZASYJNTYDJXKJCDJSZCBARTDCLYJQMWNQNCLLLKBYBZZSYHQQLTWLCCXTXLLZNTYLNEWYZYXCZXXGRKRMTCNDNJTSYYSSDQDGHSDBJGHRWRQLYBGLXHLGTGXBQJDZPYJSJYJCTMRNYMGRZJCZGJMZMGXMPRYXKJNYMSGMZJYMKMFXMLDTGFBHCJHKYLPFMDXLQJJSMTQGZSJLQDLDGJYCALCMZCSDJLLNXDJFFFFJCZFMZFFPFKHKGDPSXKTACJDHHZDDCRRCFQYJKQCCWJDXHWJLYLLZGCFCQDSMLZPBJJPLSBCJGGDCKKDEZSQCCKJGCGKDJTJDLZYCXKLQSCGJCLTFPCQCZGWPJDQYZJJBYJHSJDZWGFSJGZKQCCZLLPSPKJGQJHZZLJPLGJGJJTHJJYJZCZMLZLYQBGJWMLJKXZDZNJQSYZMLJLLJKYWXMKJLHSKJGBMCLYYMKXJQLBMLLKMDXXKWYXYSLMLPSJQQJQXYXFJTJDXMXXLLCXQBSYJBGWYMBGGBCYXPJYGPEPFGDJGBHBNSQJYZJKJKHXQFGQZKFHYGKHDKLLSDJQXPQYKYBNQSXQNSZSWHBSXWHXWBZZXDMNSJBSBKBBZKLYLXGWXDRWYQZMYWSJQLCJXXJXKJEQXSCYETLZHLYYYSDZPAQYZCMTLSHTZCFYZYXYLJSDCJQAGYSLCQLYYYSHMRQQKLDXZSCSSSYDYCJYSFSJBFRSSZQSBXXPXJYSDRCKGJLGDKZJZBDKTCSYQPYHSTCLDJDHMXMCGXYZHJDDTMHLTXZXYLYMOHYJCLTYFBQQXPFBDFHHTKSQHZYYWCNXXCRWHOWGYJLEGWDQCWGFJYCSNTMYTOLBYGWQWESJPWNMLRYDZSZTXYQPZGCWXHNGPYXSHMYQJXZTDPPBFYHZHTJYFDZWKGKZBLDNTSXHQEEGZZYLZMMZYJZGXZXKHKSTXNXXWYLYAPSTHXDWHZYMPXAGKYDXBHNHXKDPJNMYHYLPMGOCSLNZHKXXLPZZLBMLSFBHHGYGYYGGBHSCYAQTYWLXTZQCEZYDQDQMMHTKLLSZHLSJZWFYHQSWSCWLQAZYNYTLSXTHAZNKZZSZZLAXXZWWCTGQQTDDYZTCCHYQZFLXPSLZYGPZSZNGLNDQTBDLXGTCTAJDKYWNSYZLJHHZZCWNYYZYWMHYCHHYXHJKZWSXHZYXLYSKQYSPSLYZWMYPPKBYGLKZHTYXAXQSYSHXASMCHKDSCRSWJPWXSGZJLWWSCHSJHSQNHCSEGNDAQTBAALZZMSSTDQJCJKTSCJAXPLGGXHHGXXZCXPDMMHLDGTYBYSJMXHMRCPXXJZCKZXSHMLQXXTTHXWZFKHCCZDYTCJYXQHLXDHYPJQXYLSYYDZOZJNYXQEZYSQYAYXWYPDGXDDXSPPYZNDLTWRHXYDXZZJHTCXMCZLHPYYYYMHZLLHNXMYLLLMDCPPXHMXDKYCYRDLTXJCHHZZXZLCCLYLNZSHZJZZLNNRLWHYQSNJHXYNTTTKYJPYCHHYEGKCTTWLGQRLGGTGTYGYHPYHYLQYQGCWYQKPYYYTTTTLHYHLLTYTTSPLKYZXGZWGPYDSSZZDQXSKCQNMJJZZBXYQMJRTFFBTKHZKBXLJJKDXJTLBWFZPPTKQTZTGPDGNTPJYFALQMKGXBDCLZFHZCLLLLADPMXDJHLCCLGYHDZFGYDDGCYYFGYDXKSSEBDHYKDKDKHNAXXYBPBYYHXZQGAFFQYJXDMLJCSQZLLPCHBSXGJYNDYBYQSPZWJLZKSDDTACTBXZDYZYPJZQSJNKKTKNJDJGYYPGTLFYQKASDNTCYHBLWDZHBBYDWJRYGKZYHEYYFJMSDTYFZJJHGCXPLXHLDWXXJKYTCYKSSSMTWCTTQZLPBSZDZWZXGZAGYKTYWXLHLSPBCLLOQMMZSSLCMBJCSZZKYDCZJGQQDSMCYTZQQLWZQZXSSFPTTFQMDDZDSHDTDWFHTDYZJYQJQKYPBDJYYXTLJHDRQXXXHAYDHRJLKLYTWHLLRLLRCXYLBWSRSZZSYMKZZHHKYHXKSMDSYDYCJPBZBSQLFCXXXNXKXWYWSDZYQOGGQMMYHCDZTTFJYYBGSTTTYBYKJDHKYXBELHTYPJQNFXFDYKZHQKZBYJTZBXHFDXKDASWTAWAJLDYJSFHBLDNNTNQJTJNCHXFJSRFWHZFMDRYJYJWZPDJKZYJYMPCYZNYNXFBYTFYFWYGDBNZZZDNYTXZEMMQBSQEHXFZMBMFLZZSRXYMJGSXWZJSPRYDJSJGXHJJGLJJYNZZJXHGXKYMLPYYYCXYTWQZSWHWLYRJLPXSLSXMFSWWKLCTNXNYNPSJSZHDZEPTXMYYWXYYSYWLXJQZQXZDCLEEELMCPJPCLWBXSQHFWWTFFJTNQJHJQDXHWLBYZNFJLALKYYJLDXHHYCSTYYWNRJYXYWTRMDRQHWQCMFJDYZMHMYYXJWMYZQZXTLMRSPWWCHAQBXYGZYPXYYRRCLMPYMGKSJSZYSRMYJSNXTPLNBAPPYPYLXYYZKYNLDZYJZCZNNLMZHHARQMPGWQTZMXXMLLHGDZXYHXKYXYCJMFFYYHJFSBSSQLXXNDYCANNMTCJCYPRRNYTYQNYYMBMSXNDLYLYSLJRLXYSXQMLLYZLZJJJKYZZCSFBZXXMSTBJGNXYZHLXNMCWSCYZYFZLXBRNNNYLBNRTGZQYSATSWRYHYJZMZDHZGZDWYBSSCSKXSYHYTXXGCQGXZZSHYXJSCRHMKKBXCZJYJYMKQHZJFNBHMQHYSNJNZYBKNQMCLGQHWLZNZSWXKHLJHYYBQLBFCDSXDLDSPFZPSKJYZWZXZDDXJSMMEGJSCSSMGCLXXKYYYLNYPWWWGYDKZJGGGZGGSYCKNJWNJPCXBJJTQTJWDSSPJXZXNZXUMELPXFSXTLLXCLJXJJLJZXCTPSWXLYDHLYQRWHSYCSQYYBYAYWJJJQFWQCQQCJQGXALDBZZYJGKGXPLTZYFXJLTPADKYQHPMATLCPDCKBMTXYBHKLENXDLEEGQDYMSAWHZMLJTWYGXLYQZLJEEYYBQQFFNLYXRDSCTGJGXYYNKLLYQKCCTLHJLQMKKZGCYYGLLLJDZGYDHZWXPYSJBZKDZGYZZHYWYFQYTYZSZYEZZLYMHJJHTSMQWYZLKYYWZCSRKQYTLTDXWCTYJKLWSQZWBDCQYNCJSRSZJLKCDCDTLZZZACQQZZDDXYPLXZBQJYLZLLLQDDZQJYJYJZYXNYYYNYJXKXDAZWYRDLJYYYRJLXLLDYXJCYWYWNQCCLDDNYYYNYCKCZHXXCCLGZQJGKWPPCQQJYSBZZXYJSQPXJPZBSBDSFNSFPZXHDWZTDWPPTFLZZBZDMYYPQJRSDZSQZSQXBDGCPZSWDWCSQZGMDHZXMWWFYBPDGPHTMJTHZSMMBGZMBZJCFZWFZBBZMQCFMBDMCJXLGPNJBBXGYHYYJGPTZGZMQBQTCGYXJXLWZKYDPDYMGCFTPFXYZTZXDZXTGKMTYBBCLBJASKYTSSQYYMSZXFJEWLXLLSZBQJJJAKLYLXLYCCTSXMCWFKKKBSXLLLLJYXTYLTJYYTDPJHNHNNKBYQNFQYYZBYYESSESSGDYHFHWTCJBSDZZTFDMXHCNJZYMQWSRYJDZJQPDQBBSTJGGFBKJBXTGQHNGWJXJGDLLTHZHHYYYYYYSXWTYYYCCBDBPYPZYCCZYJPZYWCBDLFWZCWJDXXHYHLHWZZXJTCZLCDPXUJCZZZLYXJJTXPHFXWPYWXZPTDZZBDZCYHJHMLXBQXSBYLRDTGJRRCTTTHYTCZWMXFYTWWZCWJWXJYWCSKYBZSCCTZQNHXNWXXKHKFHTSWOCCJYBCMPZZYKBNNZPBZHHZDLSYDDYTYFJPXYNGFXBYQXCBHXCPSXTYZDMKYSNXSXLHKMZXLYHDHKWHXXSSKQYHHCJYXGLHZXCSNHEKDTGZXQYPKDHEXTYKCNYMYYYPKQYYYKXZLTHJQTBYQHXBMYHSQCKWWYLLHCYYLNNEQXQWMCFBDCCMLJGGXDQKTLXKGNQCDGZJWYJJLYHHQTTTNWCHMXCXWHWSZJYDJCCDBQCDGDNYXZTHCQRXCBHZTQCBXWGQWYYBXHMBYMYQTYEXMQKYAQYRGYZSLFYKKQHYSSQYSHJGJCNXKZYCXSBXYXHYYLSTYCXQTHYSMGSCPMMGCCCCCMTZTASMGQZJHKLOSQYLSWTMXSYQKDZLJQQYPLSYCZTCQQPBBQJZCLPKHQZYYXXDTDDTSJCXFFLLCHQXMJLWCJCXTSPYCXNDTJSHJWXDQQJSKXYAMYLSJHMLALYKXCYYDMNMDQMXMCZNNCYBZKKYFLMCHCMLHXRCJJHSYLNMTJZGZGYWJXSRXCWJGJQHQZDQJDCJJZKJKGDZQGJJYJYLXZXXCDQHHHEYTMHLFSBDJSYYSHFYSTCZQLPBDRFRZTZYKYWHSZYQKWDQZRKMSYNBCRXQBJYFAZPZZEDZCJYWBCJWHYJBQSZYWRYSZPTDKZPFPBNZTKLQYHBBZPNPPTYZZYBQNYDCPJMMCYCQMCYFZZDCMNLFPBPLNGQJTBTTNJZPZBBZNJKLJQYLNBZQHKSJZNGGQSZZKYXSHPZSNBCGZKDDZQANZHJKDRTLZLSWJLJZLYWTJNDJZJHXYAYNCBGTZCSSQMNJPJYTYSWXZFKWJQTKHTZPLBHSNJZSYZBWZZZZLSYLSBJHDWWQPSLMMFBJDWAQYZTCJTBNNWZXQXCDSLQGDSDPDZHJTQQPSWLYYJZLGYXYZLCTCBJTKTYCZJTQKBSJLGMGZDMCSGPYNJZYQYYKNXRPWSZXMTNCSZZYXYBYHYZAXYWQCJTLLCKJJTJHGDXDXYQYZZBYWDLWQCGLZGJGQRQZCZSSBCRPCSKYDZNXJSQGXSSJMYDNSTZTPBDLTKZWXQWQTZEXNQCZGWEZKSSBYBRTSSSLCCGBPSZQSZLCCGLLLZXHZQTHCZMQGYZQZNMCOCSZJMMZSQPJYGQLJYJPPLDXRGZYXCCSXHSHGTZNLZWZKJCXTCFCJXLBMQBCZZWPQDNHXLJCTHYZLGYLNLSZZPCXDSCQQHJQKSXZPBAJYEMSMJTZDXLCJYRYYNWJBNGZZTMJXLTBSLYRZPYLSSCNXPHLLHYLLQQZQLXYMRSYCXZLMMCZLTZSDWTJJLLNZGGQXPFSKYGYGHBFZPDKMWGHCXMSGDXJMCJZDYCABXJDLNBCDQYGSKYDQTXDJJYXMSZQAZDZFSLQXYJSJZYLBTXXWXQQZBJZUFBBLYLWDSLJHXJYZJWTDJCZFQZQZZDZSXZZQLZCDZFJHYSPYMPQZMLPPLFFXJJNZZYLSJEYQZFPFZKSYWJJJHRDJZZXTXXGLGHYDXCSKYSWMMZCWYBAZBJKSHFHJCXMHFQHYXXYZFTSJYZFXYXPZLCHMZMBXHZZSXYFYMNCWDABAZLXKTCSHHXKXJJZJSTHYGXSXYYHHHJWXKZXSSBZZWHHHCWTZZZPJXSNXQQJGZYZYWLLCWXZFXXYXYHXMKYYSWSQMNLNAYCYSPMJKHWCQHYLAJJMZXHMMCNZHBHXCLXTJPLTXYJHDYYLTTXFSZHYXXSJBJYAYRSMXYPLCKDUYHLXRLNLLSTYZYYQYGYHHSCCSMZCTZQXKYQFPYYRPFFLKQUNTSZLLZMWWTCQQYZWTLLMLMPWMBZSSTZRBPDDTLQJJBXZCSRZQQYGWCSXFWZLXCCRSZDZMCYGGDZQSGTJSWLJMYMMZYHFBJDGYXCCPSHXNZCSBSJYJGJMPPWAFFYFNXHYZXZYLREMZGZCYZSSZDLLJCSQFNXZKPTXZGXJJGFMYYYSNBTYLBNLHPFZDCYFBMGQRRSSSZXYSGTZRNYDZZCDGPJAFJFZKNZBLCZSZPSGCYCJSZLMLRSZBZZLDLSLLYSXSQZQLYXZLSKKBRXBRBZCYCXZZZEEYFGKLZLYYHGZSGZLFJHGTGWKRAAJYZKZQTSSHJJXDCYZUYJLZYRZDQQHGJZXSSZBYKJPBFRTJXLLFQWJHYLQTYMBLPZDXTZYGBDHZZRBGXHWNJTJXLKSCFSMWLSDQYSJTXKZSCFWJLBXFTZLLJZLLQBLSQMQQCGCZFPBPHZCZJLPYYGGDTGWDCFCZQYYYQYSSCLXZSKLZZZGFFCQNWGLHQYZJJCZLQZZYJPJZZBPDCCMHJGXDQDGDLZQMFGPSYTSDYFWWDJZJYSXYYCZCYHZWPBYKXRYLYBHKJKSFXTZJMMCKHLLTNYYMSYXYZPYJQYCSYCWMTJJKQYRHLLQXPSGTLYYCLJSCPXJYZFNMLRGJJTYZBXYZMSJYJHHFZQMSYXRSZCWTLRTQZSSTKXGQKGSPTGCZNJSJCQCXHMXGGZTQYDJKZDLBZSXJLHYQGGGTHQSZPYHJHHGYYGKGGCWJZZYLCZLXQSFTGZSLLLMLJSKCTBLLZZSZMMNYTPZSXQHJCJYQXYZXZQZCPSHKZZYSXCDFGMWQRLLQXRFZTLYSTCTMJCXJJXHJNXTNRZTZFQYHQGLLGCXSZSJDJLJCYDSJTLNYXHSZXCGJZYQPYLFHDJSBPCCZHJJJQZJQDYBSSLLCMYTTMQTBHJQNNYGKYRQYQMZGCJKPDCGMYZHQLLSLLCLMHOLZGDYYFZSLJCQZLYLZQJESHNYLLJXGJXLYSYYYXNBZLJSSZCQQCJYLLZLTJYLLZLLBNYLGQCHXYYXOXCXQKYJXXXYKLXSXXYQXCYKQXQCSGYXXYQXYGYTQOHXHXPYXXXULCYEYCHZZCBWQBBWJQZSCSZSSLZYLKDESJZWMYMCYTSDSXXSCJPQQSQYLYYZYCMDJDZYWCBTJSYDJKCYDDJLBDJJSODZYSYXQQYXDHHGQQYQHDYXWGMMMAJDYBBBPPBCMUUPLJZSMTXERXJMHQNUTPJDCBSSMSSSTKJTSSMMTRCPLZSZMLQDSDMJMQPNQDXCFYNBFSDQXYXHYAYKQYDDLQYYYSSZBYDSLNTFQTZQPZMCHDHCZCWFDXTMYQSPHQYYXSRGJCWTJTZZQMGWJJTJHTQJBBHWZPXXHYQFXXQYWYYHYSCDYDHHQMNMTMWCPBSZPPZZGLMZFOLLCFWHMMSJZTTDHZZYFFYTZZGZYSKYJXQYJZQBHMBZZLYGHGFMSHPZFZSNCLPBQSNJXZSLXXFPMTYJYGBXLLDLXPZJYZJYHHZCYWHJYLSJEXFSZZYWXKZJLUYDTMLYMQJPWXYHXSKTQJEZRPXXZHHMHWQPWQLYJJQJJZSZCPHJLCHHNXJLQWZJHBMZYXBDHHYPZLHLHLGFWLCHYYTLHJXCJMSCPXSTKPNHQXSRTYXXTESYJCTLSSLSTDLLLWWYHDHRJZSFGXTSYCZYNYHTDHWJSLHTZDQDJZXXQHGYLTZPHCSQFCLNJTCLZPFSTPDYNYLGMJLLYCQHYSSHCHYLHQYQTMZYPBYWRFQYKQSYSLZDQJMPXYYSSRHZJNYWTQDFZBWWTWWRXCWHGYHXMKMYYYQMSMZHNGCEPMLQQMTCWCTMMPXJPJJHFXYYZSXZHTYBMSTSYJTTQQQYYLHYNPYQZLCYZHZWSMYLKFJXLWGXYPJYTYSYXYMZCKTTWLKSMZSYLMPWLZWXWQZSSAQSYXYRHSSNTSRAPXCPWCMGDXHXZDZYFJHGZTTSBJHGYZSZYSMYCLLLXBTYXHBBZJKSSDMALXHYCFYGMQYPJYCQXJLLLJGSLZGQLYCJCCZOTYXMTMTTLLWTGPXYMZMKLPSZZZXHKQYSXCTYJZYHXSHYXZKXLZWPSQPYHJWPJPWXQQYLXSDHMRSLZZYZWTTCYXYSZZSHBSCCSTPLWSSCJCHNLCGCHSSPHYLHFHHXJSXYLLNYLSZDHZXYLSXLWZYKCLDYAXZCMDDYSPJTQJZLNWQPSSSWCTSTSZLBLNXSMNYYMJQBQHRZWTYYDCHQLXKPZWBGQYBKFCMZWPZLLYYLSZYDWHXPSBCMLJBSCGBHXLQHYRLJXYSWXWXZSLDFHLSLYNJLZYFLYJYCDRJLFSYZFSLLCQYQFGJYHYXZLYLMSTDJCYHBZLLNWLXXYGYYHSMGDHXXHHLZZJZXCZZZCYQZFNGWPYLCPKPYYPMCLQKDGXZGGWQBDXZZKZFBXXLZXJTPJPTTBYTSZZDWSLCHZHSLTYXHQLHYXXXYYZYSWTXZKHLXZXZPYHGCHKCFSYHUTJRLXFJXPTZTWHPLYXFCRHXSHXKYXXYHZQDXQWULHYHMJTBFLKHTXCWHJFWJCFPQRYQXCYYYQYGRPYWSGSUNGWCHKZDXYFLXXHJJBYZWTSXXNCYJJYMSWZJQRMHXZWFQSYLZJZGBHYNSLBGTTCSYBYXXWXYHXYYXNSQYXMQYWRGYQLXBBZLJSYLPSYTJZYHYZAWLRORJMKSCZJXXXYXCHDYXRYXXJDTSQFXLYLTSFFYXLMTYJMJUYYYXLTZCSXQZQHZXLYYXZHDNBRXXXJCTYHLBRLMBRLLAXKYLLLJLYXXLYCRYLCJTGJCMTLZLLCYZZPZPCYAWHJJFYBDYYZSMPCKZDQYQPBPCJPDCYZMDPBCYYDYCNNPLMTMLRMFMMGWYZBSJGYGSMZQQQZTXMKQWGXLLPJGZBQCDJJJFPKJKCXBLJMSWMDTQJXLDLPPBXCWRCQFBFQJCZAHZGMYKPHYYHZYKNDKZMBPJYXPXYHLFPNYYGXJDBKXNXHJMZJXSTRSTLDXSKZYSYBZXJLXYSLBZYSLHXJPFXPQNBYLLJQKYGZMCYZZYMCCSLCLHZFWFWYXZMWSXTYNXJHPYYMCYSPMHYSMYDYSHQYZCHMJJMZCAAGCFJBBHPLYZYLXXSDJGXDHKXXTXXNBHRMLYJSLTXMRHNLXQJXYZLLYSWQGDLBJHDCGJYQYCMHWFMJYBMBYJYJWYMDPWHXQLDYGPDFXXBCGJSPCKRSSYZJMSLBZZJFLJJJLGXZGYXYXLSZQYXBEXYXHGCXBPLDYHWETTWWCJMBTXCHXYQXLLXFLYXLLJLSSFWDPZSMYJCLMWYTCZPCHQEKCQBWLCQYDPLQPPQZQFJQDJHYMMCXTXDRMJWRHXCJZYLQXDYYNHYYHRSLSRSYWWZJYMTLTLLGTQCJZYABTCKZCJYCCQLJZQXALMZYHYWLWDXZXQDLLQSHGPJFJLJHJABCQZDJGTKHSSTCYJLPSWZLXZXRWGLDLZRLZXTGSLLLLZLYXXWGDZYGBDPHZPBRLWSXQBPFDWOFMWHLYPCBJCCLDMBZPBZZLCYQXLDOMZBLZWPDWYYGDSTTHCSQSCCRSSSYSLFYBFNTYJSZDFNDPDHDZZMBBLSLCMYFFGTJJQWFTMTPJWFNLBZCMMJTGBDZLQLPYFHYYMJYLSDCHDZJWJCCTLJCLDTLJJCPDDSQDSSZYBNDBJLGGJZXSXNLYCYBJXQYCBYLZCFZPPGKCXZDZFZTJJFJSJXZBNZYJQTTYJYHTYCZHYMDJXTTMPXSPLZCDWSLSHXYPZGTFMLCJTYCBPMGDKWYCYZCDSZZYHFLYCTYGWHKJYYLSJCXGYWJCBLLCSNDDBTZBSCLYZCZZSSQDLLMQYYHFSLQLLXFTYHABXGWNYWYYPLLSDLDLLBJCYXJZMLHLJDXYYQYTDLLLBUGBFDFBBQJZZMDPJHGCLGMJJPGAEHHBWCQXAXHHHZCHXYPHJAXHLPHJPGPZJQCQZGJJZZUZDMQYYBZZPHYHYBWHAZYJHYKFGDPFQSDLZMLJXKXGALXZDAGLMDGXMWZQYXXDXXPFDMMSSYMPFMDMMKXKSYZYSHDZKXSYSMMZZZMSYDNZZCZXFPLSTMZDNMXCKJMZTYYMZMZZMSXHHDCZJEMXXKLJSTLWLSQLYJZLLZJSSDPPMHNLZJCZYHMXXHGZCJMDHXTKGRMXFWMCGMWKDTKSXQMMMFZZYDKMSCLCMPCGMHSPXQPZDSSLCXKYXTWLWJYAHZJGZQMCSNXYYMMPMLKJXMHLMLQMXCTKZMJQYSZJSYSZHSYJZJCDAJZYBSDQJZGWZQQXFKDMSDJLFWEHKZQKJPEYPZYSZCDWYJFFMZZYLTTDZZEFMZLBNPPLPLPEPSZALLTYLKCKQZKGENQLWAGYXYDPXLHSXQQWQCQXQCLHYXXMLYCCWLYMQYSKGCHLCJNSZKPYZKCQZQLJPDMDZHLASXLBYDWQLWDNBQCRYDDZTJYBKBWSZDXDTNPJDTCTQDFXQQMGNXECLTTBKPWSLCTYQLPWYZZKLPYGZCQQPLLKCCYLPQMZCZQCLJSLQZDJXLDDHPZQDLJJXZQDXYZQKZLJCYQDYJPPYPQYKJYRMPCBYMCXKLLZLLFQPYLLLMBSGLCYSSLRSYSQTMXYXZQZFDZUYSYZTFFMZZSMZQHZSSCCMLYXWTPZGXZJGZGSJSGKDDHTQGGZLLBJDZLCBCHYXYZHZFYWXYZYMSDBZZYJGTSMTFXQYXQSTDGSLNXDLRYZZLRYYLXQHTXSRTZNGZXBNQQZFMYKMZJBZYMKBPNLYZPBLMCNQYZZZSJZHJCTZKHYZZJRDYZHNPXGLFZTLKGJTCTSSYLLGZRZBBQZZKLPKLCZYSSUYXBJFPNJZZXCDWXZYJXZZDJJKGGRSRJKMSMZJLSJYWQSKYHQJSXPJZZZLSNSHRNYPZTWCHKLPSRZLZXYJQXQKYSJYCZTLQZYBBYBWZPQDWWYZCYTJCJXCKCWDKKZXSGKDZXWWYYJQYYTCYTDLLXWKCZKKLCCLZCQQDZLQLCSFQCHQHSFSMQZZLNBJJZBSJHTSZDYSJQJPDLZCDCWJKJZZLPYCGMZWDJJBSJQZSYZYHHXJPBJYDSSXDZNCGLQMBTSFSBPDZDLZNFGFJGFSMPXJQLMBLGQCYYXBQKDJJQYRFKZTJDHCZKLBSDZCFJTPLLJGXHYXZCSSZZXSTJYGKGCKGYOQXJPLZPBPGTGYJZGHZQZZLBJLSQFZGKQQJZGYCZBZQTLDXRJXBSXXPZXHYZYCLWDXJJHXMFDZPFZHQHQMQGKSLYHTYCGFRZGNQXCLPDLBZCSCZQLLJBLHBZCYPZZPPDYMZZSGYHCKCPZJGSLJLNSCDSLDLXBMSTLDDFJMKDJDHZLZXLSZQPQPGJLLYBDSZGQLBZLSLKYYHZTTNTJYQTZZPSZQZTLLJTYYLLQLLQYZQLBDZLSLYYZYMDFSZSNHLXZNCZQZPBWSKRFBSYZMTHBLGJPMCZZLSTLXSHTCSYZLZBLFEQHLXFLCJLYLJQCBZLZJHHSSTBRMHXZHJZCLXFNBGXGTQJCZTMSFZKJMSSNXLJKBHSJXNTNLZDNTLMSJXGZJYJCZXYJYJWRWWQNZTNFJSZPZSHZJFYRDJSFSZJZBJFZQZZHZLXFYSBZQLZSGYFTZDCSZXZJBQMSZKJRHYJZCKMJKHCHGTXKXQGLXPXFXTRTYLXJXHDTSJXHJZJXZWZLCQSBTXWXGXTXXHXFTSDKFJHZYJFJXRZSDLLLTQSQQZQWZXSYQTWGWBZCGZLLYZBCLMQQTZHZXZXLJFRMYZFLXYSQXXJKXRMQDZDMMYYBSQBHGZMWFWXGMXLZPYYTGZYCCDXYZXYWGSYJYZNBHPZJSQSYXSXRTFYZGRHZTXSZZTHCBFCLSYXZLZQMZLMPLMXZJXSFLBYZMYQHXJSXRXSQZZZSSLYFRCZJRCRXHHZXQYDYHXSJJHZCXZBTYNSYSXJBQLPXZQPYMLXZKYXLXCJLCYSXXZZLXDLLLJJYHZXGYJWKJRWYHCPSGNRZLFZWFZZNSXGXFLZSXZZZBFCSYJDBRJKRDHHGXJLJJTGXJXXSTJTJXLYXQFCSGSWMSBCTLQZZWLZZKXJMLTMJYHSDDBXGZHDLBMYJFRZFSGCLYJBPMLYSMSXLSZJQQHJZFXGFQFQBPXZGYYQXGZTCQWYLTLGWSGWHRLFSFGZJMGMGBGTJFSYZZGZYZAFLSSPMLPFLCWBJZCLJJMZLPJJLYMQDMYYYFBGYGYZMLYZDXQYXRQQQHSYYYQXYLJTYXFSFSLLGNQCYHYCWFHCCCFXPYLYPLLZYXXXXXKQHHXSHJZCFZSCZJXCPZWHHHHHAPYLQALPQAFYHXDYLUKMZQGGGDDESRNNZLTZGCHYPPYSQJJHCLLJTOLNJPZLJLHYMHEYDYDSQYCDDHGZUNDZCLZYZLLZNTNYZGSLHSLPJJBDGWXPCDUTJCKLKCLWKLLCASSTKZZDNQNTTLYYZSSYSSZZRYLJQKCQDHHCRXRZYDGRGCWCGZQFFFPPJFZYNAKRGYWYQPQXXFKJTSZZXSWZDDFBBXTBGTZKZNPZZPZXZPJSZBMQHKCYXYLDKLJNYPKYGHGDZJXXEAHPNZKZTZCMXCXMMJXNKSZQNMNLWBWWXJKYHCPSTMCSQTZJYXTPCTPDTNNPGLLLZSJLSPBLPLQHDTNJNLYYRSZFFJFQWDPHZDWMRZCCLODAXNSSNYZRESTYJWJYJDBCFXNMWTTBYLWSTSZGYBLJPXGLBOCLHPCBJLTMXZLJYLZXCLTPNCLCKXTPZJSWCYXSFYSZDKNTLBYJCYJLLSTGQCBXRYZXBXKLYLHZLQZLNZCXWJZLJZJNCJHXMNZZGJZZXTZJXYCYYCXXJYYXJJXSSSJSTSSTTPPGQTCSXWZDCSYFPTFBFHFBBLZJCLZZDBXGCXLQPXKFZFLSYLTUWBMQJHSZBMDDBCYSCCLDXYCDDQLYJJWMQLLCSGLJJSYFPYYCCYLTJANTJJPWYCMMGQYYSXDXQMZHSZXPFTWWZQSWQRFKJLZJQQYFBRXJHHFWJJZYQAZMYFRHCYYBYQWLPEXCCZSTYRLTTDMQLYKMBBGMYYJPRKZNPBSXYXBHYZDJDNGHPMFSGMWFZMFQMMBCMZZCJJLCNUXYQLMLRYGQZCYXZLWJGCJCGGMCJNFYZZJHYCPRRCMTZQZXHFQGTJXCCJEAQCRJYHPLQLSZDJRBCQHQDYRHYLYXJSYMHZYDWLDFRYHBPYDTSSCNWBXGLPZMLZZTQSSCPJMXXYCSJYTYCGHYCJWYRXXLFEMWJNMKLLSWTXHYYYNCMMCWJDQDJZGLLJWJRKHPZGGFLCCSCZMCBLTBHBQJXQDSPDJZZGKGLFQYWBZYZJLTSTDHQHCTCBCHFLQMPWDSHYYTQWCNZZJTLBYMBPDYYYXSQKXWYYFLXXNCWCXYPMAELYKKJMZZZBRXYYQJFLJPFHHHYTZZXSGQQMHSPGDZQWBWPJHZJDYSCQWZKTXXSQLZYYMYSDZGRXCKKUJLWPYSYSCSYZLRMLQSYLJXBCXTLWDQZPCYCYKPPPNSXFYZJJRCEMHSZMSXLXGLRWGCSTLRSXBZGBZGZTCPLUJLSLYLYMTXMTZPALZXPXJTJWTCYYZLBLXBZLQMYLXPGHDSLSSDMXMBDZZSXWHAMLCZCPJMCNHJYSNSYGCHSKQMZZQDLLKABLWJXSFMOCDXJRRLYQZKJMYBYQLYHETFJZFRFKSRYXFJTWDSXXSYSQJYSLYXWJHSNLXYYXHBHAWHHJZXWMYLJCSSLKYDZTXBZSYFDXGXZJKHSXXYBSSXDPYNZWRPTQZCZENYGCXQFJYKJBZMLJCMQQXUOXSLYXXLYLLJDZBTYMHPFSTTQQWLHOKYBLZZALZXQLHZWRRQHLSTMYPYXJJXMQSJFNBXYXYJXXYQYLTHYLQYFMLKLJTMLLHSZWKZHLJMLHLJKLJSTLQXYLMBHHLNLZXQJHXCFXXLHYHJJGBYZZKBXSCQDJQDSUJZYYHZHHMGSXCSYMXFEBCQWWRBPYYJQTYZCYQYQQZYHMWFFHGZFRJFCDPXNTQYZPDYKHJLFRZXPPXZDBBGZQSTLGDGYLCQMLCHHMFYWLZYXKJLYPQHSYWMQQGQZMLZJNSQXJQSYJYCBEHSXFSZPXZWFLLBCYYJDYTDTHWZSFJMQQYJLMQXXLLDTTKHHYBFPWTYYSQQWNQWLGWDEBZWCMYGCULKJXTMXMYJSXHYBRWFYMWFRXYQMXYSZTZZTFYKMLDHQDXWYYNLCRYJBLPSXCXYWLSPRRJWXHQYPHTYDNXHHMMYWYTZCSQMTSSCCDALWZTCPQPYJLLQZYJSWXMZZMMYLMXCLMXCZMXMZSQTZPPQQBLPGXQZHFLJJHYTJSRXWZXSCCDLXTYJDCQJXSLQYCLZXLZZXMXQRJMHRHZJBHMFLJLMLCLQNLDXZLLLPYPSYJYSXCQQDCMQJZZXHNPNXZMEKMXHYKYQLXSXTXJYYHWDCWDZHQYYBGYBCYSCFGPSJNZDYZZJZXRZRQJJYMCANYRJTLDPPYZBSTJKXXZYPFDWFGZZRPYMTNGXZQBYXNBUFNQKRJQZMJEGRZGYCLKXZDSKKNSXKCLJSPJYYZLQQJYBZSSQLLLKJXTBKTYLCCDDBLSPPFYLGYDTZJYQGGKQTTFZXBDKTYYHYBBFYTYYBCLPDYTGDHRYRNJSPTCSNYJQHKLLLZSLYDXXWBCJQSPXBPJZJCJDZFFXXBRMLAZHCSNDLBJDSZBLPRZTSWSBXBCLLXXLZDJZSJPYLYXXYFTFFFBHJJXGBYXJPMMMPSSJZJMTLYZJXSWXTYLEDQPJMYGQZJGDJLQJWJQLLSJGJGYGMSCLJJXDTYGJQJQJCJZCJGDZZSXQGSJGGCXHQXSNQLZZBXHSGZXCXYLJXYXYYDFQQJHJFXDHCTXJYRXYSQTJXYEFYYSSYYJXNCYZXFXMSYSZXYYSCHSHXZZZGZZZGFJDLTYLNPZGYJYZYYQZPBXQBDZTZCZYXXYHHSQXSHDHGQHJHGYWSZTMZMLHYXGEBTYLZKQWYTJZRCLEKYSTDBCYKQQSAYXCJXWWGSBHJYZYDHCSJKQCXSWXFLTYNYZPZCCZJQTZWJQDZZZQZLJJXLSBHPYXXPSXSHHEZTXFPTLQYZZXHYTXNCFZYYHXGNXMYWXTZSJPTHHGYMXMXQZXTSBCZYJYXXTYYZYPCQLMMSZMJZZLLZXGXZAAJZYXJMZXWDXZSXZDZXLEYJJZQBHZWZZZQTZPSXZTDSXJJJZNYAZPHXYYSRNQDTHZHYYKYJHDZXZLSWCLYBZYECWCYCRYLCXNHZYDZYDYJDFRJJHTRSQTXYXJRJHOJYNXELXSFSFJZGHPZSXZSZDZCQZBYYKLSGSJHCZSHDGQGXYZGXCHXZJWYQWGYHKSSEQZZNDZFKWYSSTCLZSTSYMCDHJXXYWEYXCZAYDMPXMDSXYBSQMJMZJMTZQLPJYQZCGQHXJHHLXXHLHDLDJQCLDWBSXFZZYYSCHTYTYYBHECXHYKGJPXHHYZJFXHWHBDZFYZBCAPNPGNYDMSXHMMMMAMYNBYJTMPXYYMCTHJBZYFCGTYHWPHFTWZZEZSBZEGPFMTSKFTYCMHFLLHGPZJXZJGZJYXZSBBQSCZZLZCCSTPGXMJSFTCCZJZDJXCYBZLFCJSYZFGSZLYBCWZZBYZDZYPSWYJZXZBDSYUXLZZBZFYGCZXBZHZFTPBGZGEJBSTGKDMFHYZZJHZLLZZGJQZLSFDJSSCBZGPDLFZFZSZYZYZSYGCXSNXXCHCZXTZZLJFZGQSQYXZJQDCCZTQCDXZJYQJQCHXZTDLGSCXZSYQJQTZWLQDQZTQCHQQJZYEZZZPBWKDJFCJPZTYPQYQTTYNLMBDKTJZPQZQZZFPZSBNJLGYJDXJDZZKZGQKXDLPZJTCJDQBXDJQJSTCKNXBXZMSLYJCQMTJQWWCJQNJNLLLHJCWQTBZQYDZCZPZZDZYDDCYZZZCCJTTJFZDPRRTZTJDCQTQZDTJNPLZBCLLCTZSXKJZQZPZLBZRBTJDCXFCZDBCCJJLTQQPLDCGZDBBZJCQDCJWYNLLZYZCCDWLLXWZLXRXNTQQCZXKQLSGDFQTDDGLRLAJJTKUYMKQLLTZYTDYYCZGJWYXDXFRSKSTQTENQMRKQZHHQKDLDAZFKYPBGGPZREBZZYKZZSPEGJXGYKQZZZSLYSYYYZWFQZYLZZLZHWCHKYPQGNPGBLPLRRJYXCCSYYHSFZFYBZYYTGZXYLXCZWXXZJZBLFFLGSKHYJZEYJHLPLLLLCZGXDRZELRHGKLZZYHZLYQSZZJZQLJZFLNBHGWLCZCFJYSPYXZLZLXGCCPZBLLCYBBBBUBBCBPCRNNZCZYRBFSRLDCGQYYQXYGMQZWTZYTYJXYFWTEHZZJYWLCCNTZYJJZDEDPZDZTSYQJHDYMBJNYJZLXTSSTPHNDJXXBYXQTZQDDTJTDYYTGWSCSZQFLSHLGLBCZPHDLYZJYCKWTYTYLBNYTSDSYCCTYSZYYEBHEXHQDTWNYGYCLXTSZYSTQMYGZAZCCSZZDSLZCLZRQXYYELJSBYMXSXZTEMBBLLYYLLYTDQYSHYMRQWKFKBFXNXSBYCHXBWJYHTQBPBSBWDZYLKGZSKYHXQZJXHXJXGNLJKZLYYCDXLFYFGHLJGJYBXQLYBXQPQGZTZPLNCYPXDJYQYDYMRBESJYYHKXXSTMXRCZZYWXYQYBMCLLYZHQYZWQXDBXBZWZMSLPDMYSKFMZKLZCYQYCZLQXFZZYDQZPZYGYJYZMZXDZFYFYTTQTZHGSPCZMLCCYTZXJCYTJMKSLPZHYSNZLLYTPZCTZZCKTXDHXXTQCYFKSMQCCYYAZHTJPCYLZLYJBJXTPNYLJYYNRXSYLMMNXJSMYBCSYSYLZYLXJJQYLDZLPQBFZZBLFNDXQKCZFYWHGQMRDSXYCYTXNQQJZYYPFZXDYZFPRXEJDGYQBXRCNFYYQPGHYJDYZXGRHTKYLNWDZNTSMPKLBTHBPYSZBZTJZSZZJTYYXZPHSSZZBZCZPTQFZMYFLYPYBBJQXZMXXDJMTSYSKKBJZXHJCKLPSMKYJZCXTMLJYXRZZQSLXXQPYZXMKYXXXJCLJPRMYYGADYSKQLSNDHYZKQXZYZTCGHZTLMLWZYBWSYCTBHJHJFCWZTXWYTKZLXQSHLYJZJXTMPLPYCGLTBZZTLZJCYJGDTCLKLPLLQPJMZPAPXYZLKKTKDZCZZBNZDYDYQZJYJGMCTXLTGXSZLMLHBGLKFWNWZHDXUHLFMKYSLGXDTWWFRJEJZTZHYDXYKSHWFZCQSHKTMQQHTZHYMJDJSKHXZJZBZZXYMPAGQMSTPXLSKLZYNWRTSQLSZBPSPSGZWYHTLKSSSWHZZLYYTNXJGMJSZSUFWNLSOZTXGXLSAMMLBWLDSZYLAKQCQCTMYCFJBSLXCLZZCLXXKSBZQCLHJPSQPLSXXCKSLNHPSFQQYTXYJZLQLDXZQJZDYYDJNZPTUZDSKJFSLJHYLZSQZLBTXYDGTQFDBYAZXDZHZJNHHQBYKNXJJQCZMLLJZKSPLDYCLBBLXKLELXJLBQYCXJXGCNLCQPLZLZYJTZLJGYZDZPLTQCSXFDMNYCXGBTJDCZNBGBQYQJWGKFHTNPYQZQGBKPBBYZMTJDYTBLSQMPSXTBNPDXKLEMYYCJYNZCTLDYKZZXDDXHQSHDGMZSJYCCTAYRZLPYLTLKXSLZCGGEXCLFXLKJRTLQJAQZNCMBYDKKCXGLCZJZXJHPTDJJMZQYKQSECQZDSHHADMLZFMMZBGNTJNNLGBYJBRBTMLBYJDZXLCJLPLDLPCQDHLXZLYCBLCXZZJADJLNZMMSSSMYBHBSQKBHRSXXJMXSDZNZPXLGBRHWGGFCXGMSKLLTSJYYCQLTSKYWYYHYWXBXQYWPYWYKQLSQPTNTKHQCWDQKTWPXXHCPTHTWUMSSYHBWCRWXHJMKMZNGWTMLKFGHKJYLSYYCXWHYECLQHKQHTTQKHFZLDXQWYZYYDESBPKYRZPJFYYZJCEQDZZDLATZBBFJLLCXDLMJSSXEGYGSJQXCWBXSSZPDYZCXDNYXPPZYDLYJCZPLTXLSXYZYRXCYYYDYLWWNZSAHJSYQYHGYWWAXTJZDAXYSRLTDPSSYYFNEJDXYZHLXLLLZQZSJNYQYQQXYJGHZGZCYJCHZLYCDSHWSHJZYJXCLLNXZJJYYXNFXMWFPYLCYLLABWDDHWDXJMCXZTZPMLQZHSFHZYNZTLLDYWLSLXHYMMYLMBWWKYXYADTXYLLDJPYBPWUXJMWMLLSAFDLLYFLBHHHBQQLTZJCQJLDJTFFKMMMBYTHYGDCQRDDWRQJXNBYSNWZDBYYTBJHPYBYTTJXAAHGQDQTMYSTQXKBTZPKJLZRBEQQSSMJJBDJOTGTBXPGBKTLHQXJJJCTHXQDWJLWRFWQGWSHCKRYSWGFTGYGBXSDWDWRFHWYTJJXXXJYZYSLPYYYPAYXHYDQKXSHXYXGSKQHYWFDDDPPLCJLQQEEWXKSYYKDYPLTJTHKJLTCYYHHJTTPLTZZCDLTHQKZXQYSTEEYWYYZYXXYYSTTJKLLPZMCYHQGXYHSRMBXPLLNQYDQHXSXXWGDQBSHYLLPJJJTHYJKYPPTHYYKTYEZYENMDSHLCRPQFDGFXZPSFTLJXXJBSWYYSKSFLXLPPLBBBLBSFXFYZBSJSSYLPBBFFFFSSCJDSTZSXZRYYSYFFSYZYZBJTBCTSBSDHRTJJBYTCXYJEYLXCBNEBJDSYXYKGSJZBXBYTFZWGENYHHTHZHHXFWGCSTBGXKLSXYWMTMBYXJSTZSCDYQRCYTWXZFHMYMCXLZNSDJTTTXRYCFYJSBSDYERXJLJXBBDEYNJGHXGCKGSCYMBLXJMSZNSKGXFBNBPTHFJAAFXYXFPXMYPQDTZCXZZPXRSYWZDLYBBKTYQPQJPZYPZJZNJPZJLZZFYSBTTSLMPTZRTDXQSJEHBZYLZDHLJSQMLHTXTJECXSLZZSPKTLZKQQYFSYGYWPCPQFHQHYTQXZKRSGTTSQCZLPTXCDYYZXSQZSLXLZMYCPCQBZYXHBSXLZDLTCDXTYLZJYYZPZYZLTXJSJXHLPMYTXCQRBLZSSFJZZTNJYTXMYJHLHPPLCYXQJQQKZZSCPZKSWALQSBLCCZJSXGWWWYGYKTJBBZTDKHXHKGTGPBKQYSLPXPJCKBMLLXDZSTBKLGGQKQLSBKKTFXRMDKBFTPZFRTBBRFERQGXYJPZSSTLBZTPSZQZSJDHLJQLZBPMSMMSXLQQNHKNBLRDDNXXDHDDJCYYGYLXGZLXSYGMQQGKHBPMXYXLYTQWLWGCPBMQXCYZYDRJBHTDJYHQSHTMJSBYPLWHLZFFNYPMHXXHPLTBQPFBJWQDBYGPNZTPFZJGSDDTQSHZEAWZZYLLTYYBWJKXXGHLFKXDJTMSZSQYNZGGSWQSPHTLSSKMCLZXYSZQZXNCJDQGZDLFNYKLJCJLLZLMZZNHYDSSHTHZZLZZBBHQZWWYCRZHLYQQJBEYFXXXWHSRXWQHWPSLMSSKZTTYGYQQWRSLALHMJTQJSMXQBJJZJXZYZKXBYQXBJXSHZTSFJLXMXZXFGHKZSZGGYLCLSARJYHSLLLMZXELGLXYDJYTLFBHBPNLYZFBBHPTGJKWETZHKJJXZXXGLLJLSTGSHJJYQLQZFKCGNNDJSSZFDBCTWWSEQFHQJBSAQTGYPQLBXBMMYWXGSLZHGLZGQYFLZBYFZJFRYSFMBYZHQGFWZSYFYJJPHZBYYZFFWODGRLMFTWLBZGYCQXCDJYGZYYYYTYTYDWEGAZYHXJLZYYHLRMGRXXZCLHNELJJTJTPWJYBJJBXJJTJTEEKHWSLJPLPSFYZPQQBDLQJJTYYQLYZKDKSQJYYQZLDQTGJQYZJSUCMRYQTHTEJMFCTYHYPKMHYZWJDQFHYYXWSHCTXRLJHQXHCCYYYJLTKTTYTMXGTCJTZAYYOCZLYLBSZYWJYTSJYHBYSHFJLYGJXXTMZYYLTXXYPZLXYJZYZYYPNHMYMDYYLBLHLSYYQQLLNJJYMSOYQBZGDLYXYLCQYXTSZEGXHZGLHWBLJHEYXTWQMAKBPQCGYSHHEGQCMWYYWLJYJHYYZLLJJYLHZYHMGSLJLJXCJJYCLYCJPCPZJZJMMYLCQLNQLJQJSXYJMLSZLJQLYCMMHCFMMFPQQMFYLQMCFFQMMMMHMZNFHHJGTTHHKHSLNCHHYQDXTMMQDCYZYXYQMYQYLTDCYYYZAZZCYMZYDLZFFFMMYCQZWZZMABTBYZTDMNZZGGDFTYPCGQYTTSSFFWFDTZQSSYSTWXJHXYTSXXYLBYQHWWKXHZXWZNNZZJZJJQJCCCHYYXBZXZCYZTLLCQXYNJYCYYCYNZZQYYYEWYCZDCJYCCHYJLBTZYYCQWMPWPYMLGKDLDLGKQQBGYCHJXY'
  let oMultiDiff = { '19969': 'DZ', '19975': 'WM', '19988': 'QJ', '20048': 'YL', '20056': 'SC', '20060': 'NM', '20094': 'QG', '20127': 'QJ', '20167': 'QC', '20193': 'YG', '20250': 'KH', '20256': 'ZC', '20282': 'SC', '20285': 'QJG', '20291': 'TD', '20314': 'YD', '20340': 'NE', '20375': 'TD', '20389': 'YJ', '20391': 'CZ', '20415': 'PB', '20446': 'YS', '20447': 'SQ', '20504': 'TC', '20608': 'KG', '20854': 'QJ', '20857': 'ZC', '20911': 'PF', '20985': 'AW', '21032': 'PB', '21048': 'XQ', '21049': 'SC', '21089': 'YS', '21119': 'JC', '21242': 'SB', '21273': 'SC', '21305': 'YP', '21306': 'QO', '21330': 'ZC', '21333': 'SDC', '21345': 'QK', '21378': 'CA', '21397': 'SC', '21414': 'XS', '21442': 'SC', '21477': 'JG', '21480': 'TD', '21484': 'ZS', '21494': 'YX', '21505': 'YX', '21512': 'HG', '21523': 'XH', '21537': 'PB', '21542': 'PF', '21549': 'KH', '21571': 'E', '21574': 'DA', '21588': 'TD', '21589': 'O', '21618': 'ZC', '21621': 'KHA', '21632': 'ZJ', '21654': 'KG', '21679': 'LKG', '21683': 'KH', '21710': 'A', '21719': 'YH', '21734': 'WOE', '21769': 'A', '21780': 'WN', '21804': 'XH', '21834': 'A', '21899': 'ZD', '21903': 'RN', '21908': 'WO', '21939': 'ZC', '21956': 'SA', '21964': 'YA', '21970': 'TD', '22003': 'A', '22031': 'JG', '22040': 'XS', '22060': 'ZC', '22066': 'ZC', '22079': 'MH', '22129': 'XJ', '22179': 'XA', '22237': 'NJ', '22244': 'TD', '22280': 'JQ', '22300': 'YH', '22313': 'XW', '22331': 'YQ', '22343': 'YJ', '22351': 'PH', '22395': 'DC', '22412': 'TD', '22484': 'PB', '22500': 'PB', '22534': 'ZD', '22549': 'DH', '22561': 'PB', '22612': 'TD', '22771': 'KQ', '22831': 'HB', '22841': 'JG', '22855': 'QJ', '22865': 'XQ', '23013': 'ML', '23081': 'WM', '23487': 'SX', '23558': 'QJ', '23561': 'YW', '23586': 'YW', '23614': 'YW', '23615': 'SN', '23631': 'PB', '23646': 'ZS', '23663': 'ZT', '23673': 'YG', '23762': 'TD', '23769': 'ZS', '23780': 'QJ', '23884': 'QK', '24055': 'XH', '24113': 'DC', '24162': 'ZC', '24191': 'GA', '24273': 'QJ', '24324': 'NL', '24377': 'TD', '24378': 'QJ', '24439': 'PF', '24554': 'ZS', '24683': 'TD', '24694': 'WE', '24733': 'LK', '24925': 'TN', '25094': 'ZG', '25100': 'XQ', '25103': 'XH', '25153': 'PB', '25170': 'PB', '25179': 'KG', '25203': 'PB', '25240': 'ZS', '25282': 'FB', '25303': 'NA', '25324': 'KG', '25341': 'ZY', '25373': 'WZ', '25375': 'XJ', '25384': 'A', '25457': 'A', '25528': 'SD', '25530': 'SC', '25552': 'TD', '25774': 'ZC', '25874': 'ZC', '26044': 'YW', '26080': 'WM', '26292': 'PB', '26333': 'PB', '26355': 'ZY', '26366': 'CZ', '26397': 'ZC', '26399': 'QJ', '26415': 'ZS', '26451': 'SB', '26526': 'ZC', '26552': 'JG', '26561': 'TD', '26588': 'JG', '26597': 'CZ', '26629': 'ZS', '26638': 'YL', '26646': 'XQ', '26653': 'KG', '26657': 'XJ', '26727': 'HG', '26894': 'ZC', '26937': 'ZS', '26946': 'ZC', '26999': 'KJ', '27099': 'KJ', '27449': 'YQ', '27481': 'XS', '27542': 'ZS', '27663': 'ZS', '27748': 'TS', '27784': 'SC', '27788': 'ZD', '27795': 'TD', '27812': 'O', '27850': 'PB', '27852': 'MB', '27895': 'SL', '27898': 'PL', '27973': 'QJ', '27981': 'KH', '27986': 'HX', '27994': 'XJ', '28044': 'YC', '28065': 'WG', '28177': 'SM', '28267': 'QJ', '28291': 'KH', '28337': 'ZQ', '28463': 'TL', '28548': 'DC', '28601': 'TD', '28689': 'PB', '28805': 'JG', '28820': 'QG', '28846': 'PB', '28952': 'TD', '28975': 'ZC', '29100': 'A', '29325': 'QJ', '29575': 'SL', '29602': 'FB', '30010': 'TD', '30044': 'CX', '30058': 'PF', '30091': 'YSP', '30111': 'YN', '30229': 'XJ', '30427': 'SC', '30465': 'SX', '30631': 'YQ', '30655': 'QJ', '30684': 'QJG', '30707': 'SD', '30729': 'XH', '30796': 'LG', '30917': 'PB', '31074': 'NM', '31085': 'JZ', '31109': 'SC', '31181': 'ZC', '31192': 'MLB', '31293': 'JQ', '31400': 'YX', '31584': 'YJ', '31896': 'ZN', '31909': 'ZY', '31995': 'XJ', '32321': 'PF', '32327': 'ZY', '32418': 'HG', '32420': 'XQ', '32421': 'HG', '32438': 'LG', '32473': 'GJ', '32488': 'TD', '32521': 'QJ', '32527': 'PB', '32562': 'ZSQ', '32564': 'JZ', '32735': 'ZD', '32793': 'PB', '33071': 'PF', '33098': 'XL', '33100': 'YA', '33152': 'PB', '33261': 'CX', '33324': 'BP', '33333': 'TD', '33406': 'YA', '33426': 'WM', '33432': 'PB', '33445': 'JG', '33486': 'ZN', '33493': 'TS', '33507': 'QJ', '33540': 'QJ', '33544': 'ZC', '33564': 'XQ', '33617': 'YT', '33632': 'QJ', '33636': 'XH', '33637': 'YX', '33694': 'WG', '33705': 'PF', '33728': 'YW', '33882': 'SR', '34067': 'WM', '34074': 'YW', '34121': 'QJ', '34255': 'ZC', '34259': 'XL', '34425': 'JH', '34430': 'XH', '34485': 'KH', '34503': 'YS', '34532': 'HG', '34552': 'XS', '34558': 'YE', '34593': 'ZL', '34660': 'YQ', '34892': 'XH', '34928': 'SC', '34999': 'QJ', '35048': 'PB', '35059': 'SC', '35098': 'ZC', '35203': 'TQ', '35265': 'JX', '35299': 'JX', '35782': 'SZ', '35828': 'YS', '35830': 'E', '35843': 'TD', '35895': 'YG', '35977': 'MH', '36158': 'JG', '36228': 'QJ', '36426': 'XQ', '36466': 'DC', '36710': 'JC', '36711': 'ZYG', '36767': 'PB', '36866': 'SK', '36951': 'YW', '37034': 'YX', '37063': 'XH', '37218': 'ZC', '37325': 'ZC', '38063': 'PB', '38079': 'TD', '38085': 'QY', '38107': 'DC', '38116': 'TD', '38123': 'YD', '38224': 'HG', '38241': 'XTC', '38271': 'ZC', '38415': 'YE', '38426': 'KH', '38461': 'YD', '38463': 'AE', '38466': 'PB', '38477': 'XJ', '38518': 'YT', '38551': 'WK', '38585': 'ZC', '38704': 'XS', '38739': 'LJ', '38761': 'GJ', '38808': 'SQ', '39048': 'JG', '39049': 'XJ', '39052': 'HG', '39076': 'CZ', '39271': 'XT', '39534': 'TD', '39552': 'TD', '39584': 'PB', '39647': 'SB', '39730': 'LG', '39748': 'TPB', '40109': 'ZQ', '40479': 'ND', '40516': 'HG', '40536': 'HG', '40583': 'QJ', '40765': 'YQ', '40784': 'QJ', '40840': 'YK', '40863': 'QJG' }
  let arrResult = []
  for (let i = 0, len = str.length; i < len; i++) {
    let ch = str.charAt(i)
    arrResult.push(checkCh(ch))
  }
  return mkRslt(arrResult)

  function checkCh (ch) {
    let uni = ch.charCodeAt(0)
    if (uni > 40869 || uni < 19968) return ch
    return (oMultiDiff[uni] ? oMultiDiff[uni] : (strChineseFirstPY.charAt(uni - 19968)))
  }

  function mkRslt (arr) {
    let arrRslt = ['']
    for (let i = 0, len = arr.length; i < len; i++) {
      let str = arr[i]
      let strlen = str.length
      if (strlen === 1) {
        for (let k = 0; k < arrRslt.length; k++) {
          arrRslt[k] += str
        }
      } else {
        let tmpArr = arrRslt.slice(0)
        arrRslt = []
        for (let k = 0; k < strlen; k++) {
          let tmp = tmpArr.slice(0)
          for (let j = 0; j < tmp.length; j++) {
            tmp[j] += str.charAt(k)
          }
          arrRslt = arrRslt.concat(tmp)
        }
      }
    }
    return arrRslt
  }
}

export default {
  Usual,
  Region
}
