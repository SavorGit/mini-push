// pages/find/video.js
const app = getApp();
const utils = require('../../utils/util.js')
var mta = require('../../utils/mta_analysis.js')
var pubdetail;
var box_mac;
var openid;
var api_url = app.globalData.api_url;
var api_url = app.globalData.api_v_url;
var pageid = 22;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    pageFrom: null, // 来源页面地址
    link_type: app.globalData.link_type, //1:外网投屏  2：直连投屏
    is_replay_disabel: false,
    showControl: false,
    is_box_show: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var self = this;
    let pages = getCurrentPages(); //当前页面栈
    if (pages.length > 1) {
      self.setData({
        pageFrom: pages[1].route
      });
    } else {
      self.setData({
        pageFrom: ''
      });
    }

    // console.log('onLoad', 'self.data.link_type', self.data.link_type);
    if (self.data.link_type == 2) {
      return;
    }

    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    box_mac = options.box_mac;

    //wx.hideShareMenu();
    var forscreen_id = options.forscreen_id;
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
      url: api_url + '/Smallapp3/Find/showPic',
      data: {
        forscreen_id: forscreen_id,
        openid: openid,

      },
      success: function(res) {
        self.setData({
          videoinfo: res.data.result,
          play_num: res.data.result.play_num,
          collect_num: res.data.result.collect_num,
          share_num: res.data.result.share_num,
          is_collect: res.data.result.is_collect,
          openid: openid,
          box_mac: box_mac,
        })
      }
    })
  },
  //收藏资源
  onCollect: function(e) {
    var self = this;
    var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;

    var res_type = e.target.dataset.type;
    utils.tryCatch(mta.Event.stat('FindVideo_VideoDetail_Favorite', {
      'openid': openid,
      'from': self.data.pageFrom,
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
        'type': res_type,
        'status': 1,
      },
      success: function(e) {
        self.setData({
          is_collect: 1,
          collect_num: e.data.result.nums,
        })
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
    var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;

    var res_type = e.target.dataset.type;
    utils.tryCatch(mta.Event.stat('FindVideo_VideoDetail_Favorite', {
      'openid': openid,
      'from': self.data.pageFrom,
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
        'type': res_type,
        'status': 0,
      },
      success: function(e) {


        self.setData({
          is_collect: 0,
          collect_num: e.data.result.nums,
        })

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
  //点击分享按钮
  onShareAppMessage: function(res) {
    var self = this;
    var openid = res.target.dataset.openid;
    var res_id = res.target.dataset.res_id;

    var res_type = res.target.dataset.type;
    var pubdetail = res.target.dataset.pubdetail;
    var img_url = pubdetail[0]['vide_img'];

    var share_num = res.target.dataset.share_num;

    utils.tryCatch(mta.Event.stat('FindVideo_VideoDetail_Share', {
      'openid': openid,
      'from': self.data.pageFrom
    }));
    if (res.from === 'button') {
      // 转发成功
      share_num = share_num++;
      wx.request({
        url: api_url + '/Smallapp3/share/recLogs',
        header: {
          'content-type': 'application/json'
        },
        data: {
          'openid': openid,
          'res_id': res_id,
          'type': res_type,
          'status': 1,
        },
        success: function(e) {
          if (e.data.code == 10000) {
            self.setData({
              share_num: e.data.result.share_nums,
            })
          }


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
      //var share_url = '/pages/share/pic?forscreen_id=' + res_id;
      // 来自页面内转发按钮
      return {
        title: '发现一个好玩的东西',
        path: '/pages/share/pic?res_id=' + res_id + '&type=2',
        imageUrl: img_url,
        success: function(res) {

        }
      }
    }
  }, // 分享结束

  onVideoPlay: function(e) {
    var self = this;
    utils.tryCatch(mta.Event.stat('FindVideo_VideoDetail_Play', {
      'openid': openid,
      'from': self.data.pageFrom
    }));
  },

  //电视播放
  boxShow(e) {
    var self = this;
    var box_mac = e.target.dataset.boxmac;
    var find_id = e.target.dataset.forscreen_id

    utils.tryCatch(mta.Event.stat('FindVideo_VideoDetail_LaunchTV', {
      'openid': openid,
      'from': self.data.pageFrom,
      'boxmac': box_mac
    }));
    if (box_mac == '') {
      app.scanQrcode(pageid);
    } else {
      var user_info = wx.getStorageSync("savor_user_info");
      //console.log(user_info);
      var avatarUrl = user_info.avatarUrl;
      var nickName = user_info.nickName;
      var openid = e.currentTarget.dataset.openid;
      pubdetail = e.currentTarget.dataset.pubdetail;
      var forscreen_char = '';
      var res_type = e.currentTarget.dataset.res_type;
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      if (res_type == 1) {
        var action = 11; //发现图片点播
      } else if (res_type == 2) {
        var action = 12; //发现视频点播
      }
      var res_len = e.currentTarget.dataset.res_nums;
      var forscreen_id = (new Date()).valueOf();

      wx.request({
        url: api_url + '/smallapp21/User/isForscreenIng',
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        data: {
          box_mac: box_mac
        },
        success: function(res) {
          var is_forscreen = res.data.result.is_forscreen;
          if (is_forscreen == 1) {
            wx.showModal({
              title: '确认要打断投屏',
              content: '当前电视正在进行投屏,继续投屏有可能打断当前投屏中的内容.',
              success: function(res) {
                if (res.confirm) {

                  var djs = 10;
                  self.setData({
                    is_replay_disabel: true
                  })

                  self.setData({
                    djs: djs
                  })
                  var timer8_0 = setInterval(function() {
                    djs -= 1;
                    self.setData({
                      djs: djs
                    });
                    if (djs == 0) {
                      self.setData({
                        is_replay_disabel: false,
                      })
                      clearInterval(timer8_0);
                    }

                  }, 1000);
                  if (res_type == 1) {
                    for (var i = 0; i < res_len; i++) {
                      var order = i + 1;
                      wx.request({ //start
                        url: api_url + '/Smallapp/index/recordForScreenPics',
                        header: {
                          'content-type': 'application/json'
                        },
                        data: {
                          forscreen_id: forscreen_id,
                          openid: openid,
                          box_mac: box_mac,
                          action: action,
                          mobile_brand: mobile_brand,
                          mobile_model: mobile_model,
                          forscreen_char: forscreen_char,
                          imgs: '["' + pubdetail[i]['forscreen_url'] + '"]',
                          resource_id: pubdetail[i]['res_id'],
                          res_sup_time: 0,
                          res_eup_time: 0,
                          resource_size: pubdetail[i]['resource_size'],
                          is_pub_hotelinfo: 0,
                          is_share: 0
                        },
                        success: function(ret) {}



                      }); //end
                      var url = pubdetail[i]['forscreen_url'];
                      var filename = pubdetail[i]['filename'];
                      var res_id = pubdetail[i]['res_id'];

                      wx.request({
                        url: api_url + '/Netty/Index/pushnetty',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        method: "POST",
                        data: {
                          box_mac: box_mac,
                          msg: '{ "action": 4, "resource_type":2, "url":"' + url + '","filename":"' + filename + '","openid":"' + openid + '","img_nums":' + res_len + ',"forscreen_char":"' + forscreen_char + '","order":' + order + ',"forscreen_id":"' + forscreen_id + '","img_id":"' + res_id + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '"}',
                        },
                        success: function(result) {

                          wx.showToast({
                            title: '点播成功,电视即将开始播放',
                            icon: 'none',
                            duration: 5000
                          });
                        },
                        fail: function(res) {
                          wx.showToast({
                            title: '网络异常,点播失败',
                            icon: 'none',
                            duration: 2000
                          })
                        }
                      })

                    }

                  } else { //视频投屏
                    self.setData({
                      is_box_show: true,
                    })
                    for (var i = 0; i < res_len; i++) {
                      wx.request({
                        url: api_url + '/Smallapp/index/recordForScreenPics',
                        header: {
                          'content-type': 'application/json'
                        },
                        data: {
                          openid: openid,
                          box_mac: box_mac,
                          action: 12,

                          mobile_brand: mobile_brand,
                          mobile_model: mobile_model,
                          forscreen_char: forscreen_char,
                          imgs: '["' + pubdetail[i]['forscreen_url'] + '"]',
                          resource_id: pubdetail[i]['res_id'],
                          res_sup_time: 0,
                          res_eup_time: 0,
                          resource_size: pubdetail[i]['resource_size'],
                          is_pub_hotelinfo: 0,
                          is_share: 0,
                          forscreen_id: forscreen_id,
                          duration: pubdetail[i]['duration'],
                        },
                        success: function(ret) {

                        }
                      });

                      wx.request({
                        url: api_url + '/Netty/Index/pushnetty',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        method: "POST",
                        data: {
                          box_mac: box_mac,
                          msg: '{ "action":2, "url": "' + pubdetail[i]['forscreen_url'] + '", "filename":"' + pubdetail[i]['filename'] + '","openid":"' + openid + '","resource_type":2,"video_id":"' + pubdetail[i]['res_id'] + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '","forscreen_id":"' + forscreen_id + '"}',
                        },
                        success: function(result) {

                          wx.showToast({
                            title: '点播成功,电视即将开始播放',
                            icon: 'none',
                            duration: 2000
                          });
                        },
                        fail: function(res) {
                          wx.showToast({
                            title: '网络异常,点播失败',
                            icon: 'none',
                            duration: 2000
                          })
                        }
                      });
                    }
                  }
                  wx.request({
                    url: api_url + '/Smallapp21/CollectCount/recCount',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    data: {
                      res_id: find_id
                    },

                  })
                } else {

                }
              }
            })
          } else {
            var djs = 10;
            self.setData({
              is_replay_disabel: true
            })

            self.setData({
              djs: djs
            })
            var timer8_0 = setInterval(function() {
              djs -= 1;
              self.setData({
                djs: djs
              });
              if (djs == 0) {
                self.setData({
                  is_replay_disabel: false,
                })
                clearInterval(timer8_0);
              }

            }, 1000);
            if (res_type == 1) {
              for (var i = 0; i < res_len; i++) {
                var order = i + 1;
                wx.request({ //start
                  url: api_url + '/Smallapp/index/recordForScreenPics',
                  header: {
                    'content-type': 'application/json'
                  },
                  data: {
                    forscreen_id: forscreen_id,
                    openid: openid,
                    box_mac: box_mac,
                    action: action,
                    mobile_brand: mobile_brand,
                    mobile_model: mobile_model,
                    forscreen_char: forscreen_char,
                    imgs: '["' + pubdetail[i]['forscreen_url'] + '"]',
                    resource_id: pubdetail[i]['res_id'],
                    res_sup_time: 0,
                    res_eup_time: 0,
                    resource_size: pubdetail[i]['resource_size'],
                    is_pub_hotelinfo: 0,
                    is_share: 0
                  },
                  success: function(ret) {}



                }); //end
                var url = pubdetail[i]['forscreen_url'];
                var filename = pubdetail[i]['filename'];
                var res_id = pubdetail[i]['res_id'];

                wx.request({
                  url: api_url + '/Netty/Index/pushnetty',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  method: "POST",
                  data: {
                    box_mac: box_mac,
                    msg: '{ "action": 4, "resource_type":2, "url":"' + url + '","filename":"' + filename + '","openid":"' + openid + '","img_nums":' + res_len + ',"forscreen_char":"' + forscreen_char + '","order":' + order + ',"forscreen_id":"' + forscreen_id + '","img_id":"' + res_id + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '"}',
                  },
                  success: function(result) {

                    wx.showToast({
                      title: '点播成功,电视即将开始播放',
                      icon: 'none',
                      duration: 5000
                    });
                  },
                  fail: function(res) {
                    wx.showToast({
                      title: '网络异常,点播失败',
                      icon: 'none',
                      duration: 2000
                    })
                  }
                })

              }

            } else { //视频投屏
              self.setData({
                is_box_show: true,
              })
              for (var i = 0; i < res_len; i++) {
                wx.request({
                  url: api_url + '/Smallapp/index/recordForScreenPics',
                  header: {
                    'content-type': 'application/json'
                  },
                  data: {
                    openid: openid,
                    box_mac: box_mac,
                    action: 12,

                    mobile_brand: mobile_brand,
                    mobile_model: mobile_model,
                    forscreen_char: forscreen_char,
                    imgs: '["' + pubdetail[i]['forscreen_url'] + '"]',
                    resource_id: pubdetail[i]['res_id'],
                    res_sup_time: 0,
                    res_eup_time: 0,
                    resource_size: pubdetail[i]['resource_size'],
                    is_pub_hotelinfo: 0,
                    is_share: 0,
                    forscreen_id: forscreen_id,
                    duration: pubdetail[i]['duration'],
                  },
                  success: function(ret) {

                  }
                });

                wx.request({
                  url: api_url + '/Netty/Index/pushnetty',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  method: "POST",
                  data: {
                    box_mac: box_mac,
                    msg: '{ "action":2, "url": "' + pubdetail[i]['forscreen_url'] + '", "filename":"' + pubdetail[i]['filename'] + '","openid":"' + openid + '","resource_type":2,"video_id":"' + pubdetail[i]['res_id'] + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '","forscreen_id":"' + forscreen_id + '"}',
                  },
                  success: function(result) {

                    wx.showToast({
                      title: '点播成功,电视即将开始播放',
                      icon: 'none',
                      duration: 2000
                    });
                  },
                  fail: function(res) {
                    wx.showToast({
                      title: '网络异常,点播失败',
                      icon: 'none',
                      duration: 2000
                    })
                  }
                });
              }
            }
            wx.request({
              url: api_url + '/Smallapp21/CollectCount/recCount',
              headers: {
                'Content-Type': 'application/json'
              },
              data: {
                res_id: find_id
              },

            })
          }

        }
      });


    }
  }, //电视播放结束
  //遥控呼大码
  callQrCode: utils.throttle(function(e) {
    var self = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlCallQrcode(openid, box_mac, qrcode_img, hotel_info, self);
  }, 3000), //呼大码结束
  //打开遥控器
  openControl: function(e) {
    var self = this;
    var qrcode_url = api_url + '/Smallapp4/index/getBoxQr?box_mac=' + box_mac + '&type=3';
    self.setData({

      showControl: true,
      qrcode_img: qrcode_url
    })
    mta.Event.stat('openControl', {
      'linktype': app.globalData.link_type
    })
  },
  //关闭遥控
  closeControl: function(e) {
    var self = this;
    self.setData({

      showControl: false,
    })
    mta.Event.stat("closecontrol", {})
  },
  //遥控退出投屏
  exitForscreen: function(e) {
    var self = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlExitForscreen(openid, box_mac, hotel_info, self);
  },
  //遥控调整音量
  changeVolume: function(e) {
    var self = this;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlChangeVolume(openid, box_mac, change_type, hotel_info, self);

  },
  //遥控切换节目
  changeProgram: function(e) {
    var self = this;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlChangeProgram(openid, box_mac, change_type, hotel_info, self);
  },
  modalConfirm: function(e) {
    console.log(e);
    var self = this;
    var hotel_info = e.target.dataset.hotel_info;
    app.linkHotelWifi(hotel_info, self);
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
  goToBack: function(e) {
    app.goToBack();
  }
})