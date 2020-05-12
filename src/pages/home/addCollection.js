import React from 'react'
import { Modal, Input, Button } from 'antd'
import uuid from 'uuid'

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
          width="700px"
        >
          <div>
            收藏名称：&nbsp;
            <Input
              style={{ marginBottom: 20 }} value={name}
              onChange={e => this.setState({ name: e.target.value })}
            />
            收藏备注：&nbsp;
            <TextArea
              value={desc} rows={4}
              onChange={e => this.setState({ desc: e.target.value })}
            />
          </div>
        </Modal>
      </div>
    )
  }
}
export default AddCollect
