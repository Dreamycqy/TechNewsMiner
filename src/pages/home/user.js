import React from 'react'
import { Menu, Modal, Dropdown, Avatar, Icon } from 'antd'
import FilterKeyword from './filterKeyword'

function logout() {
  window.localStorage.setItem('uid', '')
  window.location.href = '/login'
}

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

  render() {
    const { username } = window.localStorage
    const menu = (
      <Menu>
        <Menu.Item>
          <FilterKeyword init={this.props.init} />
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
                ? <Avatar>{username.substr(0, 1).toUpperCase()}</Avatar> : <Avatar icon="user" />
            }
            <span style={{ marginLeft: 10 }}>{username && username !== '' ? username : '未登录'}</span>
            <Icon type="down" />
          </div>
        </Dropdown>
      </div>
    )
  }
}

export default User