/* eslint-disable jsx-a11y/label-has-for */
import React from 'react'
import { Icon, Input, Form, Card, Button, message } from 'antd'
import moment from 'moment'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { register } from '@/services/index'

@connect()
class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      info: '',
      email: '',
      msg: '请输入邮箱',
    }
  }

    mailOnChange = async (event) => {
      this.setState({ email: event.target.value })
      const data = await this.checkName(event.target.value)
      this.setState({ msg: data })
    };

    passwordOnChange = (event) => {
      this.setState({ password: event.target.value })
    };

    checkName = async (email) => {
      if (email.length === 0) {
        return '请输入邮箱'
      }
      const reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      const data = reg.test(email)
      if (data === false && email !== 'caojin') {
        return '请输入正确的邮件格式'
      } else {
        return 'true'
      }
    }

    submit = () => {
      const { username, password, email } = this.state
      if (email.length === 0) {
        this.setState({ info: '请输入邮箱!' })
        return
      }
      if (username.length === 0) {
        this.setState({ info: '请输入用户名!' })
        return
      }
      if (password.length === 0) {
        this.setState({ info: '请输入密码!' })
        return
      }
      this.setState({ info: '' })
      this.login(username, password, email)
    }

    login = async (username, password, email) => {
      window.localStorage.clear()
      const data = await register({
        email,
        username,
        password,
      })
      if (data.status === '10000') {
        window.localStorage.setItem('uid', data.uid)
        window.localStorage.setItem('username', data.username)
        window.localStorage.setItem('expire', moment().subtract(-2, 'hours').format('YYYY-MM-DD HH:mm:ss'))
        this.setState({ info: '' })
        message.success('注册成功！')
        this.props.dispatch(routerRedux.push({
          pathname: '/foreign-news/index',
        }))
      } else {
        message.error('注册失败！请检查用户名密码，稍后再试')
        this.setState({ info: data.msg })
      }
      // const postData = `username=${username}&password=${password}`
      // const url = 'https://api2.newsminer.net/svc/ForeignLogin/login'
      // const url ='http://localhost:8080/svc/ForeignLogin/login';
      // fetch(url, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/x-www-form-urlencoded',
      //   },
      //   body: postData,
      // }).then(response => response.json()) // /解析json数据
      //   .then((result) => {
      //     if (result.status === '10000') {
      //       global.setCookie('id', result.uid, 7)
      //       global.setCookie('un', username, 7)
      //       this.setState({ info: '' })
      //     } else {
      //       this.setState({ info: result.msg })
      //     }
      //   })
      //   .catch(e => console.log('错误:', e))
    }

    render() {
      const { info, msg } = this.state
      return (
        <div style={{ width: 300, margin: '30vh auto' }}>
          <Card>
            <h1 style={{ margin: '10px auto', width: '100%', textAlign: 'center' }}>科普新闻平台注册</h1>
            <Form>
              <Form.Item
                validateStatus={msg === 'true' ? 'success' : 'error'}
                help={msg === 'true' ? '' : msg}
              >
                <Input
                  prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="请输入邮箱"
                  onChange={this.mailOnChange}
                />
              </Form.Item>
              <Form.Item>
                <Input
                  prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="请输入用户名"
                  onChange={e => this.setState({ username: e.target.value })}
                />
              </Form.Item>
              <Form.Item>
                <Input
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type="password"
                  placeholder="请输入密码"
                  onChange={this.passwordOnChange}
                />
              </Form.Item>
              <Form.Item>
                <label style={{ color: 'red' }}>{info}</label>
              </Form.Item>
              <Form.Item>
                <div style={{ textAlign: 'center' }}>
                  <Button
                    type="primary"
                    onClick={this.submit}
                    style={{ width: '100%' }}
                  >
                    注册
                  </Button>
                  <br />
                  <Button
                    onClick={() => this.props.dispatch(routerRedux.push({
                      pathname: '/foreign-news/login',
                    }))}
                    style={{ width: '100%' }}
                  >
                    已有账号？返回登录
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </div>
      )
    }
}

export default Login
