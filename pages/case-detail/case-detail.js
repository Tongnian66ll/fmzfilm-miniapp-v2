const mockData = require('../../utils/mockData')

Page({
  data: {
    caseItem: null,
    currentImageIndex: 0
  },

  onLoad(options) {
    if (options.id) {
      const found = mockData.cases.find(c => c._id === options.id)
      if (found) {
        this.setData({ caseItem: found })
      } else {
        wx.showToast({ title: '案例不存在', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
      }
    }
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url
    if (this.data.caseItem && this.data.caseItem.images) {
      wx.previewImage({
        current: url,
        urls: this.data.caseItem.images
      })
    }
  },

  swiperChange(e) {
    this.setData({ currentImageIndex: e.detail.current })
  },

  onShareAppMessage() {
    const item = this.data.caseItem
    return {
      title: item ? item.title : '分秒帧影视',
      path: '/pages/case-detail/case-detail?id=' + (item ? item._id : ''),
      imageUrl: item ? item.coverUrl : ''
    }
  },

  onShareTimeline() {
    const item = this.data.caseItem
    return {
      title: item ? item.title : '分秒帧影视',
      imageUrl: item ? item.coverUrl : ''
    }
  }
})
