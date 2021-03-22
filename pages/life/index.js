// pages/life/index.js
// pages/hotel/cooperation.js
const utils = require('../../utils/util.js')

const app = getApp()
var page = 1; //当前节目单页数
var api_v_url = app.globalData.api_v_url;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dis_type:0,  //距离类型 0由近到远1由远到近
    statusBarHeight: getApp().globalData.statusBarHeight,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.getLifeTypeList();
    wx.getLocation({
      type: 'wgs84',
      isHighAccuracy:true,
      success(res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        that.setData({
          latitude:latitude,
          longitude:longitude
        })
        utils.PostRequest(api_v_url + '/Area/getAreaid', {
          latitude: latitude,
          longitude: longitude
        }, (data, headers, cookies, errMsg, statusCode) => {
          var area_id = data.result.area_id;
          //获取酒楼列表
          that.getHotelList(page,area_id);
        })
      },fail:function(){
        var area_id = 1;
        that.getHotelList(page,area_id,0,0,0);
      }
    })
  },
  //获取酒楼列表
  getHotelList:function(page=1,area_id=1,county_id=0,food_style_id=0,avg_exp_id=0){
    var that = this;
    var latitude = that.data.latitude;
    var longitude = that.data.longitude;
    utils.PostRequest(api_v_url + '/hotel/recList', {
      page: page,
      area_id: area_id,
      county_id: county_id,
      food_style_id: food_style_id,
      avg_exp_id: avg_exp_id,
      latitude:latitude,
      longitude,longitude,
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        hotel_list: data.result
      })
    })
  },
  //生活分类
  getLifeTypeList:function(e){
    var that = this;
    utils.PostRequest(api_v_url + '/aa/bb', {
      
    }, (data, headers, cookies, errMsg, statusCode) => {
      
    })
  },
  //切换距离

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