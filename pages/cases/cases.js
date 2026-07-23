const mockData = require('../../utils/mockData')

Page({
  data: {
    categories: ['全部', '电影', '短片', '短剧', '纪录片', '宣传片', '影视制作', '广告', 'AIGC', 'MV', '互动影游', '综艺'],
    activeCategory: '全部',
    cases: []
  },

  onLoad() {
    this.loadCases()
  },

  onShow() {
    this.loadCases()
  },

  onPullDownRefresh() {
    this.loadCases()
    wx.stopPullDownRefresh()
  },

  loadCases() {
    let filtered = mockData.cases
    if (this.data.activeCategory !== '全部') {
      filtered = filtered.filter(c => c.category === this.data.activeCategory)
    }
    this.setData({ cases: filtered })
  },

  switchCategory(e) {
    const cat = e.currentTarget.dataset.cat
    this.setData({ activeCategory: cat })
    this.loadCases()
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/casepkg/case-detail/case-detail?id=' + id })
  }
})
