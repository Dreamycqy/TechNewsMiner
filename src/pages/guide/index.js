import React from 'react'
import { Icon } from 'antd'
import _ from 'lodash'
import Bg from '@/assets/bg.jpg'

const guidelist = [{
  name: '健康医疗',
  list: [{
    title: '辉瑞BioNTech新冠疫苗三期临床试验取得突破性成果',
    guide: '俄罗斯卫星通讯社莫斯科11月9日电 德国生物技术公司BioNTech发布消息，与美国制药巨头辉瑞公司合力研发的新冠疫苗在三期临床试验中取得突破性成果，预计将在11月份取得紧急授权。消息中指出，BNT162b2疫苗三期临床试验显示，疫苗的有效性被证明超过90%。BioNTech公司在官网发布消息说："基于目前的预测，我们计划2020年在全球生产5000万剂疫苗，将在2021年生产13亿剂疫苗。"',
    pic: 'http://sputniknews.cn/images/101987/21/1019872137.jpg',
    url: 'http://sputniknews.cn/covid-2019/202011091032493106/',
  }, {
    title: '辉瑞BioNTech新冠疫苗三期临床试验取得突破性成果',
    guide: '俄罗斯卫星通讯社莫斯科11月9日电 德国生物技术公司BioNTech发布消息，与美国制药巨头辉瑞公司合力研发的新冠疫苗在三期临床试验中取得突破性成果，预计将在11月份取得紧急授权。消息中指出，BNT162b2疫苗三期临床试验显示，疫苗的有效性被证明超过90%。BioNTech公司在官网发布消息说："基于目前的预测，我们计划2020年在全球生产5000万剂疫苗，将在2021年生产13亿剂疫苗。"',
    pic: 'http://sputniknews.cn/images/101987/21/1019872137.jpg',
    url: 'http://sputniknews.cn/covid-2019/202011091032493106/',
  }, {
    title: '辉瑞BioNTech新冠疫苗三期临床试验取得突破性成果',
    guide: '俄罗斯卫星通讯社莫斯科11月9日电 德国生物技术公司BioNTech发布消息，与美国制药巨头辉瑞公司合力研发的新冠疫苗在三期临床试验中取得突破性成果，预计将在11月份取得紧急授权。消息中指出，BNT162b2疫苗三期临床试验显示，疫苗的有效性被证明超过90%。BioNTech公司在官网发布消息说："基于目前的预测，我们计划2020年在全球生产5000万剂疫苗，将在2021年生产13亿剂疫苗。"',
    pic: 'http://sputniknews.cn/images/101987/21/1019872137.jpg',
    url: 'http://sputniknews.cn/covid-2019/202011091032493106/',
  }],
}, {
  name: '能源利用',
  list: [{
    title: '辉瑞BioNTech新冠疫苗三期临床试验取得突破性成果',
    guide: '俄罗斯卫星通讯社莫斯科11月9日电 德国生物技术公司BioNTech发布消息，与美国制药巨头辉瑞公司合力研发的新冠疫苗在三期临床试验中取得突破性成果，预计将在11月份取得紧急授权。消息中指出，BNT162b2疫苗三期临床试验显示，疫苗的有效性被证明超过90%。BioNTech公司在官网发布消息说："基于目前的预测，我们计划2020年在全球生产5000万剂疫苗，将在2021年生产13亿剂疫苗。"',
    pic: 'http://sputniknews.cn/images/101987/21/1019872137.jpg',
    url: 'http://sputniknews.cn/covid-2019/202011091032493106/',
  }, {
    title: '辉瑞BioNTech新冠疫苗三期临床试验取得突破性成果',
    guide: '俄罗斯卫星通讯社莫斯科11月9日电 德国生物技术公司BioNTech发布消息，与美国制药巨头辉瑞公司合力研发的新冠疫苗在三期临床试验中取得突破性成果，预计将在11月份取得紧急授权。消息中指出，BNT162b2疫苗三期临床试验显示，疫苗的有效性被证明超过90%。BioNTech公司在官网发布消息说："基于目前的预测，我们计划2020年在全球生产5000万剂疫苗，将在2021年生产13亿剂疫苗。"',
    pic: 'http://sputniknews.cn/images/101987/21/1019872137.jpg',
    url: 'http://sputniknews.cn/covid-2019/202011091032493106/',
  }, {
    title: '辉瑞BioNTech新冠疫苗三期临床试验取得突破性成果',
    guide: '俄罗斯卫星通讯社莫斯科11月9日电 德国生物技术公司BioNTech发布消息，与美国制药巨头辉瑞公司合力研发的新冠疫苗在三期临床试验中取得突破性成果，预计将在11月份取得紧急授权。消息中指出，BNT162b2疫苗三期临床试验显示，疫苗的有效性被证明超过90%。BioNTech公司在官网发布消息说："基于目前的预测，我们计划2020年在全球生产5000万剂疫苗，将在2021年生产13亿剂疫苗。"',
    pic: 'http://sputniknews.cn/images/101987/21/1019872137.jpg',
    url: 'http://sputniknews.cn/covid-2019/202011091032493106/',
  }],
}]
const colorList = [
  { name: '前沿技术', color: '' },
  { name: '健康医疗', color: '#87d068' },
  { name: '应急避险', color: '' },
  { name: '信息科技', color: '' },
  { name: '能源利用', color: 'gold' },
  { name: '气候环境', color: '' },
  { name: '食品安全', color: '' },
  { name: '航空航天', color: '' },
]

