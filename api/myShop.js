import request from '@/utils/requestUtil'

export function createMyShop(data) {
	return request({
		method: 'POST',
		url: '/member/myShop/add',
		data: data
	})
}

export function getMyShop(params) {
	return request({
		method: 'GET',
		url: '/member/myShop/detail',
		params: params
	})
}
