import React from 'react'
import { Tabs } from 'antd'
import { connect } from 'dva'
import _ from 'lodash'
import Main from './main'
import User from './user'

const { TabPane } = Tabs
// const diction = {
//   NewTech: '前沿技术',
//   Medicine: '健康医疗',
//   Danger: '应急避险',
//   Internet: '信息科技',
//   Energy: '能源利用',
//   Environment: '气候环境',
//   Food: '食品安全',
//   Space: '航空航天',
// }
const keyMap = require('@/constants/key_map.json')

function mapStateToProps(state) {
  const { userInfo } = state.global
  return {
    userInfo,
  }
}
@connect(mapStateToProps)
class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    const { uid } = window.localStorage
    if (!uid || uid.length < 1) {
      window.location.href = '/foreign-news/login'
    }
    const { userInfo } = this.props
    const tabList = []
    if (userInfo.category) {
      const { category } = userInfo
      let categoryList = []
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
            title: keyMap[first].cn,
            key: first,
            children: [],
          })
        }
        _.find(tabList, { key: first }).children.push({
          title: keyMap[e].cn,
          key: e,
        })
      })
    }
    tabList.unshift({
      title: '首页',
      key: 'home',
    })
    return (
      <div>
        <div style={{ overflow: 'hidden', height: 32, lineHeight: '32px', backgroundColor: '#001529' }}>
          <div style={{ float: 'left' }}>
            <div style={{ marginLeft: 40, fontSize: 14, fontWeight: 600, display: 'inline-block' }}>
              <a href="/foreign-news/index">科普新闻发现</a>
            </div>
          </div>
          <div style={{ float: 'right', marginRight: 40 }}>
            <User />
          </div>
        </div>
        <Tabs tabBarStyle={{ marginLeft: 40 }}>
          {tabList.map((e) => {
            return (
              <TabPane tab={e.title} key={e.title}>
                <Main type={e} />
              </TabPane>
            )
          })}
        </Tabs>
      </div>
    )
  }
}

export default Home
