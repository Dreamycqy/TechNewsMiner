import React from 'react'
import { Spin, Button } from 'antd'
import _ from 'lodash'
import { connect } from 'dva'
import moment from 'moment'
import { guideSearch, getContentByIds, getAbstract } from '@/services/index'
import { eventImageStr } from '@/utils/common'
import Bg from '@/assets/bg.jpg'
import NewsContent from './newsContent'

const startDate = moment().subtract('7', 'days')
const endDate = moment()
const resultData = []
const diction = {
  NewTech: '前沿技术',
  Medicine: '健康医疗',
  Danger: '应急避险',
  Internet: '信息科技',
  Energy: '能源利用',
  Environment: '气候环境',
  Food: '食品安全',
  Space: '航空航天',
}
const typeList = {
  前沿技术: ['0-7', '0-8', '0-9', '1-1', '1-4', '1-7'],
  健康医疗: ['0-3', '1-2'],
  应急避险: ['0-8', '0-9'],
  信息科技: ['0-6', '1-5'],
  能源利用: ['0-1', '1-0'],
  气候环境: ['0-2', '1-3'],
  食品安全: ['0-4'],
  航空航天: ['0-0'],
}
const colorList = [
  { name: '前沿技术', color: '#2db7f5' },
  { name: '健康医疗', color: '#87d068' },
  { name: '应急避险', color: 'volcano' },
  { name: '信息科技', color: 'pink' },
  { name: '能源利用', color: 'gold' },
  { name: '气候环境', color: 'cyan' },
  { name: '食品安全', color: 'geekblue' },
  { name: '航空航天', color: 'purple' },
]
// const dateFormat = 'YYYY-MM-DD'
// const appid = '20200511000448145'
// const translatekey = 'nCGO32AVxsejOEd7CaVk'
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
      await category.forEach((e) => {
        this.search(this.filterType(diction[e]))
      })
    }
  }

  componentWillReceiveProps = async (nextProps) => {
    const { userInfo } = nextProps
    if (userInfo.category) {
      const { category } = userInfo
      await category.forEach((e) => {
        this.search(this.filterType(diction[e]))
      })
    }
  }

  filterType = (type) => {
    const list = typeList[type]
    const keyList = []
    for (const i in key_map) {
      if (list.indexOf(i.substr(0, 3)) > -1 || i === '0' || i === '1') {
        keyList.push(i)
      }
    }
    return { type, keyList }
  }

  search = async ({ type, keyList }) => {
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
    const data = await guideSearch({
      word: JSON.stringify([]),
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
          const guide = await getAbstract({
            num: 4,
            text,
          })
          if (guide) {
            this.setState({ info: '正在抽取摘要' })
            final.push({
              title: item.news_Title,
              guide: guide.data,
              pic: eventImageStr(item['news_Pictures']),
              url: item.news_URL,
              time: moment(item.news_Time),
            })
          }
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
          backgroundColor: _.find(colorList, { name: item.name }).color,
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
      <div style={{ padding: 10, background: `url("${Bg}") top repeat`, backgroundSize: '150%' }}>
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
