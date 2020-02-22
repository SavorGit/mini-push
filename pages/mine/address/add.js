// pages/hotel/address/add.js
const app = getApp()
const utils = require('../../../utils/util.js')
const mta = require('../../../utils/mta_analysis.js')
var api_url = app.globalData.api_url;
var openid = openid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    showDeleteConfirmPopWindow:false,
    is_default:true,
    address_id:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    openid = options.openid;
    var address_id = options.address_id;
    if(typeof(address_id) =='undefined'){//新增收货地址
      
    }else {//编辑收货地址
      
      utils.PostRequest(api_url + '/Smallapp4/aa/bb', {
        openid: openid,
        address_id: address_id
      }, (data, headers, cookies, errMsg, statusCode) => {
        that.setData({
          address_info:data.result,
          address_id:address_id
        })
      },function(){
        wx.navigateBack({
          delta:1
        })
      });
    }
  },
  /**
   * 设置默认地址
   */
  changeSwitch:function(e){
    that = this;
    var is_default = e.detail.value;
    that.setData({
      is_default: is_default
    })
  },
  /**
   * 新增收货地址
   */
  saveAddress:function(e){
    var that = this;
    var address_id = that.data.address_id;
    var receiver = e.detail.value.receiver.replace(/\s+/g, '');
    var mobile = e.detail.value.mobile.replace(/\s+/g, '');
    var cityIndex = that.data.cityIndex;
    var areaIndex = that.data.areaIndex;
    var addr = e.detail.value.addr.replace(/\s+/g, '');

    if(receiver==''){
      app.showToast('请输入您的收货人名称');
      return false;
    }
    if (!checkMobile(mobile)){
      return false;
    }
    if (cityIndex == 0) {
      app.showToast('请选择所在城市');
      return false;
    }
    if (areaIndex == 0) {
      app.showToast('请选择所在区域');
      return false;
    }
    if(addr==''){
      app.showToast('请输入您的详细地址')
    }
    var area_list = that.data.objectCityArray;
    var area_id = area_list[cityIndex].id;

    var county_list = that.data.objectAreaArray;

    var county_id = county_list[cityIndex].id;


    that.setData({
      receiver: receiver,
      mobile: mobile,
      area_id: area_id,
      county_id: county_id,
      addr: addr
    })
  },
  /**
   * 确认保存
   */
  modalConfirm:function(e){
    var that = this;
    var receiver = that.data.receiver;
    var mobile = that.data.mobile;
    var area_id = that.data.area_id;
    var county_id = that.data.county_id;
    var addr = that.data.addr;
    var address_id = that.data.address_id;
    var is_default = that.data.is_default;
    utils.PostRequest(api_url + '/Smallapp4/aa/bb', {
      openid: openid,
      address_id: address_id,
      receiver: receiver,
      mobile: mobile,
      area_id: area_id,
      county_id: county_id,
      addr: addr,
      is_default: is_default
    }, (data, headers, cookies, errMsg, statusCode) => {
      app.showToast('保存成功');
      wx.navigateBack({
        delta:1
      })
    },function(){
      that.setData({
        showDeleteConfirmPopWindow:false,
      })
    });
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

  }
})