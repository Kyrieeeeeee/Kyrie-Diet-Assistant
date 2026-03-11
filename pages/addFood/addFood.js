Page({
  data: { typeIdx: 0, name: '', refW: 0, nutriW: 0, hasUnit: false, uName: '', uW: 0 },
  inputName(e) { this.setData({ name: e.detail.value }); },
  changeType(e) { this.setData({ typeIdx: e.detail.value }); },
  inputRefW(e) { this.setData({ refW: e.detail.value }); },
  inputNutriW(e) { this.setData({ nutriW: e.detail.value }); },
  toggleUnit(e) { this.setData({ hasUnit: e.detail.value }); },
  inputUnitName(e) { this.setData({ uName: e.detail.value }); },
  inputUnitW(e) { this.setData({ uW: e.detail.value }); },

  save() {
    const { name, typeIdx, refW, nutriW, hasUnit, uName, uW } = this.data;
    if(!name || !refW || !nutriW) return wx.showToast({title:'请填写完整', icon:'none'});

    const food = {
      name,
      rate: parseFloat(nutriW) / parseFloat(refW),
      displayRate: `${nutriW}g/${refW}g`,
      unit: hasUnit ? { name: uName, weight: parseFloat(uW) } : null
    };

    let key = typeIdx == 0 ? 'carbList' : 'proteinList';
    let list = wx.getStorageSync(key) || [];
    list.push(food);
    wx.setStorageSync(key, list);
    
    wx.showToast({ title: '已录入' });
    setTimeout(() => { wx.navigateBack(); }, 800);
  }
})