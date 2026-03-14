// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk')

// 初始化云能力
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  return {
    openid: wxContext.OPENID, // 你的唯一身份证
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}