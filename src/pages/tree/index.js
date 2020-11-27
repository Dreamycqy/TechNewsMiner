import React from 'react'
import { Input, Tree, Divider, Table, Icon, Tooltip, Button } from 'antd'
import _ from 'lodash'
import User from '../home/user'

const { TreeNode } = Tree
const { Search } = Input
let dataList = []
const gData = require('@/constants/tree_cn.json')
const key_map = require('@/constants/key_map.json')

const dataSource = [{
  name: '风洞技术',
  recommand: ['大型飞机技术'],
}, {
  name: '机场地面引导',
  recommand: ['通用航空', '空中交通管制监视技术'],
}, {
  name: '中药原理',
  recommand: ['现代中医药技术'],
}]

class Collect extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
      selectKey: '',
    }
  }

  componentWillMount() {
    dataList = []
    for (const i in key_map) { // eslint-disable-line
      dataList.push({
        title: key_map[i].cn,
        key: i,
      })
    }
  }

  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    })
  }

  onChange = (e) => {
    const { value } = e.target
    const expandedKeys = dataList
      .map((item) => {
        if (item.title.indexOf(value) > -1) {
          return this.getParentKey(item.key, gData)
        }
        return null
      })
      .filter((item, i, self) => item && self.indexOf(item) === i)
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    })
  }

  onSelect = async (keys) => {
    if (keys.length === 0) {
      return
    }
    await this.setState({
      selectKey: keys[0],
    })
  }

  getParentKey = (key, tree) => {
    let parentKey
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i]
      if (node.children) {
        if (node.children.some(item => item.key === key)) {
          parentKey = node.key
        } else if (this.getParentKey(key, node.children)) {
          parentKey = this.getParentKey(key, node.children)
        }
      }
    }
    return parentKey
  }

  handleSelect = (name) => {
    this.onChange({
      target: {
        value: name,
      },
    })
    this.setState({ selectKey: _.find(dataList, { title: name }).key })
  }

  loop = data => data.map((item) => {
    const { searchValue } = this.state
    const index = item.title.indexOf(searchValue)
    const beforeStr = item.title.substr(0, index)
    const afterStr = item.title.substr(index + searchValue.length)
    const title = index > -1 ? (
      <span>
        {beforeStr}
        <span style={{ color: '#f50' }}>{searchValue}</span>
        {afterStr}
      </span>
    ) : (
      <span>{item.title}</span>
    )
    if (item.children) {
      return (
        <TreeNode key={item.key} title={title}>
          {this.loop(item.children)}
        </TreeNode>
      )
    }
    return <TreeNode key={item.key} title={title} />
  })

  render() {
    const { expandedKeys, autoExpandParent, searchValue, selectKey } = this.state
    const columns = [{
      title: '新概念名称',
      dataIndex: 'name',
    }, {
      title: '来源',
      render: () => {
        return (
          <div>
            <a href="javascript:;">文章标题</a>
          </div>
        )
      },
    }, {
      title: '推荐父级',
      render: (text, record) => {
        return (
          <div>
            {record.recommand.map((e, index) => {
              return (
                <span>
                  <a href="javascript:;" onClick={() => this.handleSelect(e)}>{e}</a>
                  <span style={{ display: index !== record.recommand.length - 1 ? 'inline-block' : 'none' }}>，&nbsp;</span>
                </span>
              )
            })}
          </div>
        )
      },
    }, {
      title: '操作',
      render: () => {
        return (
          <div>
            <a href="javascript:;">确定</a>
            <Divider type="vertical" />
            <a href="javascript:;">删除</a>
          </div>
        )
      },
    }]
    return (
      <div style={{ minHeight: 660 }}>
        <div style={{ overflow: 'hidden', height: 32, lineHeight: '32px', backgroundColor: '#001529' }}>
          <div style={{ float: 'left' }}>
            <div style={{ marginLeft: 40, fontSize: 14, fontWeight: 600, display: 'inline-block' }}>
              <a href="/foreign-news/index">科普新闻发现</a>
            </div>
          </div>
          <div style={{ float: 'right', marginRight: 40 }}>
            <User />
          </div>
        </div>
        <div style={{ float: 'left', width: 400, borderRight: '1px solid #e8e8e8', padding: 10, height: 600, overflow: 'scroll' }}>
          <div>
            <Search style={{ marginBottom: 8 }} placeholder="Search" value={searchValue} onChange={this.onChange} />
            <Tree
              onExpand={this.onExpand}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              selectedKeys={[selectKey]}
              onSelect={this.onSelect}
              blockNode
            >
              {this.loop(gData)}
            </Tree>
          </div>
        </div>
        <div style={{ overflow: 'hidden', padding: 20 }}>
          <div style={{ height: 42 }}>
            <div style={{ float: 'left', fontSize: 20, fontWeight: 700 }}>
              知识概念树标注
            </div>
            <div style={{ fontSize: 14, float: 'left', margin: '4px 0 0 10px' }}>
              <Tooltip title="将自动采集和手动添加的新概念，挂在左侧概念树的选中节点下。" placement="right">
                <Icon type="question-circle" />
              </Tooltip>
            </div>
          </div>
          <div style={{ height: 50 }}>
            <h3 style={{ color: '#000000a6', float: 'left', marginTop: 4 }}>
              当前选中父级概念：
              <span style={{ color: '#24b0e6' }}>{key_map[selectKey] ? key_map[selectKey].cn : ''}</span>
            </h3>
            <Button type="primary" style={{ float: 'right', marginRight: 20 }}>添加新概念</Button>
          </div>
          <Table
            dataSource={dataSource}
            columns={columns}
          />
        </div>
      </div>
    )
  }
}
export default Collect
