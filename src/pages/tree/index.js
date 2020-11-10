import React from 'react'
import { Input, Tree, Divider, Table } from 'antd'

const { TreeNode } = Tree
const { Search } = Input
const gData = require('@/constants/tree_cn.json')

const dataList = []

const columns = [{
  title: '名称',
  dataIndex: 'name',
}, {
  title: '来源',
  render: (text, record) => {
    return (
      <div>
        <a href="javascript:;">文章标题</a>
      </div>
    )
  },
}, {
  title: '推荐',
  render: (text, record) => {
    return (
      <div>
        {record.recommand.map((e, index) => {
          return (
            <span>
              <a href="javascript:;">{e}</a>
              <span style={{ display: index !== record.recommand.length - 1 ? 'inline-block' : 'none' }}>, </span>
            </span>
          )
        })}
      </div>
    )
  },
}, {
  title: '操作',
  render: (text, record) => {
    return (
      <div>
        <a href="javascript:;">确定</a>
        <Divider type="vertical" />
        <a href="javascript:;">删除</a>
      </div>
    )
  },
}]

const dataSource = [{
  name: '词条1',
  recommand: ['通用航空', '空中交通管制监视技术'],
}, {
  name: '词条2',
  recommand: ['通用航空', '空中交通管制监视技术'],
}, {
  name: '词条3',
  recommand: ['通用航空', '空中交通管制监视技术'],
}, {
  name: '词条4',
  recommand: ['通用航空', '空中交通管制监视技术'],
}, {
  name: '词条5',
  recommand: ['通用航空', '空中交通管制监视技术'],
}, {
  name: '词条6',
  recommand: ['通用航空', '空中交通管制监视技术'],
}, {
  name: '词条7',
  recommand: ['通用航空', '空中交通管制监视技术'],
}, {
  name: '词条8',
  recommand: ['通用航空', '空中交通管制监视技术'],
}, {
  name: '词条9',
  recommand: ['通用航空', '空中交通管制监视技术'],
}, {
  name: '词条10',
  recommand: ['通用航空', '空中交通管制监视技术'],
}]

class Collect extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
    }
  }

  componentWillMount() {
    this.generateList(gData)
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

  generateList = (data) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i]
      const { key } = node
      dataList.push({ key, title: key })
      if (node.children) {
        this.generateList(node.children)
      }
    }
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
    const { expandedKeys, autoExpandParent } = this.state
    return (
      <div style={{ margin: 20 }}>
        <div style={{ float: 'left', width: 400, borderRight: '1px solid #e8e8e8', padding: 10 }}>
          <div>
            <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={this.onChange} />
            <Tree
              onExpand={this.onExpand}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
            >
              {this.loop(gData)}
            </Tree>
          </div>
        </div>
        <div style={{ overflow: 'hidden' }}>
          {/* <div style={{ height: 60 }}>
            <div style={{ float: 'left', marginRight:  }}>

            </div>
          </div> */}
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
