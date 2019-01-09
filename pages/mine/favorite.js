// pages/mine/favorite.js
const app = getApp();
var openid;
var page = 1;
var pubdetail;
var i;
var box_mac;
var sharelist;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openid: '',
    page: 1,
    userinfo: [],
    sharelist: [],
    keys: '',
    hiddens: true,
    forscreen_id:'',
    collect:1
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu();
    var that = this;
    box_mac = options.box_mac;
    console.log(box_mac);
    //获取用户信息以及我的公开

    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    that.setData({
      box_mac:box_mac,
      openid:openid,
    })
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp3/User/getMyCollect',
      headers: {
        'Content-Type': 'application/json'
      },
      data: { openid: openid },
      success: function (res) {
        sharelist = res.data.result.list;
        that.setData({
          //userinfo: res.data.result.user_info,
          sharelist: res.data.result.list,
        })
      }
    })
  },
  //节目内容电视播放
  boxShowProgram(e) {
    var box_mac = e.target.dataset.boxmac;


    if (box_mac == '') {
      wx.showModal({
        title: '提示',
        content: "您可扫码链接热点合作餐厅电视,使用此功能",
        showCancel: true,
        confirmText: '立即扫码',
        success: function (res) {
          if (res.confirm == true) {
            wx.scanCode({
              onlyFromCamera: true,
              success: (res) => {
                //console.log(res);
                wx.navigateTo({
                  url: '/' + res.path
                })
              }
            })
          }

        }
      });
    } else {
      var openid = e.currentTarget.dataset.openid;
      var vediourl = e.currentTarget.dataset.vediourl;
      var forscreen_char = e.currentTarget.dataset.name;


      var filename = e.currentTarget.dataset.filename;//文件名
      var timestamp = (new Date()).valueOf();
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;



      wx.request({
        url: 'https://mobile.littlehotspot.com/smallapp21/User/isForscreenIng',
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        data: { box_mac: box_mac },
        success: function (res) {
          var is_forscreen = res.data.result.is_forscreen;
          if (is_forscreen == 1) {
            wx.showModal({
              title: '确认要打断投屏',
              content: '当前电视正在进行投屏,继续投屏有可能打断当前投屏中的内容.',
              success: function (res) {
                if (res.confirm) {
                  //console.log('用户点击确定')
                  wx.request({
                    url: 'https://mobile.littlehotspot.com/Netty/Index/index',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    method: "POST",
                    data: {
                      box_mac: box_mac,
                      msg: '{ "action": 5,"url":"' + vediourl + '","filename":"' + filename + '","forscreen_id":' + timestamp + ',"resource_id":' + timestamp + '}',
                    },
                    success: function (res) {
                      if (res.data.code == 10000) {
                        wx.showToast({
                          title: '点播成功,电视即将开始播放',
                          icon: 'none',
                          duration: 2000
                        });
                        wx.request({
                          url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
                          header: {
                            'content-type': 'application/json'
                          },
                          data: {
                            openid: openid,
                            box_mac: box_mac,
                            action: 5,
                            mobile_brand: mobile_brand,
                            mobile_model: mobile_model,
                            forscreen_char: forscreen_char,
                            forscreen_id: timestamp,
                            resource_id: timestamp,
                            imgs: '["media/resource/' + filename + '"]'
                          },
                        });
                      } else {
                        wx.showToast({
                          title: '该电视暂不支持投屏',
                          icon: 'none',
                          duration: 2000
                        });
                      }
                    },
                    fail: function (res) {
                      wx.showToast({
                        title: '网络异常,点播失败',
                        icon: 'none',
                        duration: 2000
                      })
                    }
                  })
                } else if (res.cancel) {
                  //console.log('用户点击取消')
                }
              }
            })
          } else {
            wx.request({
              url: 'https://mobile.littlehotspot.com/Netty/Index/index',
              headers: {
                'Content-Type': 'application/json'
              },
              method: "POST",
              data: {
                box_mac: box_mac,
                msg: '{ "action": 5,"url":"' + vediourl + '","filename":"' + filename + '","forscreen_id":' + timestamp + ',"resource_id":' + timestamp + '}',
              },
              success: function (res) {
                if (res.data.code == 10000) {
                  wx.showToast({
                    title: '点播成功,电视即将开始播放',
                    icon: 'none',
                    duration: 2000
                  });
                  wx.request({
                    url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
                    header: {
                      'content-type': 'application/json'
                    },
                    data: {
                      openid: openid,
                      box_mac: box_mac,
                      action: 5,
                      mobile_brand: mobile_brand,
                      mobile_model: mobile_model,
                      forscreen_char: forscreen_char,
                      forscreen_id: timestamp,
                      resource_id: timestamp,
                      imgs: '["media/resource/' + filename + '"]'
                    },
                  });
                } else {
                  wx.showToast({
                    title: '该电视暂不支持投屏',
                    icon: 'none',
                    duration: 2000
                  });
                }

              },
              fail: function (res) {
                wx.showToast({
                  title: '网络异常,点播失败',
                  icon: 'none',
                  duration: 2000
                })
              }
            })
          }
        }
      })
      //return false;

    }
  },//电视播放节目结束
  //电视播放投屏
  boxShowForscreen(e) {
    var box_mac = e.target.dataset.boxmac;
    var find_id = e.target.dataset.forscreen_id
    if (box_mac == '') {
      wx.showModal({
        title: '提示',
        content: "您可扫码链接热点合作餐厅电视,使用此功能",
        showCancel: true,
        confirmText: '立即扫码',
        success: function (res) {
          if (res.confirm == true) {
            wx.scanCode({
              onlyFromCamera: true,
              success: (res) => {
                //console.log(res);
                wx.navigateTo({
                  url: '/' + res.path
                })
              }
            })
          }

        }
      });
    } else {
      var user_info = wx.getStorageSync("savor_user_info");

      
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
        url: 'https://mobile.littlehotspot.com/smallapp21/User/isForscreenIng',
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        data: {
          box_mac: box_mac
        },
        success: function (res) {
          var is_forscreen = res.data.result.is_forscreen;
          if (is_forscreen == 1) {
            wx.showModal({
              title: '确认要打断投屏',
              content: '当前电视正在进行投屏,继续投屏有可能打断当前投屏中的内容.',
              success: function (res) {
                if (res.confirm) {

                  if (res_type == 1) {
                    for (i = 0; i < res_len; i++) {
                      var order = i + 1;
                      wx.request({ //start
                        url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
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
                          imgs: '["' + pubdetail[i]['res_url'] + '"]',
                          resource_id: pubdetail[i]['res_id'],
                          res_sup_time: 0,
                          res_eup_time: 0,
                          resource_size: pubdetail[i]['resource_size'],
                          is_pub_hotelinfo: 0,
                          is_share: 0
                        },
                        success: function (ret) { }



                      }); //end
                      var url = pubdetail[i]['res_url'];
                      var filename = pubdetail[i]['filename'];
                      var res_id = pubdetail[i]['res_id'];

                      wx.request({
                        url: 'https://mobile.littlehotspot.com/Netty/Index/index',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        method: "POST",
                        data: {
                          box_mac: box_mac,
                          msg: '{ "action": 4, "resource_type":2, "url":"' + url + '","filename":"' + filename + '","openid":"' + openid + '","img_nums":' + res_len + ',"forscreen_char":"' + forscreen_char + '","order":' + order + ',"forscreen_id":"' + forscreen_id + '","img_id":"' + res_id + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '"}',
                        },
                        success: function (result) {

                          wx.showToast({
                            title: '点播成功,电视即将开始播放',
                            icon: 'none',
                            duration: 5000
                          });
                        },
                        fail: function (res) {
                          wx.showToast({
                            title: '网络异常,点播失败',
                            icon: 'none',
                            duration: 2000
                          })
                        }
                      })

                    }

                  } else { //视频投屏
                    for (i = 0; i < res_len; i++) {
                      wx.request({
                        url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
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
                        success: function (ret) {

                        }
                      });

                      wx.request({
                        url: 'https://mobile.littlehotspot.com/Netty/Index/index',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        method: "POST",
                        data: {
                          box_mac: box_mac,
                          msg: '{ "action":2, "url": "' + pubdetail[i]['forscreen_url'] + '", "filename":"' + pubdetail[i]['filename'] + '","openid":"' + openid + '","resource_type":2,"video_id":"' + pubdetail[i]['res_id'] + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '","forscreen_id":"' + forscreen_id + '"}',
                        },
                        success: function (result) {

                          wx.showToast({
                            title: '点播成功,电视即将开始播放',
                            icon: 'none',
                            duration: 2000
                          });
                        },
                        fail: function (res) {
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
                    url: 'https://mobile.littlehotspot.com/Smallapp21/CollectCount/recCount',
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
            if (res_type == 1) {
              for (i = 0; i < res_len; i++) {
                var order = i + 1;
                wx.request({ //start
                  url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
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
                  success: function (ret) { }



                }); //end
                var url = pubdetail[i]['forscreen_url'];
                var filename = pubdetail[i]['filename'];
                var res_id = pubdetail[i]['res_id'];

                wx.request({
                  url: 'https://mobile.littlehotspot.com/Netty/Index/index',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  method: "POST",
                  data: {
                    box_mac: box_mac,
                    msg: '{ "action": 4, "resource_type":2, "url":"' + url + '","filename":"' + filename + '","openid":"' + openid + '","img_nums":' + res_len + ',"forscreen_char":"' + forscreen_char + '","order":' + order + ',"forscreen_id":"' + forscreen_id + '","img_id":"' + res_id + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '"}',
                  },
                  success: function (result) {

                    wx.showToast({
                      title: '点播成功,电视即将开始播放',
                      icon: 'none',
                      duration: 5000
                    });
                  },
                  fail: function (res) {
                    wx.showToast({
                      title: '网络异常,点播失败',
                      icon: 'none',
                      duration: 2000
                    })
                  }
                })

              }

            } else { //视频投屏
              for (i = 0; i < res_len; i++) {
                wx.request({
                  url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
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
                    imgs: '["' + pubdetail['forscreen_url'] + '"]',
                    resource_id: pubdetail['res_id'],
                    res_sup_time: 0,
                    res_eup_time: 0,
                    resource_size: pubdetail['resource_size'],
                    is_pub_hotelinfo: 0,
                    is_share: 0,
                    forscreen_id: forscreen_id,
                    duration: pubdetail['duration'],
                  },
                  success: function (ret) {

                  }
                });

                wx.request({
                  url: 'https://mobile.littlehotspot.com/Netty/Index/index',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  method: "POST",
                  data: {
                    box_mac: box_mac,
                    msg: '{ "action":2, "url": "' + pubdetail['forscreen_url'] + '", "filename":"' + pubdetail['filename'] + '","openid":"' + openid + '","resource_type":2,"video_id":"' + pubdetail['res_id'] + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '","forscreen_id":"' + forscreen_id + '"}',
                  },
                  success: function (result) {

                    wx.showToast({
                      title: '点播成功,电视即将开始播放',
                      icon: 'none',
                      duration: 2000
                    });
                  },
                  fail: function (res) {
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
              url: 'https://mobile.littlehotspot.com/Smallapp21/CollectCount/recCount',
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
  }, //电视播放投屏结束
  //收藏资源
  onCollect: function (res) {
    var that = this;
    var res_id = res.currentTarget.dataset.res_id;
    var res_key = res.currentTarget.dataset.res_key;
    var openid = res.currentTarget.dataset.openid;
    var type = res.currentTarget.dataset.type;
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/collect/recLogs',
      header: {
        'content-type': 'application/json'
      },
      data: {
        'openid': openid,
        'res_id': res_id,
        'type': type,
        'status': 1,
      },
      success: function (e) {
        var collect_nums = e.data.result.nums;
        for (var i = 0; i < sharelist.length; i++) {
          if (i == res_key) {
            sharelist[i].is_collect = 1;
            sharelist[i].collect_num = collect_nums;
          }
        }
        that.setData({
          sharelist: sharelist
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
      fial: function ({
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
  cancCollect: function (res) {
    console.log(res);
    var that = this;
    var res_id = res.currentTarget.dataset.res_id;
    var res_key = res.currentTarget.dataset.res_key;
    var openid = res.currentTarget.dataset.openid;
    var type = res.currentTarget.dataset.type;
   
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/collect/recLogs',
      header: {
        'content-type': 'application/json'
      },
      data: {
        'openid': openid,
        'res_id': res_id,
        'type': type,
        'status': 0,
      },
      success: function (e) {
        var collect_nums = e.data.result.nums;
        for (var i = 0; i < sharelist.length; i++) {
          if (i == res_key) {
            sharelist[i].is_collect = 0;
            sharelist[i].collect_num = collect_nums;
          }
        }
        console.log(sharelist);
        that.setData({
          sharelist: sharelist
        })
        
      },
      fial: function ({
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  

  popDel: function(e) {
    var forscreen_id = e.currentTarget.dataset.forscreen_id;
    var keys = e.currentTarget.dataset.keys;
    //console.log(forscreen_id);
    this.setData({
      showModal: true,
      forscreen_id: forscreen_id,
      keys: keys
    });
  },
  modalConfirm: function(e) {
    var that = this;
    var forscreen_id = e.currentTarget.dataset.forscreen_id;

    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/User/delMycollect',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        openid: openid,
        res_id: forscreen_id
      },
      success: function (res) {
        that.onLoad()
      }
    })
  },
  modalCancel: function(e) {

  },
  //预览图片
  previewImage: function (e) {
    var current = e.target.dataset.src;
    var pkey = e.target.dataset.pkey;
    var urls = [];
    for (var row in current) {
      urls[row] = current[row]['res_url']

    }
    //console.log(pkey);
    wx.previewImage({
      current: urls[pkey], // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
  //上拉刷新
  loadMore: function (e) {
    var that = this;

    page = page + 1;
    that.setData({
      hiddens: false,
    })
    wx.request({
      url: 'https://mobile.littlehotspot.com/smallapp3/user/getMyCollect',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        page: page,
        openid: openid,
      },
      method: "POST",
      success: function (res) {
        if (res.data.code == 10000) {
          sharelist = res.data.result.list;
          that.setData({
            userinfo: res.data.result.user_info,
            sharelist: res.data.result.list,
            hiddens: true,
          })

        } else {
          that.setData({
            hiddens: true,
          })
        }
      }
    })
  },
})