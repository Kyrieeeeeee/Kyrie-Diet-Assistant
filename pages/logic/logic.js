Page({
  data: { p: {}, w: 0, bmr: 0, tdee: 0, targetCal: 0, carbG: 0, proteinG: 0, fatG: 0, goalText: '', carbPercent: '', proPercent: '', timeText: '' },
  onLoad() {
    const data = wx.getStorageSync('lastResult');
    if (!data) return;
    const gText = data.goalIdx == 0 ? "减脂 (制造约36%热量缺口)" : "增肌 (制造约16%热量盈余)";
    const cPct = data.goalIdx == 0 ? "64%" : "70%";
    const pPct = data.goalIdx == 0 ? "36%" : "30%";
    let times = ['空腹晨练', '上午练', '下午练', '傍晚练', '夜间练'];
    let tText = data.isTrain ? times[data.timeIdx] : '休息日 (无运动安排)';
    this.setData({ p: data.profile, w: data.weight, goalIdx: data.goalIdx, isTrain: data.isTrain, bmr: Math.round(data.bmr), tdee: Math.round(data.tdee), targetCal: Math.round(data.targetCal), carbG: Math.round(data.carbG), proteinG: Math.round(data.proteinG), fatG: Math.round(data.fatG), goalText: gText, carbPercent: cPct, proPercent: pPct, timeText: tText });
  }
})