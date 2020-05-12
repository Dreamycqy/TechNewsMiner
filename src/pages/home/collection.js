import React from 'react'
import { Modal, Table, Button } from 'antd'

class Collection extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      dataSource: [],
    }
  }

  openModal = async () => {
    await this.setState({
      visible: true,
      dataSource: JSON.parse(window.localStorage.collection || '[]'),
    })
  }

  jump = (id) => {
    window.open(`/abstract?id=${id}`)
  }

  handleDeleteRow = (id) => {
    const dataSource = [...this.state.dataSource]
    this.setState({ dataSource: dataSource.filter(item => item.id !== id) })
  }

  changeList = () => {
    const { dataSource } = this.state
    window.localStorage.setItem('collection', JSON.stringify(dataSource))
    this.setState({ visible: false })
  }

  render() {
    const {
      visible, dataSource,
    } = this.state
    const columns = [{
      title: 'ID',
      dataIndex: 'id',
      render: (text, record) => {
        return (
          <a href="javascript:;" onClick={() => this.jump(record.id)}>
            {text}
          </a>
        )
      },
    }, {
      title: '名称',
      dataIndex: 'name',
    }, {
      title: '搜索词',
      dataIndex: 'searchText',
    }, {
      title: '描述',
      dataIndex: 'desc',
    }, {
      title: '收藏新闻数',
      render: (text, record) => {
        return (
          <span>{record.checkedList.length}</span>
        )
      },
    }, {
      title: '操作',
      width: 60,
      render: (text, record) => {
        return (
          <a href="javascript:;" onClick={() => this.handleDeleteRow(record.id)}>
            删除
          </a>
        )
      },
    }]
    return (
      <div style={{ display: 'inline-block', marginLeft: 10 }}>
        <Button style={{ backgroundColor: '#43CD80', borderColor: '#43CD80' }} type="primary" onClick={() => this.openModal()}>收藏列表</Button>
        <Modal
          title="收藏列表"
          visible={visible}
          onOk={() => this.changeList()}
          onCancel={() => this.setState({ visible: false })}
          width="1000px"
        >
          <Table
            dataSource={dataSource}
            columns={columns}
            rowKey="id"
          />
        </Modal>
      </div>
    )
  }
}
export default Collection
