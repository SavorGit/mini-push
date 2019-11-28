//index.js
//获取应用实例
const utils = require('../../utils/util.js')
const app = getApp()
var timestamp = (new Date()).valueOf();
var box_mac; //当前连接机顶盒mac
var page = 1; //当前节目单页数
var user_id;
var program_list; //点播列表
var openid; //用户openid
var api_url = app.globalData.api_url;
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
  },
  Page: {},

  Netty: {}
};
Page({
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    openid: '',
    motto: '热点投屏',
    userInfo: {},
    hasUserInfo: false,
    tempFilePaths: '',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showView: true,
    imgUrls: [],
    // hiddens: true,
    box_mac: '',
    popRemoteControlWindow: false,

    indicatorDots: true, //是否显示面板指示点
    autoplay: true, //是否自动切换
    interval: 3000, //自动切换时间间隔
    lb_duration: 1000, //滑动动画时长
  },

  onLoad: function() {
    //wx.hideShareMenu();
    let self = this;
    if (app.globalData.openid && app.globalData.openid != '') {
      //注册用户
      self.setData({
        openid: app.globalData.openid
      });
      SavorUtils.User.isRegister(self); //判断用户是否注册
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          self.setData({
            openid: openid
          });
          SavorUtils.User.isRegister(self); //判断用户是否注册
        }
      }
    }
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    utils.PostRequest(api_url + '/Smallapp4/index/isHaveCallBox?openid=' + openid, {}, (data, headers, cookies, errMsg, statusCode) => {
      var is_have = data.result.is_have;
      if (is_have == 1) {
        app.linkHotelWifi(data.result, self);
        self.setData({
          box_mac: data.result.box_mac,
          is_open_simple: data.result.is_open_simple,
          hotel_info: data.result,
        });
        box_mac = data.result.box_mac;
        //获取节目单列表
        utils.PostRequest(api_url + '/Smallapp4/optimize/getOptimizeList', {
          box_mac: box_mac,
          page: page,
          openid: openid,
        }, (boxData, boxHeaders, boxCookies, boxErrMsg, boxStatusCode) => {
          console.log(boxData.result);
          program_list = boxData.result
          self.setData({
            program_list: boxData.result
          })
        });
      } else {
        //获取小程序主节目单列表
        utils.PostRequest(api_url + '/Smallapp4/optimize/getOptimizeList', {
          page: page,
          openid: openid,
        }, (boxData, boxHeaders, boxCookies, boxErrMsg, boxStatusCode) => self.setData({
          program_list: boxData.result,
        }));
        self.setData({
          box_mac: '',
        })
        box_mac = '';
      }
    });
    utils.PostRequest(api_url + '/Smallapp3/Adsposition/getAdspositionList', {
      position: 1,
    }, (data, headers, cookies, errMsg, statusCode) => self.setData({
      imgUrls: data.result
    }));
    // wx.request({
    //   url: api_url + '/Smallapp4/index/isHaveCallBox?openid=' + openid,
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },

    //   success: function(rest) {
    //     var is_have = rest.data.result.is_have;
    //     if (is_have == 1) {
    //       app.linkHotelWifi(rest.data.result, self);
    //       self.setData({
    //         box_mac: rest.data.result.box_mac,
    //         is_open_simple: rest.data.result.is_open_simple,
    //         hotel_info: rest.data.result,
    //       });
    //       box_mac = rest.data.result.box_mac;
    //       //获取节目单列表
    //       wx.request({ //获取机顶盒节目单列表
    //         // url: api_url + '/Smallapp3/optimize/getOptimizeList',
    //         url: api_url + '/Smallapp4/optimize/getOptimizeList',
    //         header: {
    //           'Content-Type': 'application/json'
    //         },
    //         data: {
    //           box_mac: box_mac,
    //           page: page,
    //           openid: openid,
    //         },
    //         method: "POST",
    //         success: function(res) {
    //           console.log(res.data.result);
    //           program_list = res.data.result
    //           self.setData({
    //             program_list: res.data.result
    //           })
    //         }
    //       })
    //     } else {
    //       //获取小程序主节目单列表
    //       wx.request({
    //         // url: api_url + '/Smallapp3/optimize/getOptimizeList',
    //         url: api_url + '/Smallapp4/optimize/getOptimizeList',
    //         data: {
    //           page: page,
    //           openid: openid,
    //         },
    //         header: {
    //           'content-type': 'application/json'
    //         },
    //         success: function(res) {
    //           if (res.data.code == 10000) {
    //             program_list = res.data.result
    //             self.setData({
    //               program_list: res.data.result,
    //             })

    //           }
    //         }
    //       });
    //       self.setData({
    //         box_mac: '',
    //       })
    //       box_mac = '';
    //     }
    //   }
    // })
    // wx.request({
    //   url: api_url + '/Smallapp3/Adsposition/getAdspositionList',
    //   data: {
    //     position: 1,
    //   },
    //   success: function(res) {
    //     if (res.data.code == 10000) {
    //       var imgUrls = res.data.result;
    //       self.setData({
    //         imgUrls: res.data.result
    //       })
    //     }
    //   }
    // })

  },
  //遥控呼大码
  callQrCode: utils.throttle(function(e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlCallQrcode(openid, box_mac, qrcode_img, hotel_info, that);
  }, 3000),
  //呼大码结束
  //打开遥控器
  openControl: function(e) {
    var self = this;
    var qrcode_url = api_url + '/Smallapp4/index/getBoxQr?box_mac=' + box_mac + '&type=3';
    self.setData({
      popRemoteControlWindow: true,
      qrcode_img: qrcode_url
    })
  },
  //关闭遥控
  closeControl: function(e) {
    var self = this;
    self.setData({
      popRemoteControlWindow: false,
    })

  },
  //遥控退出投屏
  exitForscreen: function(e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlExitForscreen(openid, box_mac, hotel_info, that);
  },
  //遥控调整音量
  changeVolume: function(e) {
    var that = this;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlChangeVolume(openid, box_mac, change_type, hotel_info, that);

  },
  //遥控切换节目
  changeProgram: function(e) {
    var that = this;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlChangeProgram(openid, box_mac, change_type, hotel_info, that);
  },
  modalConfirm: function(e) {
    console.log(e);
    var that = this;
    var hotel_info = e.target.dataset.hotel_info;
    app.linkHotelWifi(hotel_info, that);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    if (app.globalData.openid && app.globalData.openid != '') {
      utils.PostRequest(api_url + '/Smallapp4/index/isHaveCallBox', {
        openid: app.globalData.openid
      }, (data, headers, cookies, errMsg, statusCode) => {
        if (data.result.is_have == 1) {

        } else {
          app.globalData.link_type = 1;
          that.setData({
            is_link: 0,
            box_mac: '',
            link_type: 1,
            popRemoteControlWindow: false
          })
          box_mac = '';
        }
        //console.log(data);
      }, re => { }, { isShowLoading: false });
    } else {
      app.openidCallback = openid => {
        utils.PostRequest(api_url + '/Smallapp4/index/isHaveCallBox', {
          openid: openid
        }, (data, headers, cookies, errMsg, statusCode) => {
          if (data.result.is_have == 1) {

          } else {
            app.globalData.link_type = 1;
            that.setData({
              is_link: 0,
              box_mac: '',
              link_type: 1,
              popRemoteControlWindow: false
            })
            box_mac = '';
          }
        }, re => { }, { isShowLoading: false });
      }
    }
    //this.onLoad()
  },

  //上拉刷新
  loadMore: function(e) {
    var self = this;
    var box_mac = e.currentTarget.dataset.boxmac;
    page = page + 1;
    if (box_mac == '' || box_mac == undefined) {
      utils.PostRequest(api_url + '/Smallapp4/optimize/getOptimizeList', {
        page: page,
        openid: openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        self.setData({
          program_list: data.result
        })
        program_list = data.result
      });
      // wx.request({
      //   //url: api_url+'/smallapp/Demand/getList',
      //   // url: api_url + '/Smallapp3/optimize/getOptimizeList',
      //   url: api_url + '/Smallapp4/optimize/getOptimizeList',
      //   header: {
      //     'Content-Type': 'application/json'
      //   },
      //   data: {
      //     page: page,
      //     openid: openid,
      //   },
      //   method: "POST",
      //   success: function(res) {
      //     if (res.data.code == 10000) {
      //       self.setData({
      //         program_list: res.data.result,
      //         hiddens: true,
      //       })
      //       program_list = res.data.result
      //     } else {
      //       self.setData({
      //         hiddens: true,
      //       })
      //     }
      //   }
      // })
    } else {
      utils.PostRequest(api_url + '/Smallapp4/optimize/getOptimizeList', {
        box_mac: box_mac,
        page: page,
        openid: openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        program_list = data.result
        self.setData({
          program_list: data.result
        })
      });
      // wx.request({
      //   //url: api_url+'/Smallapp/BoxProgram/getBoxProgramList',
      //   // url: api_url + '/Smallapp3/optimize/getOptimizeList',
      //   url: api_url + '/Smallapp4/optimize/getOptimizeList',
      //   header: {
      //     'Content-Type': 'application/json'
      //   },
      //   data: {
      //     box_mac: box_mac,
      //     page: page,
      //     openid: openid,
      //   },
      //   method: "POST",
      //   success: function(res) {
      //     program_list = res.data.result
      //     self.setData({
      //       program_list: res.data.result,
      //       hiddens: true,
      //     })
      //   }
      // })
    }

  },
  //电视播放
  boxShow(e) {
    let self = this;
    let listIndex = e.currentTarget.dataset.index;
    var box_mac = e.target.dataset.boxmac;


    if (box_mac == '') {
      app.scanQrcode();
    } else {
      var openid = e.currentTarget.dataset.openid;
      var vediourl = e.currentTarget.dataset.vediourl;
      var forscreen_char = e.currentTarget.dataset.name;


      var filename = e.currentTarget.dataset.filename; //文件名
      var timestamp = (new Date()).valueOf();
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;


      var forscreen_id = e.currentTarget.dataset.goods_id;
      var res_type = 2;
      var res_nums = 1;
      var duration = e.currentTarget.dataset.duration;
      var resource_size = e.currentTarget.dataset.resource_size;
      var forscreen_url = e.currentTarget.dataset.forscreen_url;
      var filename = e.currentTarget.dataset.filename;
      var tx_url = e.currentTarget.dataset.tx_url;
      var pubdetail = [{
        'duration': 0,
        'resource_size': 0,
        'forscreen_url': '',
        'res_id': 0
      }];
      for (var i = 0; i < 1; i++) {
        pubdetail[0].duration = duration;
        pubdetail[0].resource_size = resource_size;
        pubdetail[0].forscreen_url = forscreen_url;
        pubdetail[0].res_id = forscreen_id;
        pubdetail[0].filename = filename;
        pubdetail[0].res_url = tx_url;
      }
      var hotel_info = e.currentTarget.dataset.hotel_info;
      app.boxShow(box_mac, forscreen_id, pubdetail, res_type, res_nums, 5, hotel_info);

      // 调用记录播放次数接口
      utils.PostRequest(api_url + '/Smallapp4/demand/recordPlaynum', {
        openid: openid,
        res_id: forscreen_id
      }, (data, headers, cookies, errMsg, statusCode) => {
        let program_list = self.data.program_list;
        program_list[listIndex].play_num = data.result.play_num;
        self.setData({
          program_list: program_list
        });
      });

    }
  }, //电视播放结束
  //收藏资源
  onCollect: function(e) {
    var self = this;
    //var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;
    var res_key = e.target.dataset.res_key;
    var res_type = 4;
    utils.PostRequest(api_url + '/Smallapp/collect/recLogs', {
      'openid': openid,
      'res_id': res_id,
      'type': res_type,
      'status': 1,
    }, (data, headers, cookies, errMsg, statusCode) => {
      for (var i = 0; i < program_list.length; i++) {
        if (i == res_key) {
          program_list[i].is_collect = 1;
          program_list[i].collect_num++;
        }
      }
      self.setData({
        program_list: program_list
      });
    }, res => wx.showToast({
      title: '网络异常，请稍后重试',
      icon: 'none',
      duration: 2000
    }));
    // wx.request({
    //   url: api_url + '/Smallapp/collect/recLogs',
    //   header: {
    //     'content-type': 'application/json'
    //   },
    //   data: {
    //     'openid': openid,
    //     'res_id': res_id,
    //     'type': res_type,
    //     'status': 1,
    //   },
    //   success: function(e) {
    //     for (var i = 0; i < program_list.length; i++) {
    //       if (i == res_key) {
    //         program_list[i].is_collect = 1;
    //         program_list[i].collect_num++;
    //       }
    //     }
    //     self.setData({
    //       program_list: program_list
    //     })
    //     /*if (e.data.code == 10000) {
    //       wx.showToast({
    //         title: '收藏成功',
    //         icon: 'none',
    //         duration: 2000
    //       })
    //     } else {
    //       wx.showToast({
    //         title: '收藏失败，请稍后重试',
    //         icon: 'none',
    //         duration: 2000
    //       })
    //     }*/
    //   },
    //   fial: function({
    //     errMsg
    //   }) {
    //     wx.showToast({
    //       title: '网络异常，请稍后重试',
    //       icon: 'none',
    //       duration: 2000
    //     })
    //   }
    // })
  }, //收藏资源结束
  //取消收藏
  cancCollect: function(e) {
    var self = this;
    var res_id = e.target.dataset.res_id;
    var res_key = e.target.dataset.res_key;
    var res_type = 4;
    utils.PostRequest(api_url + '/Smallapp/collect/recLogs', {
      'openid': openid,
      'res_id': res_id,
      'type': res_type,
      'status': 0,
    }, (data, headers, cookies, errMsg, statusCode) => {
      for (var i = 0; i < program_list.length; i++) {
        if (i == res_key) {
          program_list[i].is_collect = 0;
          program_list[i].collect_num--;
        }
      }
      self.setData({
        program_list: program_list
      });
    }, res => wx.showToast({
      title: '网络异常，请稍后重试',
      icon: 'none',
      duration: 2000
    }));
    // wx.request({
    //   url: api_url + '/Smallapp/collect/recLogs',
    //   header: {
    //     'content-type': 'application/json'
    //   },
    //   data: {
    //     'openid': openid,
    //     'res_id': res_id,
    //     'type': res_type,
    //     'status': 0,
    //   },
    //   success: function(e) {
    //     for (var i = 0; i < program_list.length; i++) {
    //       if (i == res_key) {
    //         program_list[i].is_collect = 0;
    //         program_list[i].collect_num--;
    //       }
    //     }
    //     self.setData({
    //       program_list: program_list
    //     })
    //     /*if (e.data.code == 10000) {
    //       wx.showToast({
    //         title: '取消收藏成功',
    //         icon: 'none',
    //         duration: 2000
    //       })
    //     } else {
    //       wx.showToast({
    //         title: '取消收藏失败，请稍后重试',
    //         icon: 'none',
    //         duration: 2000
    //       })
    //     }*/
    //   },
    //   fial: function({
    //     errMsg
    //   }) {
    //     wx.showToast({
    //       title: '网络异常，请稍后重试',
    //       icon: 'none',
    //       duration: 2000
    //     })
    //   }
    // })
  }, //取消收藏结束
  //点击分享按钮
  onShareAppMessage: function(res) {
    var self = this;
    var openid = res.target.dataset.openid;
    var goods_id = res.target.dataset.res_id;
    var res_key = res.target.dataset.res_key;
    var img_url = res.target.dataset.img_url;

    if (res.from === 'button') {
      // 转发成功
      utils.PostRequest(api_url + '/Smallapp/share/recLogs', {
        'openid': openid,
        'res_id': goods_id,
        'type': 4,
        'status': 1,
      }, (data, headers, cookies, errMsg, statusCode) => {
        for (var i = 0; i < program_list.length; i++) {
          if (i == res_key) {
            program_list[i].share_num++;
          }
        }
        self.setData({
          program_list: program_list
        });
      }, res => wx.showToast({
        title: '网络异常，请稍后重试',
        icon: 'none',
        duration: 2000
      }));
      // wx.request({
      //   url: api_url + '/Smallapp/share/recLogs',
      //   header: {
      //     'content-type': 'application/json'
      //   },
      //   data: {
      //     'openid': openid,
      //     'res_id': goods_id,
      //     'type': 4,
      //     'status': 1,
      //   },
      //   success: function(e) {
      //     for (var i = 0; i < program_list.length; i++) {
      //       if (i == res_key) {
      //         program_list[i].share_num++;
      //       }
      //     }
      //     self.setData({
      //       program_list: program_list
      //     })

      //   },
      //   fail: function({
      //     errMsg
      //   }) {
      //     wx.showToast({
      //       title: '网络异常，请稍后重试',
      //       icon: 'none',
      //       duration: 2000
      //     })
      //   }
      // })
      // 来自页面内转发按钮
      return {
        title: '热点聚焦，投你所好',
        //path: '/pages/share/video?res_id='+res_id+'&type=3',
        path: '/pages/demand/goods_detail?goods_id=' + goods_id + '&box_mac=&is_header=1',
        imageUrl: img_url,
        success: function(res) {


        },
      }
    }
  }, // 分享结束
  //查看视频播放记录日志
  demandLog: function(res) {
    var openid = res.currentTarget.dataset.openid;
    var box_mac = res.currentTarget.dataset.box_mac;
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var forscreen_char = '';
    var imgs = res.currentTarget.dataset.tx_url;
    var resource_id = res.currentTarget.dataset.id
    var timestamp = (new Date()).valueOf();
    var duration = res.currentTarget.dataset.duration;
    utils.PostRequest(api_url + '/Smallapp/index/recordForScreenPics', {
      openid: openid,
      box_mac: box_mac,
      action: 21,
      resource_type: 2,
      mobile_brand: mobile_brand,
      mobile_model: mobile_model,
      forscreen_char: forscreen_char,
      imgs: '["' + imgs + '"]',
      resource_id: resource_id,
      res_sup_time: 0,
      res_eup_time: 0,
      resource_size: 0,
      is_pub_hotelinfo: 0,
      is_share: 0,
      forscreen_id: timestamp,
      duration: duration,
    });
    // wx.request({
    //   url: api_url + '/Smallapp/index/recordForScreenPics',
    //   header: {
    //     'content-type': 'application/json'
    //   },
    //   data: {
    //     openid: openid,
    //     box_mac: box_mac,
    //     action: 21,
    //     resource_type: 2,
    //     mobile_brand: mobile_brand,
    //     mobile_model: mobile_model,
    //     forscreen_char: forscreen_char,
    //     imgs: '["' + imgs + '"]',
    //     resource_id: resource_id,
    //     res_sup_time: 0,
    //     res_eup_time: 0,
    //     resource_size: 0,
    //     is_pub_hotelinfo: 0,
    //     is_share: 0,
    //     forscreen_id: timestamp,
    //     duration: duration,
    //   },
    // });
  },

})