// pages/mine/favorite.js
const utils = require('../../utils/util.js')
var mta = require('../../utils/mta_analysis.js')
const app = getApp();
var openid;
var page = 1;
var pubdetail;
var i;
var box_mac;
var sharelist;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var pageid = 52;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    link_type: app.globalData.link_type, //1:外网投屏  2：直连投屏
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openid: '',
    page: 1,
    userinfo: [],
    sharelist: [],
    keys: '',
    hiddens: true,
    forscreen_id: '',
    collect: 1,
    showControl: false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //wx.hideShareMenu();
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
    utils.PostRequest(api_v_url + '/index/isHaveCallBox', {
      openid:openid
    }, (data, headers, cookies, errMsg, statusCode) => {
      if (data.result.is_have == 1) {
        self.setData({
          hotel_info: data.result,
        })
      }
    })
    utils.PostRequest(api_url + '/Smallapp4/User/getMyCollect', {
      openid:openid
    }, (data, headers, cookies, errMsg, statusCode) => {
      sharelist = data.result.list;
      self.setData({
        //userinfo: res.data.result.user_info,
        sharelist: data.result.list,
      })
    })
    
    
  },
  //节目内容电视播放
  boxShowProgram(e) {
    var box_mac = e.target.dataset.boxmac;


    if (box_mac == '') {
      app.scanQrcode(pageid);
    } else {
      var openid = e.currentTarget.dataset.openid;
      var vediourl = e.currentTarget.dataset.vediourl;
      var forscreen_char = e.currentTarget.dataset.name;


      var filename = e.currentTarget.dataset.filename; //文件名
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
              success: function(res) {
                if (res.confirm) {
                  utils.PostRequest(api_url + '/Netty/Index/pushnetty', {
                    box_mac: box_mac,
                    msg: '{ "action": 5,"url":"' + vediourl + '","filename":"' + filename + '","forscreen_id":' + timestamp + ',"resource_id":' + timestamp + ',"openid":"'+openid+'"}',
                  }, (data, headers, cookies, errMsg, statusCode) => {
                    wx.showToast({
                      title: '点播成功,电视即将开始播放',
                      icon: 'none',
                      duration: 2000
                    });

                    utils.PostRequest(api_url + '/Smallapp/index/recordForScreenPics', {
                      openid: openid,
                      box_mac: box_mac,
                      action: 5,
                      mobile_brand: mobile_brand,
                      mobile_model: mobile_model,
                      forscreen_char: forscreen_char,
                      forscreen_id: timestamp,
                      resource_id: timestamp,
                      imgs: '["media/resource/' + filename + '"]'
                    }, (data, headers, cookies, errMsg, statusCode) => {
                      
                    })
                    
                  },res=>{
                    wx.showToast({
                      title: '该电视暂不支持投屏',
                      icon: 'none',
                      duration: 2000
                    });
                  })

                  
                } else if (res.cancel) {}
              }
            })
          } else {

            utils.PostRequest(api_url + '/Netty/Index/pushnetty', {
              box_mac: box_mac,
              msg: '{ "action": 5,"url":"' + vediourl + '","filename":"' + filename + '","forscreen_id":' + timestamp + ',"resource_id":' + timestamp + ',"openid":"'+openid+'"}',
            }, (data, headers, cookies, errMsg, statusCode) => {
              wx.showToast({
                title: '点播成功,电视即将开始播放',
                icon: 'none',
                duration: 2000
              });
              utils.PostRequest(api_url + '/Smallapp/index/recordForScreenPics', {
                openid: openid,
                  box_mac: box_mac,
                  action: 5,
                  mobile_brand: mobile_brand,
                  mobile_model: mobile_model,
                  forscreen_char: forscreen_char,
                  forscreen_id: timestamp,
                  resource_id: timestamp,
                  imgs: '["media/resource/' + filename + '"]'
              }, (data, headers, cookies, errMsg, statusCode) => {
              })
              
            },res=>{
              wx.showToast({
                title: '该电视暂不支持投屏',
                icon: 'none',
                duration: 2000
              });
            })            

           
          }

      })

      
      //return false;

    }
  }, //电视播放节目结束
  //电视播放投屏
  boxShowForscreen(e) {
    var that = this;
    var box_mac = e.target.dataset.boxmac;
    var find_id = e.target.dataset.forscreen_id
    pubdetail = e.currentTarget.dataset.pubdetail;
    var res_type = e.currentTarget.dataset.res_type;
    var res_nums = e.currentTarget.dataset.res_nums;
    var forscreen_char = '';
    if (res_type == 1) {
      var action = 11; //发现图片点播
    } else if (res_type == 2) {
      var action = 12; //发现视频点播
    }
    var hotel_info = that.data.hotel_info;
    app.boxShow(box_mac, find_id, pubdetail, res_type, res_nums, action, hotel_info, that);



    
  }, //电视播放投屏结束
  //收藏资源
  onCollect: function(res) {
    var self = this;
    var res_id = res.currentTarget.dataset.res_id;
    var res_key = res.currentTarget.dataset.res_key;
    var openid = res.currentTarget.dataset.openid;
    var type = res.currentTarget.dataset.type;
    utils.tryCatch(mta.Event.stat('MineFav_List_Favorite', {
      'openid': openid,
      'status': true
    }));
    utils.PostRequest(api_url + '/Smallapp/collect/recLogs', {
      openid: openid,
      res_id: res_id,
      type: type,
      status: 1,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var collect_nums = data.result.nums;
      for (var i = 0; i < sharelist.length; i++) {
        if (i == res_key) {
          sharelist[i].is_collect = 1;
          sharelist[i].collect_num = collect_nums;
        }
      }
      self.setData({
        sharelist: sharelist
      })

    },res=>{
      wx.showToast({
        title: '网络异常，请稍后重试',
        icon: 'none',
        duration: 2000
      })
    })
    
  }, //收藏资源结束
  //取消收藏
  cancCollect: function(res) {
    var self = this;
    var res_id = res.currentTarget.dataset.res_id;
    var res_key = res.currentTarget.dataset.res_key;
    var openid = res.currentTarget.dataset.openid;
    var type = res.currentTarget.dataset.type;
    utils.tryCatch(mta.Event.stat('MineFav_List_Favorite', {
      'openid': openid,
      'status': false
    }));

    utils.PostRequest(api_url + '/Smallapp/collect/recLogs', {
      openid: openid,
      res_id: res_id,
      type: type,
      status: 0,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var collect_nums = data.result.nums;
        for (var i = 0; i < sharelist.length; i++) {
          if (i == res_key) {
            sharelist[i].is_collect = 0;
            sharelist[i].collect_num = collect_nums;
          }
        }
        self.setData({
          sharelist: sharelist
        })
    },res=>{
      wx.showToast({
        title: '网络异常，请稍后重试',
        icon: 'none',
        duration: 2000
      })
    })
    
  }, //取消收藏结束
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
  modalConfirm: function(e) {
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
    var filename = res.target.dataset.filename;
    var type = res.target.dataset.type;
    utils.tryCatch(mta.Event.stat('MineFav_List_Share', {
      'openid': openid
    }));
    if (type == 3) {
      var img_url = pubdetail.imgurl;
      var video_url = pubdetail.res_url;
      var share_url = '/pages/share/video?res_id=' + res_id + '&type=3';
    } else if (type == 2) {
      if (res_type == 1) {
        var img_url = pubdetail[0]['res_url'];
        var share_url = '/pages/share/pic?forscreen_id=' + res_id;
      } else {
        var img_url = pubdetail['imgurl'];
        var share_url = '/pages/share/video?res_id=' + res_id + '&type=2';
      }
    }



    if (res.from === 'button') {
      // 转发成功
      utils.PostRequest(api_url + '/Smallapp/share/recLogs', {
        openid: openid,
        res_id: res_id,
        type: type,
        status: 1,
      }, (data, headers, cookies, errMsg, statusCode) => {
        for (var i = 0; i < sharelist.length; i++) {
          if (i == res_key) {
            sharelist[i].share_num++;
          }
        }
        self.setData({
          sharelist: sharelist
        })
      },res=>{
        wx.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none',
          duration: 2000
        })
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
    this.setData({
      showModal: true,
      forscreen_id: forscreen_id,
      keys: keys
    });
  },
  modalConfirm: function(e) {
    var self = this;
    var forscreen_id = e.currentTarget.dataset.forscreen_id;

    utils.PostRequest(api_url + '/Smallapp/User/delMycollect', {
      openid: openid,
      res_id: forscreen_id
    }, (data, headers, cookies, errMsg, statusCode) => {
      self.onLoad()
    })
    
  },
  modalCancel: function(e) {

  },
  onClickItem: function(e) {
    var self = this;
    utils.tryCatch(mta.Event.stat('MineFav_List_ClickItem', {
      'openid': self.data.openid
    }));
  },
  //预览图片
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
  //上拉刷新
  loadMore: function(e) {
    var self = this;

    page = page + 1;
    

    utils.PostRequest(api_url + '/smallapp4/user/getMyCollect', {
      page: page,
        openid: openid,
    }, (data, headers, cookies, errMsg, statusCode) => {
      sharelist = data.result.list;
      self.setData({
        //userinfo: res.data.result.user_info,
        sharelist: res.data.result.list,
        
      })
    })
    
  },
  goToBack: function(e) {
    app.goToBack();
  }
})