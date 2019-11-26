// pages/find/full_scroll.js

let app = getApp();
let systemInfo = app.SystemInfo;
let utils = require("../../utils/util.js")
let touchEvent = [];
let touchMoveExecuteTrip = '160rpx';

let api_url = app.globalData.api_url;
let SavorUtils = {
  User: {

    // 判断用户是否注册
    isRegister: pageContext => utils.PostRequest(api_url + '/smallapp21/User/isRegister', {
      openid: pageContext.data.openid,
      page_id: 2
    }, (data, headers, cookies, errMsg, statusCode) => wx.setStorage({
      key: 'savor_user_info',
      data: data.result.userinfo,
    }), res => wx.setStorage({
      key: 'savor_user_info',
      data: {
        openid: app.globalData.openid
      }
    })),

    // 获取版位信息
    isHaveCallBox: (pageContext) => utils.PostRequest(api_url + '/Smallapp/index/isHaveCallBox?openid=' + pageContext.data.openid, {}, (data, headers, cookies, errMsg, statusCode) => {
      let is_have = data.result.is_have;
      if (is_have == 1) {
        app.linkHotelWifi(data.result, pageContext);
        pageContext.setData({
          is_link: 1,
          hotel_name: data.result.hotel_name,
          room_name: data.result.room_name,
          box_mac: data.result.box_mac,
          is_open_simple: data.result.is_open_simple
        });
      } else {
        pageContext.setData({
          is_link: 0,
          box_mac: ''
        });
      }
    }),

    // 收藏/取消收藏
    favorite: (pageContext, forscreenId, index, status) => utils.PostRequest(api_url + '/Smallapp/collect/recLogs', {
      'openid': pageContext.data.openid,
      'res_id': forscreenId,
      'type': 2,
      'status': status,
    }, (data, headers, cookies, errMsg, statusCode) => {
      if (pageContext.data.pageType == 1) {
        let pictureObjectList = pageContext.data.pictureObjectList;
        pictureObjectList[index].is_collect = status;
        pictureObjectList[index].collect_num = data.result.nums;
        pageContext.setData({
          pictureObjectList: pictureObjectList
        });
      } else {
        let mediaObjectList = pageContext.data.mediaObjectList;
        mediaObjectList[index].is_collect = status;
        mediaObjectList[index].collect_num = data.result.nums;
        pageContext.setData({
          mediaObjectList: mediaObjectList
        });
      }
    }, ({
      errMsg
    }) => wx.showToast({
      title: '网络异常，请稍后重试',
      icon: 'none',
      duration: 2000
    })),

    // 投屏单个媒体
    recordForScreenPics: (pageContext, extendData, forscreenId, pubdetail) => {
      let originalData = {
        forscreen_id: forscreenId,
        openid: pageContext.data.openid,
        box_mac: pageContext.data.box_mac,
        mobile_brand: app.globalData.mobile_brand,
        mobile_model: app.globalData.mobile_model,
        forscreen_char: '',
        imgs: '["' + pubdetail['forscreen_url'] + '"]',
        resource_id: pubdetail['res_id'],
        res_sup_time: 0,
        res_eup_time: 0,
        resource_size: pubdetail['resource_size'],
        is_pub_hotelinfo: 0,
        is_share: 0,
        action: 12
      };
      let data = utils.ObjectUtil.extend(originalData, extendData);
      utils.PostRequest(api_url + '/Smallapp/index/recordForScreenPics', data);
    },

    // 投屏媒体组
    launchMediaSubGroup: (pageContext, mediaObject) => {
      let user_info = wx.getStorageSync("savor_user_info");
      let avatarUrl = user_info.avatarUrl;
      let nickName = user_info.nickName;
      let mediaSubGroupType = mediaObject.res_type;
      let pubdetailList = mediaObject.pubdetail;
      let mediaSubGroupSize = mediaObject.res_nums;
      let currentTime = (new Date()).valueOf();
      for (let index = 0; index < mediaSubGroupSize; index++) {
        let extendData = {};
        let action = -1;
        let order = index + 1;
        let url = pubdetailList[index]['forscreen_url'];
        let filename = pubdetailList[index]['filename'];
        let res_id = pubdetailList[index]['res_id'];
        let nettyMessageContent = '{"resource_type":2,"url":"' + url + '","filename":"' + filename + '","openid":"' + pageContext.data.openid + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '","forscreen_id":"' + currentTime + '"';
        if (mediaSubGroupType == 1) { // 图片
          extendData.action = 11; //发现图片点播
          delete extendData.duration;
          nettyMessageContent += ',"action":4,"img_id":"' + res_id + '","img_nums":' + mediaSubGroupSize + ',"forscreen_char":"","order":' + order;
        } else { // 视频
          extendData.action = 12; //发现视频点播
          extendData.duration = pubdetailList[index]['duration']
          nettyMessageContent += ',"action":2,"video_id":"' + res_id + '"';
        }
        nettyMessageContent += '}';
        SavorUtils.User.recordForScreenPics(pageContext, extendData, currentTime, pubdetailList[index]);
        SavorUtils.Netty.push(pageContext, nettyMessageContent); // 向机顶盒推送消息
      }
    },

    // 投屏媒体
    launchMedia: (pageContext, forscreenId, indexInList) => {
      let mediaObject = pageContext.data.mediaObjectList[indexInList];
      
      SavorUtils.User.launchMediaSubGroup(pageContext, mediaObject);
      utils.PostRequest(api_url + '/Smallapp21/CollectCount/recCount', {
        res_id: forscreenId
      });
    }
  },
  Page: {

    // 加载视频数据
    loadMediaData: function(pageContext) {
      let user_info = wx.getStorageSync("savor_user_info");
      let pageNo = ++pageContext.data.mediaPageNo;
      utils.PostRequest(api_url + '/Smallapp4/find/videos', {
        page: pageNo,
        openid: user_info.openid
      }, (data, headers, cookies, errMsg, statusCode) => {
        let mediaObjectList = pageContext.data.mediaObjectList;
        if (!(mediaObjectList instanceof Array)) {
          mediaObjectList = new Array();
        }
        pageContext.setData({
          mediaPageNo: pageNo,
          pageType: 0,
          mediaObjectList: mediaObjectList.concat(data.result)
        });
      });
    },

    // 加载图片数据
    loadPictureData: function(pageContext) {
      let user_info = wx.getStorageSync("savor_user_info");
      let pageNo = ++pageContext.data.picturePageNo;
      utils.PostRequest(api_url + '/Smallapp4/find/images', {
        page: pageNo,
        openid: user_info.openid
      }, (data, headers, cookies, errMsg, statusCode) => {
        let pictureObjectList = pageContext.data.pictureObjectList;
        if (!(pictureObjectList instanceof Array)) {
          pictureObjectList = new Array();
        }
        pageContext.setData({
          picturePageNo: pageNo,
          pageType: 1,
          pictureObjectList: pictureObjectList.concat(data.result)
        });
      });
    },
  },

  Netty: {
    push: (pageContext, message) => utils.PostRequest(api_url + '/Netty/Index/index', {
      box_mac: pageContext.data.box_mac,
      msg: message
    }, (data, headers, cookies, errMsg, statusCode) => wx.showToast({
      title: '点播成功,电视即将开始播放',
      icon: 'none',
      duration: 2000
    }), res => wx.showToast({
      title: '网络异常,点播失败',
      icon: 'none',
      duration: 2000
    }))
  }
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: app.globalData.statusBarHeight,
    openid: '',
    pageType: 0, // 页面类型。0：视频：1：图片。
    mediaScrollIndex: 0, //当前页面的索引值
    playProgress: [],
    mediaObjectList: [], // 视频列表
    mediaPageNo: 0,
    pictureObjectList: [], // 图片列表
    picturePageNo: 0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let self = this;
    self.touchMoveHandler = new utils.TouchMoveHandler(systemInfo, touchMoveExecuteTrip);

    if (app.globalData.openid && app.globalData.openid != '') {
      self.setData({
        openid: app.globalData.openid
      });
      SavorUtils.User.isRegister(self); //判断用户是否注册
      SavorUtils.User.isHaveCallBox(self);
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          self.setData({
            openid: openid
          });
          SavorUtils.User.isRegister(self); //判断用户是否注册
          SavorUtils.User.isHaveCallBox(self);
        }
      };
    }
    // let box_mac = self.data.box_mac;

    // 加载数据
    SavorUtils.Page.loadMediaData(self);
    wx.createVideoContext('JohnVideo0').play();
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#000000',
      animation: {
        duration: 30,
        timingFunc: 'linear'
      }
    });
  },

  /**
   * 手指触摸动作开始
   */
  onTouchStart: function(e) {
    let self = this;
    if (!(e.changedTouches instanceof Array) || e.changedTouches.length < 1) {
      e.changedTouches = e.touches;
    }
    if (!(e.touches instanceof Array) || e.touches.length < 1) {
      e.touches = e.changedTouches;
    }
    touchEvent['touchStart'] = e;
  },

  /**
   * 手指触摸动作结束
   */
  onTouchEnd: function(e) {
    let self = this;
    if (!(e.changedTouches instanceof Array) || e.changedTouches.length < 1) {
      e.changedTouches = e.touches;
    }
    if (!(e.touches instanceof Array) || e.touches.length < 1) {
      e.touches = e.changedTouches;
    }

    let startEvent = touchEvent['touchStart'],
      endEvent = e;
    let moveExecuteTrip = self.touchMoveHandler.turnPixel('touchMoveExecuteTrip', touchMoveExecuteTrip);
    let tripY = endEvent.touches[0].pageY - startEvent.touches[0].pageY;
    let lastScrollIndex = self.data.mediaScrollIndex;
    let mediaScrollIndex = lastScrollIndex;
    if (tripY > moveExecuteTrip && self.data.mediaScrollIndex > 0) {
      mediaScrollIndex--;
    } else if (tripY < -(moveExecuteTrip) && self.data.mediaScrollIndex < self.data.mediaObjectList.length - 1) {
      mediaScrollIndex++;
    } else {
      return;
    }

    let animation = wx.createAnimation({
      duration: 150,
      timingFunction: 'linear'
    });
    animation.left(0).top(0).translateX(0).translateY('-' + (mediaScrollIndex * 100) + '%').step({
      duration: 150,
      timingFunction: 'linear'
    });
    self.setData({
      mediaScrollIndex: mediaScrollIndex,
      animationData: animation
    });
    setTimeout(function() {
      self.setData({
        animationData: {}
      });
    }, 150);

    delete touchEvent["touchStart"];
    delete touchEvent["touchEnd"];

    wx.createVideoContext('JohnVideo' + lastScrollIndex).pause();
    wx.createVideoContext('JohnVideo' + mediaScrollIndex).play();
    if (self.data.mediaObjectList.length - 1 == self.data.mediaScrollIndex) {
      SavorUtils.Page.loadMediaData(self);
    }
  },

  /**
   * 播放进度变化时触发，event.detail = {currentTime, duration} 。触发频率 250ms 一次
   */
  onTimeUpdate: function(e) {
    let self = this;
    // console.log(e);
    let playProgress = self.data.playProgress;
    playProgress[e.target.dataset.index] = e.detail.currentTime / e.detail.duration;
    // console.log(playProgress);
    self.setData({
      playProgress: playProgress
    });
  },

  // 加载进度
  onLoadProgress: function(e) {
    // console.log(e);
  },

  // 跳转到发布图片页
  goToFindPictures: function(e) {
    let self = this;
    wx.createVideoContext('JohnVideo' + self.data.mediaScrollIndex).pause();
    if (self.data.pictureObjectList.length < 1) {
      SavorUtils.Page.loadPictureData(self);
    } else {
      self.setData({
        pageType: 1
      });
    }
  },

  // 跳转到发布视频页
  goToFindMedias: function(e) {
    let self = this;
    if (self.data.mediaObjectList.length < 1) {
      SavorUtils.Page.loadMediaData(self);
    } else {
      self.setData({
        mediaScrollIndex: 0,
        pageType: 0
      });
    }
    wx.createVideoContext('JohnVideo' + self.data.mediaScrollIndex).play();
  },

  //收藏资源
  onCollect: function(e) {
    console.log(e);
    let self = this;
    let forscreenId = e.currentTarget.dataset.forscreen_id;

    let index = e.currentTarget.dataset.index;
    SavorUtils.User.favorite(self, forscreenId, index, 1);
  },

  //取消收藏
  cancCollect: function(e) {
    console.log(e);
    let self = this;
    let forscreenId = e.currentTarget.dataset.forscreen_id;
    
    let index = e.currentTarget.dataset.index;
    SavorUtils.User.favorite(self, forscreenId, index, 0);
  },

  //电视播放
  boxShow(e) {
    console.log(e);
    let self = this;
    let forscreenId = e.target.dataset.forscreen_id;
    let indexInList = e.target.dataset.index;
    if (self.data.box_mac == '') {
      app.scanQrcode();
    } else {
      utils.PostRequest(api_url + '/smallapp21/User/isForscreenIng', {
        box_mac: self.data.box_mac
      }, (data, headers, cookies, errMsg, statusCode) => {
        let is_forscreen = data.result.is_forscreen;
        if (is_forscreen == 1) {
          wx.showModal({
            title: '确认要打断投屏',
            content: '当前电视正在进行投屏,继续投屏有可能打断当前投屏中的内容.',
            success: function(res) {
              if (res.confirm) {
                SavorUtils.User.launchMedia(self, forscreenId, indexInList);
              }
            }
          })
        } else {
          SavorUtils.User.launchMedia(self, forscreenId, indexInList);
        }
      });
    }
  }, //电视播放结束

  // 加载更多图片
  loadMorePictures: function(e) {
    let self = this;
    SavorUtils.Page.loadPictureData(self);
  },

  // 点击更多按钮 - 图片
  clickPictureMenuMore: function(e) {
    let self = this;
    let forscreenId = e.target.dataset.forscreen_id;
    let index = e.target.dataset.index;
    let pictureObjectList = self.data.pictureObjectList;
    pictureObjectList[index].isOpen = !(pictureObjectList[index].isOpen);
    self.setData({
      pictureObjectList: pictureObjectList
    });
  }
});