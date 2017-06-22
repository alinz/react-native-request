// @flow

import { logger } from 'react-native-logger'

type Builder = {
  url: (path: string) => string,
  body: (body: any) => string,
  headers: (options: Request) => Object
}

export type Request = {
  path: string,
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT',
  body?: string | Object,
  headers?: Object
}

export type Response = {
  body: any,
  status: number,
  raw: any
}

export const createRequest = (builder: Builder) => (options: Request): Promise<Response> => {
  const url = builder.url ? builder.url(options.path) : options.path
  const method = options.method || 'GET'
  const body = options.body ? builder.body(options.body) : undefined

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
    ...builder.headers(options)
  }

  return new Promise((resolve, reject) => {
    logger.group('api', `${method}: ${url}`, async log => {
      if (body) {
        log('request budy', body)
      }

      try {
        let data = ''

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
        // status code 204 means there is no data
        // so we won't parsing the content of received data
        if (resp.status !== 204) {
          data = await resp.json()
          log('data', data)
        }

        resolve({
          body: data,
          status: resp.status,
          raw: resp
        })
      } catch (e) {
        log('error:', e)
        reject(e)
      }
    })
  })
}
