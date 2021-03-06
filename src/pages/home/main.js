import React from 'react'
import { Select, Button, Checkbox, DatePicker, TreeSelect, List, Icon, BackTop, message, Empty, Modal, Tooltip, Divider } from 'antd'
import moment from 'moment'
import _ from 'lodash'
import { connect } from 'dva'
import md5 from 'md5'
import $ from 'jquery'
import { makeOption, findPathByLeafId, eventImage, timeout } from '@/utils/common'
import { search, subQueryNews, getFilterKeyword, getContentByIds, getListAbstract } from '@/services/index'
import Export from '@/components/items/export'
import AddCollection from './addCollection'
import Collection from './collection'

let quickFilterResult = []
let quickFilterSelect = {}
let emptyFilterResult = []
let emptyFilterSelect = {}
let translateList = []
const { RangePicker } = DatePicker
const { Option } = Select
const countryList = [
  { value: 'recommand', name: '推荐' },
  { value: 'all', name: '全部' },
  { value: 'jp', name: '日本' },
  { value: 'us', name: '美国' },
  { value: 'en', name: '英国' },
  { value: 'fr', name: '法国' },
  { value: 'eu', name: '欧洲' },
  { value: 'ru', name: '俄罗斯' },
  { value: 'sf', name: '科学传播组织' },
  // { value: 'cn', name: '中国' },
  { value: 'knowledge', name: '智库' },
]
// const typeList = {
//   前沿技术: ['0-7', '0-8', '0-9', '1-1', '1-4', '1-7'],
//   健康医疗: ['0-3', '1-2'],
//   应急避险: ['0-8', '0-9'],
//   信息科技: ['0-6', '1-5'],
//   能源利用: ['0-1', '1-0'],
//   气候环境: ['0-2', '1-3'],
//   食品安全: ['0-4'],
//   航空航天: ['0-0'],
// }
const dateFormat = 'YYYY-MM-DD'
const appid = '20200511000448145'
const translatekey = 'nCGO32AVxsejOEd7CaVk'
const kgData = require('@/constants/tree_cn.json')
const kgEnData = require('@/constants/tree_en.json')
const key_map = require('@/constants/key_map.json')
const countryMap = require('@/constants/countryMap.json')

