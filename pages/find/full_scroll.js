// pages/find/full_scroll.js

let app = getApp();
let systemInfo = app.SystemInfo;
let utils = require("../../utils/util.js");
var mta = require('../../utils/mta_analysis.js');
let touchEvent = [];
let touchMoveExecuteTrip = '160rpx';
var cache_key = app.globalData.cache_key;
let api_url = app.globalData.api_url;
let api_v_url = app.globalData.api_v_url;
let box_api_domain = '';
let httpReg = new RegExp('^http(s)?://', 'i');
let pageid = 2;
let SavorUtils = {
  Constant: {
    LinkType: {
      INIT: 0, // 初始化
      NET: 1, // 外网
      BOX: 2 // 直联
    },
    MediaType: {
      UNKNOW: 0,
      PICTURE: 1,
      VIDEO: 2
    }
  },
  User: {

    // 判断用户是否注册
    isRegister: pageContext => utils.PostRequest(api_v_url + '/User/isRegister', {
      openid: pageContext.data.openid,
      page_id: 2
    }, (data, headers, cookies, errMsg, statusCode) => wx.setStorage({
      key: 'savor_user_info',
      data: data.result.userinfo,
    }), res => {
      if (app.globalData.link_type != 2) {
        wx.setStorage({
          key: 'savor_user_info',
          data: {
            openid: app.globalData.openid
          }
        });
      }
    }),

    // 获取版位信息
    isHaveCallBox: (pageContext) => utils.PostRequest(api_v_url + '/index/isHaveCallBox?openid=' + pageContext.data.openid, {}, (data, headers, cookies, errMsg, statusCode) => {
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
    favorite: (pageContext, forscreenId, type, index, status) => utils.PostRequest(api_v_url + '/collect/recLogs', {
      'openid': pageContext.data.openid,
      'res_id': forscreenId,
      'type': type,
      'status': status,
      //'only_co': status,
    }, (data, headers, cookies, errMsg, statusCode) => {
      if (pageContext.data.pageType == 1) {
        let pictureObjectList = pageContext.data.pictureObjectList;
        pictureObjectList[index].is_collect = status;
        pictureObjectList[index].collect_num = data.result.nums;
        pageContext.setData({
          pictureObjectList: pictureObjectList
        });
        if (status == 1) {
          utils.tryCatch(mta.Event.stat('findCollectPic', {
            'openid': pageContext.data.openid
          }));
        }
        utils.tryCatch(mta.Event.stat('FindPic_PicList_Favorite', {
          'openid': pageContext.data.openid,
          'boxmac': pageContext.data.box_mac,
          'status': status == 1
        }));
      } else {
        let mediaObjectList = pageContext.data.mediaObjectList;
        mediaObjectList[index].is_collect = status;
        mediaObjectList[index].collect_num = data.result.nums;
        pageContext.setData({
          mediaObjectList: mediaObjectList
        });
        if (status == 1) {
          utils.tryCatch(mta.Event.stat('findCollectVideo', {
            'openid': pageContext.data.openid
          }));
        }
        utils.tryCatch(mta.Event.stat('FindVideo_VideoList_Favorite', {
          'openid': pageContext.data.openid,
          'boxmac': pageContext.data.box_mac,
          'status': status == 1
        }));
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
      utils.PostRequest(api_v_url + '/index/recordForScreenPics', data);
    },

    // 投屏媒体组
    launchMediaSubGroup: (pageContext, mediaObject, forscreen_id) => {
      var that =  this;
      console.log(mediaObject);
      let user_info = wx.getStorageSync("savor_user_info");
      let avatarUrl = user_info.avatarUrl;
      let nickName = user_info.nickName;
      let mediaSubGroupType = mediaObject.res_type;
      let pubdetailList = mediaObject.pubdetail;
      let mediaSubGroupSize = mediaObject.res_nums;
      let currentTime = (new Date()).valueOf();
      
      var box_mac = pageContext.data.box_mac
      var pubdetail = mediaObject.pubdetail;
      var res_nums = pubdetail.length;
      var res_type = mediaSubGroupType
      
      if(mediaObject.type==1){
        action = 5;
      }else{
        if(res_type==1){
          var action = 11;
        }else {
          var action = 12;
        }
      }
      app.boxShow(box_mac, forscreen_id, pubdetail, res_type, res_nums, action, '', that);
      if (mediaSubGroupType == SavorUtils.Constant.MediaType.PICTURE) {
        utils.tryCatch(mta.Event.stat('findBoxShowpic', {
          'openid': pageContext.data.openid
        }));
      } else {
        utils.tryCatch(mta.Event.stat('findBoxShowVideo', {
          'openid': pageContext.data.openid
        }));
      }
    },

    // 投屏媒体
    launchMedia: (pageContext, forscreenId, indexInList) => {
      let mediaObject = null;
      if (pageContext.data.pageType == 1) {
        mediaObject = pageContext.data.pictureObjectList[indexInList];
      } else {
        mediaObject = pageContext.data.mediaObjectList[indexInList];
      }
      SavorUtils.User.launchMediaSubGroup(pageContext, mediaObject, forscreenId);
      utils.PostRequest(api_v_url + '/CollectCount/recCount', {
        res_id: forscreenId
      });
      //utils.tryCatch(mta.Event.stat('findBoxShow', { 'openid': pageContext.data.openid }));
    }
  },
  Page: {

    // 加载视频数据
    loadMediaData: pageContext => {
      let user_info = wx.getStorageSync("savor_user_info");
      let pageNo = ++pageContext.data.mediaPageNo;
      utils.PostRequest(api_v_url + '/find/videos', {
        page: pageNo,
        openid: user_info.openid
      }, (data, headers, cookies, errMsg, statusCode) => {
        let mediaObjectList = pageContext.data.mediaObjectList;
        if (!(mediaObjectList instanceof Array)) {
          mediaObjectList = new Array();
        }
        if (!(data.result instanceof Array)) {
          wx.showToast({
            title: '没有视频了，赶快上传几个吧！',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        pageContext.setData({
          mediaPageNo: pageNo,
          pageType: 0,
          mediaObjectList: mediaObjectList.concat(data.result)
        });
      });
    },

    // 加载视频数据
    loadBoxMediaData: pageContext => {
      let user_info = wx.getStorageSync("savor_user_info");
      // let pageNo = ++pageContext.data.mediaPageNo;
      let request_url = box_api_domain + '/h5/findDiscover?box_mac=' + app.globalData.hotel_info.box_mac + '&web=true&deviceId=' + user_info.openid;
      if (utils.verbose == true) {
        console.log('full_scroll.customer.Page.loadMediaData', 'app.globalData.hotel_info', app.globalData.hotel_info, request_url);
      }
      utils.PostRequest(request_url, {
        // page: pageNo,
        // openid: user_info.openid
      }, (data, headers, cookies, errMsg, statusCode) => {
        if (utils.verbose == true) {
          console.log('full_scroll.customer.Page.loadMediaData', 'success', app.globalData.hotel_info.intranet_ip, app.globalData.hotel_info.box_mac, user_info.openid, request_url, data);
        }
        let mediaObjectList = pageContext.data.mediaObjectList;
        if (!(mediaObjectList instanceof Array)) {
          mediaObjectList = new Array();
        }
        if (!(data.result instanceof Array)) {
          wx.showToast({
            title: '没有视频了！',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        pageContext.setData({
          // mediaPageNo: pageNo,
          pageType: 0,
          mediaObjectList: mediaObjectList.concat(data.result)
        });
      }, res => {
        if (utils.verbose == true) {
          console.log('full_scroll.customer.Page.loadMediaData', 'fail', app.globalData.hotel_info.intranet_ip, app.globalData.hotel_info.box_mac, user_info.openid, request_url, res);
        }
        if (typeof(res.errMsg) == 'string') {
          // pageContext.apiFail = true;
          pageContext.setData({
            apiStatus: 221
          });
        }
      });
    },

    // 加载图片数据
    loadPictureData: pageContext => {
      let user_info = wx.getStorageSync("savor_user_info");
      let pageNo = ++pageContext.data.picturePageNo;
      utils.PostRequest(api_v_url + '/find/images', {
        page: pageNo,
        openid: user_info.openid
      }, (data, headers, cookies, errMsg, statusCode) => {
        let pictureObjectList = pageContext.data.pictureObjectList;
        // if (!(pictureObjectList instanceof Array)) {
        //   pictureObjectList = new Array();
        // }
        if (!(data.result instanceof Array)) {
          wx.showToast({
            title: '没有图片了，赶快上传几张吧！',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        pageContext.setData({
          picturePageNo: pageNo,
          pageType: 1,
          // pictureObjectList: pictureObjectList.concat(data.result)
          pictureObjectList: data.result
        });
      });
    },

    // 初始化页面数据
    initPageSetData: pageContext => {
      pageContext.setData({
        isShowMediaPlayButton: false
      });
      wx.createVideoContext('JohnVideo0').play();
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#000000',
        animation: {
          duration: 30,
          timingFunc: 'linear'
        }
      });
    }
  },
};

Page({
  // 触摸开始时间
  touchStartTimeOnVideo: 0,
  // 触摸结束时间
  touchEndTimeOnVideo: 0,
  // 最后一次单击事件点击发生时间
  lastTapTimeOnVideo: 0,

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: app.globalData.statusBarHeight,
    link_type: app.globalData.link_type, //1:外网投屏  2：直连投屏
    openid: '',
    pageType: 0, // 页面类型。0：视频：1：图片。
    isShowMediaPlayButton: true, // 是否显示播放按钮
    isShowMediaLoading: false, // 是否展示 Loading
    mediaScrollIndex: 0, //当前页面的索引值
    playProgress: [],
    mediaObjectList: [], // 视频列表
    mediaPageNo: 0,
    pictureObjectList: [], // 图片列表
    picturePageNo: 0,
    btnFavoriteClickTime: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let self = this;
    self.touchMoveHandler = new utils.TouchMoveHandler(systemInfo, touchMoveExecuteTrip);
    self.setData({
      link_type: app.globalData.link_type
    });
  },

  /**
   * 生命周期回调—监听页面初次渲染完成
   */
  onReady: function(options) {
    let self = this;

    if (utils.verbose == true) {
      console.log('full_scroll.Page.onReady', 'app.globalData.hotel_info', app.globalData.hotel_info);
      console.log('full_scroll.Page.onReady', 'self.data.link_type', self.data.link_type, app.globalData.link_type, SavorUtils.Constant.LinkType.BOX);
    }
    // 非直联方式
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

    // 加载数据
    SavorUtils.Page.loadMediaData(self);
    SavorUtils.Page.initPageSetData(self)
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
    var user_info = wx.getStorageSync(cache_key + 'user_info');
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
      //看上一个
      mediaScrollIndex--;
      // wx.showTabBar({});
      utils.tryCatch(mta.Event.stat('findvideoglide', {
        'openid': user_info.openid
      }));
    } else if (tripY < -(moveExecuteTrip) && self.data.mediaScrollIndex < self.data.mediaObjectList.length - 1) {
      //看下一个
      mediaScrollIndex++;
      // wx.hideTabBar({});
      utils.tryCatch(mta.Event.stat('findvideoupglide', {
        'openid': user_info.openid
      }));
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
    self.setData({
      isShowMediaPlayButton: false
    });
    wx.createVideoContext('JohnVideo' + mediaScrollIndex).play();
    if (self.data.mediaObjectList.length - 1 == self.data.mediaScrollIndex) {
      if (self.data.link_type == SavorUtils.Constant.LinkType.BOX) { // 直联方式
        SavorUtils.Page.loadBoxMediaData(self);
      } else {
        SavorUtils.Page.loadMediaData(self);
      }
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

  // 当开始/继续播放时触发play事件
  onVideoPlay: function(e) {
    let self = this;
    if (utils.verbose == true) {
      console.log('full_scroll.Page.onVideoPlay', e);
    }
    utils.tryCatch(mta.Event.stat('FindVideo_VideoList_Play', {
      'openid': self.data.openid
    }));
  },

  // 当暂停播放时触发 pause 事件
  onVideoPause: function(e) {
    let self = this;
    if (utils.verbose == true) {
      console.log('full_scroll.Page.onVideoPause', e);
    }
    utils.tryCatch(mta.Event.stat('FindVideo_VideoList_Pause', {
      'openid': self.data.openid
    }));
  },

  // 当播放到末尾时触发 ended 事件
  onVideoEnded: function(e) {
    let self = this;
    //console.log('full_scroll.Page.onVideoEnded', e);
    self.setData({
      isShowMediaPlayButton: true
    });
    var user_info = wx.getStorageSync(cache_key + 'user_info');
    var id = e.currentTarget.dataset.id;
    var type = e.currentTarget.dataset.type;
    utils.tryCatch(mta.Event.stat('onVideoEnded', {
      'id': id,
      'types': type,
      'openid': user_info.openid
    })); //1官方 2精选 3公开
  },

  // 视频元数据加载完成时触发。
  onVideoLoadedMetadata: function(e) {
    // console.log('full_scroll.Page.onVideoLoadedMetadata', e);
  },

  // 视频播放出错时触发
  onVideoError: function(e) {
    // console.log('full_scroll.Page.onVideoError', e);
  },

  // 视频出现缓冲时触发
  onVideoWaiting: function(e) {
    let self = this;
    self.setData({
      isShowMediaLoading: true,
      isShowMediaPlayButton: false
    });
    // console.log('full_scroll.Page.onVideoWaiting', e);
    wx.onNetworkStatusChange(function(res) {
      if (res.isConnected == false) {
        self.setData({
          isShowMediaLoading: false
        });
        wx.showToast({
          title: '网络已断开',
          icon: 'none',
          duration: 5000
        });
      }
    });
  },

  // 加载进度
  onLoadProgress: function(e) {
    let self = this;
    self.setData({
      isShowMediaLoading: false
    });
  },

  // 点击视频
  onClickVideo: function(e) {
    let self = this;
    if (self.data.isShowMediaPlayButton == true) {
      self.setData({
        isShowMediaPlayButton: false
      });
      wx.createVideoContext('JohnVideo' + self.data.mediaScrollIndex).play();
    } else {
      self.setData({
        isShowMediaPlayButton: true
      });
      wx.createVideoContext('JohnVideo' + self.data.mediaScrollIndex).pause();
    }
  },

  // 双击视频
  onDoubleClickVideo: function(e) {
    let self = this;
    let index = e.currentTarget.dataset.index;
    let type = e.currentTarget.dataset.type;
    if (self.data.mediaObjectList[index].is_collect != 1) {
      if (type == 2 || type == 3) {
        var res_id = e.currentTarget.dataset.forscreen_id;
        var c_type = 2;
      } else {
        var res_id = e.currentTarget.dataset.id;
        var c_type = 3
      }
      SavorUtils.User.favorite(self, res_id, c_type, index, 1);
    }
  },
  /// 按钮触摸开始触发的事件
  touchStartOnVideo: function(e) {
    this.touchStartTimeOnVideo = e.timeStamp;
  },

  /// 按钮触摸结束触发的事件
  touchEndOnVideo: function(e) {
    this.touchEndTimeOnVideo = e.timeStamp;
  },

  /// 单击、双击
  videoMultipleTap: function(e) {
    let self = this;
    // 控制点击事件在350ms内触发，加这层判断是为了防止长按时会触发点击事件
    if (self.touchEndTimeOnVideo - self.touchStartTimeOnVideo < 350) {
      // 当前点击的时间
      let currentTime = e.timeStamp
      let lastTapTimeOnVideo = self.lastTapTimeOnVideo
      // 更新最后一次点击时间
      self.lastTapTimeOnVideo = currentTime

      // 如果两次点击时间在300毫秒内，则认为是双击事件
      if (currentTime - lastTapTimeOnVideo < 300) {
        console.log("double tap")
        // 成功触发双击事件时，取消单击事件的执行
        clearTimeout(self.lastTapTimeoutFunc);
        self.onDoubleClickVideo(e);
      } else {
        // 单击事件延时300毫秒执行，这和最初的浏览器的点击300ms延时有点像。
        self.lastTapTimeoutFunc = setTimeout(function() {
          console.log("tap")
          self.onClickVideo(e);
        }, 300);
      }
    }
  },

  // 跳转到发现页 - 图片
  goToFindPictures: function(e) {
    let self = this;
    // wx.showTabBar({});
    wx.createVideoContext('JohnVideo' + self.data.mediaScrollIndex).pause();
    if (self.data.pictureObjectList.length < 1) {
      SavorUtils.Page.loadPictureData(self);
    } else {
      self.setData({
        pageType: 1
      });
    }
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#ffffff',
      animation: {
        duration: 30,
        timingFunc: 'linear'
      }
    });
    utils.tryCatch(mta.Event.stat('findSwichPic', {
      'openid': self.data.openid
    }));
  },

  // 跳转到发现页 - 视频
  goToFindMedias: function(e) {
    let self = this;
    // wx.hideTabBar({});
    if (self.data.mediaObjectList.length < 1) {
      SavorUtils.Page.loadMediaData(self);
    } else {
      self.setData({
        mediaScrollIndex: 0,
        pageType: 0
      });
    }
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#000000',
      animation: {
        duration: 30,
        timingFunc: 'linear'
      }
    });
    wx.createVideoContext('JohnVideo' + self.data.mediaScrollIndex).play();
    utils.tryCatch(mta.Event.stat('FindPic_PicList_GotoVideoList', {
      'openid': self.data.openid
    }));
  },

  //收藏资源
  onCollect: function(e) {
    let self = this;

    let type = e.currentTarget.dataset.type;
    if (type == 2 || type == 3) {
      var res_id = e.currentTarget.dataset.forscreen_id;
      var c_type = 2;
    } else {
      var res_id = e.currentTarget.dataset.id;
      var c_type = 3
    }

    let index = e.currentTarget.dataset.index;
    SavorUtils.User.favorite(self, res_id, c_type, index, 1);
    //utils.tryCatch(mta.Event.stat('findCollect', { 'openid': self.data.openid }));
  },

  //取消收藏
  cancCollect: function(e) {
    let self = this;
    let type = e.currentTarget.dataset.type;
    if (type == 2 || type == 3) {
      var res_id = e.currentTarget.dataset.forscreen_id;
      var c_type = 2;
    } else {
      var res_id = e.currentTarget.dataset.id;
      var c_type = 3
    }
    let index = e.currentTarget.dataset.index;
    SavorUtils.User.favorite(self, res_id, c_type, index, 0);
  },

  //电视播放
  boxShow(e) {
    let self = this;
    let forscreenId = e.currentTarget.dataset.forscreen_id;
    let indexInList = e.currentTarget.dataset.index;
    if (self.data.box_mac == '') {
      app.scanQrcode(pageid);
    } else {
      SavorUtils.User.launchMedia(self, forscreenId, indexInList);
    }
  }, //电视播放结束

  // 点击进入落地页 - 图片
  onInputPictureDetail: function(e) {
    let self = this;
    let boxMac = e.currentTarget.dataset.box_mac;
    let index = e.currentTarget.dataset.index;
    let pictureObject = self.data.pictureObjectList[index];
    let forscreenId = pictureObject.forscreen_id;
    wx.navigateTo({
      url: '/pages/find/picture?forscreen_id=' + forscreenId + '&box_mac=' + boxMac
    })
  },

  //预览图片
  previewImages: function(e) {
    let self = this;
    let pictures = e.target.dataset.pictures;
    let pictureIndex = e.target.dataset.picture_index;
    let urls = [];
    for (let row in pictures) {
      urls[row] = pictures[row]['res_url'];
    }
    wx.previewImage({
      current: urls[pictureIndex], // 当前显示图片的http链接
      urls: urls, // 需要预览的图片http链接列表
      success: function(res) {
        utils.tryCatch(mta.Event.stat('FindPic_PicList_PreviewImage', {
          'openid': self.data.openid,
          'status': 'success'
        }));
      },
      fail: function(e) {
        utils.tryCatch(mta.Event.stat('FindPic_PicList_PreviewImage', {
          'openid': self.data.openid,
          'status': 'fail'
        }));
      }
    });
  },

  // 加载更多图片
  loadMorePictures: function(e) {
    let self = this;
    SavorUtils.Page.loadPictureData(self);
  },

  // 加载默认头像 - 图片
  loadingPicturesDefaultUserImg: function(e) {
    let self = this;
    let index = e.target.dataset.index;
    let pictureObjectList = self.data.pictureObjectList;
    pictureObjectList[index].avatarUrl = '/images/imgs/default-user.ico';
    self.setData({
      pictureObjectList: pictureObjectList
    });
  },

  // 加载默认图片 - 图片
  loadingPicturesDefaultUserImg: function(e) {
    let self = this;
    let index = e.target.dataset.index;
    let pictureIndex = e.target.dataset.picture_index;
    let pictureObjectList = self.data.pictureObjectList;
    pictureObjectList[index].pubdetail[pictureIndex] = '/images/imgs/default-pic.png';
    self.setData({
      pictureObjectList: pictureObjectList
    });
  },

  // 点击更多按钮 - 图片
  clickPictureMenuMore: function(e) {
    let self = this;
    let forscreenId = e.target.dataset.forscreen_id;
    let index = e.target.dataset.index;
    let pictureObjectList = self.data.pictureObjectList;
    if (!pictureObjectList[index].isOpen) { //打开操作菜单
      utils.tryCatch(mta.Event.stat('findClickOpenMenu', {
        'openid': self.data.openid
      }));
    }
    utils.tryCatch(mta.Event.stat('FindPic_PicList_OptionMore', {
      'openid': self.data.openid,
      'status': !pictureObjectList[index].isOpen ? 'open' : 'close'
    }));
    pictureObjectList[index].isOpen = !(pictureObjectList[index].isOpen);
    if(pictureObjectList[index].isOpen){
      for(let i in pictureObjectList){
        if(i!=index){
          pictureObjectList[i].isOpen = false;
        }
      }
    }
    self.setData({
      pictureObjectList: pictureObjectList
    });

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(options) {
    var that = this;
    if (app.globalData.openid && app.globalData.openid != '') {
      utils.PostRequest(api_v_url + '/index/isHaveCallBox', {
        openid: app.globalData.openid
      }, (data, headers, cookies, errMsg, statusCode) => {
        if (data.result.is_have == 1) {

        } else {
          //app.globalData.link_type = 1;
          that.setData({
            box_mac: '',
          })

        }
        //console.log(data);
      }, re => {}, {
        isShowLoading: false
      });
    } else {
      app.openidCallback = openid => {
        utils.PostRequest(api_v_url + '/index/isHaveCallBox', {
          openid: openid
        }, (data, headers, cookies, errMsg, statusCode) => {
          if (data.result.is_have == 1) {

          } else {
            that.setData({
              box_mac: '',
            })

          }
        }, re => {}, {
          isShowLoading: false
        });
      }
    }
    var user_info = wx.getStorageSync(cache_key + 'user_info');
    utils.tryCatch(mta.Event.stat('showfind', {
      'openid': user_info.openid
    }));
  },

  //点击分享按钮
  onShareAppMessage: function(res) {
    var that = this;
    //utils.tryCatch(mta.Event.stat('findShare', { 'openid': that.data.openid }));
    let index = res.target.dataset.index;

    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    var type = res.target.dataset.type;
    var res_type = res.target.dataset.res_type;
    if (res_type == 1) {
      utils.tryCatch(mta.Event.stat('findSharePic', {
        'openid': that.data.openid
      }));
    } else if (res_type == 2) {
      utils.tryCatch(mta.Event.stat('findShareVideo', {
        'openid': that.data.openid
      }));
    }
    if (type == 1) {
      var res_id = res.target.dataset.id;
      var c_type = 3;
      if (res_type == 1) {
        var share_url = '/pages/share/pic?forscreen_id=' + res_id;
      } else {
        var share_url = '/pages/share/video?res_id=' + res_id + '&type=3';
      }

    } else if (type == 2 || type == 3) {
      var res_id = res.target.dataset.forscreen_id;
      var c_type = 2;
      if (res_type == 1) {
        var share_url = '/pages/share/pic?forscreen_id=' + res_id;
      } else {
        var share_url = '/pages/share/video?res_id=' + res_id + '&type=2';
      }
    }
    // console.log(share_url);
    //var video_url = res.target.dataset.video_url;
    var pubdetail = res.target.dataset.pubdetail;
    var img_url = pubdetail[0].img_url;
    //var res_url = res.target.dataset.res_url;
   
    if (res.from === 'button') {

      // 转发成功
      utils.PostRequest(api_v_url + '/share/recLogs', {
        'openid': openid,
        'res_id': res_id,
        'type': c_type,
        'status': 1,
      }, (data, headers, cookies, errMsg, statusCode) => {
        if (res_type == 1) {
          /*let pictureObjectList = that.data.pictureObjectList;
          pictureObjectList[index].share_num = data.result.share_nums;
          that.setData({
            pictureObjectList: pictureObjectList
          });*/
        } else {
          let mediaObjectList = that.data.mediaObjectList;
          mediaObjectList[index].share_num = data.result.share_nums;
          that.setData({
            mediaObjectList: mediaObjectList
          });
        }
      });
      // 来自页面内转发按钮
      return {
        title: '热点聚焦，投你所好',
        path: share_url,
        imageUrl: img_url,
        success: function(res) {
          // console.log('full_scroll.Page.onShareAppMessage','return', e);
        },
      }
    }

  }, // 分享结束

  // 重试 - 无网
  onReload(e) {
    this.onReady();
  },

  // 跳转到机顶盒视频 - 无网
  gotoBoxVideoPage(e) {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
});