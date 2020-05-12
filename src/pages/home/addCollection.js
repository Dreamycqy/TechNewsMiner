import React from 'react'
import { Modal, Input, Button, message, Form } from 'antd'
import uuid from 'uuid'
import moment from 'moment'

const { TextArea } = Input

class AddCollect extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      name: '',
      desc: '',
    }
  }

  openModal = async () => {
    if (this.props.checkedIdList.length === 0) {
      message.error('未选择任何新闻条目！')
      return
    }
    await this.setState({ visible: true, name: '', desc: '' })
  }

  addCollcetion = () => {
    const { name, desc } = this.state
    const checkedList = []
    this.props.checkedIdList.forEach((id) => {
      this.props.allDataList.forEach((data) => {
        if (id === data.news_ID) {
          checkedList.push(data)
        }
      })
    })
    const dataSource = JSON.parse(window.localStorage.collection || '[]')
    dataSource.push({
      id: uuid(),
      name,
      desc,
      checkedList,
      time: moment().format('YYYY-MM-DD HH:mm'),
      searchText: this.props.searchText,
    })
    window.localStorage.setItem('collection', JSON.stringify(dataSource))
    this.setState({ visible: false })
  }

  render() {
    const {
      visible, name, desc,
    } = this.state
    return (
      <div style={{ display: 'inline-block' }}>
        <Button style={{ backgroundColor: '#FFA500', borderColor: '#FFA500' }} type="primary" onClick={() => this.openModal()}>添加收藏</Button>
        <Modal
          title="添加收藏"
          visible={visible}
          onOk={() => this.addCollcetion()}
          onCancel={() => this.setState({ visible: false })}
          width="550px"
        >
          <Form layout="inline">
            <Form.Item label="搜索关键词">
              {this.props.searchText}
            </Form.Item>
            <br />
            <Form.Item
              label="收藏名称"
              hasFeedback
              validateStatus={name.length > 0 ? 'success' : 'error'}
              help={name.length > 0 ? '' : '收藏名称必须填写'}
            >
              <Input
                style={{ marginBottom: 20, width: 400 }} value={name}
                onChange={e => this.setState({ name: e.target.value })}
              />
            </Form.Item>
            <br />
            <Form.Item label="收藏备注">
              <TextArea
                value={desc} rows={4}
                style={{ width: 400 }}
                onChange={e => this.setState({ desc: e.target.value })}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }
}
export default AddCollect
