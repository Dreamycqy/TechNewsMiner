import React from 'react'
import { Input, Divider, List, Icon } from 'antd'
import md5 from 'md5'
import $ from 'jquery'
import _ from 'lodash'
import { eventImage, getUrlParams } from '@/utils/common'
import Export from './exportAbs'

const { TextArea } = Input
const appid = '20200511000448145'
const translatekey = 'nCGO32AVxsejOEd7CaVk'

const originData = _.find(JSON.parse(window.localStorage.collection), { id: getUrlParams().id })
const { searchText } = originData

class Abstract extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newsList: originData.checkedList,
    }
  }

  redirect = (url) => {
    return `https://newsminer.net/link.html?url=${url}`
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
        break
      default:
        break
    }
    this.setState({ newsList })
  }

  render() {
    const { newsList } = this.state
    return (
      <div>
        <div style={{ paddingTop: 20 }}>
          <span style={{ marginRight: 20, marginLeft: 50, fontSize: 18 }}>
            关键词：
            <span style={{ color: 'red' }}>{searchText}</span>
          </span>
          <Export dataList={newsList} searchText={searchText} />
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
                        <p dangerouslySetInnerHTML={{ __html: item.edition && item.edition !== '' ? item['edition'] : item.transmode === true ? `${item['translation']}...` : `${item['news_Content']}...` }} />
                      )
                  }
                </List.Item>
              )
            }
            }
          />
        </div>
      </div>
    )
  }
}

export default Abstract
