import React from 'react'
import { Modal, Input, Button, message, Form, Select, Radio } from 'antd'
import uuid from 'uuid'
import _ from 'lodash'
import moment from 'moment'

const { TextArea } = Input
const { Option } = Select

class AddCollect extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      name: '',
      desc: '',
      dataSource: [],
      addType: 'add',
      selectid: '',
    }
  }

  onChangeRadio = (e) => {
    const { selectid, dataSource } = this.state
    this.setState({ addType: e.target.value })
    if (e.target.value === 'edit' && selectid === '') {
      this.setState({ selectid: dataSource[0].id })
    }
  }

  openModal = async () => {
    if (this.props.checkedIdList.length === 0) {
      message.error('未选择任何新闻条目！')
      return
    }
    await this.setState({
      visible: true,
      name: '',
      desc: '',
      addType: 'add',
      selectid: '',
      dataSource: JSON.parse(window.localStorage.collection || '[]'),
    })
  }

  addCollcetion = () => {
    const { name, desc, dataSource, addType } = this.state
    const checkedList = []
    this.props.checkedIdList.forEach((id) => {
      this.props.allDataList.forEach((data) => {
        if (id === data.news_ID) {
          checkedList.push(data)
        }
      })
    })
    if (addType === 'add') {
      dataSource.push({
        id: uuid(),
        name,
        desc,
        checkedList,
        time: moment().format('YYYY-MM-DD HH:mm'),
        searchText: this.props.searchText,
      })
    } else {
      const target = _.find(dataSource, { id: this.state.selectid })
      target.checkedList = _.uniqBy(target.checkedList.concat(checkedList), 'news_ID')
      let array = target.searchText.split(' ')
      array = array.concat(this.props.searchText.split(' '))
      target.searchText = _.uniq(array).join(' ')
    }
    window.localStorage.setItem('collection', JSON.stringify(dataSource))
    this.setState({ visible: false })
  }

  renderOption = (arr) => {
    const result = []
    arr.forEach((e) => {
      result.push(
        <Option key={e.id} value={e.id}>
          {e.name}
          &nbsp;-&nbsp;
          <span color="#e8e8e8">
            {e.desc}
            &nbsp;
            {e.time}
          </span>
        </Option>,
      )
    })
    return result
  }

  render() {
    const {
      visible, name, desc, dataSource, addType, selectid,
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
              label="添加类型"
            >
              <Radio.Group onChange={this.onChangeRadio} value={addType}>
                <Radio value="add">新增收藏</Radio>
                <Radio value="edit" disabled={dataSource.length === 0}>从现有收藏中选择</Radio>
              </Radio.Group>
            </Form.Item>
            <br />
            <Form.Item
              label="现有收藏"
              style={{ display: addType === 'edit' ? 'block' : 'none' }}
            >
              <Select
                style={{ marginBottom: 20, width: 400 }} value={selectid}
                onChange={value => this.setState({ selectid: value })}
              >
                {this.renderOption(dataSource)}
              </Select>
            </Form.Item>
            <br />
            <Form.Item
              label="收藏名称"
              hasFeedback
              style={{ display: addType === 'add' ? 'block' : 'none' }}
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
