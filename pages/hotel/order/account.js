// pages/hotel/order/account.js
const app = getApp()
const utils = require('../../../utils/util.js')
const mta = require('../../../utils/mta_analysis.js')
var api_url = app.globalData.api_url;
var goods_id;
var openid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    showBuyConfirmPopWindow: false,
    addDisabled: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    let that = this;
    console.log(options);
    goods_id = options.goods_id;
    openid = options.openid;
    //self.setData({ showBuyConfirmPopWindow: true });

    //菜品详情
    utils.PostRequest(api_url + '/Smallapp4/dish/detail', {
      goods_id: goods_id,
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
      goods_info: data.result,
      merchant: data.result.merchant
    }), function () {
      wx.navigateBack({
        delta: 1
      })
    });
  },
  /**
   * 下单
   */
  placeOrder: function (e) {
    var that = this;
    var contact = e.detail.value.contact.replace(/\s+/g, '');
    var address = e.detail.value.address.replace(/\s+/g, '');
    var phone = e.detail.value.phone;
    var delivery_date = e.detail.value.delivery_date;
    var delivery_time = e.detail.value.delivery_time;

    if (contact == '') {
      app.showToast('请输入收货人名称');
      return false;
    }
    if (phone == '') {
      app.showToast('请输入联系电话');
      return false;
    }
    if (address == '') {
      app.showToast('请输入收货地址');
      return false;
    }
    if (delivery_date == '') {
      app.showToast('请选择送达日期');
      return false;
    }
    if (delivery_time == '') {
      app.showToast('请选择送达时间');
      return false;
    }
    var is_mobile = app.checkMobile(phone);
    if (!is_mobile) {
      return false;
    }
    var delivery_time = delivery_date + ' ' + delivery_time;

    that.setData({
      addDisabled: true
    })
    //下单
    utils.PostRequest(api_url + '/Smallapp4/order/addDishorder', {
      address: address,
      amount: 1,
      contact: contact,
      delivery_time: delivery_time,
      goods_id: goods_id,
      openid: openid,
      phone: phone,
    }, (data, headers, cookies, errMsg, statusCode) => {

      that.setData({
        showBuyConfirmPopWindow: true,
        order_msg1: data.result.message1,
        order_msg2: data.result.message2,
        addDisabled: false
      })
    }, function () {
      that.setData({
        addDisabled: false
      })
    })

  },
  bindDateChange: function (e) {
    var that = this;
    var type = e.currentTarget.dataset.type;
    if (type == 1) {
      var delivery_date = e.detail.value;
      that.setData({
        delivery_date: delivery_date
      })
    } else if (type == 2) {
      var delivery_time = e.detail.value;
      that.setData({
        delivery_time: delivery_time
      })
    }
  },
  modalConfirm: function (e) {
    wx.navigateBack({
      delta: 1
    })
  },
  gotoDisheDetail: function (e) {
    wx.navigateTo({
      url: '/pages/hotel/dishes/detail?goods_id=' + goods_id,
    })
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

  // 关闭订单确认弹窗
  closeBuyConfirmPopWindow: function (e) {
    let self = this;
    self.setData({ showBuyConfirmPopWindow: false });
  }
})