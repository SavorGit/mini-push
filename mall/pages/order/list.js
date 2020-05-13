// mall/pages/order/list.js
/**
 * 【商城】订单列表页面
 */
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var openid;
var page = 1;
var order_type =5;
var page_all;
var page_dealing;
var page_ship ;
var page_complete;
var page_cancel;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    SystemInfo: getApp().SystemInfo,
    statusBarHeight: getApp().globalData.statusBarHeight,
    tab: '0'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    page_all = 1;
    page_dealing =1;
    page_ship =1;
    page_complete =1;
    page_cancel = 1;
    openid = options.openid;
    var order_status = options.order_status;
    that.setData({
      tab:order_status
    })
    that.getOrderList(0,1)
    that.getOrderList(1, 1)
    that.getOrderList(3, 1)
    ///that.getOrderList(2, 1)
    that.getOrderList(4,1)
    that.getOrderList(5,1)
  },
  getOrderList:function(status,page,){
    var that = this;
    utils.PostRequest(api_v_url + '/order/orderlist', {
      openid:openid,
      type: order_type,
      status:status,
      page:page
    }, (data, headers, cookies, errMsg, statusCode) => {
      if (status == 0) {
        that.setData({
          all_order_list: data.result.datalist
        })
      } else if (status == 1) {
        that.setData({
          deal_order_list: data.result.datalist
        })
      } else if (status == 3) {
        that.setData({
          ship_order_list: data.result.datalist
        })
      } else if (status == 4) {
        that.setData({
          complete_order_list: data.result.datalist
        })
      }else if(status == 5){
        that.setData({
          cancel_order_list:data.result.datalist
        })
      }
      
    });
  },
  gotoOrderDetail:function(e){
    var order_id = e.currentTarget.dataset.order_id;
    wx.navigateTo({
      url: '/mall/pages/order/detail?order_id='+order_id+'&openid='+openid,
    })
  },
  //取消订单
  cancleOrder: function (e) {
    var that = this;
    var order_id = e.currentTarget.dataset.order_id;
    var keys = e.currentTarget.dataset.keys;
    var order_status = that.data.tab;

    wx.showModal({
      title: '提示',
      content: '确认取消订单吗?',
      success: function (res) {
        if (res.confirm) {
          utils.PostRequest(api_v_url + '/order/cancel', {
            openid: openid,
            order_id: order_id,
          }, (data, headers, cookies, errMsg, statusCode) => {
            if (order_status == 0) {//全部订单
              var order_list = that.data.all_order_list;
              order_list[keys].status = 54;
              order_list[keys].status_str = '用户取消';
              
              that.setData({
                all_order_list: order_list
              })
              //处理中的订单
              that.getOrderList(1,page_dealing);
              
            } else if (order_status == 1) {//待处理
              var order_list = that.data.deal_order_list;
              order_list.splice(keys, 1)
              that.setData({
                deal_order_list: order_list
              })
              //全部订单
              that.getOrderList(0, page_all);
            }
            //已完成
            //that.getOrderList(2,page_complete);
            //已取消
            that.getOrderList(5,page_cancel);
            
            
          })
        }
      }
    })

  },
  loadMore:function(e){
    var that = this;
    var order_status = that.data.tab
    if (order_status == 0) {
      page_all += 1;
      page = page_all;
    } else if (order_status == 1) {
      page_dealing += 1;
      page = page_dealing;
    } else if (order_status == 3) {
      page_ship += 1;
      page = page_ship;
    } else if (order_status == 4) {
      page_complete += 1;
      page = page_complete;
    }else if(order_status == 5){
      page_cancel +=1;
      page = page_cancel;
    }
    that.getOrderList(order_status, page);
  },
  reBuy:function(e){
    var order_id = e.currentTarget.dataset.order_id;
    wx.navigateTo({
      url: '/mall/pages/order/confirmation?order_id='+order_id+'&openid='+openid+'&order_type=3',
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


  // 选项卡选择
  showTab: function (e) {
    let self = this;
    let tabType = e.currentTarget.dataset.tab;
    self.setData({
      tab: tabType
    });
  },
})