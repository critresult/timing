import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import { Provider } from 'mobx-react'
import PromoterStore from './stores/promoter'

axios.defaults.baseURL = 'https://api.critresult.com'
// axios.defaults.baseURL = 'http://localhost:4000'
axios.defaults.headers['content-type'] = 'application/json'

Object.assign(document.body.style, {
  margin: 'auto',
  'font-family': 'Helvetica',
})

const stores = {
  promoter: new PromoterStore(),
}

ReactDOM.render(
  <Provider {...stores}>
    <div>hello world</div>
  </Provider>,
  document.getElementById('app')
)
