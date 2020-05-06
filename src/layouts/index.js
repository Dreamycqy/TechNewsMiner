import React from 'react'
import { connect } from 'dva'
import { Layout, Icon, LocaleProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import styles from './MainLayout.less'
import PandaHeader from './Header'
import Navigation from './Navigation'

const {
  Header, Content, Sider,
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
      collapsed: false,
    }
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    })
  }

  render() {
    const {
      children, router, activeKey, userInfo,
    } = this.props
    const { collapsed } = this.state
    return (
      <Layout style={{ height: '100%', minWidth: 1220 }}>
        <Header className={styles.mainHeader}>
          <div className={styles.logo} onClick={() => window.location.href = '/'}>
            <a style={{ fontSize: 22, fontWeight: 700 }} href="javascript:;">用户画像系统</a>
          </div>
          <PandaHeader
            activeKey={activeKey}
            router={router}
            userInfo={userInfo}
          />
        </Header>
        <Layout>
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            className={styles.sider}
          >
            <Navigation
              path={window.location.pathname.split('/')[3]}
              collapsed={collapsed}
            />
          </Sider>
          <LocaleProvider locale={zh_CN}>
            <Content style={{ padding: '8px 6px 6px 10px', height: '100%' }}>
              <div className={styles.main}>
                {children}
              </div>
              <div className={styles.footer}>
                Copyright by Team Tsinghua, 2020
              </div>
            </Content>
          </LocaleProvider>
        </Layout>
      </Layout>
    )
  }
}

export default MainLayout
