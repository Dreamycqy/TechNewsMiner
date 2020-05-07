import React from 'react'
import { Input, Select, Button, Row, Col, Checkbox, Divider, DatePicker, TreeSelect } from 'antd'
import moment from 'moment'
import _ from 'lodash'
import { makeOption, findPathByLeafId } from '@/utils/common'

let quickFilterResult = []
let quickFilterSelect = {}
const { Search } = Input
const { RangePicker } = DatePicker
const countryList = [
  { value: 'all', name: '全部' },
  { value: 'jp', name: '日本' },
  { value: 'us', name: '美国' },
  { value: 'en', name: '英国' },
  { value: 'fr', name: '法国' },
  { value: 'eu', name: '欧洲' },
  { value: 'ru', name: '俄罗斯' },
  { value: 'knowledge', name: '智库' },
]
const dateFormat = 'YYYY-MM-DD'
const myData = require('@/constants/tree_cn.json')
const key_map = require('@/constants/key_map.json')

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newsList: [],
      searchText: '',
      beginDate: moment().subtract(6, 'days'),
      endDate: moment(),
      country: 'all',
      indeterminate: false,
      checkedIdList: [],
      checkAll: false,
      showQuickFilter: false,
      showSearchBar: false,
      categories: [],
      treeValue: [],
    }
  }

  componentWillMount = () => {
  }

  changeCountry = (key) => {
    this.setState({ country: key })
  }

  changeDate = (date) => {
    this.setState({ beginDate: date[0], endDate: date[1] })
  }

  search = async () => {}

  searchInput = (value) => {
    this.setState({ searchText: value })
    const target = findPathByLeafId(value, myData, 'title')
    if (target) {
      const { treeValue } = this.state
      if (treeValue.indexOf(target.node.key) < 0) {
        this.setState({ showQuickFilter: true })
        quickFilterSelect = target.node
      } else {
        this.setState({ showQuickFilter: false })
      }
    }
  }

  searchOnClick = () => {
    const { queryDate, searchText } = this.state
    this.search(queryDate, searchText)
  }

  onCheckAllChange = (e) => {
    const { newsList } = this.state
    const { checked } = e.target
    const allIdList = []
    newsList.forEach((item) => {
      allIdList.push(item.news_ID)
      item.checked = checked // eslint-disable-line
    })
    this.setState({
      checkedIdList: checked ? allIdList : [],
      indeterminate: false,
      checkAll: checked,
    })
  }

  selectCategory = async (keyList) => {
    const categories = []
    keyList.forEach((key) => {
      categories.push(key_map[key]['cn'])
      categories.push(key_map[key]['en'])
    })
    await this.setState({ categories, treeValue: keyList })
    this.searchInput(this.state.searchText)
  }

  showSearchBarButton = () => {
    const { showSearchBar } = this.state
    this.setState({ showSearchBar: !showSearchBar })
  }

  jumpQuickFilter = () => {
    quickFilterResult = []
    this.quickFilter([quickFilterSelect])
    const { treeValue } = this.state
    this.selectCategory(_.uniq(treeValue.concat(quickFilterResult)))
    quickFilterSelect = {}
    this.setState({ showQuickFilter: false })
  }

  quickFilter = (nodes) => {
    for (const item of nodes) {
      quickFilterResult.push(item.value)
      if (item.children) {
        this.quickFilter(item.children)
      }
    }
  }

  render() {
    const {
      newsList, searchText, country, showQuickFilter, indeterminate, checkAll, checkedIdList,
      showSearchBar, beginDate, endDate, treeValue,
    } = this.state
    return (
      <div>
        <Row style={{ height: showQuickFilter ? 80 : 64, paddingLeft: 50, lineHeight: '64px', borderBottom: '1px solid #e1e1e1' }}>
          <Col span={15}>
            <div>
              <Search
                addonBefore={(
                  <div>
                    <div style={{ width: 70, display: 'inline-block' }}>选择来源：</div>
                    <Select
                      value={country}
                      style={{ width: 85 }}
                      onChange={this.changeCountry}
                    >
                      {makeOption(countryList)}
                    </Select>
                  </div>
                      )}
                style={{ width: 600, marginTop: 16, borderRadius: 0 }}
                onChange={e => this.searchInput(e.target.value)}
                value={searchText}
                onSearch={this.searchOnClick}
                enterButton="搜索"
                placeholder="请输入搜索关键词"
              />
              <Button style={{ marginLeft: 20 }} onClick={this.showSearchBarButton}>展开高级选项</Button>
            </div>
            <div style={{ marginLeft: 160, lineHeight: '0px', display: showQuickFilter ? 'block' : 'none' }}>
              <a href="javascript:;" onClick={() => this.jumpQuickFilter()}>
                关键词&nbsp;&nbsp;
                <span style={{ color: 'red' }}>{searchText}</span>
                &nbsp;&nbsp;在聚类列表里已存在且未选中，是否选中？
              </a>
            </div>
          </Col>
          <Col span={5} offset={4}>
            <div style={{ float: 'right', marginRight: 25 }}>
              <Checkbox
                indeterminate={indeterminate}
                onChange={this.onCheckAllChange}
                checked={checkAll}
              >
                全选
              </Checkbox>
              <label> {/* eslint-disable-line */}
                {' '}
                已选择
                {checkedIdList.length}
                条/共
                {newsList.length}
                条
              </label>
              <Divider type="vertical" />
              <Button type="primary" onClick={this.showDrawer} icon="menu" />
            </div>
          </Col>
        </Row>
        <div style={{ display: showSearchBar ? 'block' : 'none', minHeight: 90, paddingLeft: 50, paddingTop: 8, backgroundColor: '#fff' }}>
          <span>
            时间区间：&nbsp;&nbsp;
          </span>
          <RangePicker
            format={dateFormat}
            onChange={this.changeDate}
            value={[beginDate, endDate]}
          />
          <Button style={{ marginLeft: 20 }} icon="search" type="primary" onClick={this.subSearchOnClick}>从当前结果中搜索</Button>
          <br />
          <div style={{ marginTop: 10 }}>
            <span>
              聚类圈选：&nbsp;&nbsp;
            </span>
            <TreeSelect
              treeData={myData}
              value={treeValue}
              maxTagCount={6}
              maxTagPlaceholder={(omittedValues) => {
                return `其他${omittedValues.length - 6}个类`
              }}
              treeCheckable
              showSearch
              showCheckedStrategy="SHOW_ALL"
              style={{ width: 650 }}
              onChange={this.selectCategory}
              treeNodeFilterProp="title"
            />
          </div>
        </div>
      </div>
    )
  }
}

export default Home
