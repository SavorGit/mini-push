// mall/pages/hotel/index.js
/**
 * 【商城】店铺页面
 */


Page({

  /**
   * 页面的初始数据
   */
  data: {
    SystemInfo: getApp().SystemInfo,
    statusBarHeight: getApp().globalData.statusBarHeight,
    tab: 'goods',
    dishesList: [{
      id: '001',
      imgUrl: 'https://oss.littlehotspot.com/WeChat/MiniProgram/LaunchScreen/source/images/imgs/default.jpeg',
      name: '菜品1',
      price: 123
    }, {
      id: '002',
      imgUrl: 'https://oss.littlehotspot.com/WeChat/MiniProgram/LaunchScreen/source/images/imgs/default.jpeg',
      name: '菜品2',
      price: 123
    }, {
      id: '003',
      imgUrl: 'https://oss.littlehotspot.com/WeChat/MiniProgram/LaunchScreen/source/images/imgs/default.jpeg',
      name: '菜品3',
      price: 123
    }],
    dishesCart: {
      dishesCount: 2, totalPrice: 268, list: [{
        name: '菜品3',
        price: 123,
        amount: 2
      }]
    },
    hotel_info: {
      notice: '顾客朋友大家好，由于现在疫情严重，有个别小区不让骑手出入的顾客，自己也不能出小区拿外卖的顾客慎重下单，以免给您...',
      business_lunchhours: '11:00-14:00',
      business_dinnerhours: '18:00-24:00',
      tel: '010-1234567',
      charter: ['https://oss.littlehotspot.com/WeChat/MiniProgram/LaunchScreen/source/images/imgs/default.jpeg', 'https://oss.littlehotspot.com/WeChat/MiniProgram/LaunchScreen/source/images/imgs/default.jpeg']
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 添加购物车 - 菜品
   * @param {*} e 
   */
  addDishesCart: function (e) {
    let self = this;
    let index = e.currentTarget.dataset.index;
    let dishesList = self.data.dishesList;
    dishesList[index].addToCart = true;
    self.setData({ dishesList: dishesList });
    setTimeout(function () {
      delete dishesList[index].addToCart;
      self.setData({ dishesList: dishesList });
    }, 500);
  },

  /**
   * 清空购物车 - 菜品
   * @param {*} e 
   */
  clearDishesCart: function (e) { },

  // 选项卡选择
  showTab: function (e) {
    let self = this;
    let tabType = e.currentTarget.dataset.tab;
    self.setData({
      tab: tabType
    });
  },

  // 打开购物车弹窗 - 菜品
  openDishesCartWindow: function (e) {
    let self = this;
    self.setData({ showDishesCartPopWindow: true, showDishesCartWindow: true });
  },

  // 关闭购物车弹窗 - 菜品
  closeDishesCartWindow: function (e) {
    let self = this;
    self.setData({ showDishesCartWindow: false });
    setTimeout(function () {
      self.setData({ showDishesCartPopWindow: false });
    }, 500);
  },
})