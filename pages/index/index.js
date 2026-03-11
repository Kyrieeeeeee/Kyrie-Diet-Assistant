// pages/index/index.js
Page({
  data: {
    profile: null,
    weight: '',
    goalIdx: 0,
    isTrain: false,
    timeIdx: 0,
    times: ['空腹晨练 (练后吃早饭)', '上午练 (早饭后练)', '下午练 (午饭后练)', '傍晚练 (晚饭前练)', '夜间练 (晚饭后练)'],
    carbList: [],
    proteinList: [],
    isAdvanced: false, // 是否开启精细化配置
    carbIdx: 0,
    proIdx: 0,
    breakCarbIdx: 0,
    breakProIdx: 0,
    lunchCarbIdx: 0,
    lunchProIdx: 0,
    dinnerCarbIdx: 0,
    dinnerProIdx: 0
  },

  onShow() {
    // 1. 档案检测：如果没填过档案，引导去填写
    const profile = wx.getStorageSync('userProfile');
    if (!profile) {
      wx.showToast({ title: '请先完善基础档案', icon: 'none' });
      setTimeout(() => { wx.navigateTo({ url: '/pages/profile/profile' }); }, 1000);
      return;
    }

    // 2. 初始化食材库：防止用户第一次手机打开时列表为空
    let cList = wx.getStorageSync('carbList');
    if (!cList || cList.length === 0) {
      cList = [
        { name: '一般熟米饭', rate: 0.3, desc: '30g/100g', unit: { name: '外卖盒', weight: 100 } },
        { name: '燕麦块', rate: 0.6, desc: '60g/100g', unit: { name: '块', weight: 50 } }
      ];
      wx.setStorageSync('carbList', cList);
    }

    let pList = wx.getStorageSync('proteinList');
    if (!pList || pList.length === 0) {
      pList = [{ name: '熟瘦肉(猪牛羊鸡)', rate: 0.25, desc: '25g/100g' }];
      wx.setStorageSync('proteinList', pList);
    }

    // 3. 刷新页面显示数据
    this.setData({
      profile,
      weight: wx.getStorageSync('lastWeight') || '',
      carbList: cList,
      proteinList: pList
    });
  },

  // --- 用户输入与选择监听 ---
  inputWeight(e) { this.setData({ weight: e.detail.value }); },
  changeGoal(e) { this.setData({ goalIdx: e.detail.value }); },
  toggleTrain(e) { this.setData({ isTrain: e.detail.value }); },
  changeTime(e) { this.setData({ timeIdx: e.detail.value }); },
  toggleAdvanced(e) { this.setData({ isAdvanced: e.detail.value }); },

  pickCarb(e) { this.setData({ carbIdx: e.detail.value }); },
  pickPro(e) { this.setData({ proIdx: e.detail.value }); },
  pickBreakCarb(e) { this.setData({ breakCarbIdx: e.detail.value }); },
  pickBreakPro(e) { this.setData({ breakProIdx: e.detail.value }); },
  pickLunchCarb(e) { this.setData({ lunchCarbIdx: e.detail.value }); },
  pickLunchPro(e) { this.setData({ lunchProIdx: e.detail.value }); },
  pickDinnerCarb(e) { this.setData({ dinnerCarbIdx: e.detail.value }); },
  pickDinnerPro(e) { this.setData({ dinnerProIdx: e.detail.value }); },

  // --- 页面跳转 ---
  goToProfile() { wx.navigateTo({ url: '/pages/profile/profile' }); },
  goToManageFood() { wx.navigateTo({ url: '/pages/manageFood/manageFood' }); },

  // --- 分享引擎 (新增部分) ---
  // 1. 发送给朋友
  onShareAppMessage() {
    return {
      title: '精准计算你的三大营养素配额',
      path: '/pages/index/index'
    }
  },
  // 2. 分享到朋友圈
  onShareTimeline() {
    return {
      title: '我正在用这款极简饮食计算器，推荐给你！'
    }
  },

  // --- 核心计算与跳转逻辑 ---
  calculate() {
    const w = parseFloat(this.data.weight);
    const p = this.data.profile;

    // 严谨的真机防错检查
    if (!w || isNaN(w)) return wx.showToast({ title: '请填写有效体重', icon: 'none' });
    if (!p || !p.height || !p.age) return wx.showToast({ title: '请先完善身体档案', icon: 'none' });

    // 确保计算用的数值是纯数字，防止真机字符串干扰
    const h = parseFloat(p.height);
    const a = parseFloat(p.age);
    const isFatLoss = this.data.goalIdx == 0;

    // 基础公式逻辑
    let bmr = 9.99 * w + 6.25 * h - 4.92 * a + (p.isMale ? 5 : -161);
    let trainBurn = this.data.isTrain ? (p.isMale ? 200 : 150) : 0;
    let tdee = (bmr / 0.7) + trainBurn;
    let targetCal = tdee * (isFatLoss ? 0.64 : 0.84);

    let fatGrams = p.isMale ? (isFatLoss ? 60 : 80) : (isFatLoss ? 50 : 70);
    let remainingCal = targetCal - (fatGrams * 9);

    let carbG = (remainingCal * (isFatLoss ? 0.64 : 0.70)) / 4;
    let proteinG = (remainingCal * (isFatLoss ? 0.36 : 0.30)) / 4;

    const cl = this.data.carbList;
    const pl = this.data.proteinList;
    const isAdv = this.data.isAdvanced;

    // 封装并保存计算结果
    const result = {
      profile: { ...p, height: h, age: a },
      weight: w,
      goalIdx: this.data.goalIdx,
      bmr, tdee, targetCal, carbG, proteinG, fatG: fatGrams,
      // 这里的逻辑会根据是否开启精细化，决定是全天统一还是三餐分开
      breakCarb: isAdv ? cl[this.data.breakCarbIdx] : cl[this.data.carbIdx],
      breakPro: isAdv ? pl[this.data.breakProIdx] : pl[this.data.proIdx],
      lunchCarb: isAdv ? cl[this.data.lunchCarbIdx] : cl[this.data.carbIdx],
      lunchPro: isAdv ? pl[this.data.lunchProIdx] : pl[this.data.proIdx],
      dinnerCarb: isAdv ? cl[this.data.dinnerCarbIdx] : cl[this.data.carbIdx],
      dinnerPro: isAdv ? pl[this.data.dinnerProIdx] : pl[this.data.proIdx],
      isTrain: this.data.isTrain,
      timeIdx: parseInt(this.data.timeIdx)
    };

    wx.setStorageSync('lastWeight', w);
    wx.setStorageSync('lastResult', result);

    // 跳转至结果页
    wx.navigateTo({ url: '/pages/result/result' });
  }
})