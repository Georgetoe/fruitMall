<template>
	<view class="container">
		<view class="left-bottom-sign"></view>
		<view class="back-btn yticon icon-zuojiantou-up" @click="navBack"></view>
		<view class="right-top-sign"></view>
		<!-- 设置白色背景防止软键盘把下部绝对定位元素顶上来盖住输入框等 -->
		<view class="wrapper">
			<view class="left-top-sign">REGISTER</view>
			<view class="welcome">
				欢迎注册！
			</view>
			<view class="input-content">
				<view class="input-item">
					<text class="tit">用户名</text>
					<input type="text" v-model="username" placeholder="请输入用户名" maxlength="11"/>
				</view>
				<view class="input-item">
					<text class="tit">手机号</text>
					<input type="number" v-model="phoneNumber" placeholder="请输入手机号" maxlength="11" />
				</view>
				<view class="input-item">
					<text class="tit">验证码</text>
					<view class="captcha-container">
						<input type="text" v-model="captcha" placeholder="请输入验证码" maxlength="6" />
						<button class="get-captcha-btn" :disabled="isCaptchaLoading || captchaSent" @click="sendCaptcha">
							{{ captchaSent ? `${countdown}s 后可重新发送` : '获取验证码' }}
						</button>
					</view>
				</view>
				<view class="input-item">
					<text class="tit">密码</text>
					<input type="password" v-model="password" placeholder="8-18位不含特殊字符的数字、字母组合" placeholder-class="input-empty" maxlength="20" password @confirm="toRegister" />
				</view>
				<view class="input-item">
					<text class="tit">确认密码</text>
					<input type="password" v-model="confirmPassword" placeholder="请再次输入密码" placeholder-class="input-empty" maxlength="20" password @confirm="toRegister" />
				</view>
			</view>
			
			<button class="confirm-btn" @click="toRegister" :disabled="registering">注册</button>
			<view class="forget-section" @click="toLogin">
				已有账号? 立即登录
			</view>
		</view>
	</view>
</template>
<script>
	import {
		mapMutations
	} from 'vuex';
	import {
		memberRegister, memberLogin, memberInfo, sendAuthCode
	} from '@/api/member.js';

	export default {
		data() {
			return {
				username: '',
				phoneNumber: '', // 新增：手机号
				captcha: '', // 新增：验证码
				password: '',
				confirmPassword: '',
				registering: false,
				isCaptchaLoading: false, // 验证码发送状态
				captchaSent: false, // 是否已发送验证码
				countdown: 60, // 倒计时时间
				timer: null // 计时器引用
			}
		},
		methods: {
			
			...mapMutations(['login']),
			navBack() {
				uni.navigateBack();
			},
			toLogin() {
				uni.navigateTo({ url: '/pages/public/login' });
			},

			async aftertoLogin() {
					this.logining = true;
					memberLogin({
						username: this.username,
						password: this.password
					}).then(response => {
						let token = response.data.tokenHead+response.data.token;
						uni.setStorageSync('token',token);
						uni.setStorageSync('username',this.username);
						uni.setStorageSync('password',this.password);
						memberInfo().then(response=>{
							this.login(response.data);
							uni.switchTab({
								url: '/pages/index/index' // 替换为你的首页路径
							});
						});
					}).catch(() => {
						this.logining = false;
					});
				},
		
			
			async sendCaptcha() {
					// 校验手机号格式
					if (!/^1\d{10}$/.test(this.phoneNumber)) {
						uni.showToast({
							title: '请输入有效的手机号',
							icon: 'none'
						});
						return;
					}
			
					this.isCaptchaLoading = true;
			
					try {
						const AuthCode = await sendAuthCode({
							telephone: this.phoneNumber
						}); // 调用后端 API 发送验证码
			
						console.log(AuthCode);
			
						uni.showToast({
							title: '验证码已发送，请查收短信',
							icon: 'success'
						});
			
						this.captchaSent = true;
			
						// 开始倒计时
						this.startCountdown();
					} catch (error) {
						uni.showToast({
							title: '验证码发送失败，请稍后再试',
							icon: 'none'
						});
					} finally {
						this.isCaptchaLoading = false;
					}
				},
			
			startCountdown() {
					this.timer = setInterval(() => {
						if (this.countdown > 0) {
							this.countdown--;
						} else {
							clearInterval(this.timer);
							this.timer = null;
							this.captchaSent = false;
							this.countdown = 60; // 重置倒计时
						}
					}, 1000);
				},
			
			async toRegister() {
				
			
			
				// 校验手机号格式
				if (!/^1\d{10}$/.test(this.phoneNumber)) {
					uni.showToast({
						title: '请输入有效的手机号',
						icon: 'none'
					});
					return;
				}

				// 校验验证码是否为空
				if (!this.captcha) {
					uni.showToast({
						title: '请输入验证码',
						icon: 'none'
					});
					return;
				}

				// 校验密码是否一致
				if (this.password !== this.confirmPassword) {
					uni.showToast({
						title: '两次输入的密码不一致',
						icon: 'none'
					});
					return;
				}

				this.registering = true;

				// 调用后端 API 进行注册
				try {
					await memberRegister({
						authCode: this.captcha ,// 添加验证码
						password: this.password,
						telephone: this.phoneNumber, // 手机号
						username: this.username
					});
						
					uni.showToast({
						title: '注册成功',
						icon: 'success'
					});
					// 注册成功后自动登录
					await this.aftertoLogin();
					
				} catch (error) {
					uni.showToast({
						title: '注册失败，请稍后再试',
						icon: 'none'
					});
				} finally {
					this.registering = false;
				}
			},
			
		   beforeDestroy() {
		   		if (this.timer) {
		   			clearInterval(this.timer);
		   		}
		   }
		}
	}
