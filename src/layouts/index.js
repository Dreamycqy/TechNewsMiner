import React from 'react'
import { connect } from 'dva'
import { Layout, LocaleProvider, message } from 'antd'
import moment from 'moment'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import { getProfile } from '@/services/index'
import styles from './MainLayout.less'

const {
  Content,
} = Layout

function mapStateToProps(state) {
  const { userInfo } = state.global
  return {
    userInfo,
  }
}
@connect(mapStateToProps)
class MainLayout extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  componentWillMount = async () => {
    const { expire } = window.localStorage
    if (moment().subtract(1, 'days') > moment(expire)) {
      message.info('登录已过期，请重新登录')
      window.location.href = '/foreign-news/login'
    }
    const data = await getProfile({})
    if (data) {
      this.props.dispatch({
        type: 'global/updateState',
        payload: {
          userInfo: data,
        },
      })
    }
  }

  render() {
    const {
      children,
    } = this.props
    return (
      <Layout style={{ height: '100%', minWidth: 1220 }}>
        <LocaleProvider locale={zh_CN}>
          <Content style={{ height: '100%' }}>
            <div className={styles.main}>
              {children}
            </div>
            <div className={styles.footer}>
              Copyright by Team Tsinghua, 2020
            </div>
          </Content>
        </LocaleProvider>
      </Layout>
    )
  }
}

export default MainLayout
