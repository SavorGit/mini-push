// pages/forscreen/history/list.js
const util = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp();
var openid;
var box_mac = '';
var page = 1;
var forscreen_history_list;
var api_url = app.globalData.api_url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    forscreen_history_list: '',
    hiddens: true,   //上拉加载中
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //wx.hideShareMenu();
    var that = this;
    openid = options.openid;
    box_mac= options.box_mac;
    that.setData({
      openid:openid,
      box_mac:box_mac
    })

    wx.request({
      url: api_url+'/Smallapp4/index/isHaveCallBox?openid=' + openid,
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 10000 && res.data.result.is_have == 1) {
          that.setData({
            is_open_simple: res.data.result.is_open_simple,
          })
        }
      }
    })
    //获取投屏历史
    wx.request({
      url: api_url+'/Smallapp21/ForscreenHistory/getList',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openid: openid,
        box_mac: box_mac,
        page: page,
      },
      success: function (res) {
        var hst_list = res.data.result;

        if (JSON.stringify(hst_list) == "{}") {
          that.setData({
            forscreen_history_list: ''
          })
        } else {
          that.setData({
            forscreen_history_list: res.data.result
          })
        }

      }
    })
  },
  replayHistory: function (e) {
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    //console.log(user_info);
    var avatarUrl = user_info.avatarUrl;
    var nickName = user_info.nickName;
    var forscreen_char = '';
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    //console.log(e);
    var openid = e.target.dataset.openid;
    var box_mac = e.target.dataset.box_mac;
    var res_type = e.target.dataset.res_type;
    var res_list = e.target.dataset.historylist;
    var res_len = res_list.length;
    var forscreen_id = (new Date()).valueOf();  //投屏id
    var action = 8;  //重新播放

    wx.request({
      url: api_url+'/smallapp21/User/isForscreenIng',
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
                if (res_type == 1) {
                  for (var i = 0; i < res_len; i++) {
                    var order = i + 1;
                    wx.request({//start
                      url: api_url+'/Smallapp/index/recordForScreenPics',
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
                        imgs: '["' + res_list[i]['forscreen_url'] + '"]',
                        resource_id: res_list[i]['resource_id'],
                        resource_type: res_type,
                        res_sup_time: 0,
                        res_eup_time: 0,
                        resource_size: 0,
                        is_pub_hotelinfo: 0,
                        is_share: 0
                      },
                      success: function (ret) {
                      }
                    });//end
                    var url = res_list[i]['forscreen_url'];
                    var filename = res_list[i]['filename'];
                    var res_id = res_list[i]['resource_id'];

                    wx.request({
                      url: api_url+'/Netty/Index/index',
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
                          title: '重投成功,电视即将开始播放',
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
                } else {//视频投屏
                  for (var i = 0; i < res_len; i++) {
                    wx.request({
                      url: api_url+'/Smallapp/index/recordForScreenPics',
                      header: {
                        'content-type': 'application/json'
                      },
                      data: {
                        openid: openid,
                        box_mac: box_mac,
                        action: action,

                        mobile_brand: mobile_brand,
                        mobile_model: mobile_model,
                        forscreen_char: forscreen_char,
                        imgs: '["' + res_list[i]['forscreen_url'] + '"]',
                        resource_id: res_list[i]['resource_id'],
                        resource_type: res_type,
                        res_sup_time: 0,
                        res_eup_time: 0,
                        resource_size: 0,
                        is_pub_hotelinfo: 0,
                        is_share: 0,
                        forscreen_id: forscreen_id,
                        duration: 0,
                      },
                      success: function (ret) {

                      }
                    });

                    wx.request({
                      url: api_url+'/Netty/Index/index',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      method: "POST",
                      data: {
                        box_mac: box_mac,
                        msg: '{ "action":2, "url": "' + res_list[i]['forscreen_url'] + '", "filename":"' + res_list[i]['filename'] + '","openid":"' + openid + '","resource_type":2,"video_id":"' + res_list[i]['resource_id'] + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '","forscreen_id":"' + forscreen_id+'"}',
                      },
                      success: function (result) {

                        wx.showToast({
                          title: '重投成功,电视即将开始播放',
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
              }else{

              }
            }
          })
        }else {
          if (res_type == 1) {
            for (var i = 0; i < res_len; i++) {
              var order = i + 1;
              wx.request({//start
                url: api_url+'/Smallapp/index/recordForScreenPics',
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
                  imgs: '["' + res_list[i]['forscreen_url'] + '"]',
                  resource_id: res_list[i]['resource_id'],
                  resource_type: res_type,
                  res_sup_time: 0,
                  res_eup_time: 0,
                  resource_size: 0,
                  is_pub_hotelinfo: 0,
                  is_share: 0
                },
                success: function (ret) {
                }
              });//end
              var url = res_list[i]['forscreen_url'];
              var filename = res_list[i]['filename'];
              var res_id = res_list[i]['resource_id'];

              wx.request({
                url: api_url+'/Netty/Index/index',
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
                    title: '重投成功,电视即将开始播放',
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
          } else {//视频投屏
            for (var i = 0; i < res_len; i++) {
              wx.request({
                url: api_url+'/Smallapp/index/recordForScreenPics',
                header: {
                  'content-type': 'application/json'
                },
                data: {
                  openid: openid,
                  box_mac: box_mac,
                  action: action,

                  mobile_brand: mobile_brand,
                  mobile_model: mobile_model,
                  forscreen_char: forscreen_char,
                  imgs: '["' + res_list[i]['forscreen_url'] + '"]',
                  resource_id: res_list[i]['resource_id'],
                  resource_type: res_type,
                  res_sup_time: 0,
                  res_eup_time: 0,
                  resource_size: 0,
                  is_pub_hotelinfo: 0,
                  is_share: 0,
                  forscreen_id: forscreen_id,
                  duration: 0,
                },
                success: function (ret) {

                }
              });

              wx.request({
                url: api_url+'/Netty/Index/index',
                headers: {
                  'Content-Type': 'application/json'
                },
                method: "POST",
                data: {
                  box_mac: box_mac,
                  msg: '{ "action":2, "url": "' + res_list[i]['forscreen_url'] + '", "filename":"' + res_list[i]['filename'] + '","openid":"' + openid + '","resource_type":2,"video_id":"' + res_list[i]['resource_id'] + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '","forscreen_id":"' + forscreen_id+'"}',
                },
                success: function (result) {

                  wx.showToast({
                    title: '重投成功,电视即将开始播放',
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
        }
      }
    })

    

  },
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
    var openid = e.target.dataset.openid;
    var box_mac = e.target.dataset.box_mac;
    page = page + 1;
    that.setData({
      hiddens: false,
    })
    wx.request({
      url: api_url+'/Smallapp21/ForscreenHistory/getList',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        page: page,
        box_mac: box_mac,
        openid: openid,
      },
      method: "POST",
      success: function (res) {
        if (res.data.code == 10000) {
          forscreen_history_list = res.data.result,
            that.setData({
              forscreen_history_list: res.data.result,
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
  //遥控呼大码
  callQrCode: util.throttle(function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    app.controlCallQrcode(openid, box_mac, qrcode_img);
  }, 3000),//呼大码结束
  //打开遥控器
  openControl: function (e) {
    var that = this;
    var qrcode_url = api_url+'/Smallapp4/index/getBoxQr?box_mac=' + box_mac + '&type=3';
    that.setData({

      showControl: true,
      qrcode_img: qrcode_url
    })
    mta.Event.stat('openControl', { 'linktype': app.globalData.link_type })
  },
  //关闭遥控
  closeControl: function (e) {
    var that = this;
    that.setData({

      showControl: false,
    })
    mta.Event.stat("closecontrol", {})
  },
  //遥控退出投屏
  exitForscreen: function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    app.controlExitForscreen(openid, box_mac);
  },
  //遥控调整音量
  changeVolume: function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeVolume(openid,box_mac, change_type);

  },
  //遥控切换节目
  changeProgram: function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeProgram(openid,box_mac, change_type);
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

  }
})