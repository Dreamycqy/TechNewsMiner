import React from 'react'
import { connect } from 'dva'
import { Menu, Icon } from 'antd'
import { routerRedux } from 'dva/router'
import menuList from '@/constants/menuList'
import styles from './MainLayout.less'

const { SubMenu } = Menu
@connect()
class Navigation extends React.Component {
  constructor(props) {
    super(props)
    const currentKey = [window.location.pathname.split('/')[2]]
    this.state = {
      theme: 'dark',
      currentKey,
    }
  }

  getMenuComponent = (menuMList, parentKey) => {
    if (menuMList && menuMList.length > 0) {
      return (
        menuMList.map((menu) => {
          const {
            id, name, icon, children = [],
          } = menu
          const key = parentKey ? `${parentKey}-${id}` : id
          const iconHtml = icon ? <Icon type={icon} /> : null
          if (children && children.length) {
            return (
              <SubMenu
                onTitleClick={this.handleSubMenuClick}
                key={key}
                title={(
                  <span>
                    {iconHtml}
                    <span>{name}</span>
                  </span>
                )}
              >
                {this.getMenuComponent(children, key)}
              </SubMenu>
            )
          } else {
            return (
              <Menu.Item onClick={() => this.forceClick(key)} key={key} style={{ height: 32, lineHeight: '32px' }}>
                {icon ? <Icon type={icon} /> : null}
                <span>{name}</span>
              </Menu.Item>
            )
          }
        })
      )
    }
  }

  forceClick = (key) => {
    if (key === this.state.currentKey[0]) {
      this.handleSelect({ key })
    }
  }

  handleSelect = async ({ key }) => {
    this.setState({ currentKey: [key] })
    this.props.dispatch(routerRedux.push({
      pathname: `/oak/${key}`,
    }))
  }

  render() {
    const { theme, currentKey } = this.state
    const { collapsed } = this.props
    return (
      <div className={styles.naviContent} ref={c => this.navigationRef = c}>
        {menuList.length
          ? (
            <Menu
              ref={c => this.menuRef = c}
              style={{ borderRight: 'none', height: '100%' }}
              theme={theme}
              onClick={this.handleSelect}
              selectedKeys={currentKey}
              mode="inline"
              collapsed={collapsed.toString()}
            >
              {this.getMenuComponent(menuList)}
            </Menu>
          ) : null
        }
      </div>
    )
  }
}

export default Navigation
