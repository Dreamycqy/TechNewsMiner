import React from 'react'
import { Menu, Modal, Dropdown, Avatar, Icon } from 'antd'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import FilterKeyword from './filterKeyword'

function logout() {
  window.localStorage.setItem('uid', '')
  window.location.href = '/foreign-news/login'
}

@connect()
class User extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  handleConfirm = () => {
    Modal.confirm({
      content: '确定要退出系统？',
      okText: '确定',
      onOk() {
        logout()
      },
      cancelText: '取消',
    })
  }

  goUser = () => {
    this.props.dispatch(routerRedux.push({
      pathname: '/foreign-news/user',
    }))
  }

  goTree = () => {
    this.props.dispatch(routerRedux.push({
      pathname: '/foreign-news/tree',
    }))
  }

  render() {
    const { username } = window.localStorage
    const menu = (
      <Menu>
        <Menu.Item>
          <FilterKeyword />
        </Menu.Item>
        <Menu.Item>
          <a href="javascript:;" onClick={() => this.goUser()}>用户管理</a>
        </Menu.Item>
        <Menu.Item>
          <a href="javascript:;" onClick={() => this.goTree()}>知识树管理</a>
        </Menu.Item>
        <Menu.Item>
          <a href="/foreign-news/guide" target="_blank">我的一周导读</a>
        </Menu.Item>
        <Menu.Item>
          <a
            onClick={() => {
              this.handleConfirm()
            }}
            href="javascript:;"
          >
            退出
          </a>
        </Menu.Item>
      </Menu>
    )
    return (
      <div>
        <Dropdown overlay={menu}>
          <div>
            {
              username && username !== ''
                ? <Avatar size="small">{username.substr(0, 1).toUpperCase()}</Avatar> : <Avatar icon="user" size="small" />
            }
            <span style={{ marginLeft: 10, color: 'white' }}>{username && username !== '' ? username : '未登录'}</span>
            <Icon type="down" style={{ marginLeft: 4, color: 'white' }} />
          </div>
        </Dropdown>
      </div>
    )
  }
}

export default User
