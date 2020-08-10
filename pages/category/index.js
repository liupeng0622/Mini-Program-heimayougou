// 引入用来发送请求的方法
import { request } from "../../request/index.js"
import regeneratorRuntime from '../../lib/runtime/runtime'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 左侧的菜单数据
    leftMenuList:[],
    // 右侧的商品数据
    rightContent:[],
    // 被点击的左侧的菜单
    currentIndex: 0,
    // 右侧内容滚动条离顶部距离
    scrollTop: 0
  },
  // 接口的返回数据
  cates:[],

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 0.web 中本地存储和小程序中本地存储的区别
      // 1.写代码的方式不一样了 
        // web: 存值 localStorage.setItem("key", "value") 获取值 localStorage.getItem("key")
        // 小程序：存值 wx.setStorageSync("key", "value")  获取值 wx.getStorageSync("key")
      // 2.存的时候，有没有做类型转换
        // web：先调用 toString()，把数据转成字符串，在存入
        // 小程序：不存在类型转换操作
    // 1.在发送请求前先判断本地存储中有没有旧数据
    // 2.如果没有旧数据，直接发送新请求
    // 3.如果有旧数据，数据也没有过期，就使用本地存储中的旧数据即可

    // >1.获取本地存储中的数据
    const Cates = wx.getStorageSync("cates");
    // >2.判断
    if(!Cates){
      // 不存在，发送请求数据
      this.getCates();
    } else {
      // 有旧的数据，看有没有过期，先定义过期时间10s
      if (Date.now() - Cates.time > 1000 * 10){
        // 重新发送请求
        this.getCates();
      } else {
        // 可以使用旧的数据
        this.Cates = Cates.data;
        let leftMenuList = this.Cates.map(v=>v.cat_name);
        let rightContent = this.Cates[0].children;
        this.setData({
          leftMenuList,
          rightContent
        })
      }
    }
  },
  // 获取分类数据
  async getCates(){
    // request({
    //   url:"/categories"
    // })
    // .then(res=>{
    //   this.Cates = res.data.message;

    //   // 把接口的数据存入到本地存储中
    //   wx.setStorageSync("cates", {time: Date.now(), data: this.Cates});
      
    //   // 左侧的菜单数据
    //   let leftMenuList = this.Cates.map(v=>v.cat_name);
    //   // 右侧的商品数据
    //   let rightContent = this.Cates[0].children;
    //   this.setData({
    //     leftMenuList,
    //     rightContent
    //   })
    // })

    // 1. 使用 es7 的 async 和 await 来发送异步请求
    const res = await request({url: "/categories"});
    this.Cates = res;
    // 把接口的数据存入到本地存储中
    wx.setStorageSync("cates", {time: Date.now(), data: this.Cates});     
    // 左侧的菜单数据
    let leftMenuList = this.Cates.map(v=>v.cat_name);
    // 右侧的商品数据
    let rightContent = this.Cates[0].children;
    this.setData({
      leftMenuList,
      rightContent
    })
  },

  // 左侧菜单的点击事件
  handleItemTap(e){
    // 1.获取被点击标题身上的索引
    // 2.给data中的 currentIndex 赋值
    // 3.根据不同的索引来渲染不同的商品内容
    const {index} = e.currentTarget.dataset;
    let rightContent = this.Cates[index].children;
    this.setData({
      currentIndex: index,
      rightContent,
      // 重新设置右侧内容 scroll-view 标签的 scrollTop
      scrollTop: 0
    })


  }
})