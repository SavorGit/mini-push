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
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    cityArray:[['北京', '上海','广州','深圳'], ['海淀区', '朝阳区', '昌平区', '西城区', '大兴区']],
    objectCityArray: [
      [
        {
          id: 1,
          name: '北京'
        },
        {
          id: 9,
          name: '上海'
        },
        {
          id: 236,
          name: '广州'
        },
        {
          id: 246,
          name: '深圳'
        }
      ],
      [
        {
          id: 10,
          name: '海淀区'
        },
        {
          id: 11,
          name: '朝阳区'
        },
        {
          id: 12,
          name: '昌平区'
        },
        {
          id: 13,
          name: '西城区'
        },
        {
          id: 14,
          name: '大兴区'
        }
      ]
    ],
    cityIndex: [0,0],

    areaArray: [],
    objectAreaArray: [],
    areaIndex: 0,

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
    var type = options.type;
    latitude = options.latitude;
    longitude= options.longitude;

    //that.getCityList();
    //获取菜系列表
    that.getFoodStyleList(type)
    //获取人均消费
    that.getExpList();



    /*//获取城市列表
    that.getCityList();
    //获取当前城市
    wx.getLocation({
      type: 'wgs84',
      isHighAccuracy:true,
      success(res) {
        console.log(res)
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
          if (data.result.cityindex == null) {
            that.setData({
              cityIndex: 0
            })
          } else {
            that.setData({
              cityIndex: data.result.cityindex
            })
          }
          var area_id = data.result.area_id;


          //获取区域列表
          that.getAreaList(area_id);
          
          //获取酒楼列表
          
          that.getHotelList(page,area_id,0,0,0);
        })
        
        //mta.Event.stat('getLocationInfo', { 'ltype': 2 })
      },
      fail: function (e) {
        that.setData({
          cityIndex: 0
        })
        var area_id = 1;
        that.getAreaList(area_id);
        
        that.getHotelList(page,area_id,0,0,0);
        
        //mta.Event.stat('getLocationInfo', { 'ltype': 1 })
      }
    })
    //获取菜系列表
    that.getFoodStyleList()
    //获取人均消费
    that.getExpList();*/

  },
  getExpList:function(){
    var that = this;
    utils.PostRequest(api_v_url + '/Hotel/getExplist', {
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        perCapitaPayArray: data.result.agv_name,
        objectPerCapitaPayArray: data.result.agv_lisg
      })
    })
  },
  getFoodStyleList:function(type){
    var that = this;
    utils.PostRequest(api_v_url + '/FoodStyle/getList', {
      type:type
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        cuisineArray: data.result.food_name_list,
        objectCuisineArray: data.result.food_list
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
  getCityList:function(){
    var that = this;
    utils.PostRequest(api_v_url + '/Area/getAreaList', {
    }, (data, headers, cookies, errMsg, statusCode) => {
      
      that.setData({
        cityArray: data.result.city_name_list,
        objectCityArray: data.result.city_list
      })
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
  //改变区域城市
  bindAreaPickerChange:function(e){
    console.log('确认')
    console.log(e)
    var city_index = e.detail.value[0];
    var area_index = e.detail.value[1];

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
      cityArray[1] = ['闽行','奉贤'];    //找到对应城市的区域并赋值
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
    
    var city_list = that.data.objectCityArray;
    var cityIndex = that.data.cityIndex; //城市key
    var area_id = city_list[cityIndex].id; //城市id

    var county_list = that.data.objectAreaArray;
    var areaIndex = that.data.areaIndex;
    var county_id = county_list[areaIndex].id; //区域id

    var food_style_list = that.data.objectCuisineArray;
    var cuisineIndex = that.data.cuisineIndex;
    var food_style_id = food_style_list[cuisineIndex].id; //菜系id

    var avg_exp_list = that.data.objectPerCapitaPayArray;
    var perCapitaPayIndex = that.data.perCapitaPayIndex;
    var avg_exp_id = avg_exp_list[perCapitaPayIndex].id; //人均消费id
    that.getHotelList(page,area_id, county_id, food_style_id, avg_exp_id);
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
    //mta.Event.stat('clickHotelImg', { 'hotelid': e.currentTarget.dataset.hotelid })
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

      that.getAreaList(area_id);
      
      //获取酒楼列表
      var food_style_list = that.data.objectCuisineArray;
      var cuisineIndex = that.data.cuisineIndex;
      var food_style_id = food_style_list[cuisineIndex].id;
      var avg_exp_list = that.data.objectPerCapitaPayArray;
      var perCapitaPayIndex = that.data.perCapitaPayIndex;
      var avg_exp_id = avg_exp_list[perCapitaPayIndex].id;
      that.getHotelList(page,area_id, 0, food_style_id, avg_exp_id);
    }
    //mta.Event.stat('chooseCity', { 'cityname': city_list[picCityIndex].region_name })
  },
  
  //切换菜系
  bindCuiPickerChange: function (e) {
    var that = this;
    var cui_list = that.data.objectCuisineArray;
    var cuisineIndex = e.detail.value
    that.setData({
      cuisineIndex: cuisineIndex
    })
    var city_list = that.data.objectCityArray;
    var cityIndex = that.data.cityIndex; //城市key
    var area_id = city_list[cityIndex].id; //城市id

    var county_list = that.data.objectAreaArray;
    var areaIndex = that.data.areaIndex;
    var county_id = county_list[areaIndex].id; //区域id

    var food_style_id = cui_list[cuisineIndex].id; //菜系id
    var avg_exp_list = that.data.objectPerCapitaPayArray;
    var perCapitaPayIndex = that.data.perCapitaPayIndex;
    var avg_exp_id = avg_exp_list[perCapitaPayIndex].id; //人均消费id

    that.getHotelList(page,area_id, county_id, food_style_id, avg_exp_id);
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
    var city_list = that.data.objectCityArray;
    var cityIndex = that.data.cityIndex; //城市key
    var area_id = city_list[cityIndex].id; //城市id

    var county_list = that.data.objectAreaArray;
    var areaIndex = that.data.areaIndex;
    var county_id = county_list[areaIndex].id; //区域id

    var food_style_list = that.data.objectCuisineArray;
    var cuisineIndex = that.data.cuisineIndex;
    var food_style_id = food_style_list[cuisineIndex].id;

    that.getHotelList(page,area_id, county_id, food_style_id, avg_exp_id);

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