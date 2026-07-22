const app = getApp()

Page({
  data: {
    showWechatQR: false,
    menuItems: [
      { id: 'wechat', label: '添加微信', icon: '💬', desc: '微信号：njfmz1' },
      { id: 'about', label: '关于我们', icon: '🏢' },
      { id: 'share', label: '分享给朋友', icon: '📤', type: 'share' },
    ]
  },

  onMenuTap(e) {
    const id = e.currentTarget.dataset.id
    switch (id) {
      case 'wechat':
        this.setData({ showWechatQR: true })
        break
      case 'about':
        wx.showModal({
          title: '分秒帧影视',
          content: '南京分秒帧影视有限公司\n\n专业影视制作团队\n50+项目经验 · 18项电影节入围\n从创意到成片，以帧级精度打磨每一部作品',
          showCancel: false,
          confirmText: '知道了'
        })
        break
    }
  },

  closeWechatQR() {
    this.setData({ showWechatQR: false })
  },

  onShareAppMessage() {
    return {
      title: '分秒帧影视 - 专业影视制作',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg'
    }
  },

  onShareTimeline() {
    return {
      title: '分秒帧影视 - 专业影视制作',
      imageUrl: '/images/share-cover.jpg'
    }
  }
})
