Page({
  data: {
    profile: null, weight: '', goalIdx: 0, isTrain: false, timeIdx: 0,
    times: ['空腹晨练 (练后吃早饭)', '上午练 (早饭后练)', '下午练 (午饭后练)', '傍晚练 (练前加餐/练后晚餐)', '夜间练 (练前晚餐/练后夜宵)'],
    carbList: [], proteinList: [], comboList: [], isAdvanced: false,
    carbIdx: 0, proIdx: 0, breakCarbIdx: 0, breakProIdx: 0, lunchCarbIdx: 0, lunchProIdx: 0, dinnerCarbIdx: 0, dinnerProIdx: 0,
    breakComboIdx: -1, lunchComboIdx: -1, dinnerComboIdx: -1,
    isAerobic: false, aerobicIdx: 0, aerobicHours: '',
    aerobicOptions: [
      { name: '平地走 (3.8 kcal/kg/h)', rate: 3.8 }, { name: '爬坡走(坡度5°) (5.5 kcal/kg/h)', rate: 5.5 },
      { name: '爬坡走(坡度10°) (8.0 kcal/kg/h)', rate: 8.0 }, { name: '跑步(8km/h) (9.5 kcal/kg/h)', rate: 9.5 },
      { name: '跑步(10km/h) (9.8 kcal/kg/h)', rate: 9.8 }, { name: '跑步(12km/h) (10.1 kcal/kg/h)', rate: 10.1 },
      { name: '户外骑行(15km/h) (5.5 kcal/kg/h)', rate: 5.5 }, { name: '室内单车 (8.8 kcal/kg/h)', rate: 8.8 },
      { name: '游泳(2km/h) (7.7 kcal/kg/h)', rate: 7.7 }
    ]
  },

  onShow() {
    const profile = wx.getStorageSync('userProfile');
    if (!profile) { wx.showToast({ title: '请先完善基础档案', icon: 'none' }); return; }
    this.setData({
      profile, weight: wx.getStorageSync('lastWeight') || '',
      carbList: wx.getStorageSync('carbList') || [],
      proteinList: wx.getStorageSync('proteinList') || [],
      comboList: wx.getStorageSync('comboList') || []
    });
  },

  inputWeight(e) { this.setData({ weight: e.detail.value }); },
  changeGoal(e) { this.setData({ goalIdx: e.detail.value }); },
  toggleTrain(e) { this.setData({ isTrain: e.detail.value }); },
  changeTime(e) { this.setData({ timeIdx: e.detail.value }); },
  toggleAdvanced(e) { this.setData({ isAdvanced: e.detail.value }); },
  toggleAerobic(e) { this.setData({ isAerobic: e.detail.value }); },
  changeAerobic(e) { this.setData({ aerobicIdx: e.detail.value }); },
  inputAerobicHours(e) { this.setData({ aerobicHours: e.detail.value }); },
  pickCarb(e) { this.setData({ carbIdx: e.detail.value }); },
  pickPro(e) { this.setData({ proIdx: e.detail.value }); },
  pickBreakCombo(e) { this.setData({ breakComboIdx: e.detail.value }); },
  pickLunchCombo(e) { this.setData({ lunchComboIdx: e.detail.value }); },
  pickDinnerCombo(e) { this.setData({ dinnerComboIdx: e.detail.value }); },
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

    let bmr = 9.99 * w + 6.25 * p.height - 4.92 * p.age + (p.isMale ? 5 : -161);
    let trainBurn = this.data.isTrain ? (p.isMale ? 200 : 150) : 0;
    let aerobicDailyBurn = this.data.isAerobic ? (this.data.aerobicOptions[this.data.aerobicIdx].rate * w * (parseFloat(this.data.aerobicHours) || 0)) : 0;

    let tdee = (bmr / 0.7) + trainBurn + aerobicDailyBurn;
    let targetCal = tdee * (this.data.goalIdx == 0 ? 0.64 : 0.84);
    let fatG = p.isMale ? (this.data.goalIdx == 0 ? 60 : 80) : (this.data.goalIdx == 0 ? 50 : 70);
    let remCal = targetCal - (fatG * 9);
    let carbG = (remCal * (this.data.goalIdx == 0 ? 0.64 : 0.70)) / 4;
    let proteinG = (remCal * (this.data.goalIdx == 0 ? 0.36 : 0.30)) / 4;

    const d = this.data;
    const res = {
      profile: p, weight: w, goalIdx: d.goalIdx, isAdvanced: d.isAdvanced, isTrain: d.isTrain, timeIdx: parseInt(d.timeIdx),
      bmr, tdee, targetCal, carbG, proteinG, fatG, aerobicDailyBurn: Math.round(aerobicDailyBurn),
      // 🌟 核心修复：确保 selections 结构清晰
      selections: {
        allDay: { carb: d.carbList[d.carbIdx], pro: d.proteinList[d.proIdx] },
        breakfast: { carb: d.carbList[d.breakCarbIdx], pro: d.proteinList[d.breakProIdx], combo: d.breakComboIdx > -1 ? d.comboList[d.breakComboIdx] : null },
        lunch: { carb: d.carbList[d.lunchCarbIdx], pro: d.proteinList[d.lunchProIdx], combo: d.lunchComboIdx > -1 ? d.comboList[d.lunchComboIdx] : null },
        dinner: { carb: d.carbList[d.dinnerCarbIdx], pro: d.proteinList[d.dinnerProIdx], combo: d.dinnerComboIdx > -1 ? d.comboList[d.dinnerComboIdx] : null }
      }
    };
    wx.setStorageSync('lastResult', res);
    wx.setStorageSync('lastWeight', w);
    wx.navigateTo({ url: '/pages/result/result' });
  }
})