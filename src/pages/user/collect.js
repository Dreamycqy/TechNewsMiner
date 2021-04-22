import React from 'react'
import { Input, Button, Form, Checkbox, Icon, message, Tree } from 'antd'
import { connect } from 'dva'
import { updateProfile } from '@/services/index'
import FilterKw from '@/pages/home/filterKeywordcopy'

const treeData = require('@/constants/simpleTree.json')

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 },
  style: { width: 600, marginTop: 10 },
}
const { localStorage } = window
const { TreeNode } = Tree

function mapStateToProps(state) {
  const { userInfo } = state.global
  return {
    userInfo,
  }
}
@connect(mapStateToProps)
class Collect extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      collapsed: false,
      email: '',
      category: [],
      checkedKeys: [],
      pushType: [],
      buttonLoading: false,
    }
  }

  componentWillMount() {
    const { userInfo } = this.props
    if (userInfo) {
      const { email, category, pushType } = userInfo
      this.setState({
        email,
        category,
        pushType,
      })
      const target = category[category.length - 1]
      if (target) {
        if (target[0] === '[') {
          this.setState({ checkedKeys: JSON.parse(target), category: category.slice(0, category.length - 1) })
        }
      }
    } else {
      this.setState({
        email: '',
        category: [],
        pushType: [],
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    const { userInfo } = nextProps
    if (userInfo) {
      const { email, category, pushType } = userInfo
      this.setState({
        email,
        category,
        pushType,
      })
      const target = category[category.length - 1]
      if (target) {
        if (target[0] === '[') {
          this.setState({ checkedKeys: JSON.parse(target), category: category.slice(0, category.length - 1) })
        }
      }
    } else {
      this.setState({
        email: '',
        category: [],
        pushType: [],
      })
    }
  }

  onCollapse = () => {
    this.setState({ collapsed: !this.state.collapsed })
  }

  onCheck = (checkedKeys) => {
    this.setState({ checkedKeys })
  }

  checkEmail = (strEmail) => {
    if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(strEmail)) {
      return false
    } else {
      return true
    }
  }

  saveData = async () => {
    const { email, category, pushType, checkedKeys } = this.state
    this.setState({ buttonLoading: true })
    this.filterKw.updateFilterKeyword()
    const temp = JSON.parse(JSON.stringify(category))
    temp.push(JSON.stringify(checkedKeys))
    const data = await updateProfile({
      email,
      category: JSON.stringify(temp),
      pushType: JSON.stringify(pushType),
    })
    if (data) {
      message.success('更新成功！')
    } else {
      message.error('更新失败！')
    }
    this.setState({ buttonLoading: false })
  }

  returnData = () => {
    const { params } = localStorage
    if (params) {
      const { email, category } = JSON.parse(params)
      this.setState({
        email,
        category,
      })
    } else {
      this.setState({
        email: '',
        category: [],
      })
    }
  }

  goBack = () => {
    window.location.href = '/foreign-news/index'
  }

  renderTreeNodes = data => data.map((item) => {
    if (item.children) {
      return (
        <TreeNode title={item.title} key={item.key} dataRef={item}>
          {this.renderTreeNodes(item.children)}
        </TreeNode>
      )
    }
    return <TreeNode key={item.key} {...item} />
  })

  render() {
    const { email, category, pushType, buttonLoading, checkedKeys } = this.state
    return (
      <div style={{ margin: 20 }}>
        <div style={{ position: 'absolute', right: 30, top: 30 }}>
          <Button type="primary" onClick={() => this.goBack()}>返回</Button>
        </div>
        <Form style={{ margin: '60px 0 0 30px' }} layout="inline">
          <Form.Item
            {...formItemLayout} label={(
              <span>
                <Icon type="sound" style={{ color: '#888' }} />
              &nbsp;推送方式
              </span>
            )}
          >
            <Checkbox.Group value={pushType} onChange={value => this.setState({ pushType: value })} style={{ width: '100%', paddingLeft: 10 }}>
              <Checkbox value="A">电子邮件</Checkbox>
              <Checkbox value="B">微信订阅</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <br />
          <Form.Item
            {...formItemLayout}
            label={(
              <span>
                <Icon type="mail" style={{ color: '#888' }} />
                &nbsp;邮件地址
              </span>
            )}
            hasFeedback
            validateStatus={this.checkEmail(email) ? 'success' : 'error'}
          >
            <Input
              style={{ width: 300, marginLeft: 10 }}
              value={email} onChange={e => this.setState({ email: e.target.value })}
            />
          </Form.Item>
          <br />
          {/* <Form.Item
            {...formItemLayout} label={(
              <span>
                <Icon type="wechat" style={{ color: '#888' }} />
              &nbsp;微信秘钥&nbsp;
                <Icon type="question-circle" theme="twoTone" />
              </span>
            )}
          >
            <div style={{ paddingLeft: 10 }}>{wechatId}</div>
          </Form.Item> */}
          <Form.Item
            {...formItemLayout} label={(
              <span>
                <Icon type="apartment" style={{ color: '#888' }} />
              &nbsp;分类订阅&nbsp;
              </span>
            )}
          >
            <Checkbox.Group
              value={category}
              onChange={value => this.setState({ category: value })}
              style={{ width: '100%', paddingLeft: 10 }}
            >
              <Checkbox value="NewTech">前沿技术</Checkbox>
              <Checkbox value="Medicine">健康医疗</Checkbox>
              <Checkbox value="Danger">应急避险</Checkbox>
              <br />
              <Checkbox value="Internet">信息科技</Checkbox>
              <Checkbox value="Energy">能源利用</Checkbox>
              <Checkbox value="Environment">气候环境</Checkbox>
              <br />
              <Checkbox value="Food">食品安全</Checkbox>
              <Checkbox value="Space">航空航天</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item
            {...formItemLayout} label={(
              <span>
                <Icon type="apartment" style={{ color: '#888' }} />
              &nbsp;概念树订阅&nbsp;
              </span>
            )}
          >
            <Tree
              checkable
              onCheck={this.onCheck}
              checkedKeys={checkedKeys}
            >
              {this.renderTreeNodes(treeData)}
            </Tree>
          </Form.Item>
          <Form.Item
            {...formItemLayout} label={(
              <span>
                <Icon type="tags" style={{ color: '#888' }} />
              &nbsp;关键词订阅&nbsp;
              </span>
            )}
          >
            <FilterKw init={this.props.init} ref={e => this.filterKw = e} />
          </Form.Item>
        </Form>
        <div style={{ marginTop: 20, marginLeft: 300 }}>
          <Button type="primary" loading={buttonLoading} onClick={() => this.saveData()}>更新</Button>
          <Button style={{ marginLeft: 30 }} onClick={() => this.returnData()}>取消</Button>
        </div>
      </div>
    )
  }
}
export default Collect
