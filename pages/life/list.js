// pages/life/list.js
const utils = require('../../utils/util.js')
var mta = require('../../utils/mta_analysis.js')
const app = getApp()
var page = 1; //当前节目单页数
var hotel_list;
var latitude;
var longitude;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var area_id;
var cate_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    cityArray:[],
    objectCityArray: [],
    objectAreaArray:[],
    cityIndex: [0,0],

    cuisineArray: [],
    objectCuisineArray: [],
    cuisineIndex: 0,

    perCapitaPayArray: [],
    objectPerCapitaPayArray: [],
    perCapitaPayIndex: 0,

    hotel_list: [],
    latitude:0,    //纬度
    longitude:0,  //经度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //wx.hideShareMenu();
    console.log(options)
    var that = this;
    area_id = options.area_id;
    cate_id = options.cate_id;
    latitude = options.latitude;
    longitude= options.longitude;

    that.getCityList(area_id);
    //获取菜系列表
    that.getFoodStyleList(cate_id)
    //获取人均消费
    that.getExpList(cate_id);
    that.getHotelList(cate_id,page,area_id);

  },
  getExpList:function(cate_id){
    var that = this;
    utils.PostRequest(api_v_url + '/category/categorylist', {
      cate_id:cate_id,
      type:102
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        perCapitaPayArray: data.result.category_name_list,
        objectPerCapitaPayArray: data.result.category_list
      })
    })
  },
  getFoodStyleList:function(cate_id){
    var that = this;
    utils.PostRequest(api_v_url + '/category/categorylist', {
      cate_id:cate_id,
      type:101
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        cuisineArray: data.result.category_name_list,
        objectCuisineArray: data.result.category_list
      })
    })
    
  }, 
  getAreaList:function(area_id){
    var that = this;
    utils.PostRequest(api_v_url + '/Area/getSecArea', {
      area_id: area_id
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        areaArray: data.result.area_name_list,
        objectAreaArray: data.result.area_list
      })
    })
   
  },
  //获取城市列表
  getCityList:function(area_id){
    var that = this;
    utils.PostRequest(api_v_url + '/area/getCityAreaList', {
      area_id:area_id
    }, (data, headers, cookies, errMsg, statusCode) => {
      
      var cityArray = data.result.names
      var objectCityArray = data.result.city_list
      var objectAreaArray = data.result.area_list;
      var cityIndex = data.result.index
      that.setData({cityArray:cityArray,objectCityArray:objectCityArray,objectAreaArray:objectAreaArray,cityIndex:cityIndex})
      /*that.setData({
        cityArray: data.result.city_name_list,
        objectCityArray: data.result.city_list
      })*/
    })
  },
  //获取酒楼列表
  getHotelList:function(cate_id,page=1,area_id=1,county_id=0,food_style_id=0,avg_exp_id=0){
    var that = this;
    
    utils.PostRequest(api_v_url + '/store/dataList', {
      cate_id:cate_id,
      page: page,
      area_id: area_id,
      county_id: county_id,
      food_style_id: food_style_id,
      avg_exp_id: avg_exp_id,
      latitude:latitude,
      longitude,longitude,
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        hotel_list: data.result.datalist
      })
    })
  },
  //改变区域城市
  bindAreaPickerChange:function(e){
    var that = this;
    var city_index = e.detail.value[0];
    var area_index = e.detail.value[1];


    var objectCityArray = this.data.objectCityArray;
    var objectAreaArray = this.data.objectAreaArray;

    console.log(objectCityArray);
    console.log(objectAreaArray);

    var city_id = objectCityArray[city_index].id;
    var area_id = objectAreaArray[city_index][area_index].id;


    console.log(city_id);
    console.log(area_id);
    var cityIndex = this.data.cityIndex;
    cityIndex = [city_index,area_index]
    this.setData({cityIndex:cityIndex});

    var cuisineIndex = that.data.cuisineIndex
    var cui_list = that.data.objectCuisineArray;

    var food_style_id = cui_list[cuisineIndex].id; //菜系id
    var avg_exp_list = that.data.objectPerCapitaPayArray;
    var perCapitaPayIndex = that.data.perCapitaPayIndex;
    var avg_exp_id = avg_exp_list[perCapitaPayIndex].id; //人均消费id
    page = 1;
    that.getHotelList(cate_id,page,city_id, area_id, food_style_id, avg_exp_id);
    //获取城市id

    //获取区域id

    //获取当前商店列表
  },
  //改变区域地区
  bindAreaPickerColumnChange:function(e){
    console.log('改变列')
    console.log(e);
    var column = e.detail.column;  //第几列
    var value  = e.detail.value;   //第几列的索引值
    var cityArray = this.data.cityArray;

    if(column==0){ //改变城市
      var objectAreaArray = this.data.objectAreaArray;
      //console.log(objectAreaArray)
      objectAreaArray = objectAreaArray[value];
      var tmp_area_arr = [];
      for(let i in objectAreaArray){
        tmp_area_arr.push(objectAreaArray[i].name);
      }
      cityArray[1] = tmp_area_arr;    //找到对应城市的区域并赋值
      this.setData({cityArray:cityArray})
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
  //上拉刷新
  loadMore: function (e) {
    var that = this;
    
    page = page + 1;
    
    var cityIndex = that.data.cityIndex;
    var objectCityArray = that.data.objectCityArray;
    var objectAreaArray = that.data.objectAreaArray;
    
 
    
    var area_id   = objectCityArray[cityIndex[0]].id
    var county_id = objectAreaArray[cityIndex[0]][cityIndex[1]].id


    var food_style_list = that.data.objectCuisineArray;
    var cuisineIndex = that.data.cuisineIndex;
    var food_style_id = food_style_list[cuisineIndex].id; //菜系id

    var avg_exp_list = that.data.objectPerCapitaPayArray;
    var perCapitaPayIndex = that.data.perCapitaPayIndex;
    var avg_exp_id = avg_exp_list[perCapitaPayIndex].id; //人均消费id
    that.getHotelList(cate_id,page,area_id, county_id, food_style_id, avg_exp_id);
  },

  previewImage: function (e) {
    var current = e.currentTarget.dataset.src;
    var urls = [];
    for (var i = 0; i < 1; i++) {
      urls[i] = current;
    }
    wx.previewImage({
      current: urls[0], // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
  
  //切换菜系
  bindCuiPickerChange: function (e) {
    var that = this;
    var cui_list = that.data.objectCuisineArray;
    var cuisineIndex = e.detail.value
    that.setData({
      cuisineIndex: cuisineIndex
    })
    console.log(cuisineIndex);
   
    var cityIndex = that.data.cityIndex;
    var objectCityArray = that.data.objectCityArray;
    var objectAreaArray = that.data.objectAreaArray;
    
 
    
    var area_id   = objectCityArray[cityIndex[0]].id
    var county_id = objectAreaArray[cityIndex[0]][cityIndex[1]].id
    console.log(area_id)
    console.log(county_id);



    var food_style_id = cui_list[cuisineIndex].id; //菜系id
    var avg_exp_list = that.data.objectPerCapitaPayArray;
    var perCapitaPayIndex = that.data.perCapitaPayIndex;
    var avg_exp_id = avg_exp_list[perCapitaPayIndex].id; //人均消费id
    page = 1;
    that.getHotelList(cate_id,page,area_id, county_id, food_style_id, avg_exp_id);
  },
  //切换消费水平
  bindPayPickerChange: function (e) {
    var that = this;
    var pay_list = that.data.objectPerCapitaPayArray;
    var perCapitaPayIndex = e.detail.value
    this.setData({
      perCapitaPayIndex: perCapitaPayIndex
    })
    var avg_exp_id = pay_list[perCapitaPayIndex].id //人均消费id

    var cityIndex = that.data.cityIndex;
    var objectCityArray = that.data.objectCityArray;
    var objectAreaArray = that.data.objectAreaArray;
    
 
    
    var area_id   = objectCityArray[cityIndex[0]].id
    var county_id = objectAreaArray[cityIndex[0]][cityIndex[1]].id
    console.log(area_id)
    console.log(county_id);

    var food_style_list = that.data.objectCuisineArray;
    var cuisineIndex = that.data.cuisineIndex;
    var food_style_id = food_style_list[cuisineIndex].id;
    page = 1;
    that.getHotelList(cate_id,page,area_id, county_id, food_style_id, avg_exp_id);

  },
  phonecallevent: function (e) {
    var tel = e.target.dataset.tel;
    wx.makePhoneCall({
      phoneNumber: tel
    })
    //mta.Event.stat('clickHotelTel', { 'hotelid': e.target.dataset.hotelid, 'tel': tel })
  },
  gotoMerchant:function(e){
    var merchant_id = e.currentTarget.dataset.merchant_id;
    if(merchant_id=='' || typeof(merchant_id)=='undefined'){
      app.showToast('数据加载中...')
      return false;
    }else {
      wx.navigateTo({
        url: '/pages/hotel/shop?merchant_id=' + merchant_id +'&tab=goods',
      })
      
    }
    
  },
  gotoDishes:function(e){
    var goods_id = e.currentTarget.dataset.goods_id;
    if(goods_id=='' || typeof(goods_id)=='undefined'){
      app.showToast('数据加载中...')
      return false;
    }else {
      wx.navigateTo({
        url: '/pages/hotel/dishes/detail?goods_id=' + goods_id,
      })
    }
    
  },
  closeFollowOfficialAccount:function(e){
    this.setData({
      is_view_official_account:false
    })
    wx.setStorageSync(cache_key+'colose_official_account',1);
  },
  nowFollowOfficialAccount:function(){
    var openid= this.data.openid;
    var user_info = wx.getStorageSync(cache_key+'user_info');
    if(user_info.wx_mpopenid=='' || typeof(user_info.wx_mpopenid)=='undefined'){
      wx.navigateTo({
        url: '/pages/h5/index?h5_url='+app.globalData.Official_account_url+openid,
      })
    }else {
      wx.navigateTo({
        url: '/pages/h5/index?h5_url='+app.globalData.Official_article_url,
      })
    }

    mta.Event.stat('clickOfficialAccount',{'openid':openid})
  },
})