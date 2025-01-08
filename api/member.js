import request from '@/utils/requestUtil'
import { API_BASE_URL} from '@/utils/appConfig.js';
import axios from 'axios';


// 创建 Axios 实例，配置基础 URL 和其他默认设置
const apiClient = axios.create({
    baseURL: API_BASE_URL, // 替换为你的后端 API 地址
    timeout: 5000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json'
    }
});

//注册发送验证码
export async function sendAuthCode(data) {
    try {
		console.log(data);
        const response = await apiClient.get('/sso/sendAuthCode', {
  params: {
    telephone: data.telephone
  }});
		
        return response.data;
    } catch (error) {
        throw new Error('发送失败: ' + (error.response?.data?.message || error.message));
    }
}

// 注册用户
export async function memberRegister(data) {
	console.log(data)
    return request({
    	method: 'POST',
    	url: '/sso/register',
    	header: {
    		'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    	},
    	data: data
    })
}

// 用户登录
export function memberLogin(data) {
	return request({
		method: 'POST',
		url: '/sso/login',
		header: {
			'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
		},
		data: data
	})
}

export function memberInfo() {
	return request({
		method: 'GET',
		url: '/sso/info'
	})
}


