import React from 'react'
import { Button, Icon, Input, Modal, Tag, Tooltip, notification } from 'antd'

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

export default class FilterKeyword extends React.Component {
    state = {
      visible: false,
      filterKeyword: [],
      inputVisible: false,
      inputValue: '',
    };

    componentWillMount() {
      const url = 'https://api2.newsminer.net/svc/Foreign/getFilterKeyword'
      // const url = 'http://localhost:8080/svc/Foreign/getFilterKeyword';
      const id = getCookie('id')
      let myRequest
      if (id) {
        const myHeader = new Headers()
        myHeader.append('Authorization', id)
        myRequest = new Request(url, { headers: myHeader })
      } else {
        myRequest = new Request(url)
      }
      fetch(myRequest)
        .then(response => response.json()) // /解析json数据
        .then((data) => {
          if (data.code === '200') {
            const filterKeyword = JSON.parse(data.description)
            this.setState({
              filterKeyword,
            })
          }
        })
        .catch(e => console.log('错误:', e)) // /请求出错
    }

    updateFilterKeyword = () => {
      const { init } = this.props
      const formData = new URLSearchParams()
      formData.set('filterKeyword', JSON.stringify(this.state.filterKeyword))

      const updateApi = 'https://api2.newsminer.net/svc/Foreign/updateFilterKeyword'
      // const updateApi = 'http://localhost:8080/svc/Foreign/updateFilterKeyword';
      const id = getCookie('id')
      let myRequest
      if (id) {
        const myHeader = new Headers()
        myHeader.append('Authorization', id)
        myRequest = new Request(updateApi, { headers: myHeader })
      } else {
        myRequest = new Request(updateApi)
      }
      fetch(myRequest, {
        method: 'post',
        body: formData,
        mode: 'cors',
      })
        .then(response => response.json())
        .then((data) => {
          console.log(data)
          openNotificationWithIcon('success', '更新成功')
          init()
        })
        .catch((e) => {
          console.log(e)
          openNotificationWithIcon('error', '更新失败')
        })
      this.setState({
        visible: false,
      })
    };

    hideModal = () => {
      this.setState({
        visible: false,
        filterKeyword: [],
      })
    };


    showModal = () => {
      this.setState({
        visible: true,
      })
    };

    handleClose = (removedTag) => {
      const filterKeyword = this.state.filterKeyword.filter(tag => tag !== removedTag)
      this.setState({ filterKeyword })
    };

    showInput = () => {
      this.setState({ inputVisible: true }, () => this.input.focus())
    };

    handleInputChange = (e) => {
      this.setState({ inputValue: e.target.value })
    };

    handleInputConfirm = () => {
      const { inputValue } = this.state
      let { filterKeyword } = this.state
      if (inputValue && filterKeyword.indexOf(inputValue) === -1) {
        filterKeyword = [...filterKeyword, inputValue]
      }
      this.setState({
        filterKeyword,
        inputVisible: false,
        inputValue: '',
      })
    };

    saveInputRef = input => (this.input = input);

    render() {
      const style = { margin: 15 }
      const { filterKeyword, inputVisible, inputValue } = this.state
      return (
        <div>
          <Button style={style} onClick={this.showModal} className="gutter-box" type="primary" icon="filter">
            过滤关键词
          </Button>
          <Modal
            title="过滤关键词管理"
            visible={this.state.visible}
            onCancel={this.hideModal}
            onOk={this.updateFilterKeyword}
            destroyOnClose
            okText="确认"
            cancelText="取消"
          >
            {filterKeyword.map((tag) => {
              const isLongTag = tag.length > 20
              const tagElem = (
                <Tag
                  key={tag} closable
                  style={{ margin: 5 }}
                  onClose={() => this.handleClose(tag)}
                >
                  {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                </Tag>
              )
              return isLongTag ? (
                <Tooltip title={tag} key={tag}>
                  {tagElem}
                </Tooltip>
              ) : (
                tagElem
              )
            })}
            {inputVisible && (
            <Input
              ref={this.saveInputRef}
              type="text"
              size="small"
              style={{ width: 78 }}
              value={inputValue}
              onChange={this.handleInputChange}
              onBlur={this.handleInputConfirm}
              onPressEnter={this.handleInputConfirm}
            />
            )}
            {!inputVisible && (
            <Tag onClick={this.showInput} style={{ background: '#fff', borderStyle: 'dashed', margin: 5 }}>
              <Icon type="plus" />
              {' '}
              添加关键词
            </Tag>
            )}
          </Modal>
        </div>
      )
    }
}
