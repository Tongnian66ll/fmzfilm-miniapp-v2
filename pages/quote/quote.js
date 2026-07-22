const mockData = require('../../utils/mockData')

Page({
  data: {
    services: [],
    allAddons: {},
    serviceAddons: {},
    currentAddons: [],
    selectedService: null,
    duration: 1,
    selectedPlan: 'monthly',
    quantity: 1,
    eventDurationType: 'half',
    selectedAddons: [],
    addonQuantities: {},
    totalPrice: 0,
    priceBreakdown: [],
    showWechatQR: false
  },

  onLoad() {
    const config = mockData.quoteConfig
    this.setData({
      services: config.services,
      allAddons: config.allAddons,
      serviceAddons: config.serviceAddons
    })
  },

  selectService(e) {
    const id = e.currentTarget.dataset.id
    const service = this.data.services.find(s => s.id === id)
    const addonIds = this.data.serviceAddons[id] || []
    const currentAddons = addonIds.map(aid => this.data.allAddons[aid]).filter(Boolean)
    this.setData({
      selectedService: service,
      currentAddons: currentAddons,
      selectedAddons: [],
      addonQuantities: {},
      duration: 1,
      quantity: 1,
      selectedPlan: 'monthly',
      eventDurationType: 'half'
    })
    this.calculate()
  },

  durationChange(e) {
    this.setData({ duration: Math.max(1, parseInt(e.detail.value) || 1) })
    this.calculate()
  },
  durationAdd() { this.setData({ duration: this.data.duration + 1 }); this.calculate() },
  durationMinus() {
    const min = (this.data.selectedService && this.data.selectedService.durationMin) || 1
    if (this.data.duration > min) { this.setData({ duration: this.data.duration - 1 }); this.calculate() }
  },

  selectPlan(e) {
    const planId = e.currentTarget.dataset.id
    const monthMap = { monthly: 1, 'half-year': 6, yearly: 12 }
    this.setData({ selectedPlan: planId, quantity: monthMap[planId] || 1 })
    this.calculate()
  },

  quantityChange(e) { this.setData({ quantity: Math.max(1, parseInt(e.detail.value) || 1) }); this.calculate() },
  quantityAdd() { this.setData({ quantity: this.data.quantity + 1 }); this.calculate() },
  quantityMinus() { if (this.data.quantity > 1) { this.setData({ quantity: this.data.quantity - 1 }); this.calculate() } },

  selectEventDuration(e) { this.setData({ eventDurationType: e.currentTarget.dataset.id }); this.calculate() },

  toggleAddon(e) {
    const id = e.currentTarget.dataset.id
    const selected = this.data.selectedAddons.slice()
    const idx = selected.indexOf(id)
    if (idx > -1) selected.splice(idx, 1); else selected.push(id)
    this.setData({ selectedAddons: selected })
    this.calculate()
  },

  addonQtyChange(e) {
    const { id } = e.currentTarget.dataset
    const val = parseInt(e.detail.value) || 0
    const quantities = Object.assign({}, this.data.addonQuantities, { [id]: Math.max(0, val) })
    this.setData({ addonQuantities: quantities })
    this.calculate()
  },
  addonQtyAdd(e) {
    const id = e.currentTarget.dataset.id
    const quantities = Object.assign({}, this.data.addonQuantities)
    quantities[id] = (quantities[id] || 0) + 1
    this.setData({ addonQuantities: quantities })
    this.calculate()
  },
  addonQtyMinus(e) {
    const id = e.currentTarget.dataset.id
    const quantities = Object.assign({}, this.data.addonQuantities)
    if ((quantities[id] || 0) > 0) { quantities[id]--; this.setData({ addonQuantities: quantities }); this.calculate() }
  },

  calculate() {
    const { selectedService } = this.data
    if (!selectedService) { this.setData({ totalPrice: 0, priceBreakdown: [] }); return }
    let total = 0
    const breakdown = []
    const sid = selectedService.id

    if (sid === 'propaganda' || sid === 'tvc') {
      const dur = this.data.duration
      const baseTotal = selectedService.basePrice * dur
      total += baseTotal
      breakdown.push({ label: selectedService.name, detail: dur === 1 ? '起拍价 ¥' + selectedService.basePrice : '¥' + selectedService.basePrice + ' × ' + dur + '分钟', amount: baseTotal })
    } else if (sid === 'short-video') {
      const plan = selectedService.plans.find(p => p.id === this.data.selectedPlan)
      const months = this.data.quantity
      const baseTotal = plan.price * months
      total += baseTotal
      breakdown.push({ label: selectedService.name + ' - ' + plan.name, detail: '¥' + plan.price + '/月 × ' + months + '个月 · ' + plan.desc, amount: baseTotal })
    } else if (sid === 'event') {
      const opt = selectedService.durationOptions.find(o => o.id === this.data.eventDurationType)
      total += opt.price
      breakdown.push({ label: selectedService.name, detail: opt.name, amount: opt.price })
    } else if (sid === 'short-film') {
      const dur = Math.max(1, this.data.duration)
      let filmPrice = 0, filmDetail = ''
      if (dur <= 5) { filmPrice = 8000; filmDetail = '5分钟内起拍' }
      else if (dur < 20) { filmPrice = 8000 + 1200 * (dur - 5); filmDetail = '5分钟内 ¥8000 + ' + (dur - 5) + '分钟 × ¥1200' }
      else { filmPrice = 8000 + 1200 * 15 + 1000 * (dur - 20); filmDetail = '5分钟内 ¥8000 + 15分钟 × ¥1200 + ' + (dur - 20) + '分钟 × ¥1000' }
      total += filmPrice
      breakdown.push({ label: selectedService.name, detail: filmDetail, amount: filmPrice })
    }

    this.data.selectedAddons.forEach(addonId => {
      const addon = this.data.allAddons[addonId]
      if (!addon) return
      const qty = this.data.addonQuantities[addonId] || 0
      if (addon.pricingType === 'fixed') {
        total += addon.price
        breakdown.push({ label: addon.name, detail: '¥' + addon.price + '/' + addon.unit, amount: addon.price })
      } else if (addon.pricingType === 'perQuantity') {
        const q = this.data.quantity || 1
        const amount = addon.price * q
        total += amount
        let detail = '¥' + addon.price + '/' + addon.unit + ' × ' + q + addon.unit
        if (addon.note) detail += '（' + addon.note + '）'
        breakdown.push({ label: addon.name, detail: detail, amount: amount })
      } else if (addon.pricingType === 'perAddonQty') {
        const amount = addon.price * qty
        total += amount
        breakdown.push({ label: addon.name, detail: '¥' + addon.price + '/' + addon.unit + ' × ' + qty + addon.unit, amount: amount })
      } else if (addon.pricingType === 'threshold') {
        const overCount = Math.max(0, qty - addon.threshold)
        const amount = overCount * addon.price
        total += amount
        let detail = ''
        if (qty > 0) { detail = qty + addon.unit + '，超出' + addon.threshold + '的部分: ' + overCount + ' × ¥' + addon.price; if (addon.note) detail += '（' + addon.note + '）' }
        else { detail = addon.note || '' }
        breakdown.push({ label: addon.name, detail: detail, amount: amount })
      } else if (addon.pricingType === 'custom') {
        breakdown.push({ label: addon.name, detail: addon.note || '费用另算', amount: 0 })
      }
    })

    this.setData({ totalPrice: total, priceBreakdown: breakdown })
  },

  showWechatQR() {
    this.setData({ showWechatQR: true })
  },

  closeWechatQR() {
    this.setData({ showWechatQR: false })
  },

  onShareAppMessage() {
    return {
      title: '分秒帧影视 - 服务报价查询',
      path: '/pages/quote/quote',
      imageUrl: '/images/share-cover.jpg'
    }
  },

  onShareTimeline() {
    return {
      title: '分秒帧影视 - 服务报价查询',
      imageUrl: '/images/share-cover.jpg'
    }
  }
})
