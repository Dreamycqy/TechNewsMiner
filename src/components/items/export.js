import React from 'react'
import { Button, notification } from 'antd'
import moment from 'moment'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from '@/constants/vfs_fonts'
import { image2Base64 } from '@/utils/common'
// import imgTime from '@/assets/imageTime.js'
// import imgEarth from '@/assets/imgEarth.js'

pdfMake.vfs = pdfFonts.pdfMake.vfs

const openNotificationWithIcon = (type, info) => {
  notification[type]({
    message: info,
    duration: 1.5,
  })
}

function redirect(url) {
  return `https://newsminer.net/link.html?url=${url}`
}

export default class Export extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
    }
  }

  handleHighLight = (str, type) => {
    if (this.props.searchText === '') {
      return str
    }
    let resultStr = str
    const result = []
    const arr = this.props.searchText.split(' ')
    arr.forEach((e) => {
      if (e !== ' ' && e !== '') {
        const reg = new RegExp(e, 'gi')
        resultStr = resultStr.replace(reg, `<em>${e}<em>`)
      }
    })
    resultStr.split('<em>').forEach((e) => {
      if (arr.indexOf(e) > -1) {
        result.push({ text: e, color: 'red', lineHeight: type === 'title' ? 1.2 : 1.5 })
      } else {
        result.push({ text: e, color: '#2b2b2b', lineHeight: type === 'title' ? 1.2 : 1.5 })
      }
    })
    if (type === 'content') {
      result.push({ text: '……' })
    }
    return result
  }

  getPicture = async (url) => {
    const arr = url.split('.')
    const ext = arr[arr.length - 1]
    const data = await image2Base64(url, ext)
    if (data) {
      return data
    }
  }

  download = async () => {
    let checkedList = []
    if (this.props.dataList) {
      checkedList = this.props.dataList
    } else {
      this.props.checkedIdList.forEach((id) => {
        this.props.allDataList.forEach((data) => {
          if (id === data.news_ID) {
            checkedList.push(data)
          }
        })
      })
    }
    if (checkedList.length === 0) {
      openNotificationWithIcon('error', '未选中任何新闻或事件')
      return
    }
    const content = []
    const imageMap = {}
    const promises = checkedList.map(async (item) => {
      const picture = item.news_Pictures
      const type = typeof picture
      let url = ''
      if (type === 'object') {
        url = picture[0] // eslint-disable-line
      } else if (type === 'string') {
        url = picture.substring(1, picture.length - 1).split(',')[0] // eslint-disable-line
      }
      if (url !== '') {
        imageMap[item.news_ID] = await this.getPicture(url)
      }
    })
    this.setState({ loading: true })
    await Promise.all(promises)
    content.push({
      text: [
        { text: '摘要文档', fontSize: 18 },
        { text: '      ', fontSize: 18 },
        { text: '搜索关键词：', fontSize: 10 },
        { text: this.props.searchText, fontSize: 10, color: 'red' },
      ],
      alignment: 'center',
      color: '#2b2b2b',
      margin: [10, 5, 10, 5],
    })
    if (this.props.info) {
      content.push({
        text: `由收藏列表：${this.props.info.name} 生成，列表更新于${this.props.info.time}`,
        alignment: 'center',
        fontSize: 10,
        margin: [10, 5, 10, 5],
        color: '#2b2b2b',
      })
    } else {
      content.push({
        text: `由首页直接生成，文档生成于${moment().format('YYYY-MM-DD HH:mm')}`,
        alignment: 'center',
        fontSize: 10,
        margin: [10, 5, 10, 5],
        color: '#2b2b2b',
      })
    }
    content.push({
      text: '                                                                                                                                            ',
      decoration: 'lineThrough',
      decorationColor: '#e8e8e8',
      alignment: 'center',
    })
    for (const item of checkedList) {
      const titleText = item.transmode === true ? item.transTitle : item.news_Title
      const contextText = item.edition && item.edition !== '' && item.origin === false
        ? item.edition : item.transmode === true ? item['translation'] : item['news_Content']
      content.push({
        text: this.handleHighLight(titleText, 'title'),
        link: redirect(item['news_URL']),
        alignment: 'center',
        fontSize: 16,
        margin: [10, 10, 10, 10],
      })
      content.push({
        text: [{
          text: item.news_Time,
          color: '#8c8c8c',
        }, {
          text: '          ',
        }, {
          text: item.news_Source,
          color: '#8c8c8c',
        }],
        alignment: 'center',
        fontSize: 10,
        margin: [10, 0, 0, 10],
      })
      content.push({
        text: this.handleHighLight(contextText, 'content'),
        fontSize: 12,
        margin: [10, 0, 10, 20],
      })
      if (imageMap[item.news_ID]) {
        content.push({
          image: imageMap[item.news_ID],
          margin: [10, 0, 10, 20],
          alignment: 'center',
        })
      }
      content.push({
        text: '                                                                                                                                            ',
        decoration: 'lineThrough',
        decorationColor: '#e8e8e8',
        alignment: 'center',
      })
    }
    const dd = {
      content,
      defaultStyle: {
        font: 'fzhtjw',
      },
    }
    pdfMake.fonts = {
      fzhtjw: {
        normal: 'fzhtjw.TTF',
      },
    }
    this.setState({ loading: false })
    pdfMake.createPdf(dd).open()
  }

  render() {
    return (
      <div style={{ display: 'inline-block', marginLeft: 10 }}>
        <Button
          style={{ margin: 0 }} className="gutter-box"
          type="primary" onClick={this.download}
          icon="export" loading={this.state.loading}
        >
          导出到PDF
        </Button>
        <br />
      </div>
    )
  }
}
