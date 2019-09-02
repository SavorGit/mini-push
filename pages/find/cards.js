// pages/find/cards.js
var app = getApp();
var util = require("../../utils/util.js")
var api_url = app.globalData.api_url;
var page_num = 1;
var openid;
var box_mac;
var touchEvent = [];
var touchMoveExecuteTrip = 150;
var systemInfo = {
  SDKVersion: "",
  batteryLevel: 0,
  brand: "",
  errMsg: "",
  fontSizeSetting: 16,
  language: "zh",
  model: "",
  pixelRatio: 1,
  platform: "",
  statusBarHeight: 0,
  system: "",
  version: "",
  safeArea: {
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  window: {
    width: 0,
    height: 0
  },
  screen: {
    width: 0,
    height: 0
  }
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: app.globalData.statusBarHeight,
    cards_img: [


    ],
    cards: [{
      x: 0,
      y: 0
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var self = this;
    wx.getSystemInfo({
      success: function(res) {
        // console.log(res, app);
        systemInfo.SDKVersion = res.SDKVersion;
        systemInfo.batteryLevel = res.batteryLevel;
        systemInfo.brand = res.brand;
        systemInfo.errMsg = res.errMsg;
        systemInfo.fontSizeSetting = res.fontSizeSetting;
        systemInfo.language = res.language;
        systemInfo.model = res.model;
        systemInfo.pixelRatio = res.pixelRatio;
        systemInfo.platform = res.platform;
        systemInfo.statusBarHeight = res.statusBarHeight;
        systemInfo.system = res.system;
        systemInfo.version = res.version;
        systemInfo.safeArea.width = res.safeArea.width;
        systemInfo.safeArea.height = res.safeArea.height;
        systemInfo.safeArea.top = res.safeArea.top;
        systemInfo.safeArea.left = res.safeArea.left;
        systemInfo.safeArea.right = res.safeArea.right;
        systemInfo.safeArea.bottom = res.safeArea.bottom;
        systemInfo.window.width = res.windowWidth;
        systemInfo.window.height = res.windowHeight;
        systemInfo.screen.width = res.screenWidth;
        systemInfo.screen.height = res.screenHeight;
        // console.log(systemInfo);

        self.setData({
          cards: [{
            x: 0,
            y: systemInfo.statusBarHeight + 46
          }]
        });
      }
    });

    //获取发现页面数据 
    if (app.globalData.openid && app.globalData.openid != '') {
      self.setData({
        openid: app.globalData.openid
      })
      openid = app.globalData.openid;
      //判断用户是否注册
      isregister(app.globalData.openid);
      ishavecallbox(app.globalData.openid);
      getJxcontents(app.globalData.openid);
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          self.setData({
            openid: openid
          })
          openid = openid;
          isregister(openid);
          ishavecallbox(openid);
          getJxcontents(openid);
        }
      }
    }



    function isregister(openid) {
      wx.request({
        url: api_url + '/smallapp21/User/isRegister',
        data: {
          "openid": openid,
          "page_id": 2
        },
        header: {
          'content-type': 'application/json'
        },
        success: function(res) {
          wx.setStorage({
            key: 'savor_user_info',
            data: res.data.result.userinfo,
          })
        },
        fail: function(e) {
          wx.setStorage({
            key: 'savor_user_info',
            data: {
              'openid': openid
            },
          })
        }
      }); //判断用户是否注册结束
    }

    function ishavecallbox(openid) {
      wx.request({
        url: api_url + '/Smallapp/index/isHaveCallBox?openid=' + openid,
        headers: {
          'Content-Type': 'application/json'
        },

        success: function(rest) {
          var is_have = rest.data.result.is_have;
          if (is_have == 1) {

            self.setData({
              is_link: 1,
              hotel_name: rest.data.result.hotel_name,
              room_name: rest.data.result.room_name,
              box_mac: rest.data.result.box_mac,
              is_open_simple: rest.data.result.is_open_simple,
            })
            box_mac = rest.data.result.box_mac;

          } else {
            self.setData({
              is_link: 0,
              box_mac: '',
            })
            box_mac = '';
          }
        }
      })
    }

    function getJxcontents(openid) {
      wx.request({
        url: api_url + '/Smallapp3/Find/findlist',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          openid: openid,
          page: 1,
        },
        success: function(res) {
          if (res.data.code == 10000) {
            self.setData({
              cards_img: res.data.result
            })
          }

        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(options) {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  /**
   * 点击事件
   */
  onClick: function(e) {
    var res_type = e.currentTarget.dataset.res_type;
    if (res_type == 1) { //图片
      var current = e.currentTarget.dataset.src;

      var urls = [];
      for (var row in current) {
        urls[row] = current[row]['res_url']

      }
      wx.previewImage({
        current: urls[0], // 当前显示图片的http链接
        urls: urls // 需要预览的图片http链接列表
      })
    } else { //视频

    }
  },
  /**
   * 手指触摸动作结束
   */
  onTouchEnd: function(e) {
    var self = this;
    touchEvent["touchEnd"] = touchEvent.pop();
    this.touchMoveHandler.touchMoveHandle(self, touchEvent["touchStart"], touchEvent["touchEnd"], function(handleEvent, page, startEvent, endEvent, top, left, x) {
      if (handleEvent == self.touchMoveHandler.Event.Less3Item) {
        page_num++;
        wx.request({
          url: api_url + '/Smallapp3/Find/findlist',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            openid: openid,
            page: page_num,
          },
          success: function(res) {
            if (res.data.code == 10000) {
              var list_info = res.data.result;
              for(var k=0;k<list_info.length;k++){
                self.data.cards_img.push(list_info[k]);
              }
              //self.data.cards_img.push(res.data.result);
              
            }
          }
        })
      }
      //console.log(handleEvent, page, startEvent, endEvent, top, left, x);
    });
  },
  /**
   * 手指触摸后移动
   */
  onTouchMove: function(e) {
    var self = this;
    touchEvent[0] = e;
    if (typeof(touchEvent["touchStart"]) != 'object' || touchEvent["touchStart"] == null) {
      touchEvent["touchStart"] = e;
      return;
    }
    if (typeof(touchEvent["touchLastMove"]) != 'object' || touchEvent["touchLastMove"] == null) {
      touchEvent["touchLastMove"] = e;
      return;
    }
    self.setData({
      cards: [{
        x: e.touches[0].pageX - touchEvent["touchStart"].touches[0].pageX,
        y: e.touches[0].pageY - touchEvent["touchStart"].touches[0].pageY + systemInfo.statusBarHeight + 46
      }]
    });
  },
  touchMoveHandler: {
    Event: {
      Start: 0x00,
      Less3Item: 0x01,
      UndifindedStartTouchEvent: 0x90,
      UndifindedEndTouchEvent: 0x99,
      LeftSlide: 0x10,
      LeftSlideMoved: 0x19,
      RightSlide: 0x20,
      RightSlideMoved: 0x29,
      ReturnToOrigin: 0x80,
      ReturnToOriginMoved: 0x89
    },
    /**
     * 滑动处理
     *
     * @para page                页面对象
     * @para startEvent          开始滑动的事件
     * @para endEvent            结束滑动的事件
     * @para callbackFunction    执行动画完成后回调函数。返回 Argument{
     *                                                           handleEvent // 处理事件
     *                                                           page // 页面对象
     *                                                           startEvent // 手指滑动开始事件
     *                                                           endEvent // 手指滑动结束事件
     *                                                           top // 元素上边距
     *                                                           left // 元素左边距
     *                                                           x // 元素移动距离
     *                                                      }
     */
    touchMoveHandle: function(page, startEvent, endEvent, callbackFunction) {
      // console.log(page, startEvent, endEvent);
      var handler = this;
      handler.callbackHandel(callbackFunction, handler.Event.Start, page, startEvent, endEvent);
      if (typeof(startEvent) != 'object' || startEvent == null) {
        handler.callbackHandel(callbackFunction, handler.Event.UndifindedStartTouchEvent, page, startEvent, endEvent);
        console.error('start-touch-event is null');
        return;
      }
      if (typeof(endEvent) != 'object' || endEvent == null) {
        handler.callbackHandel(callbackFunction, handler.Event.UndifindedEndTouchEvent, page, startEvent, endEvent);
        console.error('end-touch-event is null');
        return;
      }
      var moveExecuteTrip = touchMoveExecuteTrip / systemInfo.pixelRatio;
      var tripLeft = endEvent.touches[0].pageX - startEvent.touches[0].pageX;
      var tripTop = endEvent.touches[0].pageY - startEvent.touches[0].pageY + systemInfo.statusBarHeight + 46;
      var tripX = endEvent.touches[0].pageX - startEvent.touches[0].pageX;
      var tripY = endEvent.touches[0].pageY - startEvent.touches[0].pageY;
      if (tripX <= -1 * moveExecuteTrip) { // 向左滑动处理
        var x = (systemInfo.screen.width + tripLeft) * -1;
        handler.callbackHandel(callbackFunction, handler.Event.LeftSlide, page, startEvent, endEvent, tripTop, tripLeft, x);
        this.moveOnhorizontalHandel(page, startEvent, endEvent, tripTop, tripLeft, x);
        handler.callbackHandel(callbackFunction, handler.Event.LeftSlideMoved, page, startEvent, endEvent, tripTop, tripLeft, x);
      } else if (tripX >= moveExecuteTrip) { // 向右滑动处理
        var x = systemInfo.screen.width - tripLeft;
        handler.callbackHandel(callbackFunction, handler.Event.RightSlide, page, startEvent, endEvent, tripTop, tripLeft, x);
        this.moveOnhorizontalHandel(page, startEvent, endEvent, tripTop, tripLeft, x);
        handler.callbackHandel(callbackFunction, handler.Event.RightSlideMoved, page, startEvent, endEvent, tripTop, tripLeft, x);
      } else {
        handler.callbackHandel(callbackFunction, handler.Event.ReturnToOrigin, page, startEvent, endEvent, tripTop, tripLeft);
        this.returnToOriginHandel(page, startEvent, endEvent);
        handler.callbackHandel(callbackFunction, handler.Event.ReturnToOriginMoved, page, startEvent, endEvent, tripTop, tripLeft);
      }
      var cards_img = page.data.cards_img;
      cards_img.splice(0, 1);
      page.setData({
        cards_img: cards_img
      });
      if (cards_img.length < 3) {
        handler.callbackHandel(callbackFunction, handler.Event.Less3Item, page, startEvent, endEvent, tripTop, tripLeft);
      }
    },
    /**
     * 返回原点处理
     *
     * @para page                页面对象
     * @para startEvent          开始滑动的事件
     * @para endEvent            结束滑动的事件
     */
    returnToOriginHandel: function(page, startEvent, endEvent) {
      var animation = wx.createAnimation({
        // duration: 100,
        // timingFunction: 'cubic-bezier(.8,.2,.1,0.8)'
      });
      animation.left(0).top(systemInfo.statusBarHeight + 46).step({
        duration: 100,
        timingFunction: 'ease'
      });
      page.setData({
        animationData: animation.export()
      });
      setTimeout(function() {
        page.setData({
          animationData: {},
          cards: [{
            x: 0,
            y: systemInfo.statusBarHeight + 46
          }]
        });
      }, 100);
    },
    /**
     * 水平移动处理
     *
     * @para page                页面对象
     * @para startEvent          开始滑动的事件
     * @para endEvent            结束滑动的事件
     * @para top                 上边距
     * @para left                左边距
     * @para x                   水平滑动行程
     */
    moveOnhorizontalHandel: function(page, startEvent, endEvent, top, left, x) {
      var animation = wx.createAnimation({
        // duration: 100,
        // timingFunction: 'cubic-bezier(.8,.2,.1,0.8)'
      });
      animation.left(left).top(top).translateX(x).translateY(0).step({
        duration: 300,
        timingFunction: 'linear'
      });
      animation.left(0).top(systemInfo.statusBarHeight + 46).translateX(0).translateY(0).step({
        duration: 0,
        timingFunction: 'step-start'
      });
      page.setData({
        animationData: animation.export()
      });
      setTimeout(function() {
        page.setData({
          animationData: {}
        });
      }, 300);
    },
    /**
     * 回调处理
     *
     * @para callback            执行动画完成后回调函数
     * @para handleEvent         处理事件
     * @para page                页面对象
     * @para startEvent          开始滑动的事件
     * @para endEvent            结束滑动的事件
     * @para top                 上边距
     * @para left                左边距
     * @para x                   水平滑动行程
     */
    callbackHandel: function(callback, handleEvent, page, startEvent, endEvent, top, left, x) {
      if (typeof(callback) != 'function') {
        return;
      }
      callback(handleEvent, page, startEvent, endEvent, top, left, x);
    },
    //电视播放
    boxShow: function(e) {
      var forscreen_id = e.currentTarget.dataset.forscreen_id;

      var pubdetail = e.currentTarget.dataset.pubdetail;
      var res_type = e.currentTarget.dataset.res_type;
      var res_nums = e.currentTarget.dataset.res_nums;
      app.boxShow(box_mac, forscreen_id, pubdetail, res_type, res_nums);
    },
  }
})