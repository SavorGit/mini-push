// pages/hotel/address/index.js
const app = getApp()
const utils = require('../../../utils/util.js')
const mta = require('../../../utils/mta_analysis.js')
var api_url = app.globalData.api_url;
var openid = openid;
var page = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    address_list:[],
    showDeleteConfirmPopWindow:false,
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(that.data.address_id)
    openid = options.openid;
    utils.PostRequest(api_url + '/Smallapp4/address/addresslist', {
      openid: openid,
      page :1
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
      address_list: data.result,
    }));
  },
  /**
   * 新增收货地址
   */
  gotoAddAdress:function(e){
    var that = this;
    wx.navigateTo({
      url: '/pages/mine/address/add?openid='+openid,
    })
  },
  /**
   * 上拉分页显示
   */
  loadMore:function(e){
    var that = this;
    page +=1;
    utils.PostRequest(api_url + '/Smallapp4/address/addresslist', {
      openid: openid,
      page: page
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
      address_list: data.result,
    }));
  },
  /**
   * 编辑收货地址
   */
  editAddress:function(e){
    var address_id = e.currentTarget.dataset.address_id;
    wx.navigateTo({
      url: '/pages/mine/address/add?openid='+openid+'&address_id='+address_id,
    })                
  },
  /**
   * 删除订单
   */
  delAddress:function(e){
    var that = this;
    var address_id = e.currentTarget.dataset.address_id;
    var keys = e.currentTarget.dataset.keys;
    that.setData({
      address_id:address_id,
      keys:keys,
      showDeleteConfirmPopWindow:true
    })
  },
  /**
   * 确认删除订单
   */
  modalConfirm:function(e){
    var that = this;
    var address_list = that.data.address_list;
    var address_id = that.data.address_id;
    var keys = that.data.keys;
    if(typeof(address_id)!='undefined'){
      utils.PostRequest(api_url + '/Smallapp4/address/delAddressb', {
        openid: openid,
        address_id: address_id
      }, (data, headers, cookies, errMsg, statusCode) => {
        address_list.splice(keys,1);
        that.setData({
          showDeleteConfirmPopWindow:false,
          address_list:address_list
        })

      });
    }else {
      app.showToast('删除信息错误,请重试')
      that.setData({
        showDeleteConfirmPopWindow:false,
      })
    }
  },
  /**
   * 修改默认地址
   */
  checkboxChange:function(e){
    console.log(e)
    var that = this;
    if(e.detail.value[0]==1){
      var keys = e.currentTarget.dataset.keys;
      var address_list = that.data.address_list;
      var address_id  = e.currentTarget.dataset.address_id;
      
      utils.PostRequest(api_url + '/Smallapp4/address/setDefaultAddress', {
        openid: openid,
        address_id: address_id,
        is_default:1
      }, (data, headers, cookies, errMsg, statusCode) => {
        for (i = 0; i < address_list.length; i++) {
          if (address_list[i].is_default) {
            address_list[i].is_default == 0;
          }
          if (i == keys) {
            address_list[keys].is_default == 1;
          }
        }
        that.setData({
          address_list: address_list
        })
      });
    }
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
    var that = this;
    utils.PostRequest(api_url + '/Smallapp4/address/addresslist', {
      openid: openid,
      page: page
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
      address_list: data.result,
    }));
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

  }
})