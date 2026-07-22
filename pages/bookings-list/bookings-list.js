const app = getApp()

Page({
  data: {
    bookings: [],
    loading: true
  },

  onShow() {
    this.loadBookings()
  },

  async loadBookings() {
    this.setData({ loading: true })
    try {
      // 先尝试从云端加载
      const res = await wx.cloud.callFunction({
        name: 'getMyBookings',
        data: {}
      })
      if (res.result && res.result.success) {
        const bookings = (res.result.data || []).map(b => ({
          ...b,
          createTimeStr: this.formatTime(b.createTime || b._createTime)
        }))
        this.setData({ bookings, loading: false })
        return
      }
    } catch (e) {
      console.log('云端加载失败，尝试本地数据', e)
    }

    // 云端不可用时，从本地存储读取
    const localBookings = wx.getStorageSync('myBookings') || []
    const bookings = localBookings.map(b => ({
      ...b,
      createTimeStr: this.formatTime(b.createTime)
    }))
    this.setData({ bookings, loading: false })
  },

  formatTime(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    const pad = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
