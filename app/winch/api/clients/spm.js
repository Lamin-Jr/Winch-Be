const axios = require('axios')


const defaultErrorHandler = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the indicated range (default: 2xx)
    if (process.env.DEV) {
      /* eslint-disable no-console */
      console.error(`error response data -> ${error.response.data}`)
      console.error(`error response status -> ${error.response.status}`)
      console.error(`error response headers -> ${error.response.headers}`)
      /* eslint-enable no-console */
    }
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    if (process.env.DEV) {
      /* eslint-disable no-console */
      console.error(`error request -> ${error.request}`)
      /* eslint-enable no-console */
    }
  } else {
    // Something happened in setting up the request that triggered an Error
    if (process.env.DEV) {
      /* eslint-disable no-console */
      console.error(`error setup -> ${error.message}`)
      /* eslint-enable no-console */
    }
  }
  if (process.env.DEV) {
    /* eslint-disable no-console */
    console.error(`error -> config -> ${error.config}`)
    /* eslint-enable no-console */
  }
}

const getAxiosInstance = (client, context) => {
  if (!client._instance[context.key]) {
    if (!context.setup || !context.setup.site || !context.setup.at ) {
      console.error(`invalid setup provided for ${context.key} client instance`)
      return undefined
    }
    client._instance[context.key] = client._axios.create({
      baseURL: `https://${context.setup.site}.sparkmeter.cloud/api/v0`,
      headers: {
        'Accept': 'application/json',
        'Authentication-Token': context.setup.at,
        // 'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache',
        // 'X-Requested-With': 'XMLHttpRequest',
      },
      maxRedirects: 0,
      timeout: 0,
    })
    if (process.env.DEV) {
      const AxiosLogger = require('axios-logger');
      client._instance[context.key].interceptors.request.use(AxiosLogger.requestLogger);
      client._instance[context.key].interceptors.response.use(AxiosLogger.responseLogger);
    }
    client._meta[context.key] = context.setup.meta || {}
  }

  return client._instance[context.key];
}

const applyMeta = (client, context) => {
  if (!context.meta) {
    context.meta = client._meta[context.key] || {}
  }
}

const ensureConfig = (context, config) => {
  if (!context.config) {
    context.config = {}
  }
  Object.assign(context.config, config)
}

const ensureHeaders = (context, headers) => {
  if (!context.config.headers) {
    context.config.headers = {}
  }
  Object.assign(context.config.headers, headers);
}


class AxiosSparkmeterClient {
  constructor (axios) {
    this._axios = axios
    this._instance = {
    }
    this._meta = {
    }
  }

  preloadInstance(context) {
    return getAxiosInstance(this, context) !== undefined
  }

  getFromMeta(context, key) {
    return this._meta[context.key][key]
  }

  customers (context, responseHandler = r => r.data, errorHandler = defaultErrorHandler) {
    return new Promise((resolve, reject) => {
      const clientInstance = getAxiosInstance(this, context);
      if (!clientInstance) {
        reject(new Error('unavailable client'))
      }
      applyMeta(this, context)
      clientInstance.get('/customers', context.config || {})
        .then(response => {
          resolve(responseHandler(response))
        })
        .catch((error) => {
          errorHandler(error)
          reject(error)
        })
    })
  }

  createTransaction (context, responseHandler = r => r.data, errorHandler = defaultErrorHandler) {
    return new Promise((resolve, reject) => {
      const clientInstance = getAxiosInstance(this, context);
      if (!clientInstance) {
        reject(new Error('unavailable client'))
      }
      applyMeta(this, context)
      ensureHeaders(context, {
        'Content-Type': 'application/x-www-form-urlencoded',
      })

      clientInstance.post('/transaction/', require('querystring').stringify(context.body || {}), context.config || {})
        .then(response => {
          /*
            {
              "error": status === 'failure' -> <error_string>,
              "status": [ "success", "failure" ],
              "transaction_id": status === 'success' -> <uuid>
            }
          */
          resolve(responseHandler(response))
        })
        .catch((error) => {
          errorHandler(error)
          reject(error)
        })
    })
  }
}


module.exports = new AxiosSparkmeterClient(axios);
