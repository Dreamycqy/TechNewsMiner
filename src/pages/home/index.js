import React from 'react'
import { Tabs } from 'antd'
import { connect } from 'dva'
import Main from './main'
import User from './user'

const { TabPane } = Tabs

@connect()
class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    const { uid, params } = window.localStorage
    if (!uid || uid.length < 1) {
      window.location.href = '/foreign-news/login'
    }
    const config = JSON.parse(params)
    const tabList = config.fields
    tabList.unshift('首页')
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
              <TabPane tab={e} key={e}>
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
