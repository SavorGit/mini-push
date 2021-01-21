// scene/pages/party/index.js
/**
 * 【场景】生日聚会 - 首页
 */
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_v_url = app.globalData.api_v_url;
var api_url   = app.globalData.api_url;
var cache_key = app.globalData.cache_key;
var openid;
var box_mac;
var mobile_brand = app.globalData.mobile_brand;
var mobile_model = app.globalData.mobile_model;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    SystemInfo: getApp().SystemInfo,
    oss_url:app.globalData.oss_url,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    openid = options.openid;
    box_mac = options.box_mac;
    var hotel_name = options.hotel_name;
    var room_name  = options.room_name;
    this.setData({'hotel_name':hotel_name,'room_name':room_name})
    this.getHappyList();
    utils.PostRequest(api_url+'/Smallapp3/constellation/getConstellationList', {
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        constellationlist:data.result,
        choose_constellid:data.result[0]['id'],
        choose_constellname: data.result[0]['name'],
        choose_constellisnow: 1
      })
      if (that.data.choose_constellid) {
        mta.Event.stat('viewConstellation', { 'name': that.data.choose_constellname })
        that.getContellDetail(that.data.choose_constellid)
      }
    })
  },
  getContellDetail:function(constellid){
    var that = this
    utils.PostRequest(api_url+'/Smallapp3/constellation/getVideoList', {
      constellation_id: constellid,
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        videolist: data.result
      })
    })
    utils.PostRequest(api_url+'/Smallapp3/constellation/getConstellationDetail', {
      constellation_id: constellid,
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        constellation_detail: data.result
      })
    })
    
  },
  switchConstell:function(e){
    var that = this;
    var constellid = e.currentTarget.dataset.constellid;
    var constellisnow = e.currentTarget.dataset.isnow;
    var constellname = e.currentTarget.dataset.name;
    that.setData({
      choose_constellid:constellid,
      choose_constellisnow:constellisnow,
      choose_constellname:constellname
    })
    that.getContellDetail(constellid)
    if(constellisnow==1){
      mta.Event.stat('viewConstellation', { 'name': constellname })
    }else{
      mta.Event.stat('viewNextConstellation', { 'name': constellname })
    }
  },
  showHappy:function(e){
    var user_info = wx.getStorageSync(cache_key +'user_info');
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    var vediourl = e.currentTarget.dataset.vediourl;
    var source = e.currentTarget.dataset.source
    var rname = e.currentTarget.dataset.name;
    
    var forscreen_char = 'Happy Birthday';
    var index1 = vediourl.lastIndexOf("/");
    var index2 = vediourl.length;
    var filename = vediourl.substring(index1 + 1, index2);//后缀名


    var timestamp = (new Date()).valueOf();
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    utils.PostRequest(api_url + '/smallapp21/User/isForscreenIng', {
      box_mac: box_mac 
    }, (data, headers, cookies, errMsg, statusCode) => {
      var is_forscreen = data.result.is_forscreen;
        if (is_forscreen == 1) {
          wx.showModal({
            title: '确认要打断投屏',
            content: '当前电视正在进行投屏,继续投屏有可能打断当前投屏中的内容.',
            success: function (res) {
              if (res.confirm) {
                mta.Event.stat('breakForscreen', { 'isbreak':1 })

                utils.PostRequest(api_url + '/Netty/Index/pushnetty', {
                  box_mac: box_mac,
                  msg: '{ "action": 6,"url":"' + vediourl + '","filename":"' + filename + '","forscreen_id":"' + timestamp + '","resource_type":2,"openid":"'+openid+'","serial_number":"'+app.globalData.serial_number+'"}',
                }, (data, headers, cookies, errMsg, statusCode) => {
                  wx.showToast({
                    title: '点播成功,电视即将开始播放',
                    icon: 'none',
                    duration: 5000
                  });
                  utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
                    forscreen_id: timestamp,
                    openid: openid,
                    box_mac: box_mac,
                    action: 5,
                    mobile_brand: mobile_brand,
                    mobile_model: mobile_model,
                    forscreen_char: forscreen_char,
                    imgs: '["media/resource/' + filename + '"]',
                    serial_number:app.globalData.serial_number
                  }, (data, headers, cookies, errMsg, statusCode) => {

                  })
                  
                })
              } else {
                mta.Event.stat('breakForscreen', { 'isbreak': 0 })
              }
            }
          })
        } else {
          utils.PostRequest(api_url + '/Netty/Index/pushnetty', {
            box_mac: box_mac,
            msg: '{ "action": 6,"url":"' + vediourl + '","filename":"' + filename + '","forscreen_id":"' + timestamp + '","resource_type":2,"openid":"'+openid+'","serial_number":"'+app.globalData.serial_number+'"}',
          }, (data, headers, cookies, errMsg, statusCode) => {
            wx.showToast({
              title: '点播成功,电视即将开始播放',
              icon: 'none',
              duration: 5000
            });
            utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
              forscreen_id: timestamp,
                openid: openid,
                box_mac: box_mac,
                action: 5,
                mobile_brand: mobile_brand,
                mobile_model: mobile_model,
                forscreen_char: forscreen_char,
                imgs: '["media/resource/' + filename + '"]',
                serial_number:app.globalData.serial_number
            }, (data, headers, cookies, errMsg, statusCode) => {

            },res=>{},{ isShowLoading: false })
            
          },res=>{},{ isShowLoading: false })
          
        }

    },res=>{},{ isShowLoading: false })
    
    
    if(source==1){
      mta.Event.stat('clickBirthdayMusic', { 'name': rname })
    } else if (source == 2){
      var that = this;
      if (that.data.choose_constellisnow == 1) {
        mta.Event.stat('playConstellationVideo', { 'name': that.data.choose_constellname, 'videoname': rname })
      }else{
        mta.Event.stat('playNextConstellationVideo', { 'name': that.data.choose_constellname, 'videoname': rname })
      }
    }
    
  },
  gotoWelcome:function(e){
    var pageTitle = e.currentTarget.dataset.page_title;
    var is_have_welcome = this.data.is_have_welcome;
    if(is_have_welcome){
      var welcome_id = this.data.welcome_info.welcome_id;
    }else {
      var welcome_id = 0 ;
      
    }
    wx.navigateTo({
      url: '/scene/pages/welcome/add?openid='+openid+'&box_mac='+box_mac+'&type=4&welcome_id='+welcome_id+'&pageTitle='+pageTitle,
    })
    mta.Event.stat('clickAddWelcome',{'openid':openid,'boxmac':box_mac,'typeid':2})
  },
  getHappyList:function(){
    var that = this;
    utils.PostRequest(api_v_url+'/index/happylist', {
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        happylist:data.result
      })
    })
  },
  getPartyInfo:function(e){
    var that = this;
    utils.PostRequest(api_v_url+'/Birthdayparty/moduleList', {
      openid:openid,
      box_mac:box_mac
    }, (data, headers, cookies, errMsg, statusCode) => {
      var welcome_info = data.result.welcome;
      if(JSON.stringify(welcome_info) == "{}"){
        that.setData({is_have_welcome:false})
      }else {
        that.setData({is_have_welcome:true,welcome_info:welcome_info})
      }

      var images = data.result.images;
      var images_num = data.result.images_num;
      var videos = data.result.videos;
      var videos_num = data.result.videos_num
      

      that.setData({
        images:images,
        images_num:images_num,
        videos:videos,
        videos_num:videos_num,
        
      })
    })
    
  },

  showHappy:function(e){

    var vediourl = e.currentTarget.dataset.vediourl;
    var source = e.currentTarget.dataset.source
    var rname = e.currentTarget.dataset.name;
    
    var forscreen_char = 'Happy Birthday';
    var index1 = vediourl.lastIndexOf("/");
    var index2 = vediourl.length;
    var filename = vediourl.substring(index1 + 1, index2);//后缀名


    var timestamp = (new Date()).valueOf();
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    utils.PostRequest(api_v_url + '/User/isForscreenIng', {
      box_mac: box_mac 
    }, (data, headers, cookies, errMsg, statusCode) => {
      var is_forscreen = data.result.is_forscreen;
        if (is_forscreen == 1) {
          wx.showModal({
            title: '确认要打断投屏',
            content: '当前电视正在进行投屏,继续投屏有可能打断当前投屏中的内容.',
            success: function (res) {
              if (res.confirm) {
                mta.Event.stat('breakForscreen', { 'isbreak':1 })

                utils.PostRequest(api_url + '/Netty/Index/pushnetty', {
                  box_mac: box_mac,
                  msg: '{ "action": 6,"url":"' + vediourl + '","filename":"' + filename + '","forscreen_id":"' + timestamp + '","resource_type":2,"openid":"'+openid+'","serial_number":"'+app.globalData.serial_number+'"}',
                }, (data, headers, cookies, errMsg, statusCode) => {
                  wx.showToast({
                    title: '点播成功,电视即将开始播放',
                    icon: 'none',
                    duration: 5000
                  });
                  utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
                    forscreen_id: timestamp,
                    openid: openid,
                    box_mac: box_mac,
                    action: 5,
                    mobile_brand: mobile_brand,
                    mobile_model: mobile_model,
                    forscreen_char: forscreen_char,
                    imgs: '["media/resource/' + filename + '"]',
                    serial_number:app.globalData.serial_number
                  }, (data, headers, cookies, errMsg, statusCode) => {

                  })
                  
                })
              } else {
                mta.Event.stat('breakForscreen', { 'isbreak': 0 })
              }
            }
          })
        } else {
          utils.PostRequest(api_url + '/Netty/Index/pushnetty', {
            box_mac: box_mac,
            msg: '{ "action": 6,"url":"' + vediourl + '","filename":"' + filename + '","forscreen_id":"' + timestamp + '","resource_type":2,"openid":"'+openid+'","serial_number":"'+app.globalData.serial_number+'"}',
          }, (data, headers, cookies, errMsg, statusCode) => {
            wx.showToast({
              title: '点播成功,电视即将开始播放',
              icon: 'none',
              duration: 5000
            });
            utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
              forscreen_id: timestamp,
                openid: openid,
                box_mac: box_mac,
                action: 5,
                mobile_brand: mobile_brand,
                mobile_model: mobile_model,
                forscreen_char: forscreen_char,
                imgs: '["media/resource/' + filename + '"]',
                serial_number:app.globalData.serial_number
            }, (data, headers, cookies, errMsg, statusCode) => {

            },res=>{},{ isShowLoading: false })
            
          },res=>{},{ isShowLoading: false })
          
        }

    },res=>{},{ isShowLoading: false })
    
    
    mta.Event.stat('partyForscreenHappy',{'openid':openid,'boxmac':box_mac})
    
  },
  forImages:function(e){
    wx.navigateTo({
      url: '/pages/forscreen/forimages/index?box_mac=' + box_mac + '&openid=' + openid ,
    })
    mta.Event.stat('partyForscreenImage',{'openid':openid,'boxmac':box_mac})
  },
  forVideo:function(e){
    var is_compress = this.data.is_compress;
    wx.navigateTo({
      url: '/pages/forscreen/forvideo/index?box_mac=' + box_mac + '&openid=' + openid +'&is_compress='+is_compress,
    })
    mta.Event.stat('partyForscreenVideo',{'openid':openid,'boxmac':box_mac})
  },
  forscreenWelcome:function(e){
    var that = this;
    var welcome_info = that.data.welcome_info;
    utils.PostRequest(api_v_url + '/Welcome/demandplay', {
      openid:openid,
      box_mac:box_mac,
      welcome_id:welcome_info.welcome_id
    }, (data, headers, cookies, errMsg, statusCode) =>{
      app.showToast('投屏成功',2000,'success')
    })
    var forscreen_id =(new Date()).valueOf();
    var image_list = welcome_info.images;
    var image_str ='';
    var space  = '';
    for(let i in image_list){
      image_str +=space +'"'+image_list[i]+'"';
      space = ',';
    }
    utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
      forscreen_id: forscreen_id,
      openid: openid,
      box_mac: box_mac,
      action: 43,
      mobile_brand: mobile_brand,
      mobile_model: mobile_model,
      forscreen_char: welcome_info.content,
      imgs: '['+image_str+']',
      res_sup_time: 0,
      res_eup_time: 0,
      resource_type: 1,
      res_nums: image_list.length,
      serial_number:app.globalData.serial_number
    }, (data, headers, cookies, errMsg, statusCode) => {
    },res=>{},{ isShowLoading: false })
    mta.Event.stat('forscreenWelcome',{'openid':openid,'boxmac':box_mac,'typeid':2})
  },
  gotoGift:function(e){
    wx.navigateTo({
      url: '/scene/pages/gift/list?openid='+openid+'&box_mac='+box_mac,
    })
    
    mta.Event.stat('clickSendGift',{'openid':openid,'boxmac':box_mac,'typeid':2})
   
  },
  gotoRedPack:function(e){
    wx.navigateTo({
      url: '/pages/thematic/money_blessing/packing?openid='+openid+'&box_mac='+box_mac+'&type=4',
    })
    mta.Event.stat('clickSendRedPack',{'openid':openid,'boxmac':box_mac,'typeid':2})
  },
  gotoForImages:function(e){
    wx.navigateTo({
      url: '/scene/pages/forscreen/forimages?openid='+openid+'&box_mac='+box_mac+'&scene_type=6',
    })
  },
  gotoForVideo:function(e){
    wx.navigateTo({
      url: '/scene/pages/forscreen/forvideo?openid='+openid+'&box_mac='+box_mac+'&scene_type=5',
    })
  },
  forscreenImage:function(e){
    var that = this;
    var keys = e.currentTarget.dataset.keys;
    var images = that.data.images;
    
    //return false;
    var user_info = wx.getStorageSync(cache_key+'user_info');
    var forscreen_id =(new Date()).valueOf();
    var netty_info = {};
    netty_info.action = 4;
    netty_info.resource_type = 1;
    netty_info.forscreen_id = forscreen_id;
    netty_info.res_sup_time = forscreen_id;
    netty_info.res_eup_time = forscreen_id;
    netty_info.openid = openid;
    netty_info.forscreen_char = '';
    netty_info.avatarUrl = user_info.avatarUrl;
    netty_info.nickName  = user_info.nickName;
    netty_info.serial_number = app.globalData.serial_number;

    var img_info = {};
    var img_list = [];
    img_info.url = images[keys].file_path;
    img_info.filename = images[keys].name;
    img_info.order    = 0;
    img_info.img_id   = images[keys].img_id;
    img_info.resource_size = images[keys].resource_size;
    img_list.push(img_info);
    netty_info.img_list = img_list;
    netty_info = JSON.stringify(netty_info);
    console.log(netty_info);
    utils.PostRequest(api_url + '/Netty/Index/pushnetty', {
      box_mac: box_mac,
      msg: netty_info,
    }, (data, headers, cookies, errMsg, statusCode) => {
      app.showToast('投屏成功',2000,'success')
      var action = 4;
      var imgs = '["'+images[keys].file_path+'"]';
      var quality_type = 3;
      var resource_id = images[keys].img_id;
      var resource_size  =img_info.resource_size;
      var resource_type = 2;
      that.recordForscreen(forscreen_id,action,imgs,quality_type,resource_id,resource_size,resource_type);
    })

  },
  forscreenVideo:function(e){
    var that = this;
    var keys = e.currentTarget.dataset.keys;
    var videos = that.data.videos;
    console.log(videos);

    var user_info = wx.getStorageSync(cache_key+'user_info');
    var forscreen_id =(new Date()).valueOf();
    var netty_info = {};
    
    netty_info.action = 2;
    netty_info.url = videos[keys].file_path;
    netty_info.filename = videos[keys].name;
    netty_info.openid   = openid;
    netty_info.resource_type = 2;
    netty_info.video_id = videos[keys].video_id;
    netty_info.avatarUrl = user_info.avatarUrl;
    netty_info.nickName = user_info.nickName;
    netty_info.forscreen_id = forscreen_id;
    netty_info.res_sup_time = forscreen_id;
    netty_info.res_eup_time = forscreen_id;
    netty_info.resource_size = videos[keys].resource_size;
    netty_info.serial_number = app.globalData.serial_number;
    netty_info = JSON.stringify(netty_info);
    utils.PostRequest(api_url + '/Netty/Index/pushnetty', {
      box_mac: box_mac,
      msg: netty_info,
    }, (data, headers, cookies, errMsg, statusCode) => {
      app.showToast('投屏成功',2000,'success')
      var action =2;
      var imgs = '["'+videos[keys].file_path+'"]';
      var quality_type = 0;
      var resource_id = videos[keys].video_id;
      var resource_size = videos[keys].resource_size;
      var resource_type = 2;
      var duration =  videos[keys].duration
      that.recordForscreen(forscreen_id,action,imgs,quality_type,resource_id,resource_size,resource_type,duration);
    })
  },

  recordForscreen:function(forscreen_id,action,imgs,quality_type,resource_id,resource_size,resource_type,duration= 0){
    utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
      forscreen_id: forscreen_id,
      openid: openid,
      box_mac: box_mac,
      action: action,
      mobile_brand: mobile_brand,
      mobile_model: mobile_model,
      forscreen_char: '',
      public_text: '',
      imgs: imgs,
      quality_type:quality_type,
      resource_id: resource_id,
      res_sup_time: forscreen_id,
      res_eup_time: forscreen_id,
      resource_size: resource_size,
      is_pub_hotelinfo: 0,
      is_share: 0,
      resource_type: resource_type,
      res_nums: 1,
      duration:duration,
      serial_number:app.globalData.serial_number
    }, (data, headers, cookies, errMsg, statusCode) => {
    },re => { }, { isShowLoading: false })
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
    this.getPartyInfo();
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