import React from 'react'
import { Icon, Input, Tag, Tooltip, notification, message } from 'antd'
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
      filterKeyword: [],
      inputVisible: false,
      inputValue: '',
      categories: [],
    }

    componentWillMount = () => {
      this.getFilterKeyword()
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
      const { filterKeyword } = this.state
      const data = await updateFilterKeyword({
        filterKeyword: JSON.stringify(filterKeyword.concat(this.tree.getMyData())),
      })
      if (data) {
        openNotificationWithIcon('success', '更新成功')
      } else {
        openNotificationWithIcon('error', '更新失败')
      }
    }

    hideModal = () => {
      this.setState({
        filterKeyword: [],
      })
    }


    showModal = () => {
      this.getFilterKeyword()
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
          <div>
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
          </div>
        </div>
      )
    }
}
