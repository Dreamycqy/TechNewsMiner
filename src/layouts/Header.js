import React from 'react'
import { connect } from 'dva'
import { Menu, Modal, Dropdown, Icon } from 'antd'
import styles from './MainLayout.less'

function handleConfirm(dispatch) {
  Modal.confirm({
    content: '确定要退出系统？',
    okText: '确定',
    onOk() {
      dispatch({ type: 'global/logout', payload: {} })
    },
    cancelText: '取消',
  })
}

function PandaHeader({
  dispatch, userInfo,
}) {
  const menu = (
    <Menu>
      <Menu.Item>
        <a
          onClick={() => {
            handleConfirm(dispatch)
          }}
          href="javascript:;"
        >
          退出
        </a>
      </Menu.Item>
    </Menu>
  )
  const moreMenu = (
    <Menu>
      <Menu.Item>
        <a href="_blank">
          <Icon type="info-circle-o" />
          {' '}
          指标统一说明
        </a>
      </Menu.Item>
    </Menu>
  )
  return (
    <div className={styles.header}>
      <Dropdown overlay={menu}>
        <div className={styles.user}>
          <span className={styles.userLogo}>
            <img src={userInfo || 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'} alt="头像" />
          </span>
          <span className={styles.userName}>{userInfo || '陈秋阳'}</span>
          <Icon type="down" />
        </div>
      </Dropdown>
      <Dropdown overlay={moreMenu}>
        <span style={{ float: 'right', margin: '0 10px', lineHeight: '50px' }}>
          说明
          {' '}
          <Icon type="down" />
        </span>
      </Dropdown>
    </div>
  )
}

function mapStateToProps(state) { // eslint-disable-line
  return {}
}
export default connect(mapStateToProps)(PandaHeader)
