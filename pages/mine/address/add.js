// pages/hotel/address/add.js
const app = getApp()
const utils = require('../../../utils/util.js')
const mta = require('../../../utils/mta_analysis.js')
var api_url = app.globalData.api_url;
var openid = openid;
var area_id = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    showDeleteConfirmPopWindow:false,
    is_default:true,
    address_id:0,

    cityArray: ['请选择'],
    objectCityArray: [],
    cityIndex: 0,

    areaArray: ['请选择'],
    objectAreaArray: [],
    areaIndex: 0,
    receiver_focus:false,
    mobile_focus:false,
    addr_focus:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var that = this;
    openid = options.openid;
    if(typeof(options.area_id)!='undefined'){
      area_id = options.area_id;
    }
    var address_id = options.address_id;

    

    if(typeof(address_id) =='undefined'){//新增收货地址
      //获取城市列表
      utils.PostRequest(api_url + '/smallsale18/Area/getAreaList', {
        area_id: area_id
      }, (data, headers, cookies, errMsg, statusCode) => {
        console.log(data)
        that.setData({
          cityArray: data.result.city_name_list,
          objectCityArray: data.result.city_list
        })
      }) 
      that.setData({
        address_id:''
      })
    }else {//编辑收货地址
      
      
      utils.PostRequest(api_url + '/Smallapp43/address/detail', {
        openid: openid,
        address_id: address_id
      }, (data, headers, cookies, errMsg, statusCode) => {
        var area_id = data.result.area_id;
        var county_id = data.result.county_id;
        var is_default = data.result.is_default;
        if(is_default==1){
          is_default = true;
        }else {
          is_default = false
        }
        that.setData({
          address_info:data.result,
          address_id:address_id,
          is_default: is_default
        })

        //获取城市列表
        utils.PostRequest(api_url + '/smallsale18/Area/getAreaList', {
          area_id: area_id
        }, (data, headers, cookies, errMsg, statusCode) => {
          var city_list = data.result.city_list
          
          for(var i=0;i<city_list.length;i++){
            if (city_list[i].id == area_id){
              var cityIndex = i;
              break;
            }
            
          }
          
          that.setData({
            cityIndex: cityIndex,
            cityArray: data.result.city_name_list,
            objectCityArray: data.result.city_list
          })
        }) 
        //获取区域列表
        utils.PostRequest(api_url + '/smallsale18/Area/getSecArea', {
          area_id: area_id
        }, (data, headers, cookies, errMsg, statusCode) => {
          
          var area_list = data.result.area_list
          for(var i=0;i<area_list.length;i++){
            if (county_id==area_list[i].id){
              var areaIndex = i;
              break;
            }
            
          }


          that.setData({
            areaIndex: areaIndex,
            areaArray: data.result.area_name_list,
            objectAreaArray: data.result.area_list
          })
        })




      },function(){
        wx.navigateBack({
          delta:1
        })
      });
    }
  },
  //城市切换 
  bindCityPickerChange: function (e) {
    var that = this;
    var city_list = that.data.objectCityArray;
    var picCityIndex = e.detail.value //切换之后城市key
    var cityIndex = that.data.cityIndex; //切换之前城市key
    if (picCityIndex != cityIndex) {
      that.setData({
        cityIndex: picCityIndex,
        areaIndex: 0
      })
      //获取当前城市的区域
      var area_id = city_list[picCityIndex].id;

      //获取城市列表
      utils.PostRequest(api_url + '/smallsale18/Area/getSecArea', {
        area_id: area_id
      }, (data, headers, cookies, errMsg, statusCode) => {
        console.log(data)
        that.setData({
          areaArray: data.result.area_name_list,
          objectAreaArray: data.result.area_list
        })
      })
    }
  },
  //切换区域
  bindAreaPickerChange: function (e) {
    var that = this;
    var area_list = that.data.objectAreaArray;
    var areaIndex = e.detail.value;
    that.setData({
      areaIndex: e.detail.value
    })



  },
  /**
   * 设置默认地址
   */
  changeSwitch:function(e){
    console.log(e)
    var that = this;
    var is_default = e.detail.value;
    that.setData({
      is_default: is_default
    })
  },
  /**
   * 新增收货地址
   */
  saveAddress:function(e){
    console.log(e)
    var that = this;
    var address_id = that.data.address_id;
    var receiver = e.detail.value.receiver.replace(/\s+/g, '');
    var mobile = e.detail.value.mobile.replace(/\s+/g, '');
    var cityIndex = that.data.cityIndex;
    var areaIndex = that.data.areaIndex;
    var addr = e.detail.value.addr.replace(/\s+/g, '');

    if(receiver==''){
      app.showToast('请输入您的收货人名称');
      that.setData({
        receiver_focus:true
      })
      return false;
    }
    if (!app.checkMobile(mobile)){
      that.setData({
        mobile_focus: true
      })
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
      that.setData({
        addr_focus: true
      })
      return false;
    }
    var area_list = that.data.objectCityArray;
    var area_id = area_list[cityIndex].id;

    var county_list = that.data.objectAreaArray;

    var county_id = county_list[areaIndex].id;

    var all_address = area_list[cityIndex].region_name + county_list[areaIndex].region_name+addr

    that.setData({
      receiver: receiver,
      mobile: mobile,
      area_id: area_id,
      county_id: county_id,
      addr: addr,
      showDeleteConfirmPopWindow:true,
      all_address: all_address
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
    console.log(that.data)
    if(is_default==true){
      is_default = 1;
    }else {
      is_default = 0;
    }
    if(address_id==''){
      var api_all_url = api_url +'/Smallapp43/address/addAddress'
    }else {
      var api_all_url = api_url+'/Smallapp43/address/editAddress'
    }

    utils.PostRequest(api_all_url, {
      openid: openid,
      address_id: address_id,
      consignee: receiver,
      phone: mobile,
      area_id: area_id,
      county_id: county_id,
      address: addr,
      is_default: is_default
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        showDeleteConfirmPopWindow: false,
      })
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