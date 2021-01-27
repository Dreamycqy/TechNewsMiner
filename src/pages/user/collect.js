import React from 'react'
import { Input, Button, Form, Checkbox, Icon, message } from 'antd'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import FilterKw from '@/pages/home/filterKeywordcopy'

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 },
  style: { width: 600, marginTop: 10 },
}
const { localStorage } = window

@connect()
class Collect extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      collapsed: false,
      email: '',
      category: [],
      pushType: [],
    }
  }

  componentWillMount() {
    const { userInfo } = this.props
    if (userInfo) {
      const { email, category, pushType } = userInfo
      this.setState({
        email,
        category: JSON.parse(category),
        pushType: JSON.parse(pushType),
      })
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

  checkEmail = (strEmail) => {
    if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(strEmail)) {
      return false
    } else {
      return true
    }
  }

  saveData = async () => {
    // const { email, category, pushType } = this.state
    // const postData = JSON.stringify({
    //   email, category, pushType,
    // })
    // const data = await
    message.success('更新成功！')
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
    this.props.dispatch(routerRedux.push({
      pathname: '/foreign-news/index',
    }))
  }

  render() {
    const { email, category, pushType } = this.state
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
            <Checkbox.Group value={pushType} style={{ width: '100%', paddingLeft: 10 }}>
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
              <Checkbox value="前沿技术">前沿技术</Checkbox>
              <Checkbox value="健康医疗">健康医疗</Checkbox>
              <Checkbox value="应急避险">应急避险</Checkbox>
              <br />
              <Checkbox value="信息科技">信息科技</Checkbox>
              <Checkbox value="能源利用">能源利用</Checkbox>
              <Checkbox value="气候环境">气候环境</Checkbox>
              <br />
              <Checkbox value="食品安全">食品安全</Checkbox>
              <Checkbox value="航空航天">航空航天</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item
            {...formItemLayout} label={(
              <span>
                <Icon type="tags" style={{ color: '#888' }} />
              &nbsp;关键词订阅&nbsp;
              </span>
            )}
          >
            <FilterKw init={this.props.init} />
          </Form.Item>
        </Form>
        <div style={{ marginTop: 20, marginLeft: 300 }}>
          <Button type="primary" onClick={() => this.saveData()}>更新</Button>
          <Button style={{ marginLeft: 30 }} onClick={() => this.returnData()}>取消</Button>
        </div>
      </div>
    )
  }
}
export default Collect
