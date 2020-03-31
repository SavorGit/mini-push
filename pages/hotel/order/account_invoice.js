// pages/hotel/order/account_invoice.js
/**
 * 订单发票页面
 */

const app = getApp()
const utils = require('../../../utils/util.js')
const mta = require('../../../utils/mta_analysis.js')
var cache_key = app.globalData.cache_key;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    SystemInfo: getApp().SystemInfo,
    statusBarHeight: getApp().globalData.statusBarHeight,
    tab: 'company',
    bill_info: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var bill_info = wx.getStorageSync(cache_key+'order:bill');
    if(bill_info!=''){
      bill_info = JSON.parse(bill_info);
      if(bill_info.type==0){
        var tab = 'company';
      }else {
        var tab ='people';
      }
      this.setData({
        tab: tab,
        bill_info:bill_info
      })
    }
  },
  getWxinvoice:function(){
    var that = this;
    var bill_info = this.data.bill_info; 
    var bill_type = this.data.tab;
    wx.chooseInvoiceTitle({
      success(res) {
        var type = res.type;
        
        if (bill_type =='company'){//企业发票
          if(type==1){
            app.showToast('请选择单位发票抬头')
          }
        } else if (bill_type =='people'){//个人发票
          if(type==0){
            app.showToast('请选择个人发票抬头')
          }
        }

        bill_info.title = res.title;
        bill_info.taxNumber = res.taxNumber
        bill_info.type = res.type;
        console.log(bill_info)
        that.setData({
          bill_info:bill_info
        })
      }
    })
  },
  saveBillInfo:function(e){
    console.log(e)
    var bill_info = {};
    var tab = this.data.tab;
    var title = e.detail.value.title.replace(/\s+/g, '');
    
    
    if (tab =='company'){
      var type = 0;
      if (title == '') {
        app.showToast('请输入企业名称')
        return false;
      }
      if(taxNumber==''){
        app.showToast('请输入企业税号');
        return false;
      }
      var taxNumber = e.detail.value.taxNumber.replace(/\s+/g, '');
      bill_info.title =  title;
      bill_info.taxNumber = taxNumber;
      bill_info.type= 0;
    } else if (tab =='people'){
      var type = 1;
      if (title == '') {
        app.showToast('请输入姓名')
        return false;
      }
      bill_info.title = title;
      bill_info.taxNumber = '';
      bill_info.type = 1;
    }
    bill_info = JSON.stringify(bill_info);
    wx.setStorageSync(cache_key+'order:bill', bill_info);

    wx.navigateBack({
      delta: 1
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

  // 选择选项卡
  showTab: function (e) {
    let self = this;
    let tab = e.currentTarget.dataset.tab;
    self.setData({ tab: tab });
  }
})