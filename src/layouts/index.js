import React from 'react'
import { connect } from 'dva'
import { Layout, LocaleProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import styles from './MainLayout.less'

const {
  Content,
} = Layout

function mapStateToProps(state) {
  const { locale } = state.global
  return {
    locale,
  }
}
@connect(mapStateToProps)
class MainLayout extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
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
