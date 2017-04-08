// @flow

import { logger } from 'react-native-logger'

type Builder = {
  url: (path: string) => string,
  body: (body: any) => string
}

type Request = {
  path: string,
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT',
  body?: string | Object,
  headers?: Object
}

type Response = {
  body: any,
  status: number
}

export const createRequest = (builder: Builder) => (options: Request): Promise<Response> => {
  const url = builder.url ? builder.url(options.path) : options.path
  const method = options.method || 'GET'
  const body = options.body ? builder.body(options.body) : undefined

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
    ...options.headers || {}
  }

  return new Promise((resolve, reject) => {
    logger.group('api', `${method}: ${url}`, async (log) => {
      if (body) {
        log('request budy', body)
      }

      try {
        const resp = await fetch(url, {
          headers,
          method,
          body
        })

        if (resp.status >= 300) {
          log(`error: (${resp.status})`, resp)
          reject(resp)
          return
        }

        log('status', resp.status)
        const data = await resp.json()
        log('data', data)

        resolve({
          body: data,
          status: resp.status
        })
      } catch(e) {
        log('error:', e)
        reject(e)
      }
    })
  })
}
