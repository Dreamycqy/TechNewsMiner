import React from 'react'
import { Button } from 'antd'
import md5 from 'md5'
import $ from 'jquery'
import logo from '@/assets/logo.png'

const translatekey = 'nCGO32AVxsejOEd7CaVk'
const appid = '20200511000448145'

class NewsContent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      collepsed: true,
      titleTrans: '',
      guideTrans: '',
      isTrans: false,
    }
  }

  componentWillReceiveProps = async (nextProps) => {
    if (nextProps.trans !== this.props.isTrans) {
      this.setState({ isTrans: nextProps.trans })
    }
    if (nextProps.trans === true && this.state.titleTrans === '') {
      const title = await this.translate(this.props.data.title)
      const guide = await this.translate(this.props.data.guide)
      this.setState({ titleTrans: title.str, guideTrans: guide.str })
    }
  }

  handleTrans = async () => {
    if (this.state.isTrans === false) {
      if (this.state.titleTrans === '') {
        const title = await this.translate(this.props.data.title)
        const guide = await this.translate(this.props.data.guide)
        this.setState({ titleTrans: title.str, guideTrans: guide.str })
      }
    }
    this.setState({ isTrans: !this.state.isTrans })
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

  render() {
    const e = this.props.data
    const { collepsed, titleTrans, guideTrans, isTrans } = this.state
    return (
      <div style={{ padding: 10 }}>
        <div style={{ float: 'left', padding: 10, width: 120, textAlign: 'center' }}>
          <div style={{ backgroundColor: '#f1f0ef', lineHeight: '70px', fontSize: 18, marginBottom: 10, height: 70, color: '#999' }}>{e.time.format('DD')}</div>
          <div style={{ backgroundColor: '#f1f0ef', lineHeight: '70px', fontSize: 18, height: 70, color: '#999' }}>{e.time.format('YYYY-MM')}</div>
        </div>
        <div style={{ float: 'left', padding: 10 }}>
          {e.pic.length > 0
            ? <img src={e.pic} alt="" height="150px" width="240px" /> : <img src={logo} alt="" height="150px" width="240px" />
          }
        </div>
        <div style={{ padding: 10, overflow: 'hidden' }}>
          <h3 style={{ marginBottom: 10 }}>
            <a href={e.url} target="_blank">
              {titleTrans !== '' && isTrans === true ? titleTrans : e.title}
            </a>
          </h3>
          <div>
            <div style={{ height: collepsed === true ? 110 : '', overflow: 'hidden' }}>
              {guideTrans !== '' && isTrans === true ? guideTrans : e.guide}
            </div>
            <Button
              style={{ float: 'right', display: collepsed === true ? 'block' : 'none' }} href="javascript:;"
              onClick={() => this.setState({ collepsed: false })}
              size="small"
            >
              展开全文↓
            </Button>
            <Button
              style={{ float: 'right', display: collepsed === false ? 'block' : 'none' }} href="javascript:;"
              onClick={() => this.setState({ collepsed: true })}
              size="small"
            >
              折叠全文↑
            </Button>
            <Button
              style={{ float: 'right', marginRight: 10, display: collepsed === false ? 'block' : 'none' }} href="javascript:;"
              onClick={() => this.handleTrans()}
              size="small"
              type="primary"
            >
              {isTrans === false ? '翻译' : '取消翻译'}
            </Button>
          </div>
        </div>
        <div style={{ overflow: 'hidden' }}>
          {`<div class="news">
              <div class="timebox">
                <div class="timespan timespan_top">
                  ${e.time.format('DD')}
                  <!-- 日期 -->
                </div>
                <div class="timespan">
                  ${e.time.format('YYYY-MM')}
                  <!-- 年-月 -->
                </div>
              </div>
              <div class="imgbox">
                <img src="${e.pic.length > 0 ? e.pic : ''}" alt="" height="150px" width="240px">
              </div>
              <div class="titlebox">
                <h3 style="margin-bottom: 10px;">
                  <a href="${e.url}" target="_blank">
                    ${titleTrans !== '' && isTrans === true ? titleTrans : e.title}
                    <!-- 标题内容 -->
                  </a>
                </h3>
              <div>
                <div class="text">
                  ${guideTrans !== '' && isTrans === true ? guideTrans : e.guide}
                  <!-- 文字内容 -->
                </div>
                </div>
              </div>
            </div>`}
        </div>
      </div>
    )
  }
}
export default NewsContent
