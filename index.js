// ==UserScript==
// @name         apifox-openapi-transformer
// @namespace    https://github.com/zenonux
// @version      1.0
// @description  transform apifox openapi format provided by `http://127.0.0.1:4523/export/openapi/` into api flie writen with typescript.
// @author       换个头像心好累
// @match        *://127.0.0.1:4523/export/openapi/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=0.1
// @grant        none
// ==/UserScript==

;(function () {
  'use strict'
  const rootEl = document.body
  const jsonData = JSON.parse(rootEl.innerText)
  const apis = []
  Object.keys(jsonData.paths).forEach((url) => {
    let method = '',
      info = {}
    if (jsonData.paths[url].get) {
      method = 'get'
      info = jsonData.paths[url].get
    } else if (jsonData.paths[url].post) {
      method = 'post'
      info = jsonData.paths[url].post
    } else if (jsonData.paths[url].delete) {
      method = 'delete'
      info = jsonData.paths[url].delete
    }
    let api = _buildApi(url, method, info)
    apis.push(api)
  })
  if (apis.length > 0) {
    let apiStr = apis.join('\n')
    _showExportButton(apiStr)
  }
  function _buildApi(url, method, info) {
    let { summary, parameters, requestBody, responses } = info
    let QueryType = '{}'
    if (parameters && parameters.length > 0) {
      QueryType = _parseParam(parameters)
    }
    let BodyType = '{}'
    if (requestBody) {
      let body = requestBody.content['application/json'].schema
      BodyType = _parseBodyOrResponse(body.properties, body.required)
    }
    let ResponseType = '{}'
    let responseData = responses['200'].content['application/json'].schema
    ResponseType = _parseBodyOrResponse(
      responseData.properties,
      responseData.required
    )

    return `${summary}(payloads:{
        query:${QueryType},
        body:${BodyType},
    }): Promise<${ResponseType}>{
        return request({
            url:${url},
            method:${method},
            params:{
                ...payloads.query
            },
            data:{
                ...payloads.body
            }
        })
    },\n`
  }
  function _parseParam(parameters) {
    let query = '{'
    parameters.forEach((v) => {
      query += `${[v.name]}${v.required ? '?' : ''}:${v.schema.type};`
    })
    query += '}'
    return query
  }
  function _parseBodyOrResponse(properties, required) {
    let data = '{'
    Object.keys(properties).forEach((v) => {
      let isRequired = required.some((k) => v === k)
      let type = properties[v].type
      if (type === 'object') {
        data += `${v}:`
        data += _parseBodyOrResponse(
          properties[v].properties,
          properties[v].required
        )
        data += `;`
      } else {
        data += `${[v]}${isRequired ? '?' : ''}:${type};`
      }
    })
    data += '}'
    return data
  }
  function _showExportButton(apiStr) {
    let btn = document.createElement('button')
    btn.innerText = '复制接口'
    btn.style =
      'position:fixed;top:16%;left:50%;transform:translate(-50%,0);z-index:10000;background:#888;padding:10px 14px;border:none;color:#fff;cursor:pointer;'
    btn.addEventListener('click', () => {
      _copyToClipboard(apiStr).then(() => {
        _showToast('复制成功')
      })
    })
    document.body.appendChild(btn)
  }
  function _showToast(msg) {
    let toast = document.createElement('div')
    toast.innerText = msg
    toast.style =
      'position:fixed;top:16%;left:50%;transform:translate(-50%,-24%);z-index:20000;background:#67C23A;padding:30px 45px;border-radius:4px;color:#fff;'
    document.body.appendChild(toast)
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 1000)
  }
  function _copyToClipboard(text) {
    return navigator.clipboard.writeText(text)
  }
})()
