// mall/pages/order/gift_list.js
/**
 * 【商城】赠品订单列表页面
 */
const utils = require('../../../../utils/util.js')
var mta = require('../../../../utils/mta_analysis.js')
const app = getApp()
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var openid;
var page = 1;
var order_type = 6;
var page_all;
var page_sending;
var page_complete;
var page_cancel;
var page_past;
var page_receive;
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
    console.log(options)
    var that = this;
    wx.hideShareMenu()
    openid = options.openid;
    var order_status = options.order_status;
    page_all      = 1;
    page_sending  = 1;
    page_complete = 1;
    page_cancel   = 1;
    page_past     = 1;
    page_receive  = 1;
    that.setData({
      tab:order_status
    })
    that.getOrderList(0,1)
    that.getOrderList(6, 1) //赠送中
    that.getOrderList(2, 1) //已完成
    that.getOrderList(5,1)  //已取消
    that.getOrderList(7,1)  //已过期
    that.getOrderList(8,1)  //已收到
  },
  getOrderList:function(status,page){
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
      } else if (status == 6) {
        that.setData({
          sending_order_list: data.result.datalist
        })
      } else if (status == 2) {
        that.setData({
          complete_order_list: data.result.datalist
        })
      } else if(status == 5){
        that.setData({
          cancel_order_list:data.result.datalist
        })
      } else if(status ==7){
        that.setData({
          past_order_list:data.result.datalist
        })
      }else if(status==8){
        that.setData({
          receive_order_list : data.result.datalist
        })
      }
      
    });
  },
  loadMore:function(e){
    var that = this;
    var order_status = that.data.tab
    if (order_status == 0) {
      page_all += 1;
      page = page_all;
    } else if (order_status == 6) {
      page_sending += 1;
      page = page_sending;
    } else if (order_status == 2) {
      page_complete += 1;
      page = page_complete;
    } else if (order_status == 5) {
      page_cancel += 1;
      page = page_cancel;
    }else if(order_status == 7){
      page_past +=1;
      page = page_past;
    }else if(order_status ==8 ){
      page_receive +=1;
      page = page_receive;
    }
    that.getOrderList(order_status, page);
  },
  
  reBuy:function(e){
    var goods_info = e.currentTarget.dataset.goods_info;

    wx.navigateTo({
      url: '/pages/hotel/goods/detail?goods_id='+goods_info[0].id,
    })
  },
  gotoOrderDetail:function(e){
    console.log(e)
    var order_id = e.currentTarget.dataset.order_id;
    var give_type = e.currentTarget.dataset.give_type;
    if(give_type==2){
      var url = '/mall/pages/gift/order/gift_detail_receive?order_id='+order_id+'&openid='+openid;
    }else if(give_type==1){
      var url = '/mall/pages/gift/order/gift_detail_send?order_id='+order_id+'&openid='+openid;
    }
    wx.navigateTo({
      url: url,
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
              order_list[keys].status = 19;
              order_list[keys].status_str = '用户取消';
              
              that.setData({
                all_order_list: order_list
              })
              //赠送中
              that.getOrderList(6,page_sending);

              //取消订单
              that.getOrderList(5,page_cancel);

            }else if(order_status ==6 ){//赠送中订单
              var order_list = that.data.sending_order_list;
              order_list[keys].status = 19;
              order_list[keys].status_str = '用户取消';

              var order_list = that.data.sending_order_list;
              order_list.splice(keys, 1)
             

              that.setData({
                sending_order_list: order_list
              })
              
              //全部订单
              that.getOrderList(0,page_all);
              //取消订单
              that.getOrderList(5,page_cancel);
            } 
            
          })
        }
      }
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
  onShareAppMessage: function (e) {
    console.log(e)
    var goods_info = e.target.dataset.goods_info;
    var order_id = e.target.dataset.order_id;
    var user_info = wx.getStorageSync(cache_key+'user_info');

    var nickName   = user_info.nickName
    var goods_name = goods_info[0].name;
    var img_url    = goods_info[0].img
    var title = nickName+'送你小热点好物'+goods_name;
    if (e.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: title,
        path: '/pages/hotel/gift/share?order_id=' + order_id,
        imageUrl: img_url,
        success: function (res) {
        },
      }
    } else {
      return {
        title: title,
        path: '/pages/hotel/gift/share?order_id=' + order_id,
        imageUrl: img_url,
        success: function (res) {
        },
      }
    }
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