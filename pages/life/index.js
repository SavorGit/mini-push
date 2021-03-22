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
    is_view_dis:true, //是否显示距离
    dis_type:0,       //距离类型 0由近到远1由远到近
    statusBarHeight: getApp().globalData.statusBarHeight,

    latitude:0,    //纬度
    longitude:0,  //经度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.getLifeTypeList();
    that.getBanner();
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
          that.setData({area_id:area_id})
          //获取酒楼列表
          that.getHotelList(page,area_id);
        })
      },fail:function(){
        var area_id = 1;
        that.setData({is_view_dis:false,area_id:area_id})
        that.getHotelList(page,area_id,0,0,0);
      }
    })
    
  },
  //获取酒楼列表
  getHotelList:function(page=1,area_id=1,county_id=0,food_style_id=0,avg_exp_id=0){
    var that = this;
    var latitude = that.data.latitude;
    var longitude = that.data.longitude;
    var dis_type  = that.data.dis_type;
    utils.PostRequest(api_v_url + '/hotel/recList', {
      page: page,
      area_id: area_id,
      county_id: county_id,
      food_style_id: food_style_id,
      avg_exp_id: avg_exp_id,
      latitude:latitude,
      longitude,longitude,
      dis_type:dis_type
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
      position:4,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var banner_list = data.result.datalist;

    })
  },
  //获取广告banner
  getBanner:function(e){
    var that = this;
    utils.PostRequest(api_v_url + '/aa/bb', {
      
    }, (data, headers, cookies, errMsg, statusCode) => {
      
    })
  },
  //切换距离
  changeDisType:function(e){
    var that = this;
    var dis_type = that.data.dis_type;
    if(dis_type==0){
      dis_type = 1;
    }else {
      dis_type = 0;
    } 
    that.setData({dis_type:dis_type})
    page = 1;
    var area_id = that.data.area_id;
    that.getHotelList(page,area_id,0,0,0);
  },
  //上拉刷新
  loadMore: function (e) {
    var that = this;
    
    page = page + 1;
    var area_id = that.data.area_id;
    
    that.getHotelList(page,area_id, 0, 0, 0);
  },
  phonecallevent: function (e) {
    var tel = e.target.dataset.tel;
    wx.makePhoneCall({
      phoneNumber: tel
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

  }
})