</script>
<style lang='scss'>
	/* 其他样式保持不变 */

page {
		background: #fff;
	}

	.container {
		padding-top: 115px;
		position: relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background: #fff;
	}

	.wrapper {
		position: relative;
		z-index: 90;
		background: #fff;
		padding-bottom: 40upx;
	}

	.back-btn {
		position: absolute;
		left: 40upx;
		z-index: 9999;
		padding-top: var(--status-bar-height);
		top: 40upx;
		font-size: 40upx;
		color: $font-color-dark;
	}

	.left-top-sign {
		font-size: 120upx;
		color: $page-color-base;
		position: relative;
		left: -16upx;
	}

	.right-top-sign {
		position: absolute;
		top: 80upx;
		right: -30upx;
		z-index: 95;

		&:before,
		&:after {
			display: block;
			content: "";
			width: 400upx;
			height: 80upx;
			background: #b4f3e2;
		}

		&:before {
			transform: rotate(50deg);
			border-radius: 0 50px 0 0;
		}

		&:after {
			position: absolute;
			right: -198upx;
			top: 0;
			transform: rotate(-50deg);
			border-radius: 50px 0 0 0;
			/* background: pink; */
		}
	}

	.left-bottom-sign {
		position: absolute;
		left: -270upx;
		bottom: -320upx;
		border: 100upx solid #d0d1fd;
		border-radius: 50%;
		padding: 180upx;
	}

	.welcome {
		position: relative;
		left: 50upx;
		top: -90upx;
		font-size: 46upx;
		color: #555;
		text-shadow: 1px 0px 1px rgba(0, 0, 0, .3);
	}

	.input-content {
		padding: 0 60upx;
	}

	.input-item {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		padding: 0 30upx;
		background: $page-color-light;
		height: 120upx;
		border-radius: 4px;
		margin-bottom: 50upx;

		&:last-child {
			margin-bottom: 0;
		}

		.tit {
			height: 50upx;
			line-height: 56upx;
			font-size: $font-sm+2upx;
			color: $font-color-base;
		}

		input {
			height: 60upx;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			width: 100%;
		}
	}

	.confirm-btn {
		width: 630upx;
		height: 76upx;
		line-height: 76upx;
		border-radius: 50px;
		margin-top: 70upx;
		background: $uni-color-primary;
		color: #fff;
		font-size: $font-lg;

		&:after {
			border-radius: 100px;
		}
	}
	
	.confirm-btn2 {
		width: 630upx;
		height: 76upx;
		line-height: 76upx;
		border-radius: 50px;
		margin-top: 40upx;
		background: $uni-color-primary;
		color: #fff;
		font-size: $font-lg;
	
		&:after {
			border-radius: 100px;
		}
	}

	.forget-section {
		font-size: $font-sm+2upx;
		color: $font-color-spec;
		text-align: center;
		margin-top: 40upx;
	}

	.register-section {
		position: absolute;
		left: 0;
		bottom: 50upx;
		width: 100%;
		font-size: $font-sm+2upx;
		color: $font-color-base;
		text-align: center;

		text {
			color: $font-color-spec;
			margin-left: 10upx;
		}
	}

	.captcha-container {
		display: flex;
		align-items: center;
		width: 100%;

		input {
			flex: 1;
			height: 60upx;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			border-radius: 4px;
			margin-right: 20upx;
		}

		.get-captcha-btn {
			width: 200upx;
			height: 60upx;
			line-height: 60upx;
			background: $uni-color-primary;
			color: #fff;
			border-radius: 30upx;
			font-size: $font-sm;
			&:disabled {
				background: #ccc;
			}
		}
	}
</style>