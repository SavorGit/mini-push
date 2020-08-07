// pages/mine/index.js
const utils = require('../../utils/util.js')
var mta = require('../../utils/mta_analysis.js')
const app = getApp();
var openid;
var box_mac;
var page = 1;
var pubdetail;
var publiclist;
var i;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var pageid = 51;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    link_type: app.globalData.link_type, //1:外网投屏  2：直连投屏
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openid: '',
    showModal: false,
    page: 1,
    userinfo: [],
    publiclist: [],
    keys: '',
    hiddens: true,
    showControl: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    var self = this;
    if (self.data.link_type == 2) {
      return;
    }
    box_mac = options.box_mac;
    //获取用户信息以及我的公开
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    self.setData({
      box_mac: box_mac,
      openid: openid,
    })
    wx.request({
      url: api_v_url + '/index/isHaveCallBox?openid=' + openid,
      headers: {
        'Content-Type': 'application/json'
      },
      success: function(res) {
        if (res.data.code == 10000 && res.data.result.is_have == 1) {

          self.setData({
            is_open_simple: res.data.result.is_open_simple,
            hotel_info: res.data.result,
          })
        }
      }
    })
    wx.request({
      url: api_url + '/Smallapp3/User/getMyPublic',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        openid: openid
      },
      success: function(res) {

        publiclist = res.data.result.list;

        self.setData({
          userinfo: res.data.result.user_info,
          publiclist: res.data.result.list,
        })
      }
    })
  },
  //遥控呼大码
  callQrCode: utils.throttle(function(e) {
    var self = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlCallQrcode(openid, box_mac, qrcode_img, '', self);
  }, 3000), //呼大码结束
  //打开遥控器
  openControl: function(e) {
    var self = this;
    var qrcode_url = api_url + '/Smallapp4/index/getBoxQr?box_mac=' + box_mac + '&type=3';
    self.setData({
      showControl: true,
      qrcode_img: qrcode_url
    });
    utils.tryCatch(mta.Event.stat('openControl', {
      'linktype': app.globalData.link_type
    }));
  },
  //关闭遥控
  closeControl: function(e) {
    var self = this;
    self.setData({
      showControl: false,
    })
    utils.tryCatch(mta.Event.stat("closecontrol", {}));
  },
  //遥控退出投屏
  exitForscreen: function(e) {
    var self = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlExitForscreen(openid, box_mac, '', self);
  },
  //遥控调整音量
  changeVolume: function(e) {
    var self = this;
    box_mac = e.currentTarget.dataset.box_mac;
    openid = e.currentTarget.dataset.openid;
    var change_type = e.currentTarget.dataset.change_type;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlChangeVolume(openid, box_mac, change_type, '', self);

  },
  //遥控切换节目
  changeProgram: function(e) {
    var self = this;
    box_mac = e.currentTarget.dataset.box_mac;
    openid = e.currentTarget.dataset.openid;
    var change_type = e.currentTarget.dataset.change_type;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlChangeProgram(openid, box_mac, change_type, '', self);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let self = this;
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
  onShareAppMessage: function(res) {
    var self = this;
    var res_id = res.target.dataset.res_id;
    var res_key = res.target.dataset.res_key;
    var res_type = res.target.dataset.res_type;
    var openid = res.target.dataset.openid;
    var pubdetail = res.target.dataset.pubdetail;
    utils.tryCatch(mta.Event.stat('MinePub_List_Share', {
      'openid': openid
    }));
    if (res_type == 1) {
      var img_url = pubdetail[0]['res_url'];
      var share_url = '/pages/share/pic?forscreen_id=' + res_id;
    } else {
      var img_url = pubdetail[0]['vide_img'];
      var share_url = '/pages/share/video?res_id=' + res_id + '&type=2';
    }

    if (res.from === 'button') {
      // 转发成功
      wx.request({
        url: api_url + '/Smallapp/share/recLogs',
        header: {
          'content-type': 'application/json'
        },
        data: {
          'openid': openid,
          'res_id': res_id,
          'type': 2,
          'status': 1,
        },
        success: function(e) {
          for (var i = 0; i < publiclist.length; i++) {
            if (i == res_key) {
              publiclist[i].share_num++;
            }
          }
          self.setData({
            publiclist: publiclist
          })

        },
        fail: function({
          errMsg
        }) {
          wx.showToast({
            title: '网络异常，请稍后重试',
            icon: 'none',
            duration: 2000
          })
        }
      })
      // 来自页面内转发按钮
      return {
        title: '发现一个好玩的东西',
        path: share_url,
        imageUrl: img_url,
        success: function(res) {

        },
      }
    }
  },


  popDel: function(e) {
    var forscreen_id = e.currentTarget.dataset.forscreen_id;
    var keys = e.currentTarget.dataset.keys;
    var publiclist = e.currentTarget.dataset.publiclist;
    this.setData({
      showModal: true,
      forscreen_id: forscreen_id,
      publiclist: publiclist,
      keys: keys
    });
  },
  modalConfirm: function(e) {
    var self = this;
    var forscreen_id = e.currentTarget.dataset.forscreen_id;
    var keys = e.currentTarget.dataset.keys;
    var publiclist = e.currentTarget.dataset.publiclist;
    utils.tryCatch(mta.Event.stat('MinePub_List_Del', {
      'openid': self.data.openid,
      'status': true
    }));
    wx.request({
      url: api_url + '/Smallapp/User/delMyPublic',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        openid: openid,
        forscreen_id: forscreen_id
      },
      success: function(res) {

        self.setData({
          showModal: false,
        })
        for (var i = 0; i < publiclist.length; i++) {
          if (keys == i) {
            publiclist.splice(keys, 1);
          }
        }
        self.setData({
          publiclist: publiclist,
        })
      }
    })
  },
  onClickItem: function(e) {
    var self = this;
    utils.tryCatch(mta.Event.stat('MinePub_List_ClickItem', {
      'openid': self.data.openid
    }));
  },
  previewImage: function(e) {
    var current = e.target.dataset.src;
    var pkey = e.target.dataset.pkey;
    var urls = [];
    for (var row in current) {
      urls[row] = current[row]['res_url']

    }
    wx.previewImage({
      current: urls[pkey], // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
  modalCancel: function(e) {
    var self = this;
    utils.tryCatch(mta.Event.stat('MinePub_List_Del', {
      'openid': self.data.openid,
      'status': true
    }));
    this.setData({
      showModal: false,
    });
  },
  //上拉刷新
  loadMore: function(e) {
    var self = this;

    page = page + 1;
    self.setData({
      hiddens: false,
    })
    wx.request({
      url: api_url + '/smallapp3/user/getMyPublic',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        page: page,
        openid: openid,
      },
      method: "POST",
      success: function(res) {
        if (res.data.code == 10000) {
          publiclist = res.data.result.list;
          self.setData({
            userinfo: res.data.result.user_info,
            publiclist: res.data.result.list,
            hiddens: true,
          })

        } else {
          self.setData({
            hiddens: true,
          })
        }
      }
    })
  },
  //电视播放
  boxShow(e) {
    var that  = this;
    var box_mac = e.target.dataset.boxmac;
    var find_id = e.target.dataset.forscreen_id
    pubdetail = e.currentTarget.dataset.pubdetail;
    var res_type = e.currentTarget.dataset.res_type;
    var res_nums = e.currentTarget.dataset.res_nums;
    if (res_type == 1) {
      var action = 11; //发现图片点播
    } else if (res_type == 2) {
      var action = 12; //发现视频点播
    }
    var hotel_info = that.data.hotel_info
    app.boxShow(box_mac, find_id, pubdetail, res_type, res_nums, action, hotel_info, that);
    
    
    
  }, //电视播放结束
  //收藏资源
  onCollect: function(e) {
    var self = this;
    var openid = e.currentTarget.dataset.openid;
    var res_id = e.currentTarget.dataset.res_id;
    var res_key = e.currentTarget.dataset.res_key;
    utils.tryCatch(mta.Event.stat('MinePub_List_Favorite', {
      'openid': openid,
      'status': true
    }));
    wx.request({
      url: api_url + '/Smallapp/collect/recLogs',
      header: {
        'content-type': 'application/json'
      },
      data: {
        'openid': openid,
        'res_id': res_id,
        'type': 2,
        'status': 1,
      },
      success: function(e) {
        var collect_nums = e.data.result.nums;
        for (var i = 0; i < publiclist.length; i++) {
          if (i == res_key) {
            publiclist[i].is_collect = 1;
            publiclist[i].collect_num = collect_nums;
          }
        }
        self.setData({
          publiclist: publiclist
        })
        /*if (e.data.code == 10000) {
          wx.showToast({
            title: '收藏成功',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '收藏失败，请稍后重试',
            icon: 'none',
            duration: 2000
          })
        }*/
      },
      fial: function({
        errMsg
      }) {
        wx.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }, //收藏资源结束
  //取消收藏
  cancCollect: function(e) {
    var self = this;
    var res_id = e.currentTarget.dataset.res_id;
    var res_key = e.currentTarget.dataset.res_key;
    var openid = e.currentTarget.dataset.openid;
    utils.tryCatch(mta.Event.stat('MinePub_List_Favorite', {
      'openid': openid,
      'status': false
    }));
    wx.request({
      url: api_url + '/Smallapp/collect/recLogs',
      header: {
        'content-type': 'application/json'
      },
      data: {
        'openid': openid,
        'res_id': res_id,
        'type': 2,
        'status': 0,
      },
      success: function(e) {
        var collect_nums = e.data.result.nums;
        for (var i = 0; i < publiclist.length; i++) {
          if (i == res_key) {
            publiclist[i].is_collect = 0;
            publiclist[i].collect_num = collect_nums;
          }
        }
        self.setData({
          publiclist: publiclist
        })
        /*if (e.data.code == 10000) {
          wx.showToast({
            title: '取消收藏成功',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '取消收藏失败，请稍后重试',
            icon: 'none',
            duration: 2000
          })
        }*/
      },
      fial: function({
        errMsg
      }) {
        wx.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }, //取消收藏结束
  goToBack: function(e) {
    app.goToBack();
  }
})