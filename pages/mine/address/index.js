// pages/hotel/address/index.js
const app = getApp()
const utils = require('../../../utils/util.js')
const mta = require('../../../utils/mta_analysis.js')
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var openid = openid;
var page = 1;
var isOrder = 0;
var area_id = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    address_list:[],
    showDeleteConfirmPopWindow:false,
    isOrder: 0 ,
    showModal: false, //显示授权登陆弹窗
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    openid = options.openid;
    isOrder = options.isOrder;
    var user_info = wx.getStorageSync(cache_key+'user_info');
    if(user_info.is_wx_auth!=3){
      that.setData({
        showModal:true
      })
    }
    if(typeof(options.area_id)!='undefined'){
      area_id = options.area_id;
    }else {
      area_id = 0;
    }
    console.log(area_id)
    utils.PostRequest(api_url + '/Smallapp43/address/addresslist', {
      openid: openid,
      page :1,
      area_id: area_id,
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
      address_list: data.result,
      isOrder: isOrder
    }));
  },
  /**
   * 新增收货地址
   */
  gotoAddAdress:function(e){
    var that = this;
    wx.navigateTo({
      url: '/pages/mine/address/add?openid=' + openid + '&area_id=' + area_id,
    })
  },
  /**
   * 上拉分页显示
   */
  loadMore:function(e){
    var that = this;
    page +=1;
    utils.PostRequest(api_url + '/Smallapp43/address/addresslist', {
      openid: openid,
      page: page,
      area_id:area_id
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
      utils.PostRequest(api_url + '/Smallapp43/address/delAddress', {
        openid: openid,
        address_id: address_id
      }, (data, headers, cookies, errMsg, statusCode) => {
        address_list.splice(keys,1);
        var address_info = wx.getStorageSync(cache_key + 'select_address_info')
        
        if (address_info != ''){
          address_info = JSON.parse(address_info)
          if(address_info.address_id == address_id){
            wx.removeStorageSync(cache_key + 'select_address_info')
          }
          
        }
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
      
      utils.PostRequest(api_url + '/Smallapp43/address/setDefaultAddress', {
        openid: openid,
        address_id: address_id,
        is_default:1
      }, (data, headers, cookies, errMsg, statusCode) => {
        console.log(address_list)
        for (var i = 0; i < address_list.length; i++) {
          if (address_list[i].is_default==1) {
            address_list[i].is_default = 0;
          }
          if (i == keys) {
            address_list[keys].is_default = 1;
          }
        }
        that.setData({
          address_list: address_list
        })
      });
    }
  },
  selectAddress:function(e){
    var that = this;
    var keys = e.currentTarget.dataset.keys
    var address_list = that.data.address_list;
    var address_info = address_list[keys];
    address_info = JSON.stringify(address_info);
    wx.setStorage({
      key: cache_key+'select_address_info',
      data: address_info,
      success:function(e){
        wx.navigateBack({
          delta:1
        })
      }
    })
  },
  onGetUserInfo: function (res) {
    var that = this;

    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    mta.Event.stat("clickonwxauth", {})
    if (res.detail.errMsg == 'getUserInfo:ok') {
      wx.getUserInfo({
        success(rets) {
          utils.PostRequest(api_url + '/smallapp3/User/registerCom', {
            'openid': openid,
            'avatarUrl': rets.userInfo.avatarUrl,
            'nickName': rets.userInfo.nickName,
            'gender': rets.userInfo.gender,
            'session_key': app.globalData.session_key,
            'iv': rets.iv,
            'encryptedData': rets.encryptedData
          }, (data, headers, cookies, errMsg, statusCode) => {
            wx.setStorage({
              key: 'savor_user_info',
              data: data.result,
            });
            that.setData({
              showModal: false,
            })
          }, res => wx.showToast({
            title: '微信登陆失败，请重试',
            icon: 'none',
            duration: 2000
          }));

        }
      })
    } else {
      utils.PostRequest(api_url + '/smallapp21/User/refuseRegister', {
        'openid': openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        user_info['is_wx_auth'] = 1;
        wx.setStorage({
          key: 'savor_user_info',
          data: user_info,
        })
      });
    }


  },
  //关闭授权弹窗
  closeWxAuth: function () {
    //关闭授权登陆埋点
    var that = this;
    that.setData({
      showModal: false,
    })
    wx.navigateBack({
      delta:1
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
    var that = this;
    utils.PostRequest(api_url + '/Smallapp43/address/addresslist', {
      openid: openid,
      page: page,
      area_id:area_id
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