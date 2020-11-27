import React from 'react'
import queryString from 'query-string'
import { Select } from 'antd'

const { Option } = Select

export const getUrlParams = (type) => {
  const parsed = queryString.parse(window.location.search)
  return (type ? parsed[type] : parsed)
}

export const changeUrlQuery = (newQuery) => {
  const query = {
    ...queryString.parse(window.location.search),
    ...newQuery,
  }
  const queryStr = queryString.stringify(query)
  window.history.pushState(null, null, `?${queryStr}`)
}

export const makeOption = (array) => {
  const children = []
  for (const i of array) {
    children.push(<Option key={i.value} value={i.value}>{i.name}</Option>)
  }
  return children
}

export const isInArray = (arr, value) => {
  for (let i = 0; i < arr.length; i++) {
    if (value === arr[i]) {
      return true
    }
  }
  return false
}

export const findPathByLeafId = (leafId, nodes, type, oripath) => {
  let path = oripath
  if (oripath === undefined) {
    path = []
  }
  for (let i = 0; i < nodes.length; i++) {
    const tmpPath = path.concat()
    tmpPath.push(nodes[i][type])
    if (leafId === nodes[i][type]) {
      return { node: nodes[i], path: tmpPath }
    }
    if (nodes[i].children) {
      const findResult = findPathByLeafId(leafId, nodes[i].children, type, tmpPath)
      if (findResult) {
        return findResult
      }
    }
  }
}

export const eventImage = (picture) => {
  let url
  const type = typeof picture
  if (type === 'object') {
    url = picture[0] // eslint-disable-line
  } else if (type === 'string') {
    url = picture.substring(1, picture.length - 1).split(',')[0] // eslint-disable-line
  }
  if (url !== undefined && url.length > 0) {
    const target = <img width={250} height={140} alt="" src={url} />
    return target
  }
}

export const eventImageStr = (picture) => {
  let url
  const type = typeof picture
  if (type === 'object') {
    url = picture[0] // eslint-disable-line
  } else if (type === 'string') {
    url = picture.substring(1, picture.length - 1).split(',')[0] // eslint-disable-line
  }
  if (url !== undefined && url.length > 0) {
    return url
  } else {
    return ''
  }
}

export const image2Base64 = (url, ext) => {
  function getBase64Image(img) {
    let canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400 * img.height / img.width
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const dataURL = canvas.toDataURL(`image/${ext}`)
    canvas = null
    return dataURL
  }
  const image = new Image()
  image.src = `/foreign-news/pic/${url}`
  return new Promise((resolve) => {
    image.onload = () => {
      resolve(getBase64Image(image))
    }
  })
}

// 找出重名不重学科的节点
export const theSameLabel = (other) => {
  const samelabel = []
  for (let h = 0; h < other.length; h++) {
    const each = other[h]
    const lab = each.label
    const cor = each.course
    for (let g = 0; g < other.length; g++) {
      const obj = other[g]
      const { label } = obj
      const { course } = obj

      if (label === lab && cor !== course) {
        samelabel.push(each)
      }
    }
  }
  return samelabel
}

export const timeout = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
