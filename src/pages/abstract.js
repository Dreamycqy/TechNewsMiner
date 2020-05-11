import React from 'react'
import { Input, Button, Checkbox, List, Icon } from 'antd'
import md5 from 'md5'
import $ from 'jquery'
import _ from 'lodash'
import { eventImage, getUrlParams } from '@/utils/common'

const appid = '20200511000448145'
const translatekey = 'nCGO32AVxsejOEd7CaVk'

const target = _.find(JSON.parse(window.localStorage.collection), { id: getUrlParams().id })

class Abstract extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newsList: target.checkedList,
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

  render() {
    const { newsList } = this.state
    return (
      <div>
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
            }
          />
        </div>
      </div>
    )
  }
}

export default Abstract
