Page({
  data: {
    profile: null,
    weight: '',
    goalIdx: 0,
    isTrain: false,
    timeIdx: 0,
    times: ['空腹晨练 (练后吃早饭)', '上午练 (早饭后练)', '下午练 (午饭后练)', '傍晚练 (晚饭前练)', '夜间练 (晚饭后练)'],
    
    isAerobic: false,
    aerobicIdx: 0,
    aerobicHours: '',
    aerobicOptions: [
      { name: '平地走 (3.8 kcal/kg/h)', rate: 3.8 },
      { name: '爬坡走(坡度5°) (5.5 kcal/kg/h)', rate: 5.5 },
      { name: '爬坡走(坡度10°) (8.0 kcal/kg/h)', rate: 8.0 },
      { name: '跑步(8km/h) (9.5 kcal/kg/h)', rate: 9.5 },
      { name: '跑步(10km/h) (9.8 kcal/kg/h)', rate: 9.8 },
      { name: '跑步(12km/h) (10.1 kcal/kg/h)', rate: 10.1 },
      { name: '户外骑行(15km/h) (5.5 kcal/kg/h)', rate: 5.5 },
      { name: '室内单车 (8.8 kcal/kg/h)', rate: 8.8 },
      { name: '游泳(2km/h) (7.7 kcal/kg/h)', rate: 7.7 }
    ],

    carbList: [], proteinList: [], isAdvanced: false,
    carbIdx: 0, proIdx: 0, breakCarbIdx: 0, breakProIdx: 0,
    lunchCarbIdx: 0, lunchProIdx: 0, dinnerCarbIdx: 0, dinnerProIdx: 0
  },

  onShow() {
    const profile = wx.getStorageSync('userProfile');
    if (!profile) {
      wx.showToast({ title: '请先完善基础档案', icon: 'none' });
      setTimeout(() => { wx.navigateTo({ url: '/pages/profile/profile' }); }, 1000);
      return;
    }
    this.setData({ profile, weight: wx.getStorageSync('lastWeight') || '', carbList: wx.getStorageSync('carbList') || [], proteinList: wx.getStorageSync('proteinList') || [] });
  },

  inputWeight(e) { this.setData({ weight: e.detail.value }); },
  changeGoal(e) { this.setData({ goalIdx: e.detail.value }); },
  toggleTrain(e) { this.setData({ isTrain: e.detail.value }); },
  changeTime(e) { this.setData({ timeIdx: e.detail.value }); },
  toggleAerobic(e) { this.setData({ isAerobic: e.detail.value }); },
  changeAerobic(e) { this.setData({ aerobicIdx: e.detail.value }); },
  inputAerobicHours(e) { this.setData({ aerobicHours: e.detail.value }); },
  toggleAdvanced(e) { this.setData({ isAdvanced: e.detail.value }); },
  pickCarb(e) { this.setData({ carbIdx: e.detail.value }); },
  pickPro(e) { this.setData({ proIdx: e.detail.value }); },
  pickBreakCarb(e) { this.setData({ breakCarbIdx: e.detail.value }); },
  pickBreakPro(e) { this.setData({ breakProIdx: e.detail.value }); },
  pickLunchCarb(e) { this.setData({ lunchCarbIdx: e.detail.value }); },
  pickLunchPro(e) { this.setData({ lunchProIdx: e.detail.value }); },
  pickDinnerCarb(e) { this.setData({ dinnerCarbIdx: e.detail.value }); },
  pickDinnerPro(e) { this.setData({ dinnerProIdx: e.detail.value }); },

  goToProfile() { wx.navigateTo({ url: '/pages/profile/profile' }); },
  goToManageFood() { wx.navigateTo({ url: '/pages/manageFood/manageFood' }); },

  calculate() {
    const w = parseFloat(this.data.weight);
    const p = this.data.profile;
    if (!w || isNaN(w)) return wx.showToast({ title: '请填写有效体重', icon: 'none' });

    const h = parseFloat(p.height);
    const a = parseFloat(p.age);
    const isFatLoss = this.data.goalIdx == 0;

    let bmr = 9.99 * w + 6.25 * h - 4.92 * a + (p.isMale ? 5 : -161);
    let trainBurn = this.data.isTrain ? (p.isMale ? 200 : 150) : 0;
    
    // 🌟 修改：直接计算当日有氧消耗（不再除以7）
    let aerobicDailyBurn = 0;
    if (this.data.isAerobic) {
      const aeroRate = this.data.aerobicOptions[this.data.aerobicIdx].rate;
      const hours = parseFloat(this.data.aerobicHours) || 0;
      aerobicDailyBurn = aeroRate * w * hours; // 当日消耗 = 系数 * 体重 * 当日时长
    }

    let tdee = (bmr / 0.7) + trainBurn + aerobicDailyBurn;
    let targetCal = tdee * (isFatLoss ? 0.64 : 0.84);

    let fatGrams = p.isMale ? (isFatLoss ? 60 : 80) : (isFatLoss ? 50 : 70);
    let remainingCal = targetCal - (fatGrams * 9);
    let carbG = (remainingCal * (isFatLoss ? 0.64 : 0.70)) / 4;
    let proteinG = (remainingCal * (isFatLoss ? 0.36 : 0.30)) / 4;

    const cl = this.data.carbList;
    const pl = this.data.proteinList;
    const isAdv = this.data.isAdvanced;

    const result = {
      profile: { ...p, height: h, age: a }, weight: w, goalIdx: this.data.goalIdx,
      bmr, tdee, targetCal, carbG, proteinG, fatG: fatGrams,
      breakCarb: isAdv ? cl[this.data.breakCarbIdx] : cl[this.data.carbIdx],
      breakPro: isAdv ? pl[this.data.breakProIdx] : pl[this.data.proIdx],
      lunchCarb: isAdv ? cl[this.data.lunchCarbIdx] : cl[this.data.carbIdx],
      lunchPro: isAdv ? pl[this.data.lunchProIdx] : pl[this.data.proIdx],
      dinnerCarb: isAdv ? cl[this.data.dinnerCarbIdx] : cl[this.data.carbIdx],
      dinnerPro: isAdv ? pl[this.data.dinnerProIdx] : pl[this.data.proIdx],
      isTrain: this.data.isTrain,
      timeIdx: parseInt(this.data.timeIdx),
      isAerobic: this.data.isAerobic,
      aerobicDailyBurn: aerobicDailyBurn,
      aerobicText: this.data.isAerobic ? `${this.data.aerobicOptions[this.data.aerobicIdx].name.split(' ')[0]} (今日${this.data.aerobicHours}h)` : ''
    };

    wx.setStorageSync('lastWeight', w);
    wx.setStorageSync('lastResult', result);
    wx.navigateTo({ url: '/pages/result/result' });
  }
})