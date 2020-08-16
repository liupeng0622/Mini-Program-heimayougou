import { request } from "../../request/index.js"
import regeneratorRuntime from '../../lib/runtime/runtime'
import { login } from "../../utils/asyncWx.js"
Page({
  // 获取用户信息
  async handleGetUserInfo(e){
    try {
      // 获取用户信息
      const { encryptedDate, rawDate, iv, signature } = e.detail;
      // 获取小程序登录成功后的 code
      const {code} = await login();
      const loginParams = {encryptedDate, rawDate, iv, signature, code}
      // 发送请求，获取用户的 token
      const {token} = await request({"url":"/users/wxlogin", data:loginParams, method:"post"});
      // 把 token 存入缓存中，同时跳转回上一个页面
      wx.setStorageSync("token", token);
      wx.navigateBack({
        delta: 1
      });
    } catch (error) {
      console.log(error);
    }
  }
})