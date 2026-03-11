Page({
  data: { carbG: 0, proteinG: 0, meals: [] },

  onLoad() {
    const data = wx.getStorageSync('lastResult');
    
    // 如果数据是空的，说明流程断了，直接退回
    if (!data || !data.carbG) {
      wx.showModal({
        title: '计算失效',
        content: '数据读取失败，请在首页重新点击生成。',
        showCancel: false,
        success: () => { wx.navigateBack(); }
      });
      return;
    }

    const getFoodDetail = (targetG, food) => {
      if(!food || targetG <= 0) return { weight: 0, name: '无需摄入', unitObj: null, rateDesc: '' };
      let weight = Math.round(targetG / food.rate);
      let unitObj = food.unit ? { 
        num: (weight / food.unit.weight).toFixed(1), 
        name: food.unit.name 
      } : null;
      let rateDesc = food.desc ? food.desc : `${(food.rate * 100).toFixed(1)}%`;
      return { weight, name: food.name, unitObj, rateDesc };
    };

    let totalC = data.carbG;
    let totalP = data.proteinG;
    let cDist = [0.2, 0.4, 0.4]; 
    let pDist = [0.33, 0.33, 0.34]; 
    let names = ['早餐', '午餐', '晚餐'];
    let postIdx = -1;

    if (data.isTrain) {
      const t = data.timeIdx;
      if (t === 0) { names = ['练后早餐 (核心)', '午餐', '晚餐']; cDist = [0.45, 0.3, 0.25]; pDist = [0.4, 0.3, 0.3]; postIdx = 0; }
      else if (t === 1) { names = ['早餐', '练后加餐 (核心)', '午餐', '晚餐']; cDist = [0.15, 0.45, 0.2, 0.2]; pDist = [0.2, 0.4, 0.2, 0.2]; postIdx = 1; }
      else if (t === 2) { names = ['早餐', '午餐', '练后加餐 (核心)', '晚餐']; cDist = [0.15, 0.2, 0.45, 0.2]; pDist = [0.2, 0.2, 0.4, 0.2]; postIdx = 2; }
      else if (t === 3) { names = ['早餐', '午餐', '练前加餐', '练后晚餐 (核心)']; cDist = [0.15, 0.2, 0.15, 0.5]; pDist = [0.2, 0.2, 0, 0.6]; postIdx = 3; }
      else if (t === 4) { names = ['早餐', '午餐', '练前晚餐', '练后夜宵 (核心)']; cDist = [0.15, 0.25, 0.2, 0.4]; pDist = [0.2, 0.3, 0.2, 0.3]; postIdx = 3; }
    }

    let meals = names.map((name, i) => {
      let cObj, pObj;
      if (name.includes('早')) { cObj = data.breakCarb; pObj = data.breakPro; }
      else if (name.includes('午')) { cObj = data.lunchCarb; pObj = data.lunchPro; }
      else { cObj = data.dinnerCarb; pObj = data.dinnerPro; }

      const c = getFoodDetail(totalC * cDist[i], cObj);
      const p = getFoodDetail(totalP * pDist[i], pObj);
      return {
        name: name, isPost: i === postIdx,
        carbW: c.weight, carbName: c.name, carbUnitObj: c.unitObj, carbRateDesc: c.rateDesc,
        proW: p.weight, proName: p.name, proUnitObj: p.unitObj, proRateDesc: p.rateDesc
      };
    });

    this.setData({ carbG: Math.round(totalC), proteinG: Math.round(totalP), meals });
  },

  goToLogic() { wx.navigateTo({ url: '/pages/logic/logic' }); }
})