class Guide extends React.Component {
  renderList = (item) => {
    const result = []
    result.push(
      <div
        style={{
          backgroundColor: _.find(colorList, { name: item.name }).color,
          width: '100%',
          height: 60,
          lineHeight: '60px',
          paddingLeft: 20,
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        {item.name}
      </div>,
    )
    item.list.forEach((e) => {
      result.push(
        <div style={{ padding: 10, height: 180, overflow: 'hidden' }}>
          <div style={{ float: 'left', padding: 10, width: 120, textAlign: 'center' }}>
            <div style={{ backgroundColor: '#f1f0ef', lineHeight: '70px', fontSize: 18, marginBottom: 10, height: 70, color: '#999' }}>09</div>
            <div style={{ backgroundColor: '#f1f0ef', lineHeight: '70px', fontSize: 18, height: 70, color: '#999' }}>2020-11</div>
          </div>
          <div style={{ float: 'left', padding: 10 }}>
            <img src={e.pic} alt="" height="150px" width="240px" />
          </div>
          <div style={{ padding: 10, overflow: 'hidden' }}>
            <h3 style={{ marginBottom: 10 }}>
              <a href={e.url}>{e.title}</a>
            </h3>
            <div style={{ height: 30, lineHeight: '30px' }}>
              <div style={{ float: 'left' }}>
                <Icon type="" />
              </div>
            </div>
            <div>
              <span>{e.guide}</span>
              <a href="javascript:;">&nbsp;&nbsp;展开更多↓</a>
            </div>
          </div>
        </div>,
      )
    })
    return result
  }

  render() {
    return (
      <div style={{ padding: 10, background: `url("${Bg}") top repeat`, backgroundSize: '150%' }}>
        <div id="guideheader" style={{ margin: '10px 20px' }}>
          <div style={{ height: 48 }}>
            <h2
              style={{
                float: 'left',
                backgroundColor: '#24b0e6',
                color: 'white',
                height: 31,
                lineHeight: '31px',
                fontSize: 18,
                padding: '0 16px',
                borderRadius: 4,
                marginRight: 14,
              }}
            >
              科普新闻发现
            </h2>
            <h2 style={{ color: '#8232cad9' }}>一周导读（2020-11-03 ~ 2020-11-09）</h2>
          </div>
          <div>
            您好，尊敬的caojin，请查阅科普新闻发现系统本周的新闻导读。
          </div>
        </div>
        <div style={{ overflow: 'hidden', backgroundColor: '#ffffffdf' }}>
          {guidelist.map((e) => {
            return this.renderList(e)
          })}
        </div>
      </div>
    )
  }
}
export default Guide
