import React from 'react'
import { Input, Divider, List, Icon, Popconfirm, Select, Button, Spin } from 'antd'
import md5 from 'md5'
import moment from 'moment'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import $ from 'jquery'
import _ from 'lodash'
import { getContentByIds, getAbstract } from '@/services/index'
import { eventImage, getUrlParams } from '@/utils/common'
import Export from '@/components/items/export'

const { TextArea } = Input
const { Option } = Select
const appid = '20200511000448145'
const translatekey = 'nCGO32AVxsejOEd7CaVk'

const originData = _.find(JSON.parse(window.localStorage.collection), { id: getUrlParams().id })
const { searchText, name, desc, time } = originData
originData.checkedList.forEach((e) => {
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

@connect()
class Abstract extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newsList: originData.checkedList,
      sortor: '',
      loading: false,
      newValue: '',
    }
  }

  getPopupContainer = (node) => {
    return node.parentNode
  }

  redirect = (url) => {
    return `https://newsminer.net/link.html?url=${url}`
  }

  sortData = (type) => {
    this.setState({ sortor: type })
    const { newsList } = this.state
    switch (type) {
      case 'time':
        this.setState({ newsList: _.orderBy(newsList, 'news_Time', 'desc') })
        break
      case 'score':
        this.setState({ newsList: _.orderBy(newsList, 'score', 'desc') })
        break
      default:
        break
    }
  }

  handleHighLight = (str) => {
    if (searchText === '') {
      return str
    }
    let result = str
    const arr = searchText
    arr.forEach((e) => {
      if (e !== ' ' && e !== '') {
        const reg = new RegExp(e, 'gi')
        result = result.replace(reg, (text) => { return `<em style="color:red">${text}</em>` })
      }
    })
    return result
  }

  makeAbs = async () => {
    this.setState({ loading: true })
    const { newsList } = this.state
    let newValue = ''
    newValue += `摘要  ${name}\n`
    newValue += `关键词  ${searchText}\n`
    newValue += `生成时间 ${moment().format('YYYY-MM-DD HH:mm:ss')}\n\n`
    const contentList = await getContentByIds({
      ids: JSON.stringify(newsList.map((e) => { return e.news_ID })),
    })
    if (contentList) {
      for (const item of contentList) {
        let text = item.news_Content
        if (text.length > 20000) {
          text = text.substr(0, 20000)
        }
        const guide = await getAbstract({
          num: 4,
          text,
        })
        if (guide) {
          newValue += `${item.news_Title}\n`
          newValue += `时间：${item.news_Time} 来源：${item.news_Source}\n\n`
          newValue += `${guide.data}\n\n\n`
        }
      }
      this.setState({ loading: false, newValue })
    }
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

  handleListChange = (type, newsId, value) => {
    const { newsList } = this.state
    const newTarget = _.find(newsList, { news_ID: newsId })
    switch (type) {
      case 'pushEdit':
        newTarget.editmode = true
        break
      case 'edit':
        newTarget.edition = value
        break
      case 'drop':
        newTarget.editmode = false
        newTarget.edition = ''
        break
      case 'save':
        newTarget.editmode = false
        newTarget.origin = false
        break
      case 'origin':
        newTarget.origin = true
        break
      default:
        break
    }
    this.setState({ newsList })
  }

  handleDelete = (news_ID) => {
    const { newsList } = this.state
    this.setState({ newsList: newsList.filter(item => item.news_ID !== news_ID) })
  }

  handleMakePaper = (news_ID) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/foreign-news/paperMaker',
      query: {
        id: news_ID,
      },
    }))
  }

  render() {
    const { newsList, sortor, newValue, loading } = this.state
    return (
      <div>
        <div style={{ paddingTop: 20 }}>
          <span style={{ marginRight: 20, marginLeft: 50, fontSize: 18 }}>
            收藏：
            <span>{name}</span>
          </span>
          <span style={{ marginRight: 20, marginLeft: 20, fontSize: 18 }}>
            关键词：
            <span style={{ color: 'red' }}>{searchText}</span>
          </span>
          <span style={{ marginRight: 20, marginLeft: 20, fontSize: 18 }}>
            创建时间：
            <span>{time}</span>
          </span>
          <div style={{ float: 'right', marginRight: 40 }}>
            <Export dataList={newsList} searchText={searchText} info={{ name, desc, time }} />
          </div>
          <div style={{ float: 'right', marginRight: 20 }}>
            排序方式：
            <Select
              value={sortor}
              style={{ width: 200, marginLeft: 20 }}
              onChange={value => this.sortData(value)}
            >
              <Option key="time" value="time">时间顺序</Option>
              <Option key="score" value="score">搜索词权重顺序</Option>
            </Select>
          </div>
        </div>
        <div style={{ padding: 10, width: '100%', overflow: 'hidden', borderBottom: '1px solid #e8e8e8' }}>
          <span style={{ marginRight: 20, marginLeft: 40, fontSize: 18 }}>
            描述：
            <span>{desc}</span>
          </span>
        </div>
        <div style={{ padding: 24, background: '#fff' }}>
          <List
            itemLayout="vertical"
            size="large"
            dataSource={newsList}
            pagination={{
              pageSize: 10,
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
                            <a href="javascript:;" disabled={item['editmode']} onClick={() => this.handleTranslate(item['news_ID'])}>
                              <Icon type="cloud-sync" />
                              &nbsp;&nbsp;翻译
                            </a>
                          )
                          : (
                            <a href="javascript:;" disabled={item['editmode']} onClick={() => this.handleTransBack(item['news_ID'])}>
                              <Icon type="cloud-sync" />
                              &nbsp;&nbsp;原文
                            </a>
                          )
                        }
                      <Divider type="vertical" />
                      <a href="javascript:;" onClick={() => this.handleMakePaper(item['news_ID'])}>生成文章</a>
                    </span>,
                    <Popconfirm
                      title="确定要删除吗？"
                      placement="topRight"
                      getPopupContainer={this.getPopupContainer}
                      onConfirm={() => this.handleDelete(item.news_ID)}
                      overlayStyle={{ display: 'inline-block', width: 200 }}
                    >
                      <a href="javascript:;" disabled={newsList.length < 2}>删除</a>
                    </Popconfirm>,
                    <span>
                      {
                        item.editmode !== true
                          ? (
                            <a href="javascript:;" onClick={() => this.handleListChange('pushEdit', item['news_ID'])}>
                              <Icon type="edit" />
                              &nbsp;&nbsp;编辑
                            </a>
                          )
                          : (
                            <span>
                              <a href="javascript:;" onClick={() => this.handleListChange('save', item['news_ID'])}>
                                <Icon type="save" />
                                &nbsp;&nbsp;确定
                              </a>
                              <Divider type="vertical" />
                              <a href="javascript:;" onClick={() => this.handleListChange('drop', item['news_ID'])}>
                                <Icon type="close-circle" />
                                &nbsp;&nbsp;取消
                              </a>
                            </span>
                          )
                        }
                    </span>,
                    <span>
                      {
                        item.edition
                          ? (
                            <a href="javascript:;" onClick={() => this.handleListChange('origin', item['news_ID'])}>
                              <Icon type="edit" />
                              &nbsp;&nbsp;返回
                              {item.transmode === true ? '翻译' : '原文'}
                            </a>
                          )
                          : null
                      }
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
                  {
                    item.editmode === true
                      ? (
                        <TextArea
                          value={item.edition && item.edition !== '' ? item.edition : item.transmode === true ? item['translation'] : item['news_Content']}
                          rows={5}
                          onChange={e => this.handleListChange('edit', item['news_ID'], e.target.value)}
                        />
                      )
                      : (
                        <p dangerouslySetInnerHTML={{ __html: item.edition && item.edition !== '' && item.origin === false ? this.handleHighLight(item['edition']) : item.transmode === true ? `${this.handleHighLight(item['translation'])}...` : `${this.handleHighLight(item['news_Content'])}...` }} />
                      )
                  }
                </List.Item>
              )
            }
            }
          />
        </div>
        <div style={{ padding: 20 }}>
          <h1>摘要汇总</h1>
          {/* <span>关键词：互联网，internet，视听，audio visual，5G</span> */}
          <Spin spinning={loading}>
            <TextArea
              autosize
              style={{ marginTop: 20, padding: 20 }}
              value={newValue}
            />
          </Spin>
          <div style={{ height: 40, marginTop: 20 }}>
            <Button style={{ float: 'right' }}>暂存摘要</Button>
            <span style={{ marginRight: 20, float: 'right' }}>
              <Export dataList={newsList} searchText={searchText} info={{ name, desc, time }} />
            </span>
            <Button style={{ marginRight: 20, float: 'right' }} type="primary" onClick={() => this.makeAbs()}>生成摘要</Button>
          </div>
        </div>
      </div>
    )
  }
}

export default Abstract
