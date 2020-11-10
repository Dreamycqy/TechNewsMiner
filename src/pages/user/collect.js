import React from 'react'
import { Input, Button, Form, Checkbox, Icon, message } from 'antd'
import uuid from 'uuid'
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
      fields: [],
      wechatId: '',
    }
  }

  componentWillMount() {
    const { params } = localStorage
    if (params) {
      const { email, wechatId, fields } = JSON.parse(params)
      this.setState({
        email,
        wechatId,
        fields,
      })
    } else {
      this.setState({
        email: '',
        fields: [],
        wechatId: uuid(),
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

  saveData = () => {
    localStorage.params = JSON.stringify(this.state)
    message.success('更新成功！')
  }

  returnData = () => {
    const { params } = localStorage
    if (params) {
      const { email, fields } = JSON.parse(params)
      this.setState({
        email,
        fields,
      })
    } else {
      this.setState({
        email: '',
        fields: [],
      })
    }
  }

  goBack = () => {
    this.props.dispatch(routerRedux.push({
      pathname: '/foreign-news/index',
    }))
  }

  render() {
    const { email, wechatId, fields } = this.state
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
            <Checkbox.Group style={{ width: '100%', paddingLeft: 10 }}>
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
          <Form.Item
            {...formItemLayout} label={(
              <span>
                <Icon type="wechat" style={{ color: '#888' }} />
              &nbsp;微信秘钥&nbsp;
                <Icon type="question-circle" theme="twoTone" />
              </span>
            )}
          >
            <div style={{ paddingLeft: 10 }}>{wechatId}</div>
          </Form.Item>
          <Form.Item
            {...formItemLayout} label={(
              <span>
                <Icon type="apartment" style={{ color: '#888' }} />
              &nbsp;分类订阅&nbsp;
              </span>
            )}
          >
            <Checkbox.Group
              value={fields}
              onChange={value => this.setState({ fields: value })}
              style={{ width: '100%', paddingLeft: 10 }}
            >
              <Checkbox value="A">前沿技术</Checkbox>
              <Checkbox value="B">健康医疗</Checkbox>
              <Checkbox value="3">应急避险</Checkbox>
              <br />
              <Checkbox value="4">信息科技</Checkbox>
              <Checkbox value="5">能源利用</Checkbox>
              <Checkbox value="6">气候环境</Checkbox>
              <br />
              <Checkbox value="7">食品安全</Checkbox>
              <Checkbox value="8">航空航天</Checkbox>
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