@connect()
class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newsList: [],
      originNewsList: [],
      searchText: [],
      startDate: moment().subtract(4, 'days'),
      endDate: moment(),
      country: 'recommand',
      indeterminate: false,
      checkedIdList: [],
      checkAll: false,
      showQuickFilter: false,
      showSearchBar: false,
      categories: [],
      treeValue: [],
      loading: false,
      sortor: 'time',
      lastSearch: '',
      translateAll: false,
      current: 1,
      pageSize: 10,
      treeType: 'cn',
      myData: [],
      myEnData: [],
      selectGroups: [],
    }
    this.dataList = []
  }

  componentWillMount = async () => {
    if (this.props.type.title !== '首页') {
      const list = this.props.type.children.map((e) => { return e.key })
      const coreKey = this.props.type.key
      const childrenC = []
      const childrenE = []
      childrenC[0] = kgData[0].children.filter((e) => { return list.indexOf(e.key.substr(0, 3)) > -1 })
      childrenC[1] = kgData[1].children.filter((e) => { return list.indexOf(e.key.substr(0, 3)) > -1 })
      childrenC[2] = kgData[2].children.filter((e) => { return list.indexOf(e.key.substr(0, 3)) > -1 })
      childrenE[0] = kgEnData[0].children.filter((e) => { return list.indexOf(e.key.substr(0, 3)) > -1 })
      childrenE[1] = kgEnData[1].children.filter((e) => { return list.indexOf(e.key.substr(0, 3)) > -1 })
      childrenE[2] = kgEnData[2].children.filter((e) => { return list.indexOf(e.key.substr(0, 3)) > -1 })
      const myData = [{
        children: childrenC[coreKey],
        key: coreKey,
        value: coreKey,
        title: key_map[coreKey].cn,
      }]
      const myEnData = [{
        children: childrenE[coreKey],
        key: coreKey,
        value: coreKey,
        title: key_map[coreKey].en,
      }]
      this.dataList = []
      this.generateList(myData)
      const resultList = this.dataList.map((e) => { return e.key })
      await this.selectCategory(resultList)
      await this.setState({ myData, myEnData, selectGroups: list })
    } else {
      await this.setState({ myData: kgData, myEnData: kgEnData })
    }
    this.init()
  }

  generateList = (data) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i]
      this.dataList.push(node)
      if (node.children) {
        this.generateList(node.children)
      }
    }
  }

  getFilterKeyword = async () => {
    const data = await getFilterKeyword({})
    if (data && data.code === '200') {
      const filterKeyword = JSON.parse(data.description)
      let target = filterKeyword.length
      for (let e = 0; e < filterKeyword.length; e++) {
        if (target !== filterKeyword.length) {
          break
        }
        for (const i in key_map) {
          if (key_map[i]['cn'] === filterKeyword[e]) {
            if (filterKeyword[e + 1] === key_map[i]['en']) {
              target = e
            }
          }
        }
      }
      const categories = filterKeyword.slice(target, filterKeyword.length)
      const treeValue = []
      categories.forEach((e, index) => {
        if (index % 2 === 0) {
          for (const i in key_map) {
            if (key_map[i].cn === e) {
              treeValue.push(i)
            }
          }
        }
      })
      this.selectCategory(treeValue)
    }
  }

  translate = (q, type) => {
    const salt = Date.now()
    const sign = md5(appid + q + salt + translatekey)
    return new Promise((resolve) => {
      $.ajax({
        url: 'https://api.fanyi.baidu.com/api/trans/vip/translate',
        type: 'get',
        dataType: 'jsonp',
        data: {
          q,
          appid,
          salt,
          from: 'auto',
          to: type ? 'en' : 'zh',
          sign,
        },
        success(data) {
          let str = ''
          data['trans_result'].forEach((e) => {
            str += e.dst
          })
          resolve({ str })
        },
        error() {
        },
      })
    })
  }

  handleGetAbs = async () => {
    this.setState({ loading: true })
    const { current, pageSize, newsList } = this.state
    const selectPart = newsList.slice((current - 1) * pageSize, current * pageSize)
    const ids = selectPart.map((e) => { return e.news_ID })
    const selectList = await getContentByIds({
      ids: JSON.stringify(ids),
    })
    if (selectList) {
      const text = []
      ids.forEach((e) => {
        text.push(_.find(selectList, { news_ID: e }).news_Content)
      })
      const contentList = await getListAbstract({
        num: 4,
        text,
      })
      if (contentList.data) {
        newsList.forEach((e) => {
          const index = ids.indexOf(e.news_ID)
          if (index > -1) {
            e.news_Content = contentList.data[index]
          }
        })
        this.setState({ newsList })
      }
    }
    this.setState({ loading: false })
  }

  handleTranslate = async (newsId) => {
    const { newsList } = this.state
    let target = _.find(newsList, { news_ID: newsId })
    if (!target) {
      target = _.find(newsList, { id: newsId })
    }
    if (!target) {
      return
    }
    if (target.translation) {
      target.transmode = true
      this.setState({ newsList })
      return
    }
    const data = await this.translate(target.news_Content)
    const transTitle = await this.translate(target.news_Title)
    if (data) {
      target.translation = data.str
      target.transmode = true
      target.transTitle = transTitle.str
      this.setState({ newsList })
    }
  }

  handleTransBack = (newsId) => {
    const { newsList } = this.state
    let target = _.find(newsList, { news_ID: newsId })
    if (!target) {
      target = _.find(newsList, { id: newsId })
    }
    if (!target) {
      return
    }
    target.transmode = false
    this.setState({ newsList })
  }

  translateAllthisPage = async () => {
    const { newsList, current, pageSize, translateAll } = this.state
    const arr = newsList.slice((current - 1) * pageSize, current * pageSize)
    if (translateAll === true) {
      for (const i of arr) {
        this.handleTransBack(i.news_ID)
      }
    } else {
      for (const i of arr) {
        if (!i.translation) {
          await timeout(300) // eslint-disable-line
        }
        this.handleTranslate(i.news_ID)
      }
    }
    this.setState({ translateAll: !translateAll })
  }

  init = async () => {
    // await this.getFilterKeyword({})
    this.search()
  }

  changeCountry = (key) => {
    this.setState({ country: key })
  }

  changeDate = (date) => {
    this.setState({ startDate: date[0], endDate: date[1] })
  }

  sortData = async (type) => {
    this.setState({ sortor: type })
    const { originNewsList } = this.state
    switch (type) {
      case 'time':
        await this.setState({ newsList: _.orderBy(originNewsList, 'news_Time', 'desc') })
        break
      case 'score':
        await this.setState({ newsList: _.orderBy(originNewsList, 'score', 'desc') })
        break
      case 'newscore':
        await this.setState({ newsList: _.orderBy(originNewsList, 'new_Score', 'desc') })
        break
      default:
        break
    }
    this.handleGetAbs()
  }

  search = async () => {
    window.GLOBAL.requestCancel('search', '取消')
    const {
      startDate, endDate, categories, country, treeValue, searchText, myData,
    } = this.state
    const pattern = new RegExp('[\u4E00-\u9FA5]+')
    translateList = []
    const arr = []
    for (const i of searchText) {
      if (translateList.indexOf(i) < 0) {
        if (pattern.test(i)) {
          const str = await this.translate(i, 'en')
          if (str) {
            arr.push(i, str.str)
            translateList.push(str.str, i)
          }
        } else {
          const str = await this.translate(i)
          if (str) {
            arr.push(i, str.str)
            translateList.push(str.str, i)
          }
        }
      }
    }
    this.setState({ loading: true, searchText: arr, lastSearch: arr })
    let countryArr = countryMap[country]
    if (country === 'recommand') {
      countryArr = []
      for (const i in countryMap) {
        if (i !== 'all' && i !== 'jp' && i !== 'ru') {
          countryArr = countryArr.concat(countryMap[i])
        }
      }
    }
    const filterData = await search({
      word: JSON.stringify(searchText),
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      categories: JSON.stringify(categories),
      sources: JSON.stringify(countryArr),
    }, 'search')
    if (filterData) {
      const data = filterData.filter((e) => { return e.news_Content.length > 150 })
      if (data.length > 0 && typeof data[0] === 'object') {
        data.forEach((e) => {
          if (e.score) {
            e.score = 0
            const title = e['news_Title']
            const content = e['news_Content']
            searchText.forEach((item) => {
              const reg = new RegExp(item, 'gi')
              const scoreTitle = title.match(reg) === null ? 0 : title.match(reg).length * 10
              const scoreContent = content.match(reg) === null ? 0 : content.match(reg).length
              e.score += scoreContent + scoreTitle
            })
          }
        })
      }
      await this.setState({
        newsList: data[0] !== 'object' ? [] : _.uniqBy(data, 'news_Title'),
        originNewsList: data[0] === 'string' ? [] : _.uniqBy(data, 'news_Title'),
        checkedIdList: [],
        checkAll: false,
      })
      this.sortData(this.state.sortor)
      let ttreeValueTarget = treeValue[0]
      treeValue.forEach((e) => {
        if (e.length < ttreeValueTarget.length) {
          ttreeValueTarget = e
        }
      })
      if (data.length === 0 && ttreeValueTarget) {
        if (ttreeValueTarget.length >= 3) {
          const target = findPathByLeafId(ttreeValueTarget.substr(0, ttreeValueTarget.length - 2), myData, 'key')
          if (target) {
            emptyFilterSelect = target.node
          }
        }
      }
    } else {
      message.error('获取新闻列表失败或超时，请检查网络！')
    }
    this.setState({ loading: false })
  }

  subSearch = async (ids) => {
    const {
      searchText, startDate, endDate, categories, country, treeValue, myData,
    } = this.state
    const pattern = new RegExp('[\u4E00-\u9FA5]+')
    translateList = []
    const arr = []
    for (const i of searchText) {
      if (translateList.indexOf(i) < 0) {
        if (pattern.test(i)) {
          const str = await this.translate(i, 'en')
          if (str) {
            arr.push(i, str.str)
            translateList.push(str.str, i)
          }
        } else {
          const str = await this.translate(i)
          if (str) {
            arr.push(i, str.str)
            translateList.push(str.str, i)
          }
        }
      }
    }
    this.setState({ loading: true, searchText: arr, lastSearch: arr })
    const data = await subQueryNews({
      word: JSON.stringify(searchText),
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      categories: JSON.stringify(categories),
      sources: JSON.stringify(countryMap[country]),
      ids: JSON.stringify(ids),
    })
    if (data) {
      if (data.length > 0 && typeof data[0] !== 'string') {
        data.forEach((e) => {
          e.score = 0
          const title = e['news_Title']
          const content = e['news_Content']
          searchText.forEach((item) => {
            const reg = new RegExp(item, 'gi')
            const scoreTitle = title.match(reg) === null ? 0 : title.match(reg).length * 10
            const scoreContent = content.match(reg) === null ? 0 : content.match(reg).length
            e.score += scoreContent + scoreTitle
          })
        })
      }
      await this.setState({
        newsList: data[0] === 'string' ? [] : _.uniqBy(data, 'news_Title'),
        originNewsList: data[0] === 'string' ? [] : _.uniqBy(data, 'news_Title'),
        checkedIdList: [],
        checkAll: false,
      })
      this.sortData(this.state.sortor)
      let ttreeValueTarget = treeValue[0]
      treeValue.forEach((e) => {
        if (e.length < ttreeValueTarget.length) {
          ttreeValueTarget = e
        }
      })
      if (data.length === 0 && ttreeValueTarget) {
        if (ttreeValueTarget.length >= 3) {
          const target = findPathByLeafId(ttreeValueTarget.substr(0, ttreeValueTarget.length - 2), myData, 'key')
          if (target) {
            emptyFilterSelect = target.node
          }
        }
      }
    } else {
      message.error('获取新闻列表失败或超时，请检查网络！')
    }
    this.setState({ loading: false })
  }

  handleHighLight = (str) => {
    if (!str || str.length === 0) {
      return ''
    }
    const { lastSearch } = this.state
    if (lastSearch === []) {
      return str
    }
    let result = str
    const arr = lastSearch
    arr.forEach((e) => {
      if (e !== ' ' && e !== ' ') {
        const reg = new RegExp(e, 'gi')
        result = result.replace(reg, (text) => { return text ? `<em style="color:red">${text}</em>` : '' })
      }
    })
    return result
  }

  subSearchOnClick = (newsList) => {
    const idList = []
    newsList.forEach(item => idList.push(item.news_ID))
    this.subSearch(idList)
  }

  handleConfirm = () => {
    const { newsList } = this.state
    if (newsList.length > 1000) {
      const that = this
      Modal.confirm({
        content: '当前结果数超过处理上限，是否截取当前结果前1000条进行搜索？',
        okText: '确定',
        onOk() {
          that.subSearchOnClick(newsList.slice(0, 999))
        },
        cancelText: '取消',
      })
    } else {
      this.subSearchOnClick(newsList)
    }
  }

  searchInput = async (value) => {
    const { treeValue, treeType, myData, myEnData } = this.state
    let temp
    value.forEach((e) => {
      const target = findPathByLeafId(e, treeType === 'cn' ? myData : myEnData, 'title')
      if (target && !temp) {
        if (treeValue.indexOf(target.node.key) < 0) {
          temp = target
        }
      }
    })
    if (temp) {
      quickFilterSelect = temp.node
      this.setState({ showQuickFilter: true, searchText: value })
    } else {
      this.setState({ showQuickFilter: false, searchText: value })
    }
  }

  searchOnClick = () => {
    this.search()
  }

  addChecked = (e) => {
    const { checkedIdList, newsList } = this.state
    const { value, checked } = e.target
    if (checked) {
      checkedIdList.push(value)
    } else {
      const index = checkedIdList.indexOf(value)
      if (index > -1) {
        checkedIdList.splice(index, 1)
      }
    }

    newsList.forEach((item) => {
      if (item.news_ID === value) {
        item.checked = checked // eslint-disable-line
      }
    })
    this.setState({
      checkedIdList,
      checkAll: checkedIdList.length === newsList.length,
      indeterminate: !!checkedIdList.length && checkedIdList.length < newsList.length,
    })
  };

  onCheckAllChange = (e) => {
    const { newsList } = this.state
    const { checked } = e.target
    const allIdList = []
    newsList.forEach((item) => {
      allIdList.push(item.news_ID)
      item.checked = checked // eslint-disable-line
    })
    this.setState({
      checkedIdList: checked ? allIdList : [],
      indeterminate: false,
      checkAll: checked,
    })
  }

  onCheckCurrentPage = async (e) => {
    const { newsList, current, pageSize, checkedIdList } = this.state
    const { checked } = e.target
    const arr = newsList.slice((current - 1) * pageSize, current * pageSize)
    let allIdList = []
    if (checked) {
      allIdList = checkedIdList
      arr.forEach((item) => {
        allIdList.push(item.news_ID)
        item.checked = checked // eslint-disable-line
      })
    } else {
      checkedIdList.forEach((item) => {
        const target = _.find(arr, { news_ID: item })
        if (!target) {
          allIdList.push(item.news_ID)
        } else {
          target.checked = checked // eslint-disable-line
        }
      })
    }
    await this.setState({
      checkedIdList: _.uniq(allIdList),
    })
  }

  checkCurrentPage = (checkedIdList) => {
    const { newsList, current, pageSize } = this.state
    const arr = newsList.slice((current - 1) * pageSize, current * pageSize)
    let result = 'allcheck'
    let missed = 0
    arr.forEach((e) => {
      if (checkedIdList.indexOf(e.news_ID) < 0) {
        result = 'partcheck'
        missed += 1
      }
    })
    if (missed === arr.length) {
      result = 'uncheck'
    }
    return result
  }

  selectCategory = async (keyList) => {
    const categories = []
    let targetList = keyList
    if (keyList.length > 250) {
      message.info('后端服务暂不支持超过250项聚类，请减少聚类数量')
      targetList = keyList.slice(0, 250)
    }
    targetList.forEach((key) => {
      categories.push(key_map[key]['cn'])
      categories.push(key_map[key]['en'])
    })
    await this.setState({ categories, treeValue: keyList })
    this.searchInput(this.state.searchText)
  }

  showSearchBarButton = () => {
    const { showSearchBar } = this.state
    this.setState({ showSearchBar: !showSearchBar })
  }

  jumpQuickFilter = async () => {
    this.setState({ showSearchBar: true })
    quickFilterResult = []
    this.quickFilter([quickFilterSelect])
    const { treeValue } = this.state
    await this.selectCategory(_.uniq(treeValue.concat(quickFilterResult)))
    quickFilterSelect = {}
    this.searchInput(this.state.searchText)
  }

  quickFilter = (nodes) => {
    for (const item of nodes) {
      quickFilterResult.push(item.value)
      if (item.children) {
        this.quickFilter(item.children)
      }
    }
  }

  emptyQuickFilter = async () => {
    emptyFilterResult = []
    this.emptyFilter([emptyFilterSelect])
    const { treeValue } = this.state
    await this.selectCategory(_.uniq(treeValue.concat(emptyFilterResult)))
    emptyFilterSelect = {}
    this.search()
  }

  emptyFilter = (nodes) => {
    for (const item of nodes) {
      emptyFilterResult.push(item.value)
      if (item.children) {
        this.emptyFilter(item.children)
      }
    }
  }

  renderRecommand = () => {
    const result = []
    // for (let i = 0; i < list.length; i++) {
    //   if (result.length > 4) {
    //     const name = []
    //     // await jieba.cut(list[i])
    //     console.log(name)
    //     result.push(<Button type="link" key={name + i}>{name}</Button>)
    //   }
    // }
    return result
  }

  redirect = (url) => {
    return `https://newsminer.net/link.html?url=${url}`
  }

  handleChangeGroup = async (value) => {
    if (this.props.type.title !== '首页') {
      const list = value
      const coreKey = this.props.type.key
      const childrenC = []
      const childrenE = []
      childrenC[0] = kgData[0].children.filter((e) => { return list.indexOf(e.key.substr(0, 3)) > -1 })
      childrenC[1] = kgData[1].children.filter((e) => { return list.indexOf(e.key.substr(0, 3)) > -1 })
      childrenC[2] = kgData[2].children.filter((e) => { return list.indexOf(e.key.substr(0, 3)) > -1 })
      childrenE[0] = kgEnData[0].children.filter((e) => { return list.indexOf(e.key.substr(0, 3)) > -1 })
      childrenE[1] = kgEnData[1].children.filter((e) => { return list.indexOf(e.key.substr(0, 3)) > -1 })
      childrenE[2] = kgEnData[2].children.filter((e) => { return list.indexOf(e.key.substr(0, 3)) > -1 })
      const myData = [{
        children: childrenC[coreKey],
        key: coreKey,
        value: coreKey,
        title: key_map[coreKey].cn,
      }]
      const myEnData = [{
        children: childrenE[coreKey],
        key: coreKey,
        value: coreKey,
        title: key_map[coreKey].en,
      }]
      this.dataList = []
      this.generateList(myData)
      const resultList = this.dataList.map((e) => { return e.key })
      await this.selectCategory(resultList)
      await this.setState({ myData, myEnData, selectGroups: list })
    } else {
      await this.setState({ myData: kgData, myEnData: kgEnData })
    }
    this.init()
  }

  handleMakePaper = (news_ID) => {
    window.open(`/foreign-news/paperMaker?id=${news_ID}`)
    // this.props.dispatch(routerRedux.push({
    //   pathname: '/foreign-news/paperMaker',
    //   query: {
    //     id: news_ID,
    //   },
    // }))
  }

  render() {
    const { uid } = window.localStorage
    if (!uid || uid.length < 1) {
      window.location.href = '/foreign-news/login'
    }
    const {
      newsList, searchText, country, showQuickFilter, indeterminate, checkAll, checkedIdList,
      showSearchBar, startDate, endDate, treeValue, loading, sortor, lastSearch, translateAll,
      current, treeType, myData, myEnData, selectGroups,
    } = this.state
    const plainOptions = []
    if (this.props.type.children) {
      this.props.type.children.forEach((e) => {
        plainOptions.push({
          label: e.title,
          value: e.key,
        })
      })
    }
    return (
      <div>
        {
          this.props.type.children
            ? (
              <div style={{ height: 40, paddingLeft: 50, borderBottom: '1px solid #e1e1e1' }}>
                <div>
                  <div style={{ width: 70, display: 'inline-block' }}>选择子类：</div>
                  <Checkbox.Group
                    options={plainOptions}
                    value={selectGroups}
                    onChange={value => this.handleChangeGroup(value)}
                  />
                </div>
              </div>
            )
            : null
        }
        <div style={{ height: showQuickFilter ? 64 : 48, paddingLeft: 50, paddingTop: this.props.type.children ? 8 : 0, borderBottom: '1px solid #e1e1e1' }}>
          <div>
            <div style={{ width: 70, display: 'inline-block' }}>选择来源：</div>
            <Select
              value={country}
              style={{ width: 85, marginRight: 10 }}
              onChange={this.changeCountry}
            >
              {makeOption(countryList)}
            </Select>
            <Select
              style={{ width: 400, borderRadius: 0 }}
              onChange={value => this.searchInput(value)}
              value={searchText}
              mode="tags"
              enterButton="搜索"
              placeholder="请输入搜索关键词"
            />
            <Button style={{ marginLeft: 10 }} icon="search" type="primary" onClick={this.searchOnClick}>搜索</Button>
            <Tooltip title="从当前搜索结果中继续搜索">
              <Button style={{ marginLeft: 10 }} icon="search" type="primary" onClick={this.handleConfirm}>从当前结果中筛选</Button>
            </Tooltip>
            <Button style={{ marginLeft: 10 }} onClick={this.showSearchBarButton}>展开高级选项</Button>
          </div>
          <div style={{ marginLeft: 160, lineHeight: '0px', display: showQuickFilter ? 'block' : 'none' }}>
            <a href="javascript:;" onClick={() => this.jumpQuickFilter()}>
              关键词&nbsp;&nbsp;
              <span style={{ color: 'red' }}>{quickFilterSelect.title}</span>
              &nbsp;&nbsp;在聚类列表里已存在且未选中，是否选中？
            </a>
          </div>
        </div>
        <div style={{ display: showSearchBar ? 'block' : 'none', minHeight: 90, paddingLeft: 50, paddingTop: 8, backgroundColor: '#fff', borderBottom: '1px solid #e1e1e1' }}>
          <span>
            时间区间：&nbsp;&nbsp;
          </span>
          <RangePicker
            format={dateFormat}
            onChange={this.changeDate}
            value={[startDate, endDate]}
          />
          <br />
          <div style={{ marginTop: 10 }}>
            <span>
              聚类圈选：&nbsp;&nbsp;
            </span>
            <Select
              value={treeType}
              onChange={value => this.setState({ treeType: value })}
              style={{ width: 120, marginRight: 10 }}
            >
              <Option key="cn" value="cn">中文</Option>
              <Option key="en" value="en">English</Option>
            </Select>
            <TreeSelect
              treeData={treeType === 'cn' ? myData : myEnData}
              value={treeValue}
              maxTagCount={6}
              maxTagPlaceholder={(omittedValues) => {
                return `其他${omittedValues.length - 1}个类`
              }}
              treeCheckable
              showSearch
              showCheckedStrategy="SHOW_ALL"
              style={{ width: 650 }}
              onChange={this.selectCategory}
              treeNodeFilterProp="title"
            />
          </div>
        </div>
        <div style={{ height: 48, lineHeight: '48px', borderBottom: '1px solid #e1e1e1', paddingLeft: 40 }}>
          <div style={{ float: 'left' }}>
            <Checkbox
              indeterminate={indeterminate}
              onChange={this.onCheckAllChange}
              checked={checkAll}
            >
              全选
            </Checkbox>
            <Checkbox
              indeterminate={this.checkCurrentPage(checkedIdList) === 'partcheck'}
              onChange={this.onCheckCurrentPage}
              checked={this.checkCurrentPage(checkedIdList) === 'allcheck'}
            >
              选中本页(第
              {current}
              页)
            </Checkbox>
            <label> {/* eslint-disable-line */}
              {' '}
              已选择
              {checkedIdList.length}
              条/共
              {newsList.length}
              条
            </label>
            <Select
              value={sortor}
              style={{ width: 300, marginLeft: 20 }}
              onChange={value => this.sortData(value)}
            >
              <Option key="time" value="time">时间顺序</Option>
              <Option key="score" value="score">摘要搜索词权重顺序</Option>
              <Option key="newscore" value="newscore">全文搜索词权重顺序</Option>
            </Select>
          </div>
          <div style={{ float: 'right', marginRight: 40 }}>
            <a href="javascript:;" style={{ marginRight: 20 }} onClick={() => this.translateAllthisPage()}>
              {translateAll === true ? '取消翻译本页' : '翻译本页'}
            </a>
            <AddCollection
              checkedIdList={checkedIdList}
              allDataList={newsList}
              searchText={lastSearch}
            />
            <Collection />
            <Export checkedIdList={checkedIdList} allDataList={newsList} searchText={lastSearch} />
          </div>
        </div>
        <div style={{ margin: '0 16px', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff' }}>
            {
              newsList.length > 0 || loading === true
                ? (
                  <List
                    itemLayout="vertical"
                    size="large"
                    dataSource={newsList}
                    loading={loading}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                      onShowSizeChange: (page, pageSize) => { this.setState({ current: page, pageSize }, () => this.handleGetAbs()) },
                      onChange: page => this.setState({ current: page }, () => this.handleGetAbs()),
                    }}
                    renderItem={(item) => {
                      return (
                        <List.Item
                          extra={eventImage(item['news_Pictures'], item.news_ID)}
                          actions={[
                            <span>
                              {
                                item.transmode !== true
                                  ? (
                                    <a href="javascript:;" onClick={() => this.handleTranslate(item['news_ID'])}>
                                      <Icon type="cloud-sync" />
                                      &nbsp;&nbsp;翻译
                                    </a>
                                  )
                                  : (
                                    <a href="javascript:;" onClick={() => this.handleTransBack(item['news_ID'])}>
                                      <Icon type="cloud-sync" />
                                      &nbsp;&nbsp;原文
                                    </a>
                                  )
                                }
                              <Divider type="vertical" />
                              <a href="javascript:;" onClick={() => this.handleMakePaper(item['news_ID'])}>生成文章</a>
                            </span>,
                          ]}
                        >
                          <List.Item.Meta
                            title={(
                              <a
                                href={this.redirect(item['news_URL'])}
                                target="_blank"
                                dangerouslySetInnerHTML={{ __html: item.transmode === true ? this.handleHighLight(item['transTitle']) : this.handleHighLight(item['news_Title']) }}
                              />
                        )}
                            avatar={(
                              <Checkbox
                                value={item['news_ID']}
                                checked={item.checked}
                                onChange={this.addChecked}
                              />
                        )}
                            description={(
                              <div>
                                <Icon
                                  className="publishTime" type="clock-circle"
                                  style={{ marginRight: 8 }}
                                />
                                {item.news_Time}
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <Icon type="global" style={{ marginRight: 8 }} />
                                {item['news_Source']}
                              </div>
                        )}
                          />
                          <p dangerouslySetInnerHTML={{ __html: item.transmode === true ? `${this.handleHighLight(item['translation'])}` : `${this.handleHighLight(item['news_Content'])}` }} />
                        </List.Item>
                      )
                    }
                    }
                  />
                )
                : (
                  <Empty
                    image="https://gw.alipayobjects.com/mdn/miniapp_social/afts/img/A*pevERLJC9v0AAAAAAAAAAABjAQAAAQ/original"
                    imageStyle={{
                      height: 60,
                    }}
                    description={(
                      <span>
                        当前暂无结果，
                        {
                          emptyFilterSelect.title ? `是否选择上一级聚类【${emptyFilterSelect.title}】？` : '推荐更换搜索词'
                        }
                      </span>
                    )}
                  >
                    {
                      emptyFilterSelect.title
                        ? <Button style={{ display: emptyFilterSelect.title ? 'inline-block' : 'none' }} type="primary" onClick={() => this.emptyQuickFilter()}>继续搜索</Button>
                        : (
                          <span>
                            {this.renderRecommand(lastSearch)}
                          </span>
                        )
                    }
                  </Empty>
                )
            }
          </div>
          <BackTop />
        </div>
      </div>
    )
  }
}

export default Main
