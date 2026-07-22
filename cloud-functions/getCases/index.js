const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    let query = db.collection('cases')
    if (event.category && event.category !== '全部') {
      query = query.where({ category: event.category })
    }
    const res = await query.orderBy('sort', 'asc').limit(20).get()
    return { success: true, data: res.data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
