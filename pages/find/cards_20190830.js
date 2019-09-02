// pages/find/cards_20190830.js
var app = getApp();
var util = require("../../utils/util.js")

var touchEvent = [];
var cards = [{
  x: 0,
  y: 0
}];
var touchMoveExecuteTrip = 187;
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
      'http://oss.littlehotspot.com/forscreen/resource/1544865904825.jpg',
      'http://oss.littlehotspot.com/forscreen/resource/1547690338762.jpg',
      'http://oss.littlehotspot.com/forscreen/resource/1550142746462.mp4?x-oss-process=video/snapshot,t_3000,f_jpg,w_450,m_fast'
    ]
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

        cards[0].x = 0;
        cards[0].y = systemInfo.statusBarHeight + 46;
      }
    });
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

  },
  /**
   * 手指触摸动作开始
   */
  onTouchStart: function(e) {
    touchEvent["touchStart"] = e;
  },
  /**
   * 手指触摸动作结束
   */
  onTouchEnd: function(e) {
    // console.log(touchEvent);
    touchEvent["touchEnd"] = touchEvent.pop();
    // console.log(touchEvent);
    this.touchMoveHandle();
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
    // if (e.timeStamp - touchEvent["touchLastMove"].timeStamp <= 100) {
    //   return;
    // }
    var tripX = e.touches[0].pageX - touchEvent["touchStart"].touches[0].pageX;
    var tripY = e.touches[0].pageY - touchEvent["touchStart"].touches[0].pageY + systemInfo.statusBarHeight + 46;
    var animation = wx.createAnimation({
      duration: 10,
      // timingFunction: 'cubic-bezier(.8,.2,.1,0.8)',
      timingFunction: 'linear'
    });
    animation.left(tripX).top(tripY).step({
      duration: 10,
      timingFunction: 'linear'
    });
    this.setData({
      animationData: animation.export()
    });
    setTimeout(function() {
      self.setData({
        animationData: {}
      });
    }, 10);
  },
  /**
   * 滑动处理
   */
  touchMoveHandle: function() {
    var self = this;
    if (typeof(touchEvent["touchStart"]) != 'object' || touchEvent["touchStart"] == null) {
      return;
    }
    if (typeof(touchEvent["touchEnd"]) != 'object' || touchEvent["touchEnd"] == null) {
      return;
    }
    var moveExecuteTrip = touchMoveExecuteTrip / systemInfo.pixelRatio;
    var tripX = touchEvent["touchEnd"].touches[0].pageX - touchEvent["touchStart"].touches[0].pageX;
    var tripY = touchEvent["touchEnd"].touches[0].pageY - touchEvent["touchStart"].touches[0].pageY;
    if (tripX <= -1 * moveExecuteTrip) {
      this.toLeftHandle(touchEvent["touchStart"], touchEvent["touchEnd"]);
    } else if (tripX >= moveExecuteTrip) {
      this.toRightHandle(touchEvent["touchStart"], touchEvent["touchEnd"]);
    } else {
      this.returnToOriginHandel(touchEvent["touchStart"], touchEvent["touchEnd"]);
    }
  },
  /**
   * 向左滑动处理
   */
  toLeftHandle: function(startEvent, endEvent) {
    var self = this;
    var tripLeft = touchEvent["touchEnd"].touches[0].pageX - touchEvent["touchStart"].touches[0].pageX;
    var tripTop = touchEvent["touchEnd"].touches[0].pageY - touchEvent["touchStart"].touches[0].pageY + systemInfo.statusBarHeight + 46;
    var animation = wx.createAnimation({
      // duration: 100,
      // timingFunction: 'cubic-bezier(.8,.2,.1,0.8)',
      // timingFunction: 'ease-in'
    });
    animation.left(tripLeft).top(tripTop).translateX(-420).translateY(0).step({
      duration: 300,
      timingFunction: 'ease-in'
    });
    animation.left(0).top(systemInfo.statusBarHeight + 46).translateX(0).translateY(0).step({
      duration: 10,
      timingFunction: 'step-start'
    });
    this.setData({
      animationData: animation.export()
    });
    setTimeout(function() {
      self.setData({
        animationData: {}
      });
    }, 310);
  },
  /**
   * 向右滑动处理
   */
  toRightHandle: function(startEvent, endEvent) {
    var self = this;
    var tripLeft = touchEvent["touchEnd"].touches[0].pageX - touchEvent["touchStart"].touches[0].pageX;
    var tripTop = touchEvent["touchEnd"].touches[0].pageY - touchEvent["touchStart"].touches[0].pageY + systemInfo.statusBarHeight + 46;
    var animation = wx.createAnimation({
      // duration: 100,
      // timingFunction: 'cubic-bezier(.8,.2,.1,0.8)',
      // timingFunction: 'ease-in'
    });
    animation.left(tripLeft).top(tripTop).translateX(420).translateY(0).step({
      duration: 300,
      timingFunction: 'ease-in'
    });
    animation.left(0).top(systemInfo.statusBarHeight + 46).translateX(0).translateY(0).step({
      duration: 10,
      timingFunction: 'step-start'
    });
    this.setData({
      animationData: animation.export()
    });
    setTimeout(function() {
      self.setData({
        animationData: {}
      });
    }, 310);
  },
  /**
   * 返回原点处理
   */
  returnToOriginHandel: function(startEvent, endEvent) {
    var self = this;
    var animation = wx.createAnimation({
      // duration: 100,
      // timingFunction: 'cubic-bezier(.8,.2,.1,0.8)',
      // timingFunction: 'ease-in'
    });
    animation.left(0).top(systemInfo.statusBarHeight + 46).step({
      duration: 100,
      timingFunction: 'ease'
    });
    this.setData({
      animationData: animation.export()
    });
    setTimeout(function() {
      self.setData({
        animationData: {}
      });
    }, 100);
    cards[0].x = 0;
    cards[0].y = systemInfo.statusBarHeight + 46;
  },


  // 男神女神推荐
  // shenfen_click: function(e) {
  //   var shen_click_val = e.currentTarget.dataset.id
  //   console.log(shen_click_val)
  //   this.setData({
  //     shenfen: shen_click_val
  //   })
  // },
  show_data: function() {
    var self = this
    var data = {
      program_id: app.program_id,
      openid: app.openid,
    }
    if (this.data.danshen) {
      util.request('', 'get', data, '正在加载数据', function(res) {
        self.setData({
          danshen_data: res.data,
          img_length: res.data.length
        })
      })
    } else {
      util.request('', 'get', data, '正在加载数据', function(res) {
        console.log(res.data)
        self.setData({
          meipo_data: res.data,
          nanshen_card: res.data.k3,
          nvshen_card: res.data.k4
        })
      })
    }

  },
  //单身事件处理函数
  slidethis: function(e) {
    var self = this;
    var img_list = this.data.img_list;
    var img_1 = this.data.img_list[0];
    img_list.splice(0, 1)
    img_list.push(img_1)
    this.setData({
      img_list: img_list
    })
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'cubic-bezier(.8,.2,.1,0.8)',
    });
    this.animation = animation;
    this.animation.translateY(-420).rotate(-5).translateX(0).step();
    this.animation.translateY(0).translateX(0).rotate(0).step();
    this.setData({
      animationData: this.animation.export()
    });
    setTimeout(function() {
      self.setData({
        animationData: {}
      });
    }, 350);
    this.show_data()
  }
})