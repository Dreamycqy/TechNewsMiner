import React from 'react'
import { TreeSelect, message } from 'antd'

const myData = require('@/constants/tree_cn.json')
const key_map = require('@/constants/key_map.json')

export default class FilterKeyword extends React.Component {
    state = {
      treeValue: [],
      categories: [],
    }

    getNewData = () => {
      const treeValue = []
      this.props.categories.forEach((e, index) => {
        if (index % 2 === 0) {
          for (const i in key_map) {
            if (key_map[i].cn === e) {
              treeValue.push(i)
            }
          }
        }
      })
      this.setState({
        categories: this.props.categories,
        treeValue,
      })
    }

    getMyData = () => {
      return this.state.categories
    }

    selectCategory = async (keyList) => {
      const categories = []
      keyList.forEach((key) => {
        categories.push(key_map[key]['cn'])
        categories.push(key_map[key]['en'])
      })
      if (keyList.length > 250) {
        message.error('后端服务暂不支持超过250项聚类，请减少聚类数量')
        return
      }
      await this.setState({ categories, treeValue: keyList })
    }

    render() {
      const { treeValue } = this.state
      return (
        <div>
          <div style={{ marginTop: 10 }}>
            <span>
              聚类圈选：&nbsp;&nbsp;
            </span>
            <TreeSelect
              treeData={myData}
              value={treeValue}
              maxTagCount={6}
              maxTagPlaceholder={(omittedValues) => {
                return `其他${omittedValues.length - 1}个类`
              }}
              treeCheckable
              showSearch
              showCheckedStrategy="SHOW_ALL"
              style={{ width: 450 }}
              onChange={this.selectCategory}
              treeNodeFilterProp="title"
            />
          </div>
        </div>
      )
    }
}
