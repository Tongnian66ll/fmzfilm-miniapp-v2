const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try {
    const res = await db.collection('bookings')
      .where({ _openid: wxContext.OPENID })
      .orderBy('createTime', 'desc')
      .limit(20)
      .get()
    return { success: true, data: res.data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
