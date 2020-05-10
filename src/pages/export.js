import React from 'react'
import { Button, Modal, Form, Icon, Input, notification } from 'antd'
import * as jsPDF from 'jspdf'

window.jsPDF = jsPDF

const openNotificationWithIcon = (type, info) => {
  notification[type]({
    message: info,
    duration: 1.5,
  })
}

function getCookie(cname) {
  const name = `${cname}=`
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim()
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length)
  }
  return ''
}

export default class Export extends React.Component {
    state = {
      visible: false,
    };

    hideModal = () => {
      this.setState({
        visible: false,
      })
    };

    getEmailAddresses = () => {
      this.formRef.getEmail().addresses.forEach((address) => {
        this.sendEmail(address)
      })
      this.hideModal()
    };

    componentDidMount() {
      const script = document.createElement('script')
      script.src = '/static/simsun-normal.js'
      document.body.appendChild(script)
    }

    openEmailModal = () => {
      this.setState({
        visible: true,
      })
    };

    sendEmail = (address) => {
      const checkedList = []
      this.props.checkedIdList.forEach((id) => {
        this.props.allDataList.forEach((data) => {
          if (id === data.news_ID) {
            checkedList.push(data)
          }
        })
      })
      const formData = new URLSearchParams()
      formData.set('emailAddress', address)
      formData.set('data', JSON.stringify(checkedList))

      const url = `${global.domainName.api}/svc/techEmail/exportEmail`
      const id = getCookie('id')
      let myRequest
      if (id) {
        const myHeader = new Headers()
        myHeader.append('Authorization', id)
        myRequest = new Request(url, { headers: myHeader })
      } else {
        myRequest = new Request(url)
      }
      fetch(myRequest, {
        method: 'post',
        body: formData,
      })
        .then(response => response.json())
        .then((data) => {
          if (data.code === '200') {
            openNotificationWithIcon('success', address + data.description)
          } else {
            openNotificationWithIcon('error', address + data.description)
            console.log(`发送失败:${data.description}`)
          }
        })
        .catch((e) => {
          console.log(e)
          openNotificationWithIcon('error', `${address}发送失败`)
        })
    };

    download = () => {
      function redirect(url) {
        return `https://newsminer.net/link.html?url=${url}`
      }

      const checkedList = []
      this.props.checkedIdList.forEach((id) => {
        this.props.allDataList.forEach((data) => {
          if (id === data.news_ID) {
            checkedList.push(data)
          }
        })
      })
      const imgTime = 'data:image/png;base64,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'
      const imgEarch = 'data:image/png;base64,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'
      if (checkedList.length === 0) {
        openNotificationWithIcon('error', '未选中任何新闻或事件')
        return
      }

      const doc = new jsPDF()
      doc.setFont('simsun')
      doc.setFontType('normal')

      let verticalOffset = 20
      for (const i in checkedList) {
        const item = checkedList[i]

        doc.setFontSize(10)
        const titleLine = doc.splitTextToSize(item.news_Title.replace(/<em style='color:red'>/g, '').replace('</em>', ''), 150)
        doc.textWithLink(titleLine, 20, verticalOffset, { url: redirect(item.news_URL) })
        verticalOffset += titleLine.length * 5

        doc.setFontSize(8)
        doc.addImage(imgTime, 'JPEG', 20, verticalOffset - 2.5, 2.5, 2.5)
        doc.text(24, verticalOffset, item.news_Time)
        doc.addImage(imgEarch, 'JPEG', 54, verticalOffset - 2.5, 2.5, 2.5)
        doc.text(58, verticalOffset, item.news_Source)
        verticalOffset += 4

        const contentLines = doc.splitTextToSize(`${item.news_Content.replace(/<em style='color:red'>/g, '').replace(/<\/em>/g, '')}...`, 210)
        doc.setFontSize(6)
        doc.text(20, verticalOffset, contentLines)
        verticalOffset += contentLines.length * 3

        doc.setLineWidth(0.2)
        doc.setDrawColor('#C7C7C7')
        doc.line(20, verticalOffset, 190, verticalOffset)
        verticalOffset += 10

        const a = verticalOffset % 270
        if (a < 40) {
          doc.addPage()
          verticalOffset = 20
        }
      }
      const myDate = new Date()
      const Y = myDate.getFullYear()
      const M = (myDate.getMonth() + 1 < 10 ? `0${myDate.getMonth() + 1}` : myDate.getMonth() + 1)
      const D = myDate.getDate()
      const name = `科普新闻-${Y}${M}${D}.pdf`
      doc.save(name)
    };

    render() {
      const style = {
        margin: 15,
      }
      return (
        <div>
          <Button style={style} className="gutter-box" type="primary" onClick={this.download} icon="export">
            导出到PDF
          </Button>
          <br />
          {/* <Button style={style} className="gutter-box" type="primary" icon="export" onClick={this.openEmailModal}> */}
          {/*    导出到Email */}
          {/* </Button> */}
          <Modal
            title="请输入要导出的邮件地址"
            visible={this.state.visible}
            onCancel={this.hideModal}
            destroyOnClose
            onOk={this.getEmailAddresses}
            okText="发送"
            cancelText="取消"
          >
            <WrappedDynamicFieldSet hideModal={this.hideModal} wrappedComponentRef={form => this.formRef = form} />
          </Modal>
        </div>
      )
    }
}

let id = 1

class DynamicFieldSet extends React.Component {
    remove = (k) => {
      const { form } = this.props
      const keys = form.getFieldValue('keys')
      if (keys.length === 1) {
        return
      }
      form.setFieldsValue({
        keys: keys.filter(key => key !== k),
      })
    };

    add = () => {
      const { form } = this.props
      const keys = form.getFieldValue('keys')
      const nextKeys = keys.concat(id++)
      form.setFieldsValue({
        keys: nextKeys,
      })
    };

    getEmail = () => {
      return this.props.form.getFieldsValue()
    };

    render() {
      const { getFieldDecorator, getFieldValue } = this.props.form
      getFieldDecorator('keys', { initialValue: [0] })
      const keys = getFieldValue('keys')
      const formItems = keys.map(k => (
        <Form.Item
          required={false}
          key={k}
        >
          {getFieldDecorator(`addresses[${k}]`, {
            validateTrigger: ['onBlur'],
            rules: [
              {
                required: true,
                whitespace: true,
                message: '请输入正确的邮件地址或删除本输入框',
                type: 'email',
              },
            ],
          })(<Input placeholder="Input your email." style={{ width: '90%', marginRight: 8 }} />)}
          {keys.length > 1 ? (
            <Icon
              className="dynamic-delete-button"
              type="minus-circle-o"
              onClick={() => this.remove(k)}
            />
          ) : null}
        </Form.Item>
      ))
      return (
        <Form>
          {formItems}
          <Form.Item>
            <Button type="dashed" onClick={this.add} style={{ width: '90%' }}>
              <Icon type="plus" />
              {' '}
              添加邮件地址
            </Button>
          </Form.Item>
        </Form>
      )
    }
}

const WrappedDynamicFieldSet = Form.create({ name: 'dynamic_form_item' })(DynamicFieldSet)
