import React from 'react'
import { connect } from 'dva'
import { Menu, Layout, Icon, Avatar } from 'antd'
import CollectConfig from './collect'

const { Content, Sider } = Layout

function mapStateToProps(state) {
  const { userInfo } = state.global
  return {
    userInfo,
  }
}
@connect(mapStateToProps)
class User extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      collapsed: false,
    }
  }

  componentWillMount = () => {
  }

  onCollapse = () => {
    this.setState({ collapsed: !this.state.collapsed })
  }

  render() {
    const { collapsed } = this.state
    let username = ''
    if (window.localStorage.username) {
      username = window.localStorage.username
    }
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse}>
          <div style={{ textAlign: 'center', margin: '20px 0', display: collapsed ? 'none' : 'block' }}>
            <Avatar size={100} style={{ margin: 20 }} icon="user" />
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
              {username}
            </div>
            <div style={{ fontSize: 14, color: '#fff', marginTop: 10 }}>科普研究所</div>
          </div>
          <div style={{ textAlign: 'center', margin: '10px 0', display: collapsed ? 'block' : 'none' }}>
            <Avatar size={48} style={{ margin: 10 }} icon="user" />
          </div>
          <Menu theme="dark" defaultSelectedKeys={['2']} mode="inline">
            {/* <Menu.Item key="1">
              <Icon type="user" />
              <span>用户信息</span>
            </Menu.Item> */}
            <Menu.Item key="2">
              <Icon type="book" />
              <span>订阅设置</span>
            </Menu.Item>
            {/* <Menu.Item key="3">
              <Icon type="setting" />
              <span>系统设置</span>
            </Menu.Item>
            <Menu.Item key="4">
              <Icon type="safety-certificate" />
              <span>安全设置</span>
            </Menu.Item> */}
          </Menu>
        </Sider>
        <Content style={{ margin: 20, backgroundColor: '#fff' }}>
          <CollectConfig userInfo={this.props.userInfo} />
        </Content>
      </Layout>
    )
  }
}
export default User
