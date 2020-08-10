/*
1. 用户上滑页面，滚动条触底，开始加载下一页数据
  1. 找到滚动条触底事件
  2. 判断还有没有下一页数据
    获取到总页数（总页数 = Math.ceil（总条数 / 页容量pagesize），
    获取到当前页码，判断当前页码是否大于等于总页数。如果是，就没有下一页
  3. 如果没有，弹出提示“到底了”
  4. 如果有，加载下一页数据
    当前的页码 ++
    重新发送请求
    数据请求回来，要对 data 中的数组进行拼接，而不是替换全部
2. 下拉刷新页面
  1. 触发下拉刷新事件，在 json 文件中开启配置项，找到触发下拉刷新的事件
  2. 重置数据数组
  3. 重置页码，设置为1
  4. 重新发送请求
  5. 数据请求回来，需要手动关闭等待效果
*/
import { request } from "../../request/index.js"
import regeneratorRuntime from '../../lib/runtime/runtime'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [
      {
        id: 0,
        value: "综合",
        isActive: true
      },
      {
        id: 1,
        value: "销量",
        isActive: false
      },
      {
        id: 2,
        value: "价格",
        isActive: false
      }
    ],
    goodsList: []
  },

  // 接口要的参数
  QueryParams: {
    query: "",
    cid: "",
    pagenum: 1,
    pagesize: 10
  },
  // 总页数
  totalPages: 1,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.QueryParams.cid = options.cid;
    this.getGoodsList();
  },

  // 获取商品列表数据
  async getGoodsList(){
    const res = await request({url: "/goods/search", data: this.QueryParams});
    // 获取总条数
    const total = res.total
    // 计算总页数
    this.totalPages = Math.ceil(total/this.QueryParams.pagesize)
    console.log(this.totalPages);
    this.setData({
      // 拼接数组
      goodsList: [...this.data.goodsList, ...res.goods]
    })

    // 关闭下拉刷新的窗口
    wx.stopPullDownRefresh();
  },

  // 标题的点击事件，从子组件传递过来
  handleTabsItemChange(e){
    // 1. 获取被点击的标题索引
    const {index} = e.detail;
    // 2. 修改原数组，产生激活选中效果
    let {tabs} = this.data;
    tabs.forEach((v, i) => i===index?v.isActive=true:v.isActive=false);
    // 3. 赋值到 data 中
    this.setData({
      tabs
    })
  },

  // 页面上拉触底
  onReachBottom(){
    // 判断有没有下一页数据
    if (this.QueryParams.pagenum >= this.totalPages){
      // console.log("没有下一页数据")
      wx.showToast({
        title: '没有下一页数据'
      });
    } else {
      console.log("有下一页数据");
      this.QueryParams.pagenum++;
      this.getGoodsList();
    }
  },

  // 下拉刷新事件
  onPullDownRefresh(){
    // 1. 重置数组
    this.setData({
      goodsList: []
    })
    // 2. 重置页码
    this.QueryParams.pagenum = 1
    // 3. 发送请求

    this.getGoodsList()
  }
})