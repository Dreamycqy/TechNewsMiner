import React from 'react'
import { Icon, Input, Modal, Tag, Tooltip, notification, message } from 'antd'
import { getFilterKeyword, updateFilterKeyword } from '@/services/index'
import FilterTree from './filterTree'

const openNotificationWithIcon = (type, info) => {
  notification[type]({
    message: info,
    duration: 1.5,
  })
}

const key_map = require('@/constants/key_map.json')

export default class FilterKeyword extends React.Component {
    state = {
      visible: false,
      filterKeyword: [],
      inputVisible: false,
      inputValue: '',
      categories: [],
    }

    getFilterKeyword = async () => {
      const data = await getFilterKeyword({
      })
      if (data && data.code === '200') {
        const filterKeyword = JSON.parse(data.description)
        let target = filterKeyword.length
        for (let e = 0; e < filterKeyword.length; e++) {
          if (target !== filterKeyword.length) {
            break
          }
          for (const i in key_map) {
            if (key_map[i]['cn'] === filterKeyword[e]) {
              if (filterKeyword[e + 1] === key_map[i]['en']) {
                target = e
              }
            }
          }
        }
        await this.setState({
          filterKeyword: filterKeyword.slice(0, target),
          categories: filterKeyword.slice(target, filterKeyword.length),
        })
        this.tree.getNewData()
      } else {
        message.error(data.code ? '用户暂无关键词' : '获取用户过滤词失败！')
      }
    }

    updateFilterKeyword = async () => {
      // const { init } = this.props
      const { filterKeyword } = this.state
      const paramList = filterKeyword.concat(this.tree.getMyData())
      const data = await updateFilterKeyword({
        filterKeyword: JSON.stringify(paramList),
      })
      if (data) {
        console.log(data)
        openNotificationWithIcon('success', '更新成功')
        // init()
      } else {
        openNotificationWithIcon('error', '更新失败')
      }
      this.setState({
        visible: false,
      })
    }

    hideModal = () => {
      this.setState({
        visible: false,
        filterKeyword: [],
      })
    }


    showModal = () => {
      this.getFilterKeyword()
      this.setState({
        visible: true,
      })
    }

    handleClose = (removedTag) => {
      const { filterKeyword } = this.state
      this.setState({ filterKeyword: filterKeyword.filter(tag => tag !== removedTag) })
    }

    showInput = () => {
      this.setState({ inputVisible: true }, () => this.input.focus())
    }

    handleInputChange = (e) => {
      this.setState({ inputValue: e.target.value })
    }

    handleInputConfirm = () => {
      const { inputValue } = this.state
      let { filterKeyword } = this.state
      if (inputValue && filterKeyword.indexOf(inputValue) === -1) {
        filterKeyword = [...filterKeyword, inputValue]
      }
      this.setState({
        filterKeyword,
        inputVisible: false,
        inputValue: '',
      })
    }

    saveInputRef = input => (this.input = input)

    render() {
      const { filterKeyword, inputVisible, inputValue, categories } = this.state
      return (
        <div>
          <a href="javascript:;" onClick={this.showModal}>
            我的关键词
          </a>
          <Modal
            title="订阅关键词管理"
            visible={this.state.visible}
            onCancel={this.hideModal}
            onOk={this.updateFilterKeyword}
            destroyOnClose
            okText="确认"
            cancelText="取消"
          >
            {filterKeyword.map((tag) => {
              const isLongTag = tag.length > 20
              const tagElem = (
                <Tag
                  key={tag} closable
                  style={{ margin: 5 }}
                  onClose={() => this.handleClose(tag)}
                >
                  {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                </Tag>
              )
              return isLongTag ? (
                <Tooltip title={tag} key={tag}>
                  {tagElem}
                </Tooltip>
              ) : (
                tagElem
              )
            })}
            {inputVisible && (
            <Input
              ref={this.saveInputRef}
              type="text"
              size="small"
              style={{ width: 78 }}
              value={inputValue}
              onChange={this.handleInputChange}
              onBlur={this.handleInputConfirm}
              onPressEnter={this.handleInputConfirm}
            />
            )}
            {!inputVisible && (
            <Tag onClick={this.showInput} style={{ background: '#fff', borderStyle: 'dashed', margin: 5 }}>
              <Icon type="plus" />
              {' '}
              添加关键词
            </Tag>
            )}
            <div>
              <FilterTree categories={categories} ref={t => this.tree = t} />
            </div>
          </Modal>
        </div>
      )
    }
}
