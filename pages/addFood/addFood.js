Page({
  data: { 
    typeIdx: 0, name: '', refW: 0, nutriW: 0, hasUnit: false, uName: '', uW: 0,
    isCombo: false, carbList: [], proteinList: [], 
    comboCarbIdx: -1, comboCarbW: '', comboProIdx: -1, comboProW: '',
    editIdx: -1 // 🌟 记录是否为编辑模式
  },

  onLoad(options) {
    const cList = wx.getStorageSync('carbList') || [];
    const pList = wx.getStorageSync('proteinList') || [];
    this.setData({ carbList: cList, proteinList: pList });

    // 🌟 如果带有 editIdx，说明是编辑模式
    if (options.editIdx !== undefined) {
      const idx = parseInt(options.editIdx);
      const comboList = wx.getStorageSync('comboList') || [];
      const item = comboList[idx];

      if (item) {
        // 反查原食材在当前库里的索引
        const cIdx = cList.findIndex(c => c.name === item.carbSourceName);
        const pIdx = pList.findIndex(p => p.name === item.proSourceName);

        this.setData({
          editIdx: idx,
          isCombo: true,
          name: item.name,
          comboCarbIdx: cIdx,
          comboCarbW: item.carbSourceW,
          comboProIdx: pIdx,
          comboProW: item.proSourceW
        });
      }
    }
  },

  inputName(e) { this.setData({ name: e.detail.value }); },
  changeType(e) { this.setData({ typeIdx: e.detail.value }); },
  inputRefW(e) { this.setData({ refW: e.detail.value }); },
  inputNutriW(e) { this.setData({ nutriW: e.detail.value }); },
  toggleUnit(e) { this.setData({ hasUnit: e.detail.value }); },
  inputUnitName(e) { this.setData({ uName: e.detail.value }); },
  inputUnitW(e) { this.setData({ uW: e.detail.value }); },
  toggleCombo(e) { this.setData({ isCombo: e.detail.value }); },
  changeComboCarb(e) { this.setData({ comboCarbIdx: e.detail.value }); },
  inputComboCarbW(e) { this.setData({ comboCarbW: e.detail.value }); },
  changeComboPro(e) { this.setData({ comboProIdx: e.detail.value }); },
  inputComboProW(e) { this.setData({ comboProW: e.detail.value }); },

  save() {
    const d = this.data;
    if (!d.name) return wx.showToast({ title: '请输入名称', icon: 'none' });

    if (d.isCombo) {
      if (d.comboCarbIdx < 0 || !d.comboCarbW || d.comboProIdx < 0 || !d.comboProW) {
        return wx.showToast({ title: '请配置完整', icon: 'none' });
      }
      const selC = d.carbList[d.comboCarbIdx];
      const selP = d.proteinList[d.comboProIdx];
      const cW = parseFloat(d.comboCarbW);
      const pW = parseFloat(d.comboProW);

      const comboFood = {
        name: d.name, isCombo: true,
        carbVal: selC.rate * cW, proVal: selP.rate * pW,
        carbSourceName: selC.name, carbSourceW: cW, // 保存详细信息用于回填编辑
        proSourceName: selP.name, proSourceW: pW,
        desc: `包含: ${selC.name}(${cW}g) + ${selP.name}(${pW}g)`
      };

      let list = wx.getStorageSync('comboList') || [];
      if (d.editIdx > -1) {
        list[d.editIdx] = comboFood; // 🌟 编辑模式：覆盖原位
      } else {
        list.push(comboFood); // 🌟 新增模式：推入末尾
      }
      wx.setStorageSync('comboList', list);

    } else {
      // 普通单营养食物保存逻辑（原有逻辑）
      if(!d.refW || !d.nutriW) return wx.showToast({title:'请填写完整', icon:'none'});
      const food = {
        name: d.name, rate: parseFloat(d.nutriW) / parseFloat(d.refW),
        desc: `${d.nutriW}g/${d.refW}g`,
        unit: d.hasUnit ? { name: d.uName, weight: parseFloat(d.uW) } : null
      };
      let key = d.typeIdx == 0 ? 'carbList' : 'proteinList';
      let list = wx.getStorageSync(key) || [];
      list.push(food);
      wx.setStorageSync(key, list);
    }
    
    wx.showToast({ title: d.editIdx > -1 ? '修改成功' : '已录入' });
    setTimeout(() => { wx.navigateBack(); }, 800);
  }
})