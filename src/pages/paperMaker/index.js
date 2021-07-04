import React from 'react'
import { Input, Icon, Card, Button, Modal, Spin, Popover } from 'antd'
import AceEditor from 'react-ace'
import { connect } from 'dva'
import md5 from 'md5'
import $ from 'jquery'
import _ from 'lodash'
import subject from '@/constants/subject'
import { getUrlParams } from '@/utils/common'
import { getContentByIds, kCardSearch } from '@/services/index'
import Styles from './style.less'

const { TextArea } = Input
const ButtonGroup = Button.Group

const appid = '20200511000448145'
const translatekey = 'nCGO32AVxsejOEd7CaVk'

@connect()
class Abstract extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      news: {
        crawl_Time: '',
        news_Content: '',
        news_ID: '',
        news_Pictures: '[]',
        news_Source: '',
        news_Time: '',
        news_Title: '',
        news_URL: '',
        news_ContentCN: '',
      },
      showOrigin: false,
      visible: false,
      mainLoading: false,
      insLoading: false,
      dataType: 'sekg',
      instanceList: [],
      newsSubject: '物理',
    }
  }

  componentWillMount() {
    if (getUrlParams().id) {
      this.getContent(getUrlParams().id)
    }
  }

  onChange = (newValue) => {
    console.log('change', newValue)
  }

  getContent = async (id) => {
    this.setState({ mainLoading: true })
    const contentList = await getContentByIds({
      ids: JSON.stringify([id]),
    })
    if (contentList) {
      const news_TitleCN = await this.translate(contentList[0].news_Title)
      const news_ContentCN = await this.translate(contentList[0].news_Content)
      this.setState({ news: {
        ...contentList[0],
        news_TitleCN: news_TitleCN.str,
        news_ContentCN: news_ContentCN.str,
      } })
      this.getInstance(news_ContentCN.str)
    }
    this.setState({ mainLoading: false })
  }

  getInstance = async (content) => {
    this.setState({ insLoading: true })
    const data1 = await kCardSearch({
      course: 'physics',
      context: content.slice(0, 10000),
    })
    const data2 = await kCardSearch({
      course: 'biology',
      context: content.slice(0, 10000),
    })
    const data3 = await kCardSearch({
      course: 'chemistry',
      context: content.slice(0, 10000),
    })
    const data4 = await kCardSearch({
      course: 'geo',
      context: content.slice(0, 10000),
    })
    if (data1 && data2 && data3 && data4) {
      const list1 = data1.results.map((e) => { return { ...e, subject: '物理' } })
      const list2 = data2.results.map((e) => { return { ...e, subject: '生物' } })
      const list3 = data3.results.map((e) => { return { ...e, subject: '化学' } })
      const list4 = data4.results.map((e) => { return { ...e, subject: '地理' } })
      const num1 = list1.length
      const num2 = list2.length
      const num3 = list3.length
      const num4 = list4.length
      const max = Math.max(num1, num2, num3, num4)
      const max2 = Math.max(num1, num2, num3)
      let newsSubject = '物理'
      if (max === num1) {
        newsSubject = '物理'
      } else if (max === num2) {
        newsSubject = '生物'
      } else if (max === num3) {
        newsSubject = '化学'
      } else if (max === num4 && num4 / max2 > 1.2) {
        newsSubject = '地理'
      } else if (max2 === num1) {
        newsSubject = '物理'
      } else if (max2 === num2) {
        newsSubject = '生物'
      } else if (max2 === num3) {
        newsSubject = '化学'
      }
      const resultRaw = list1.concat(list2).concat(list3).concat(list4)
      const instanceList = _.uniqBy(resultRaw, 'entity')
      this.setState({ instanceList, newsSubject })
      this.handleInsAdd(content, instanceList)
    }
    this.setState({ insLoading: false })
  }

  handleInsAdd = (text, list) => {
    let result = text
    if (list.length) {
      list.forEach((e) => {
        result = result.replace(e.entity, `<a href="javascript:;" onClick="window.open('http://edukg.cn/knowledgeWiki/knowledge?name=${e.entity}&subject=${_.find(subject, { name: e.subject }).cmcc}')">${e.entity}</a>`)
      })
    }
    return result
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
            str += `${e.dst}\n`
          })
          resolve({ str })
        },
        error() {
        },
      })
    })
  }

  render() {
    const { news, showOrigin, visible, mainLoading, dataType, instanceList, insLoading } = this.state
    return (
      <div style={{ padding: 20 }}>
        <div id="guideheader" style={{ margin: '10px 20px' }}>
          <div style={{ height: 48 }}>
            <h2
              style={{
                float: 'left',
                backgroundColor: '#24b0e6',
                color: 'white',
                height: 31,
                lineHeight: '31px',
                fontSize: 18,
                padding: '0 16px',
                borderRadius: 4,
                marginRight: 14,
              }}
            >
              科普新闻发现
            </h2>
            <h2 style={{ color: '#8232cad9' }}>科普文章辅助生成工具</h2>
          </div>
        </div>
        <Card
          className={Styles.myCard}
          bordered={false}
          title={(
            <span style={{ color: '#fff' }}>
              <Icon type="" style={{ color: '#fff', marginRight: 10 }} />
              原文译文
            </span>
          )}
          extra={(
            <ButtonGroup style={{ marginRight: 20 }}>
              <Button
                type={showOrigin === true ? 'primary' : 'none'}
                onClick={() => this.setState({ showOrigin: true })}
              >
                显示原文
              </Button>
              <Button
                type={showOrigin === false ? 'primary' : 'none'}
                onClick={() => this.setState({ showOrigin: false })}
              >
                显示译文
              </Button>
            </ButtonGroup>
          )}
        >
          <Spin size="large" spinning={mainLoading}>
            <TextArea value={showOrigin === true ? news.news_Content : news.news_ContentCN} rows={10} />
          </Spin>
        </Card>
        <Card
          className={Styles.myCard}
          bordered={false}
          style={{ height: 500 }}
          title={(
            <span style={{ color: '#fff' }}>
              <Icon type="" style={{ color: '#fff', marginRight: 10 }} />
              实体提取
            </span>
          )}
          extra={(
            <div>
              <Popover
                content={(
                  <div style={{ width: 420 }}>
                    通过不同图谱数据源对文章内的科普知识点进行提取，默认为科学教育图谱SEKG。
                    采用XLORE数据源可以获得更详细的内容，但因为数据量更大，请求时间也会更长。
                  </div>
                )}
                title="说明"
              >
                <a style={{ marginRight: 20, fontSize: 18 }} href="javascript:;"><Icon type="question-circle" /></a>
              </Popover>
              <ButtonGroup style={{ marginRight: 20 }}>
                <Button
                  type={dataType === 'sekg' ? 'primary' : 'none'}
                  onClick={() => this.setState({ dataType: 'sekg' })}
                >
                  使用SEKG数据
                </Button>
                <Button
                  type={dataType === 'xlore' ? 'primary' : 'none'}
                  onClick={() => this.setState({ dataType: 'xlore' })}
                >
                  使用XLORE数据
                </Button>
              </ButtonGroup>
            </div>
          )}
        >
          <Spin spinning size="large" spinning={insLoading}>
            <div
              style={{ height: 400, overflowY: 'scroll' }}
              dangerouslySetInnerHTML={{ __html: this.handleInsAdd(news.news_ContentCN, instanceList) }}
            />
          </Spin>
        </Card>
        <div style={{ height: 700 }}>
          <Card
            className={Styles.myCard}
            style={{ float: 'left', width: 300, marginRight: 20 }}
            bordered={false}
            title={(
              <span style={{ color: '#fff' }}>
                <Icon type="" style={{ color: '#fff', marginRight: 10 }} />
                实体列表
              </span>
            )}
          >
            <Spin spinning size="large">
              <div style={{ height: 600 }} />
            </Spin>
          </Card>
          <Card
            className={Styles.myCard}
            style={{ overflow: 'hidden' }}
            bordered={false}
            title={(
              <span style={{ color: '#fff' }}>
                <Icon type="" style={{ color: '#fff', marginRight: 10 }} />
                文章分段
              </span>
            )}
            extra={(
              <Button type="primary">修改分段</Button>
            )}
          >
            <Spin spinning size="large">
              <div style={{ height: 600 }} />
            </Spin>
          </Card>
        </div>
        <div style={{ height: 40, marginTop: 20 }}>
          <Button style={{ float: 'right' }} onClick={() => this.setState({ visible: true })}>审阅文章</Button>
        </div>
        <Modal
          title="编辑模式"
          visible={visible}
          onCancel={() => this.setState({ visible: false })}
          width="1200px"
        >
          <AceEditor
            mode=""
            theme="github"
            value={showOrigin === true ? news.news_Content : news.news_ContentCN}
            onChange={this.onChange}
            name="UNIQUE_ID_OF_DIV"
            editorProps={{ $blockScrolling: true }}
            width="1100px"
          />
        </Modal>
      </div>
    )
  }
}
export default Abstract
