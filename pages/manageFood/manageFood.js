Page({
  data: {
    tabIdx: 0, listData: [], showEdit: false,
    editForm: { idx: -1, name: '', per100: '', unitName: '', unitWeight: '' }
  },
  onShow() { this.loadData(); },
  switchTab(e) { this.setData({ tabIdx: parseInt(e.currentTarget.dataset.idx) }); this.loadData(); },

  loadData() {
    let key = 'carbList';
    if (this.data.tabIdx == 1) key = 'proteinList';
    if (this.data.tabIdx == 2) key = 'comboList';
    this.setData({ listData: wx.getStorageSync(key) || [] });
  },

  goToAdd() { wx.navigateTo({ url: '/pages/addFood/addFood' }); },

  deleteFood(e) {
    let idx = e.currentTarget.dataset.idx;
    let key = this.data.tabIdx == 0 ? 'carbList' : (this.data.tabIdx == 1 ? 'proteinList' : 'comboList');
    wx.showModal({
      title: '确认删除', content: '是否删除该食材？',
      success: (res) => {
        if (res.confirm) {
          let list = this.data.listData;
          list.splice(idx, 1);
          wx.setStorageSync(key, list);
          this.loadData();
        }
      }
    });
  },

  openEdit(e) {
    let idx = e.currentTarget.dataset.idx;
    let item = this.data.listData[idx];

    // 🌟 核心：如果是复合食物，跳转到 addFood 页面编辑
    if (this.data.tabIdx == 2) {
      wx.navigateTo({ url: `/pages/addFood/addFood?editIdx=${idx}` });
      return;
    }

    // 单营养食物仍使用弹窗编辑
    this.setData({
      showEdit: true,
      editForm: {
        idx: idx,
        name: item.name,
        per100: Math.round(item.rate * 100),
        unitName: item.unit ? item.unit.name : '',
        unitWeight: item.unit ? item.unit.weight : ''
      }
    });
  },

  closeEdit() { this.setData({ showEdit: false }); },
  inputEditName(e) { this.setData({ 'editForm.name': e.detail.value }); },
  inputEditPer100(e) { this.setData({ 'editForm.per100': e.detail.value }); },
  inputEditUnitName(e) { this.setData({ 'editForm.unitName': e.detail.value }); },
  inputEditUnitWeight(e) { this.setData({ 'editForm.unitWeight': e.detail.value }); },

  saveEdit() {
    let f = this.data.editForm;
    let newItem = {
      name: f.name,
      rate: parseFloat(f.per100) / 100,
      desc: `${f.per100}g/100g`,
      unit: f.unitName && f.unitWeight ? { name: f.unitName, weight: parseFloat(f.unitWeight) } : null
    };
    let key = this.data.tabIdx == 0 ? 'carbList' : 'proteinList';
    let list = this.data.listData;
    list[f.idx] = newItem;
    wx.setStorageSync(key, list);
    this.closeEdit();
    this.loadData();
    wx.showToast({ title: '修改成功' });
  }
})