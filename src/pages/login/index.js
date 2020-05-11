import React from 'react'
import { Icon, Input, Form, Card, Button, message } from 'antd'
import moment from 'moment'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { login } from '@/services/index'

@connect()
class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      info: '',
    }
  }

    usernameOnChange = (event) => {
      this.setState({ username: event.target.value })
    };

    passwordOnChange = (event) => {
      this.setState({ password: event.target.value })
    };

    submit = () => {
      const { username, password } = this.state
      if (username.length === 0) {
        this.setState({ info: '请输入用户名!' })
        return
      }
      if (password.length === 0) {
        this.setState({ info: '请输入密码!' })
        return
      }
      this.setState({ info: '' })
      this.login(username, password)
    }

    login = async (username, password) => {
      window.localStorage.clear()
      const data = await login({
        username,
        password,
      })
      if (data.status === '10000') {
        window.localStorage.setItem('uid', data.uid)
        window.localStorage.setItem('username', data.username)
        window.localStorage.setItem('expire', moment().subtract(-2, 'hours').format('YYYY-MM-DD HH:mm:ss'))
        this.setState({ info: '' })
        message.success('登录成功！')
        this.props.dispatch(routerRedux.push({
          pathname: '/index',
        }))
      } else {
        message.error('登录失败！请检查用户名或密码')
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
      const { info } = this.state
      const loginPage = (
        <div style={{ width: 300, margin: '30vh auto' }}>
          <Card>
            <h1 style={{ width: 180, margin: '10px auto' }}>科普新闻登录</h1>
            <Form>
              <Form.Item>
                <Input
                  prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="用户名"
                  onChange={this.usernameOnChange}
                />
              </Form.Item>
              <Form.Item>
                <Input
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type="password"
                  placeholder="密码"
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
                  >
                    登录
                  </Button>
                  <Button
                    onClick={() => window.open('https://oauth.newsminer.net/page/register.html')}
                    style={{ marginLeft: 20 }}
                  >
                    注册
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </div>
      )
      return <div>{loginPage}</div>
    }
}

export default Login
