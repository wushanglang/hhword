import axios from 'axios';
import { ref } from 'vue'
const req = axios.create({
  baseURL: 'http://hhdict.fun:54321/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

req.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 设置响应拦截器
req.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    return Promise.reject(error);
  }
);

export  let imgUrl = ref(null)
export let adsUrl = ref(null)
export function publicité() {
  req.get('/hh/oui/publicité/read').then((data) => {
    if (data.length) {
      imgUrl.value = data[0]
      adsUrl.value = data[1]
    }
  })
} 
