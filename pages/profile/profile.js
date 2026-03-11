// pages/profile/profile.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isMale: true,
    age: '',
    height: ''
  },

  /**
   * 生命周期函数--监听页面加载
   * 进页面时，先读取手机缓存中是否已有档案
   */
  onLoad: function (options) {
    const profile = wx.getStorageSync('userProfile');
    if (profile) {
      this.setData({
        isMale: profile.isMale,
        age: profile.age,
        height: profile.height
      });
    }
  },

  // --- 输入监听函数 ---

  // 切换性别
  changeGender: function (e) {
    this.setData({
      isMale: e.detail.value == 0 // 0是男性，1是女性
    });
  },

  // 输入年龄
  inputAge: function (e) {
    this.setData({
      age: e.detail.value
    });
  },

  // 输入身高
  inputHeight: function (e) {
    this.setData({
      height: e.detail.value
    });
  },

  /**
   * 核心保存函数
   * 包含你要求的：存储逻辑 + 成功提示 + 延迟跳转
   */
  saveProfile: function () {
    const { isMale, age, height } = this.data;

    // 表单验证：确保数据都填了
    if (!age || !height) {
      wx.showToast({
        title: '请填全身体数据',
        icon: 'none'
      });
      return;
    }

    // 1. 存储逻辑：将数据封装并存入本地缓存
    const newData = {
      isMale: isMale,
      age: parseFloat(age),
      height: parseFloat(height)
    };
    wx.setStorageSync('userProfile', newData);

    // 2. 弹出轻提示，增加操作的确认感 (苹果风交互细节)
    wx.showToast({
      title: '更新成功',
      icon: 'success',
      duration: 1000
    });

    // 3. 稍微延迟 1 秒再跳回，给用户看一眼“成功”提示的时间
    setTimeout(() => {
      // 返回上一页（首页），由于首页用了 onShow，数据会立即刷新
      wx.navigateBack({
        delta: 1
      });
    }, 1000);
  }
})