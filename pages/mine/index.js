// pages/mine/index.js
const app = getApp();
var openid;
var box_mac;
var page =1;
var pubdetail;
var i;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openid: '',
    showModal: false,
    page:1,
    userinfo:[],
    publiclist:[],
    keys :'',
    hiddens: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu();
    var that = this;
    box_mac = options.box_mac;
    that.setData({
      box_mac:box_mac,
    })
    //获取用户信息以及我的公开
    console.log(box_mac);
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp3/User/getMyPublic',
      headers: {
        'Content-Type': 'application/json'
      },
      data: { openid: openid },
      success: function (res) {
        that.setData({
          userinfo: res.data.result.user_info,
          publiclist: res.data.result.list,
        })
      }
    })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },


  popDel: function(e) {
    var forscreen_id = e.currentTarget.dataset.forscreen_id;
    var keys = e.currentTarget.dataset.keys;
    var publiclist = e.currentTarget.dataset.publiclist;
    this.setData({
      showModal: true,
      forscreen_id:forscreen_id,
      publiclist:publiclist,
      keys:keys
    });
  },
  modalConfirm: function(e) {
    var that = this;
    var forscreen_id = e.currentTarget.dataset.forscreen_id;
    var keys  = e.currentTarget.dataset.keys;
    var publiclist = e.currentTarget.dataset.publiclist;
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/User/delMyPublic',
      headers: {
        'Content-Type': 'application/json'
      },
      data: { openid: openid,
              forscreen_id:forscreen_id
            },
      success: function (res) {
        
        that.setData({
          showModal: false,
        })
        for (var i = 0; i < publiclist.length;i++){
          if(keys==i){
           publiclist.splice(keys,1);
          }
        }
        that.setData({
          publiclist: publiclist,
        })
      }
    })
  },
  previewImage: function (e) {
    var current = e.target.dataset.src;
    var pkey = e.target.dataset.pkey;
    var urls = [];
    for(var row in current){
      urls[row] = current[row]['res_url']
      
    }
    //console.log(pkey);
    wx.previewImage({
      current: urls[pkey], // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
  modalCancel: function(e) {
    this.setData({
      showModal: false,

    });
  },
  //上拉刷新
  loadMore: function (e) {
    var that = this;

    page = page + 1;
    that.setData({
      hiddens: false,
    })
    wx.request({
      url: 'https://mobile.littlehotspot.com/smallapp/user/getMyPublic',
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
          that.setData({
            userinfo: res.data.result.user_info,
            publiclist: res.data.result.list,
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
  //电视播放
  boxShow(e) {
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
          }

        }
      });


    }
  }, //电视播放结束
})