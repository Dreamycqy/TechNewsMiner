import React from 'react'
import { Spin, Button } from 'antd'
import _ from 'lodash'
import { connect } from 'dva'
import moment from 'moment'
import md5 from 'md5'
import $ from 'jquery'
import { guideSearch, getContentByIds } from '@/services/index'
import { eventImageStr } from '@/utils/common'
import NewsContent from './newsContent'

const startDate = moment().subtract(30, 'days')
const endDate = moment()
const resultData = []
const appid = '20200511000448145'
const translatekey = 'nCGO32AVxsejOEd7CaVk'
const key_map = require('@/constants/key_map.json')
const countryMap = require('@/constants/countryMap.json')


function mapStateToProps(state) {
  const { userInfo } = state.global
  return {
    userInfo,
  }
}
@connect(mapStateToProps)
class Guide extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      resultDataNew: [],
      loading: false,
      info: '',
    }
  }

  componentWillMount = async () => {
    const { userInfo } = this.props
    if (userInfo.category) {
      const { category } = userInfo
      let categoryList = []
      const tabList = []
      const target = category[category.length - 1]
      if (target) {
        if (target[0] === '[') {
          categoryList = JSON.parse(target)
        }
      }
      categoryList.forEach((e) => {
        const first = e.split('-')[0]
        if (!_.find(tabList, { key: first })) {
          tabList.push({
            title: key_map[first].cn,
            key: first,
            children: [],
          })
        }
        _.find(tabList, { key: first }).children.push({
          title: key_map[e].cn,
          key: e,
        })
      })
      await tabList.forEach((e) => {
        this.search(e.title, this.filterType(e.children.map((j) => { return j.key })))
      })
    }
  }

  componentWillReceiveProps = async (nextProps) => {
    const { userInfo } = nextProps
    if (userInfo.category) {
      const { category } = userInfo
      let categoryList = []
      const tabList = []
      const target = category[category.length - 1]
      if (target) {
        if (target[0] === '[') {
          categoryList = JSON.parse(target)
        }
      }
      categoryList.forEach((e) => {
        const first = e.split('-')[0]
        if (!_.find(tabList, { key: first })) {
          tabList.push({
            title: key_map[first].cn,
            key: first,
            children: [],
          })
        }
        _.find(tabList, { key: first }).children.push({
          title: key_map[e].cn,
          key: e,
        })
      })
      await tabList.forEach((e) => {
        this.search(e.title, this.filterType(e.children.map((j) => { return j.key })))
      })
    }
  }

  filterType = (list) => {
    const keyList = []
    for (const i in key_map) {
      if (list.indexOf(i.substr(0, 3)) > -1) {
        keyList.push(i)
      }
    }
    return keyList
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

  search = async (type, keyList) => {
    this.setState({ loading: true, info: '正在筛选文章' })
    const categories = []
    let targetList = keyList
    if (keyList.length > 250) {
      targetList = keyList.slice(0, 250)
    }
    targetList.forEach((key) => {
      categories.push(key_map[key]['cn'])
      categories.push(key_map[key]['en'])
    })
    let newsList = []
    const word = categories[0].indexOf('与') > -1 ? categories[0].split('与') : categories[0].split('的')
    const list = JSON.parse(JSON.stringify(word))
    for (const i of word) {
      const str = await this.translate(i, 'en')
      if (str) {
        list.push(str.str)
      }
    }
    const data = await guideSearch({
      word: JSON.stringify(list),
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      categories: JSON.stringify(categories),
      sources: JSON.stringify(countryMap['all']),
    }, 'search')
    if (data) {
      const originNewsList = data[0] === 'string' ? [] : _.uniqBy(data, 'news_Title')
      newsList = _.orderBy(originNewsList, 'new_Score', 'desc').slice(0, 5)
      const contentList = await getContentByIds({
        ids: JSON.stringify(newsList.map((e) => { return e.news_ID })),
      })
      if (contentList) {
        const final = []
        for (const item of contentList) {
          let text = item.news_Content
          if (text.length > 10000) {
            text = text.substr(0, 10000)
          }
          final.push({
            title: item.news_Title,
            guide: text,
            pic: eventImageStr(item['news_Pictures']),
            url: item.news_URL,
            time: moment(item.news_Time),
          })
        }
        resultData.push({
          name: type,
          trans: false,
          list: final,
        })
        this.setState({ resultDataNew: resultData, loading: false })
      }
    }
  }

  handleTrans = (name, trans) => {
    const { resultDataNew } = this.state
    const target = _.find(resultDataNew, { name })
    target.trans = !trans
    this.setState({ resultDataNew })
  }

  renderList = (item) => {
    const result = []
    result.push(
      <div
        style={{
          backgroundColor: '#2db7f5',
          width: '100%',
          height: 60,
          lineHeight: '60px',
          paddingLeft: 20,
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        <div style={{ float: 'left', color: 'white' }}>{item.name}</div>
        <Button style={{ float: 'right', margin: 14 }} onClick={() => this.handleTrans(item.name, item.trans)}>
          {item.trans === true ? '取消翻译本类新闻' : '翻译本类新闻'}
        </Button>
      </div>,
    )
    item.list.forEach((e) => {
      result.push(
        <NewsContent data={e} trans={item.trans} />,
      )
    })
    return result
  }

  render() {
    const { resultDataNew, loading, info } = this.state
    return (
      <div style={{ padding: 10 }}>
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
            <h2 style={{ color: '#8232cad9' }}>{`一周导读（${startDate.format('YYYY-MM-DD')} ~ ${endDate.format('YYYY-MM-DD')}）`}</h2>
          </div>
          <div>
            您好，尊敬的
            {window.localStorage.username}
            ，请查阅科普新闻发现系统本周的新闻导读。
          </div>
        </div>
        <Spin spinning={loading}>
          <div style={{ display: loading === true ? 'block' : 'none', height: 300, textAlign: 'center' }}>
            <p style={{ marginTop: 180 }}>{info}</p>
          </div>
        </Spin>
        <div style={{ overflow: 'hidden', backgroundColor: '#ffffffdf' }}>
          {resultDataNew.map((e) => {
            return this.renderList(e)
          })}
        </div>
      </div>
    )
  }
}
export default Guide
