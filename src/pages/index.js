import React from 'react'
import { Input, Select, Button, Checkbox, Divider, DatePicker, TreeSelect, List, Drawer, Icon, BackTop, message } from 'antd'
import moment from 'moment'
import _ from 'lodash'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import md5 from 'md5'
import $ from 'jquery'
import { makeOption, findPathByLeafId, eventImage } from '@/utils/common'
import { search } from '@/services/index'
import Export from './export'
import User from './user'

let quickFilterResult = []
let quickFilterSelect = {}
const { Search } = Input
const { RangePicker } = DatePicker
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
      searchText: '',
      beginDate: moment().subtract(6, 'days'),
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
      drawerVisible: false,
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

  handleTranslate = async (title, content, newsId) => {
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
    const origin = content.split(/<em style='color:red'>.*?>/g)
    const highLight = content.match(/(?<=<em style='color:red'>).*?(?=<)/g)
    let result = ''
    origin.forEach((e, index) => {
      result += e
      if (highLight !== null && highLight[index]) {
        result += highLight[index]
      }
    })
    const data = await this.translate(result)
    const transTitle = await this.translate(title)
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

  init = () => {
    this.search()
  }

  changeCountry = (key) => {
    this.setState({ country: key })
  }

  changeDate = (date) => {
    this.setState({ beginDate: date[0], endDate: date[1] })
  }

  search = async () => {
    this.setState({ loading: true })
    const {
      searchText, beginDate, endDate, categories, country,
    } = this.state
    const data = await search({
      word: searchText,
      startDate: beginDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      categories,
      sources: countryMap[country],
    })
    if (data) {
      this.setState({
        newsList: data,
        checkedIdList: [],
        checkAll: false,
      })
    } else {
      message.error('获取新闻列表失败，请检查是否设置过滤关键词！')
    }
    this.setState({ loading: false })
  }

  searchInput = (value) => {
    this.setState({ searchText: value })
    const target = findPathByLeafId(value, myData, 'title')
    if (target) {
      const { treeValue } = this.state
      if (treeValue.indexOf(target.node.key) < 0) {
        this.setState({ showQuickFilter: true })
        quickFilterSelect = target.node
      } else {
        this.setState({ showQuickFilter: false })
      }
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
        item.checked = checked
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

  jumpQuickFilter = () => {
    quickFilterResult = []
    this.quickFilter([quickFilterSelect])
    const { treeValue } = this.state
    this.selectCategory(_.uniq(treeValue.concat(quickFilterResult)))
    quickFilterSelect = {}
    this.setState({ showQuickFilter: false })
  }

  quickFilter = (nodes) => {
    for (const item of nodes) {
      quickFilterResult.push(item.value)
      if (item.children) {
        this.quickFilter(item.children)
      }
    }
  }

  redirect = (url) => {
    return `https://newsminer.net/link.html?url=${url}`
  }

  render() {
    const { uid, username } = window.localStorage
    if (!uid || uid.length < 1) {
      window.location.href = '/login'
    }
    const {
      newsList, searchText, country, showQuickFilter, indeterminate, checkAll, checkedIdList,
      showSearchBar, beginDate, endDate, treeValue, loading, drawerVisible,
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
              <span style={{ color: 'red' }}>{searchText}</span>
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
            value={[beginDate, endDate]}
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
            <label> {/* eslint-disable-line */}
              {' '}
              已选择
              {checkedIdList.length}
              条/共
              {newsList.length}
              条
            </label>
          </div>
          <div style={{ float: 'right', marginRight: 40 }}>
            <Export checkedIdList={checkedIdList} allDataList={newsList} />
          </div>
        </div>
        <div style={{ margin: '0 16px', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff' }}>
            <List
              itemLayout="vertical"
              size="large"
              dataSource={newsList}
              loading={loading}
              pagination={{
                pageSize: 10,
              }}
              renderItem={(item) => {
                if (item.hasOwnProperty('title')) { // eslint-disable-line
                  return (
                    <List.Item
                      extra={eventImage(item['image'])}
                      actions={[
                        <span>
                          {
                            item.transmode !== true
                              ? (
                                <a href="javascript:;" onClick={() => this.handleTranslate(item['title'], item['content'], item['id'])}>
                                  <Icon type="cloud-sync" />
                                  &nbsp;&nbsp;翻译
                                </a>
                              )
                              : (
                                <a href="javascript:;" onClick={() => this.handleTransBack(item['id'])}>
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
                            href={this.redirect(item['url'])}
                            target="_blank"
                            dangerouslySetInnerHTML={{ __html: item.transmode === true ? item['transTitle'] : item['title'] }}
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
                            {item['publishTime']}
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <Icon type="global" style={{ marginRight: 8 }} />
                            {item['publisher']}
                          </div>
                         )}
                      />
                      <p dangerouslySetInnerHTML={{ __html: item.transmode === true ? `${item['translation']}...` : `${item['content']}...` }} />
                    </List.Item>
                  )
                } else {
                  return (
                    <List.Item
                      extra={eventImage(item['news_Pictures'])}
                      actions={[
                        <span>
                          {
                            item.transmode !== true
                              ? (
                                <a href="javascript:;" onClick={() => this.handleTranslate(item['news_Title'], item['news_Content'], item['news_ID'])}>
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
                            dangerouslySetInnerHTML={{ __html: item.transmode === true ? item['transTitle'] : item['news_Title'] }}
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
                      <p dangerouslySetInnerHTML={{ __html: item.transmode === true ? `${item['translation']}...` : `${item['news_Content']}...` }} />
                    </List.Item>
                  )
                }
              }}
            />
          </div>
          <BackTop />
          <Drawer
            title={username}
            placement="right"
            closable={false}
            onClose={() => this.setState({ drawerVisible: false })}
            visible={drawerVisible}
          >
            <h3>
              导出
            </h3>
            <Export checkedIdList={checkedIdList} allDataList={newsList} />
            <Divider />
            <h3>
              用户操作
            </h3>
            <Button style={{ margin: 15 }} type="primary" onClick={this.logout} icon="logout">
              注销
            </Button>
            <Divider />
          </Drawer>
        </div>
      </div>
    )
  }
}

export default Home
