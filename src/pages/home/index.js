import React from 'react'
import { Input, Select, Button, Checkbox, DatePicker, TreeSelect, List, Icon, BackTop, message, Empty } from 'antd'
import moment from 'moment'
import _ from 'lodash'
import { connect } from 'dva'
import md5 from 'md5'
import $ from 'jquery'
import { makeOption, findPathByLeafId, eventImage, timeout } from '@/utils/common'
import { search, subQueryNews } from '@/services/index'
import Export from './export'
import User from './user'
import AddCollection from './addCollection'
import Collection from './collection'

let quickFilterResult = []
let quickFilterSelect = {}
let emptyFilterResult = []
let emptyFilterSelect = {}
const { Search } = Input
const { RangePicker } = DatePicker
const { Option } = Select
const countryList = [
  { value: 'all', name: '全部' },
  { value: 'jp', name: '日本' },
  { value: 'us', name: '美国' },
  { value: 'en', name: '英国' },
  { value: 'fr', name: '法国' },
  { value: 'eu', name: '欧洲' },
  { value: 'ru', name: '俄罗斯' },
  { value: 'knowledge', name: '智库' },
]
const dateFormat = 'YYYY-MM-DD'
const appid = '20200511000448145'
const translatekey = 'nCGO32AVxsejOEd7CaVk'
const myData = require('@/constants/tree_cn.json')
const key_map = require('@/constants/key_map.json')
const countryMap = require('@/constants/countryMap.json')

