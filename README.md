# Tampermonkey-apifox-extension

transform apifox openapi format provided by `http://127.0.0.1:4523/export/openapi/` into typescript api flie.

## How it works

Before 

```json
{
    "openapi": "3.0.1",
    "info": {},
    "tags": [],
    "paths": {},
    "components": {}
}
```

After

```ts
  // 获取软件下载列表
  get(payloads: {
    params: {
      category: string
      name?: string
      subCategory?: string
      softwareVer?: string
      systemVer?: string
      language?: string
    }
    data?: {}
  }): Promise<{
    code: number
    msg: string
    data: {
      list: {
        subCategory?: string
        subSort?: number
        subList: {
          id?: number
          name?: string
          subCategory?: string
          softwareVer?: string
          systemVer?: string
          downloadUrl?: string
          sort?: number
          createTime?: number
          updateTime?: number
        }[]
      }[]
    }
  }> {
     return request({
         url:"/download/v1/software/list",
         method:"get",
         params:payloads.params,
     })
  },

```
