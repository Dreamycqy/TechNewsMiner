import React from 'react'
import logo from '@/assets/logo.png'

class NewsContent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      collepsed: true,
    }
  }

  render() {
    const e = this.props.data
    const { collepsed } = this.state
    return (
      <div style={{ padding: 10, height: collepsed === true ? 200 : '', minHeight: 200 }}>
        <div style={{ float: 'left', padding: 10, width: 120, textAlign: 'center' }}>
          <div style={{ backgroundColor: '#f1f0ef', lineHeight: '70px', fontSize: 18, marginBottom: 10, height: 70, color: '#999' }}>{e.time.format('DD')}</div>
          <div style={{ backgroundColor: '#f1f0ef', lineHeight: '70px', fontSize: 18, height: 70, color: '#999' }}>{e.time.format('YYYY-MM')}</div>
        </div>
        <div style={{ float: 'left', padding: 10 }}>
          {e.pic.length > 0
            ? <img src={e.pic} alt="" height="150px" width="240px" /> : <img src={logo} alt="" height="150px" width="240px" />
            }
        </div>
        <div style={{ padding: 10, overflow: 'hidden' }}>
          <h3 style={{ marginBottom: 10 }}>
            <a href={e.url} target="_blank">{e.title}</a>
          </h3>
          <div>
            <div style={{ height: collepsed === true ? 110 : '', overflow: 'hidden' }}>{e.guide}</div>
            <a
              style={{ float: 'right', display: collepsed === true ? 'block' : 'none' }} href="javascript:;"
              onClick={() => this.setState({ collepsed: false })}
            >
              &nbsp;&nbsp;展开全文↓
            </a>
            <a
              style={{ float: 'right', display: collepsed === false ? 'block' : 'none', color: 'red' }} href="javascript:;"
              onClick={() => this.setState({ collepsed: true })}
            >
              &nbsp;&nbsp;折叠全文↑
            </a>
          </div>
        </div>
      </div>
    )
  }
}
export default NewsContent