@connect()
class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newsList: [],
      originNewsList: [],
      searchText: '',
      startDate: moment().subtract(2, 'days'),
      endDate: moment(),
      country: 'all',
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
    }
  }

  componentWillMount = () => {
    this.init()
  }

  translate = (q) => {
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
          to: 'zh',
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

  init = () => {
    this.search()
  }

  changeCountry = (key) => {
    this.setState({ country: key })
  }

  changeDate = (date) => {
    this.setState({ startDate: date[0], endDate: date[1] })
  }

  sortData = (type) => {
    this.setState({ sortor: type })
    const { originNewsList } = this.state
    switch (type) {
      case 'time':
        this.setState({ newsList: _.orderBy(originNewsList, 'news_Time', 'desc') })
        break
      case 'score':
        this.setState({ newsList: _.orderBy(originNewsList, 'score', 'desc') })
        break
      default:
        break
    }
  }

  search = async () => {
    const {
      searchText, startDate, endDate, categories, country, treeValue,
    } = this.state
    this.setState({ loading: true, lastSearch: searchText })
    const data = await search({
      word: searchText,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      categories: JSON.stringify(categories),
      sources: JSON.stringify(countryMap[country]),
    })
    if (data) {
      data.forEach((e) => {
        e.score = 0
        const title = e['news_Title']
        const content = e['news_Content']
        searchText.split(' ').forEach((item) => {
          if (title.split(item).length > 0) {
            e.score += 10 * (title.split(this.state.item).length - 1)
          }
          if (content.split(this.state.item).length > 0) {
            e.score += 1 * (content.split(this.state.item).length - 1)
          }
        })
      })
      this.setState({
        newsList: data,
        originNewsList: data,
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
      message.error('获取新闻列表失败，请检查是否设置过滤关键词！')
    }
    this.setState({ loading: false })
  }

  subSearch = async (ids) => {
    const {
      searchText, startDate, endDate, categories, country, treeValue,
    } = this.state
    this.setState({ loading: true, lastSearch: searchText })
    const data = await subQueryNews({
      word: searchText,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      categories: JSON.stringify(categories),
      sources: JSON.stringify(countryMap[country]),
      ids: JSON.stringify(ids),
    })
    if (data) {
      data.forEach((e) => {
        e.score = 0
        const title = e['news_Title']
        const content = e['news_Content']
        searchText.split(' ').forEach((item) => {
          if (title.split(item).length > 0) {
            e.score += 10 * (title.split(this.state.item).length - 1)
          }
          if (content.split(this.state.item).length > 0) {
            e.score += 1 * (content.split(this.state.item).length - 1)
          }
        })
      })
      this.setState({
        newsList: data,
        originNewsList: data,
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
      message.error('获取新闻列表失败，请检查是否设置过滤关键词！')
    }
    this.setState({ loading: false })
  }

  handleHighLight = (str) => {
    const { lastSearch } = this.state
    if (lastSearch === '') {
      return str
    }
    let result = str
    const arr = lastSearch.split(' ')
    arr.forEach((e) => {
      if (e !== ' ' && e !== '') {
        const reg = new RegExp(e, 'gi')
        result = str.replace(reg, `<em style="color:red">${e}</em>`)
      }
    })
    return result
  }

  subSearchOnClick = () => {
    const { newsList } = this.state
    const idList = []
    newsList.forEach(item => idList.push(item.news_ID))
    this.subSearch(idList)
  }

  searchInput = (value) => {
    this.setState({ searchText: value })
    const { treeValue } = this.state
    const arr = value.split(' ')
    let temp
    arr.forEach((e) => {
      const target = findPathByLeafId(e, myData, 'title')
      if (target && !temp) {
        if (treeValue.indexOf(target.node.key) < 0) {
          temp = target
        }
      }
    })
    if (temp) {
      quickFilterSelect = temp.node
      this.setState({ showQuickFilter: true })
    } else {
      this.setState({ showQuickFilter: false })
    }
  }

  searchOnClick = () => {
    const { queryDate, searchText } = this.state
    this.search(queryDate, searchText)
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
    keyList.forEach((key) => {
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

  redirect = (url) => {
    return `https://newsminer.net/link.html?url=${url}`
  }

  render() {
    const { uid } = window.localStorage
    if (!uid || uid.length < 1) {
      window.location.href = '/login'
    }
    const {
      newsList, searchText, country, showQuickFilter, indeterminate, checkAll, checkedIdList,
      showSearchBar, startDate, endDate, treeValue, loading, sortor, lastSearch, translateAll,
      current,
    } = this.state
    return (
      <div>
        <div style={{ height: showQuickFilter ? 80 : 64, paddingLeft: 50, lineHeight: '64px', borderBottom: '1px solid #e1e1e1' }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ float: 'left' }}>
              <Search
                addonBefore={(
                  <div>
                    <div style={{ width: 70, display: 'inline-block' }}>选择来源：</div>
                    <Select
                      value={country}
                      style={{ width: 85 }}
                      onChange={this.changeCountry}
                    >
                      {makeOption(countryList)}
                    </Select>
                  </div>
                      )}
                style={{ width: 600, marginTop: 16, borderRadius: 0 }}
                onChange={e => this.searchInput(e.target.value)}
                value={searchText}
                onSearch={this.searchOnClick}
                enterButton="搜索"
                placeholder="请输入搜索关键词"
              />
              <Button style={{ marginLeft: 20 }} onClick={this.showSearchBarButton}>展开高级选项</Button>
            </div>
            <div style={{ float: 'right', marginRight: 40 }}>
              <User init={this.init} />
            </div>
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
          <Button style={{ marginLeft: 20 }} icon="search" type="primary" onClick={this.subSearchOnClick}>从当前结果中搜索</Button>
          <br />
          <div style={{ marginTop: 10 }}>
            <span>
              聚类圈选：&nbsp;&nbsp;
            </span>
            <TreeSelect
              treeData={myData}
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
              <Option key="score" value="score">搜索词权重顺序</Option>
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
            <Export checkedIdList={checkedIdList} allDataList={newsList} />
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
                      onShowSizeChange: (page, pageSize) => { this.setState({ current: page, pageSize }) },
                      onChange: page => this.setState({ current: page }),
                    }}
                    renderItem={(item) => {
                      // if (item.hasOwnProperty('title')) { // eslint-disable-line
                      //         return (
                      //           <List.Item
                      //             extra={eventImage(item['image'])}
                      //             actions={[
                      //               <span>
                      //                 {
                      //             item.transmode !== true
                      //               ? (
                      //                 <a href="javascript:;" onClick={() => this.handleTranslate(item['title'], item['content'], item['id'])}>
                      //                   <Icon type="cloud-sync" />
                      //                   &nbsp;&nbsp;翻译
                      //                 </a>
                      //               )
                      //               : (
                      //                 <a href="javascript:;" onClick={() => this.handleTransBack(item['id'])}>
                      //                   <Icon type="cloud-sync" />
                      //                   &nbsp;&nbsp;原文
                      //                 </a>
                      //               )
                      //           }
                      //               </span>,
                      //             ]}
                      //           >
                      //             <List.Item.Meta
                      //               title={(
                      //                 <a
                      //                   href={this.redirect(item['url'])}
                      //                   target="_blank"
                      //                   dangerouslySetInnerHTML={{ __html: item.transmode === true ? item['transTitle'] : item['title'] }}
                      //                 />
                      //         )}
                      //               avatar={(
                      //                 <Checkbox
                      //                   value={item['news_ID']}
                      //                   checked={item.checked}
                      //                   onChange={this.addChecked}
                      //                 />
                      //         )}
                      //               description={(
                      //                 <div>
                      //                   <Icon
                      //                     className="publishTime" type="clock-circle"
                      //                     style={{ marginRight: 8 }}
                      //                   />
                      //                   {item['publishTime']}
                      //             &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      //                   <Icon type="global" style={{ marginRight: 8 }} />
                      //                   {item['publisher']}
                      //                 </div>
                      //          )}
                      //             />
                      //             <p dangerouslySetInnerHTML={{ __html: item.transmode === true ? `${item['translation']}...` : `${item['content']}...` }} />
                      //           </List.Item>
                      //         )
                      //       } else {
                      return (
                        <List.Item
                          extra={eventImage(item['news_Pictures'])}
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
                            </span>,
                          ]}
                        >
                          <List.Item.Meta
                            title={(
                              <a
                                href={this.redirect(item['news_URL'])}
                                target="_blank"
                                dangerouslySetInnerHTML={{ __html: item.transmode === true ? item['transTitle'] : this.handleHighLight(item['news_Title']) }}
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
                          <p dangerouslySetInnerHTML={{ __html: item.transmode === true ? `${item['translation']}...` : `${this.handleHighLight(item['news_Content'])}...` }} />
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
                    <Button style={{ display: emptyFilterSelect.title ? 'inline-block' : 'none' }} type="primary" onClick={() => this.emptyQuickFilter()}>继续搜索</Button>
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

export default Home