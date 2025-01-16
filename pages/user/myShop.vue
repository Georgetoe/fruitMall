<template>
  <view>
    <!-- 展示店铺信息 -->
    <view v-if="myShop">
      <text>店铺名称：{{ myShop.name }}</text>
      <text>店铺首字母：{{ myShop.initial }}</text>
      <view>
        <text>店铺LOGO：</text>
        <image :src="myShop.logo" mode="aspectFit" style="width: 100px; height: 100px;" />
      </view>
      <text>店铺故事：{{ myShop.story }}</text>
    </view>
    
    <!-- 填写店铺信息表单 -->
    <view v-else>
      <form @submit.prevent="submitForm">
        <view>
          <label>店铺名称：</label>
          <input v-model="formData.name" placeholder="请输入店铺名称" />
        </view>
        <view>
          <label>店铺首字母：</label>
          <input v-model="formData.initial" placeholder="请输入店铺首字母（如A）" maxlength="1" />
        </view>
        <view>
          <label>店铺LOGO：</label>
          <button @click="chooseImage">选择图片</button>
          <image v-if="formData.logo" :src="formData.logo" mode="aspectFit" style="width: 100px; height: 100px; margin-top: 10px;" />
        </view>
        <view>
          <label>店铺故事（100字内）：</label>
          <textarea v-model="formData.story" placeholder="请输入店铺故事" maxlength="100"></textarea>
        </view>
        <button type="submit">提交</button>
      </form>
    </view>
  </view>
</template>

<script>
import { createMyShop, getMyShop } from "@/api/myShop.js";

export default {
  data() {
    return {
      myShop: null, // 存储店铺信息
      formData: {
        name: "",     // 店铺名称
        initial: "",  // 店铺首字母
        logo: "",     // 店铺LOGO路径
        story: "",    // 店铺故事
      },
    };
  },
  onLoad() {
    this.loadShopData();
  },
  methods: {
    // 加载店铺数据
    async loadShopData() {
      try {
        const response = await getMyShop();
        if (response && response.data) {
          this.myShop = response.data;
        } else {
          this.myShop = null; // 没有数据时显示表单
        }
      } catch (error) {
        console.error("加载店铺数据失败：", error);
      }
    },
    // 提交表单
    async submitForm() {
      try {
        const response = await createMyShop(this.formData);
        if (response && response.success) {
          this.loadShopData(); // 提交成功后重新加载店铺数据
          uni.showToast({
            title: "创建成功",
            icon: "success",
          });
        }
      } catch (error) {
        console.error("提交店铺信息失败：", error);
        uni.showToast({
          title: "提交失败，请重试",
          icon: "none",
        });
      }
    },
    // 选择图片并上传
    chooseImage() {
      uni.chooseImage({
        count: 1, // 只允许选择一张图片
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          try {
            // 假设 uploadImage 是图片上传的 API
            const uploadResponse = await this.uploadImage(tempFilePath);
            if (uploadResponse && uploadResponse.url) {
              this.formData.logo = uploadResponse.url; // 上传成功后保存图片路径
            }
          } catch (error) {
            console.error("图片上传失败：", error);
            uni.showToast({
              title: "图片上传失败",
              icon: "none",
            });
          }
        },
        fail: () => {
          uni.showToast({
            title: "图片选择失败",
            icon: "none",
          });
        },
      });
    },
    // 模拟图片上传
    async uploadImage(filePath) {
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: "https://your-upload-server.com/upload", // 替换为实际的图片上传地址
          filePath,
          name: "file",
          success: (uploadRes) => {
            const data = JSON.parse(uploadRes.data);
            if (data.success) {
              resolve({ url: data.url }); // 假设返回的结果中包含图片 URL
            } else {
              reject(new Error("上传失败"));
            }
          },
          fail: (error) => {
            reject(error);
          },
        });
      });
    },
  },
};
</script>
<style lang="scss">
	page,
	.content {
		background: $page-color-base;
	}

	.hot-section {
		display: flex;
		flex-wrap: wrap;
		margin-top: 16upx;

		.guess-item {
			display: flex;
			flex-direction: row;
			width: 100%;
			padding: 0 30upx;
			margin-bottom: 16upx;
			background-color: #fff;
			align-items: center;
		}

		.image-wrapper {
			width: 30%;
			height: 170upx;
			border-radius: 3px;
			overflow: hidden;
			background: #fff;

			image {
				width: 100%;
				height: 100%;
				opacity: 1;
			}
		}

		.title {
			font-size: $font-lg;
			color: $font-color-dark;
			line-height: 80upx;
		}

		.title2 {
			font-size: $font-sm;
			color: $font-color-light;
			line-height: 40upx;
			height: 80upx;
			overflow: hidden;
			text-overflow: ellipsis;
			display: block;
		}

		.price {
			font-size: $font-lg;
			color: $uni-color-primary;
			line-height: 80upx;
		}

		.txt {
			width: 70%;
			display: flex;
			flex-direction: row;
			padding-left: 40upx;
			align-items: center;
		}
		.hor-txt{
			display: flex;
			justify-content: space-between;
		}

		.time {
			font-size: $font-sm;
			color: $font-color-dark;
			line-height: 80upx;
		}
	}
</style>
