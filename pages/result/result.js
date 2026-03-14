Page({
  data: { carbG: 0, proteinG: 0, meals: [] },

  onLoad() {
    const data = wx.getStorageSync('lastResult');
    if (!data || !data.carbG) return wx.navigateBack();

    const getFoodDetail = (targetG, food) => {
      // 🌟 防错：如果 food 对象丢失，给予默认反馈
      if(!food || targetG <= 0) return { weight: 0, name: food ? food.name : '未选食材', unitObj: null, rateDesc: food ? food.desc : '' };
      let weight = Math.round(targetG / food.rate);
      let unitObj = food.unit ? { num: (weight / food.unit.weight).toFixed(1), name: food.unit.name } : null;
      return { weight, name: food.name, unitObj, rateDesc: food.desc || `${(food.rate * 100).toFixed(1)}%` };
    };

    let totalC = data.carbG;
    let totalP = data.proteinG;
    let cDist = [0.2, 0.4, 0.4]; 
    let pDist = [0.33, 0.33, 0.34]; 
    let names = ['早餐', '午餐', '晚餐'];
    let postIdx = -1;

    // 训练模式比例调整
    if (data.isTrain) {
      const t = data.timeIdx;
      if (t === 0) { names = ['练后早餐 (核心)', '午餐', '晚餐']; cDist = [0.45, 0.3, 0.25]; pDist = [0.4, 0.3, 0.3]; postIdx = 0; }
      else if (t === 1) { names = ['早餐', '练后加餐 (核心)', '午餐', '晚餐']; cDist = [0.15, 0.45, 0.2, 0.2]; pDist = [0.2, 0.4, 0.2, 0.2]; postIdx = 1; }
      else if (t === 2) { names = ['早餐', '午餐', '练后加餐 (核心)', '晚餐']; cDist = [0.15, 0.2, 0.45, 0.2]; pDist = [0.2, 0.2, 0.4, 0.2]; postIdx = 2; }
      else if (t === 3) { names = ['早餐', '午餐', '练前加餐', '练后晚餐 (核心)']; cDist = [0.15, 0.2, 0.15, 0.5]; pDist = [0.2, 0.2, 0, 0.6]; postIdx = 3; }
      else if (t === 4) { names = ['早餐', '午餐', '练前晚餐', '练后夜宵 (核心)']; cDist = [0.15, 0.25, 0.2, 0.4]; pDist = [0.2, 0.3, 0.2, 0.3]; postIdx = 3; }
    }

    // 🌟 1. 建立初步餐次映射，并判定复合来源
    let applied = { breakfast: false, lunch: false, dinner: false };
    let mappedMeals = names.map((name, i) => {
      let key = 'snack';
      if (name.includes('早') && !applied.breakfast) { key = 'breakfast'; applied.breakfast = true; }
      else if (name.includes('午') && !applied.lunch) { key = 'lunch'; applied.lunch = true; }
      else if ((name.includes('晚') || name.includes('夜宵')) && !applied.dinner) { key = 'dinner'; applied.dinner = true; }

      const s = data.selections;
      const combo = (data.isAdvanced && s && s[key]) ? s[key].combo : null;
      const cObj = (data.isAdvanced && s && s[key]) ? s[key].carb : s.allDay.carb;
      const pObj = (data.isAdvanced && s && s[key]) ? s[key].pro : s.allDay.pro;

      return { name, isPost: i === postIdx, cDist: cDist[i], pDist: pDist[i], cObj, pObj, combo };
    });

    // 🌟 2. 核心：优先扣除复合食物量
    let remC = totalC, remP = totalP, remCDist = 0, remPDist = 0;
    mappedMeals.forEach(m => {
      if (m.combo) {
        remC -= m.combo.carbVal;
        remP -= m.combo.proVal;
        m.cTarget = m.combo.carbVal;
        m.pTarget = m.combo.proVal;
      } else {
        remCDist += m.cDist;
        remPDist += m.pDist;
      }
    });

    // 🌟 3. 弹性分配剩余量
    if (remC < 0) remC = 0; if (remP < 0) remP = 0;
    mappedMeals.forEach(m => {
      if (!m.combo) {
        m.cTarget = remCDist > 0 ? remC * (m.cDist / remCDist) : 0;
        m.pTarget = remPDist > 0 ? remP * (m.pDist / remPDist) : 0;
      }
    });

    // 🌟 4. 渲染数据转换
    let meals = mappedMeals.map(m => {
      if (m.combo) {
        return { name: m.name, isPost: m.isPost, isCombo: true, comboName: m.combo.name, comboDesc: m.combo.desc, carbW: Math.round(m.cTarget), proW: Math.round(m.pTarget) };
      }
      const c = getFoodDetail(m.cTarget, m.cObj);
      const p = getFoodDetail(m.pTarget, m.pObj);
      return { name: m.name, isPost: m.isPost, isCombo: false, carbW: c.weight, carbName: c.name, carbUnitObj: c.unitObj, carbRateDesc: c.rateDesc, proW: p.weight, proName: p.name, proUnitObj: p.unitObj, proRateDesc: p.rateDesc };
    });

    this.setData({ carbG: Math.round(totalC), proteinG: Math.round(totalP), meals });
  },

  goToLogic() { wx.navigateTo({ url: '/pages/logic/logic' }); }
})