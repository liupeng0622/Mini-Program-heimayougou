/*
1. 获取用户收货地址
  1> 绑定点击事件
  2> 调用小程序内置 api，获取用户的收货地址

  3> 获取用户对小程序所授予获取地址的权限状态 scope
    1> 如果用户点击获取地址的提示框为确定，scope 值为 true 
    authSetting: scope.address: true
    2> 如果用户从来没有调用过 api，值为 undefined
    3> 如果用户在提示框点了取消，scope 值为 false
      诱导用户自己打开授权设置页面 wx.openSetting，当用户重新给予获取地址权限的时候，获取收货地址
    4> 把获取到的收货地址存入到本地存储中
2. 页面加载完毕
  0> onLoad onShow
  1> 获取本地存储中的地址数据
  2> 把这个数据设置给 data 中的一个变量
3. onShow
  0> 回到了商品详情页面，第一次添加商品的时候，手动添加了属性
    1. num = 1;
    2. checked = true;
  1> 获取缓存中的购物车数组
  2> 把购物车数据填充到 data 中
4. 全选的实现，数据的展示
  1 onShow 获取缓存中的购物车数组
  2 根据购物车中的商品数据，所有的商品都被选中 checked=true，全选就被选中
5. 总价格和总数量
  1 都需要商品被选中，我们才拿它来计算
*/

import { getSetting, chooseAddress, openSetting } from "../../utils/asyncWx.js"
import regeneratorRuntime from '../../lib/runtime/runtime'

Page({
  data: {
    address: {},
    cart: [],
    allChecked: false
  },
  onShow(){
    // 获取缓存中收获地址信息
    const address = wx.getStorageSync("address");
    // 获取缓存中购物车数据
    const cart = wx.getStorageSync("cart")||[];
    // 计算全选
    // every 数组方法，遍历接收一个回调函数，每一个回调函数都返回 true，every 方法返回true
    // 只要有一个回调函数返回了 false，那么不再循环执行，直接返回false
    // 空数组调用 every，返回值为 true
    const allChecked = cart.length ? cart.every(v=>v.checked) : false;
    // 给 data 赋值
    this.setData({
      address,
      cart,
      allChecked
    })
  },
    // 点击收货地址
  async handleChooseAddress(){
    try {
      // 1. 获取权限状态
      const res1 = await getSetting();
      const scopeAddress = res1.authSetting["scope.address"]; 
      // 2. 判断权限状态
      if(scopeAddress === false){
        // 诱导用户打开授予权限页面
        await openSetting();
      };
      // 调用获取地址api
      let address = await chooseAddress();
      address.all = address.provinceName+address.cityName+address.countyName+address.detailInfo;
      // 存入到缓存中
      wx.setStorageSync("address", address);
    } catch (error) {
      console.log(error);
    }
  }
})