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
  2 获取购物车数组
  3 遍历
  4 判断商品是否被选中
  5 总价格 += 商品的单价 * 商品的数量 、 总数量 += 商品的数量
  6 把计算后的价格和数量，设置回 data 中即可
6. 商品的选中
  1 绑定 change 事件
  2 获取到被修改的商品对象
  3 商品对象的选中状态 取反
  4 重新填充回 data 中和缓存中
  5 重新计算全选、总价格、总数量
7 全选反选
  1 全选复选框绑定事件 change
  2 获取 data 中的全选变量 allChecked
  3 直接取反 allChecked = !allChecked
  4 遍历购物车数组，让里面商品选中状态跟随 allChecked 改变而改变
  5 把购物车数组和 allChecked 重新设置回 data，把购物车重新设置回缓存中
8 商品数量的编辑
  1 "+" "-" 绑定同一个点击事件，用自定义属性区分（"+" "+1"; "-" "-1"）
  2 传递被点击的商品 id goods_id
  3 获取 data 中的购物车数组，来获取需要被修改的商品对象
  4 直接修改商品对象的数量 num
  5 把 cart 数组重新设置回缓存中和 data 中，this.setCart
9 点击结算
  1 判断有没有收获地址信息
  2 判断用户有没有选择商品
  3 经过以上的验证，跳转到支付页面
*/

import { getSetting, chooseAddress, openSetting, showModal, showToast } from "../../utils/asyncWx.js"
import regeneratorRuntime from '../../lib/runtime/runtime'

Page({
  data: {
    address: {},
    cart: [],
    allChecked: false,
    totalPrice: 0,
    totalNum: 0
  },
  onShow(){
    // 获取缓存中收获地址信息
    const address = wx.getStorageSync("address");
    // 获取缓存中购物车数据
    const cart = wx.getStorageSync("cart")||[];

    this.setData({address});
    this.setCart(cart);
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
  },

  // 商品的选中
  handleItemChange(e){
    // 获取被修改的商品 id
    const goods_id = e.currentTarget.dataset.id;
    // 获取购物车数组
    let {cart} = this.data;
    // 找到被修改的商品对象
    let index = cart.findIndex(v=>v.goods_id===goods_id);
    // 选中状态取反
    cart[index].checked=!cart[index].checked;
    // 把购物车数据重新设置回data中和缓存中
    this.setCart(cart);
  },

  // 设置购物车状态，同时重新计算底部工具栏的数据（全选、总价格、总数量）
  setCart(cart){
    let allChecked = true;
    // 总价格 总数量
    let totalPrice = 0;
    let totalNum = 0;
    cart.forEach(v=>{
      if(v.checked){
        totalPrice += v.num * v.goods_price;
        totalNum += v.num;
      } else {
        allChecked = false;
      }
    })
    // 判断数组是否为空
    allChecked = cart.length!=0?allChecked:false;
    this.setData({
      cart,
      totalPrice,
      totalNum,
      allChecked
    });
    wx.setStorageSync("cart". cart);
  },

  // 商品全选功能
  handleItemAllCheck(){
    // 获取 data 中的数据
    let {cart, allChecked } = this.data;
    // 修改值
    allChecked = !allChecked;
    // 循环修改 cart 数组中商品选中状态
    cart.forEach(v => v.checked = allChecked);
    // 把修改后的值填充回 data 或者缓存中
    this.setCart(cart);
  },

  // 商品数量编辑功能
  async handleItemNumEdit(e){
    // 获取传递过来的参数
    const {operation, id} = e.currentTarget.dataset;
    // 获取购物车数组
    let {cart} = this.data;
    // 找到需要修改的商品的索引
    const index = cart.findIndex(v => v.goods_id === id);
    // 判断是否执行删除，弹窗提示
    if(cart[index].num===1&&operation===-1){
      const res = await showModal({content:'您是否要删除？'});
      if (res.confirm) {
        cart.splice(index, 1)
        this.setCart(cart)
      }
    }else {
      // 进行修改数量
      cart[index].num += operation;
      // 设置回缓存和 data 中
      this.setCart(cart);
    }
  },

  // 购物车结算
  async handlePay(){
    // 判断收货地址
    const {address, totalNum} = this.data;
    if(!address.userName){
      await showToast({title:"没有选择收货地址"});
      return;
    }
    // 判断用户有没有选购商品
    if(totalNum===0){
      await showToast({title:"没有选购商品"});
      return;
    }
    // 跳转到支付页面
    wx.navigateTo({
      url: '/pages/pay/index'
    });
  }
})