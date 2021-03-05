// 抢红包-抢红包 pages/thematic/money_blessing/grab.js
var mta = require('../../../utils/mta_analysis.js');
const utils = require('../../../utils/util.js')
const app = getApp();
var openid;
var box_mac;
var order_id;
var scene;
var is_open_simple;
var discovery_list; //发现列表
var pubdetail;
var i;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url
var pageid=61;
var wxmpopenid;
var subscribe_time;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    wxAuthLogin: false,
    order_status :0,
    is_open_simple: 0,
    redpacket_content:'即刻分享视频照片，一键投屏，让饭局分享爽不停'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //wx.hideShareMenu();
    var that = this;
    wxmpopenid = '';
    subscribe_time = '';
    var tims = (new Date()).valueOf();
    if(typeof(options.scene)!='undefined'){
      scene = decodeURIComponent(options.scene);
      
      var scene_arr = scene.split('_');
      order_id = scene_arr[0];
      box_mac = scene_arr[1];
      var redpackt_qrcode_createtime = scene_arr[2];  //红包生成时间
    }else {
      order_id = options.order_id;
      box_mac  = options.box_mac;
      wxmpopenid = options.wxmpopenid;
      subscribe_time = options.subscribe_time;
      var redpackt_qrcode_createtime = options.redpackt_qrcode_createtime
    }

    
    wx.request({
      url: api_v_url+'/index/getConfig',
      success: function (e) {
        if(e.data.code==10000){
          var redpacket_content = e.data.result.redpacket_content;
          var sys_time = e.data.result.sys_time;  //系统时间
          var redpacket_exp_time = e.data.result.redpacket_exp_time;  //红包失效时间
          var diff_time = sys_time - redpackt_qrcode_createtime;
          if (diff_time > redpacket_exp_time){//如果红包已过期
              wx.reLaunch({
                url: '/pages/index/index',
              })
              wx.showToast({
                title: '该红包已过期！',
                icon:'none',
                duration:2000,
              })
          }else {
            that.setData({
              order_id: order_id,
              box_mac: box_mac,
              redpacket_content:redpacket_content
            })
            if (app.globalData.openid && app.globalData.openid != '') {
              that.setData({
                openid: app.globalData.openid
              })
              openid = app.globalData.openid;
              var forscreen_id = (new Date()).valueOf();
              var mobile_brand = app.globalData.mobile_brand;
              var mobile_model = app.globalData.mobile_model;
              app.globalData.serial_number = app.globalData.have_link_box_pre+openid+'_'+(new Date()).valueOf();
              //记录扫码抢红包日志
              utils.PostRequest(api_v_url+'/index/recordForScreenPics', {
                forscreen_id: forscreen_id,
                openid: openid,
                box_mac: box_mac,
                action: 121,
                mobile_brand: mobile_brand,
                mobile_model: mobile_model,

                imgs: '[]',
                resource_id: order_id,
                serial_number:app.globalData.serial_number
              }, (data, headers, cookies, errMsg, statusCode) => {

              })
              //绑定公众号openid
              if(wxmpopenid!=''){
                utils.PostRequest(api_v_url+'/user/bindOffiaccount', {
                  wxmpopenid:wxmpopenid,
                  openid : openid,
                  subscribe_time:subscribe_time
                }, (data, headers, cookies, errMsg, statusCode) => {
            
                },re => { }, { isShowLoading: false })

                utils.PostRequest(api_v_url+'/index/recodeQrcodeLog', {
                  openid : openid,
                  type   :36,
                  data_id:order_id,
                  box_mac:box_mac,
                  mobile_brand:app.globalData.mobile_brand,
                  mobile_model:app.globalData.mobile_model
                }, (data, headers, cookies, errMsg, statusCode) => {
            
                },re => { }, { isShowLoading: false })

              }
              
              
              
              //判断用户是否注册
              wx.request({
                url: api_v_url+'/User/isRegister',
                data: {
                  "openid": openid,
                  "box_mac": box_mac,
                },
                header: {
                  'content-type': 'application/json'
                },
                success: function (res) {
                  var code = res.data.code;
                  if (code == 10000) {
                    wx.setStorage({
                      key: 'savor_user_info',
                      data: res.data.result.userinfo,
                    })
                    var is_wx_auth = res.data.result.userinfo.is_wx_auth;
                    is_open_simple = res.data.result.userinfo.is_open_simple;

                    if (is_wx_auth != 3) {
                      that.setData({
                        showModal: true
                      })
                      mta.Event.stat("showwxauth", {})
                    } else {
                      //如果已授权   请求获取扫电视红包小程序码结果

                      utils.PostRequest(api_v_url+'/redpacket/getScanresult', {
                        "open_id": openid,
                        "order_id": order_id,
                        "box_mac": box_mac,
                      }, (data, headers, cookies, errMsg, statusCode) => {
                        var order_status = data.result.status;
                        var avatarUrl    = data.result.avatarUrl;
                        var bless        = data.result.bless;
                        var nickName     = data.result.nickName;
                        var order_id     = data.result.order_id;
                        var money        = data.result.money;
                        var user_id      = data.result.user_id;
                        var sign         = data.result.sign;
                        if (order_status == 4 || order_status == 0) {
                          wx.redirectTo({
                            url: '/pages/thematic/money_blessing/receive_h5?jump_url=' + encodeURIComponent(data.result.jump_url),
                          })

                        } else if (order_status == 1 || order_status == 2) {
                          that.setData({
                            order_status: order_status,
                            avatarUrl: avatarUrl,
                            bless: bless,
                            nickName: nickName,
                            order_id: order_id,
                            money: money,
                            is_open_simple: is_open_simple
                          })
                          getRedpacketJx(openid);

                        } else if (order_status == 3) {

                          utils.PostRequest(api_v_url+'/redpacket/grabBonusResult', {
                            order_id: order_id,
                            user_id: user_id,
                            sign: sign,
                          }, (data, headers, cookies, errMsg, statusCode) => {
                            that.setData({
                              order_status: order_status,
                              avatarUrl: avatarUrl,
                              bless: bless,
                              nickName: nickName,
                              order_id: order_id,
                              money: money,
                            })
                          },res=>{
                            wx.reLaunch({
                              url: '/pages/index/index',
                            })
                            wx.showToast({
                              title: '红包领取失败',
                              icon: 'none',
                              duration: 2000,
                            })
                          })

                          
                        } else if (order_status == 5) {
                          wx.redirectTo({
                            url: '/pages/thematic/money_blessing/grab_detail?order_id=' + order_id + "&box_mac=" + box_mac,
                          })
                        }
                      })
                      

                    }

                  } else {
                    wx.reLaunch({
                      url: '/pages/index/index',
                    })
                    wx.showToast({
                      title: '用户数据异常',
                      icon: 'none',
                      duration: 2000
                    })
                  }
                },
                fail: function (e) {
                  wx.reLaunch({
                    url: '/pages/index/index',
                  })
                }
              });//判断用户是否注册结束

            } else {
              app.openidCallback = openid => {
                if (openid != '') {
                  that.setData({
                    openid: openid
                  })
                  openid = openid;

                  var forscreen_id = (new Date()).valueOf();
                  var mobile_brand = app.globalData.mobile_brand;
                  var mobile_model = app.globalData.mobile_model;
                  app.globalData.serial_number = app.globalData.have_link_box_pre+openid+'_'+(new Date()).valueOf();
                  //记录扫码抢红包日志
                  utils.PostRequest(api_v_url+'/index/recordForScreenPics', {
                    forscreen_id: forscreen_id,
                    openid: openid,
                    box_mac: box_mac,
                    action: 121,
                    mobile_brand: mobile_brand,
                    mobile_model: mobile_model,

                    imgs: '[]',
                    resource_id: order_id,
                    serial_number:app.globalData.serial_number
                  }, (data, headers, cookies, errMsg, statusCode) => {

                  })
                  //绑定公众号openid
                  if(wxmpopenid!=''){
                    utils.PostRequest(api_v_url+'/user/bindOffiaccount', {
                      wxmpopenid:wxmpopenid,
                      openid : openid,
                      subscribe_time:subscribe_time
                    }, (data, headers, cookies, errMsg, statusCode) => {
                
                    },re => { }, { isShowLoading: false })
    
                    utils.PostRequest(api_v_url+'/index/recodeQrcodeLog', {
                      openid : openid,
                      type   :36,
                      data_id:order_id,
                      box_mac:box_mac
                    }, (data, headers, cookies, errMsg, statusCode) => {
                
                    },re => { }, { isShowLoading: false })
                  }
                  //判断用户是否注册
                  wx.request({
                    url: api_v_url+'/User/isRegister',
                    data: {
                      "openid": openid,
                    },
                    header: {
                      'content-type': 'application/json'
                    },
                    success: function (res) {
                      var code = res.data.code;
                      if (code == 10000) {
                        wx.setStorage({
                          key: 'savor_user_info',
                          data: res.data.result.userinfo,
                        })
                        var is_wx_auth = res.data.result.userinfo.is_wx_auth;
                        is_open_simple = res.data.result.userinfo.is_open_simple;
                        if (is_wx_auth != 3) {
                          that.setData({
                            showModal: true
                          })
                          mta.Event.stat("showwxauth", {})
                        } else {
                          //如果已授权   请求获取扫电视红包小程序码结果

                          utils.PostRequest(api_v_url+'/redpacket/getScanresult', {
                            "open_id": openid,
                            "order_id": order_id,
                            "box_mac": box_mac
                          }, (data, headers, cookies, errMsg, statusCode) => {
                            var order_status = data.result.status;
                            var avatarUrl    = data.result.avatarUrl;
                            var bless        = data.result.bless;
                            var nickName     = data.result.nickName;
                            var order_id     = data.result.order_id;
                            var money        = data.result.money;
                            var user_id      = data.result.user_id;
                            var sign         = data.result.sign;
                            if (order_status == 4 || order_status == 0) {
                              wx.redirectTo({
                                url: '/pages/thematic/money_blessing/receive_h5?jump_url=' + encodeURIComponent(data.result.jump_url),
                              })

                            } else if (order_status == 1 || order_status == 2) {
                              that.setData({
                                order_status: order_status,
                                avatarUrl: avatarUrl,
                                bless: bless,
                                nickName: nickName,
                                order_id: order_id,
                                money: money,
                                is_open_simple: is_open_simple,
                              })
                              getRedpacketJx(openid);
                            } else if (order_status == 3) {



                              utils.PostRequest(api_v_url+'/redpacket/grabBonusResult', {
                                order_id: order_id,
                                user_id: user_id,
                                sign: sign,
                              }, (data, headers, cookies, errMsg, statusCode) => {
                                that.setData({
                                  order_status: order_status,
                                  avatarUrl: avatarUrl,
                                  bless: bless,
                                  nickName: nickName,
                                  order_id: order_id,
                                  money: money,
                                })
                              },res=>{
                                wx.reLaunch({
                                  url: '/pages/index/index',
                                })
                                wx.showToast({
                                  title: '红包领取失败',
                                  icon: 'none',
                                  duration: 2000,
                                })
                              })
                            } else if (order_status == 5) {
                              wx.redirectTo({
                                url: '/pages/thematic/money_blessing/grab_detail?order_id=' + order_id,
                              })
                            }
                          },res=>{
                            wx.reLaunch({
                              url: '/pages/index/index',
                            })
                            wx.showToast({
                              title: '该红包不可领取',
                              icon: 'none',
                              duration: 2000,
                            })
                          })
                          

                        }

                      } else {
                        wx.reLaunch({
                          url: '/pages/index/index',
                        })
                        wx.showToast({
                          title: '用户数据异常',
                          icon: 'none',
                          duration: 2000
                        })
                      }
                    },
                    fail: function (e) {
                      wx.reLaunch({
                        url: '/pages/index/index',
                      })
                    }
                  });//判断用户是否注册结束
                }
              }
            }
            function getRedpacketJx(openid) {
              utils.PostRequest(api_v_url+'/Find/redPacketJx', {
                openid: openid,
              }, (data, headers, cookies, errMsg, statusCode) => {
                discovery_list = data.result
                that.setData({
                  discovery_list: data.result,
                })
                
              },res=>{},{ isShowLoading: false })
              
            }
          }

        }else {//失败
          wx.reLaunch({
            url: '/pages/index/index',
          })
          wx.showToast({
            title: '该红包领取失败，请扫码重试',
            icon: 'none',
            duration: 2000,
          })
        }

      },fail:function(e){
        wx.reLaunch({
          url: '/pages/index/index',
        })
        wx.showToast({
          title: '该红包领取失败，请扫码重试',
          icon: 'none',
          duration: 2000,
        })
      }
    })
    


    
    //
    
  },
  onGetUserInfo: function (res) {
    var that = this;
    
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    is_open_simple = user_info.is_open_simple;
    mta.Event.stat("clickonwxauth", {})
    app.globalData.serial_number = app.globalData.have_link_box_pre+openid+'_'+(new Date()).valueOf();
    if (res.detail.errMsg == 'getUserInfo:ok') {
      wx.getUserInfo({
        success(rets) {

          wx.request({
            url: api_v_url+'/User/registerCom',
            data: {
              'openid': openid,
              'avatarUrl': rets.userInfo.avatarUrl,
              'nickName': rets.userInfo.nickName,
              'gender': rets.userInfo.gender,
              'session_key': app.globalData.session_key,
              'iv': rets.iv,
              'encryptedData': rets.encryptedData
            },
            header: {
              'content-type': 'application/json',
              'serial-number':app.globalData.serial_number
            },
            success: function (res) {
              if (res.data.code == 10000) {
                wx.setStorage({
                  key: 'savor_user_info',
                  data: res.data.result,
                });
                that.setData({
                  showModal: false,
                })
                
                utils.PostRequest(api_v_url+'/redpacket/getScanresult', {
                  "open_id": openid,
                  "order_id": order_id,
                  "box_mac": box_mac,
                }, (data, headers, cookies, errMsg, statusCode) => {
                  var order_status = data.result.status;
                  var avatarUrl    = data.result.avatarUrl;
                  var bless        = data.result.bless;
                  var nickName     = data.result.nickName;
                  var order_id     = data.result.order_id;
                  var money        = data.result.money;
                  var user_id      = data.result.user_id;
                  var sign          = data.result.sign;
                  if (order_status == 4 || order_status == 0) {
                    wx.redirectTo({
                      url: '/pages/thematic/money_blessing/receive_h5?jump_url=' + encodeURIComponent(data.result.jump_url),
                    })

                  } else if (order_status == 1 || order_status == 2) {
                    that.setData({
                      order_status: order_status,
                      avatarUrl: avatarUrl,
                      bless: bless,
                      nickName: nickName,
                      order_id: order_id,
                      money: money,
                      is_open_simple: is_open_simple
                    })
                    getRedpacketJx(openid);
                  } else if (order_status == 3) {

                    utils.PostRequest(api_v_url+'/redpacket/grabBonusResult', {
                      order_id: order_id,
                      user_id: user_id,
                      sign: sign,
                    }, (data, headers, cookies, errMsg, statusCode) => {
                      that.setData({
                        order_status: order_status,
                        avatarUrl: avatarUrl,
                        bless: bless,
                        nickName: nickName,
                        order_id: order_id,
                        money: money,
                      })
                    },res=>{
                      wx.reLaunch({
                        url: '/pages/index/index',
                      })
                      wx.showToast({
                        title: '红包领取失败',
                        icon: 'none',
                        duration: 2000,
                      })
                    })
                    
                  } else if (order_status == 5) {
                    wx.redirectTo({
                      url: '/pages/thematic/money_blessing/grab_detail?order_id=' + order_id,
                    })
                  }
                },res=>{
                  wx.reLaunch({
                    url: '/pages/index/index',
                  })
                  wx.showToast({
                    title: '该红包不可领取',
                    icon: 'none',
                    duration: 2000,
                  })
                })
                
              } else {
                wx.showToast({
                  title: '微信授权登陆失败，请重试',
                  icon: 'none',
                  duration: 2000,

                })
              }

            }
          })
        }
      })
      mta.Event.stat("allowauth", {})
    }else {
      utils.PostRequest(api_v_url+'/User/refuseRegister', {
        'openid': openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        user_info['is_wx_auth'] = 1;
        wx.setStorage({
          key: 'savor_user_info',
          data: user_info,
        })
      },re => { }, { isShowLoading: false })
      
      mta.Event.stat("refuseauth", {})
    }  
    function getRedpacketJx(openid) {
      utils.PostRequest(api_v_url+'/Find/redPacketJx', {
        openid: openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        discovery_list = data.result
        that.setData({
          discovery_list: data.result,
        })
      },re => { }, { isShowLoading: false })
      
    }
    

  },
  //关闭授权弹窗
  closeAuth: function () {
    //关闭授权登陆埋点
    var that = this;
    that.setData({
      showModal: false,
    })
    if (box_mac == 'undefined' || box_mac == undefined) {
      box_mac = '';
    }
    utils.PostRequest(api_v_url+'/index/closeauthLog', {
      openid: openid,
      box_mac: box_mac,
    }, (data, headers, cookies, errMsg, statusCode) => {

    },re => { }, { isShowLoading: false })
    
    wx.reLaunch({
      url: '/pages/index/index',
    })
    mta.Event.stat("closewxauth", {})
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
  //选择照片上电视
  chooseImage(e) {
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    var box_mac = e.currentTarget.dataset.box_mac;
    var openid = e.currentTarget.dataset.openid;
    var is_open_simple = e.currentTarget.dataset.is_open_simple;
    if (box_mac == '') {
      app.scanQrcode(pageid);
    } else {
      

      utils.PostRequest(api_v_url + '/index/isHaveCallBox', {
        openid: user_info.openid
      }, (data, headers, cookies, errMsg, statusCode) => {
        var is_have = data.result.is_have;
        app.globalData.hotel_info = data.result;
        if(is_have==1){
          var is_compress = data.result.is_compress;
          wx.navigateTo({
            url: '/pages/forscreen/forimages/index?box_mac=' + box_mac + '&openid=' + openid + '&is_open_simple=' + is_open_simple,
          })
        }else {
          wx.reLaunch({
            url: '/pages/index/index',
          })
        }
      },function(e){
        wx.reLaunch({
          url: '/pages/index/index',
        })
      })

      
    }
  },
  //选择视频投屏
  chooseVedio(e) {
    var that = this
    var user_info = wx.getStorageSync("savor_user_info");
    var box_mac = e.currentTarget.dataset.box_mac;
    var openid = e.currentTarget.dataset.openid;
    var is_open_simple = e.currentTarget.dataset.is_open_simple;
    if (box_mac == '' || box_mac=='undefined') {
      app.scanQrcode(pageid);
    } else {
      

      utils.PostRequest(api_v_url + '/index/isHaveCallBox', {
        openid: user_info.openid
      }, (data, headers, cookies, errMsg, statusCode) => {
        var is_have = data.result.is_have;
        app.globalData.hotel_info = data.result;
        if(is_have==1){
          var is_compress = data.result.is_compress;
          wx.navigateTo({
            url: '/pages/forscreen/forvideo/index?box_mac=' + box_mac + '&openid=' + openid + '&is_open_simple=' + is_open_simple+'&is_compress='+is_compress,
          })
        }else {
          wx.reLaunch({
            url: '/pages/index/index',
          })
        }
      },function(e){
        wx.reLaunch({
          url: '/pages/index/index',
        })
      })
        
      
    }


  },
  showHappy:function(e){
    var box_mac = e.currentTarget.dataset.box_mac;
    var openid = e.currentTarget.dataset.openid;
    if (box_mac == '' || box_mac=='undefined') {
      app.scanQrcode(pageid);
    }else {
      wx.navigateTo({
        url: '/pages/thematic/birthday/list?openid=' + openid + '&box_mac=' + box_mac,
      })
    }
  },
  demand:function(res){//点播节目
    wx.switchTab({
      url: '/pages/shopping/index',
    })
  },
  
  //电视播放
  boxShow(e) {

    var that = this;
    var box_mac = e.target.dataset.boxmac;
    var find_id = e.target.dataset.forscreen_id
    pubdetail = e.target.dataset.pubdetail;
    var forscreen_char = '';
    var res_type = e.target.dataset.res_type;
    var res_nums = e.target.dataset.res_nums;
    if (res_type == 1) {
      var action = 11; //发现图片点播
    } else if (res_type == 2) {
      var action = 12; //发现视频点播
    }
    app.boxShow(box_mac, find_id, pubdetail, res_type, res_nums, action, '', that);


    
  }, //电视播放结束
  //收藏资源
  onCollect: function (e) {
    var that = this;
    var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;
    var res_key = e.target.dataset.res_key;

    utils.PostRequest(api_v_url+'/collect/recLogs', {
      'openid': openid,
      'res_id': res_id,
      'type': 2,
      'status': 1,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var collect_nums = data.result.nums;
      for (var i = 0; i < discovery_list.length; i++) {
        if (i == res_key) {
          discovery_list[i].is_collect = 1;
          discovery_list[i].collect_num = collect_nums;
        }
      }
      that.setData({
        discovery_list: discovery_list
      })
    },res=>{},{ isShowLoading: false })
    
  }, //收藏资源结束
  //取消收藏
  cancCollect: function (e) {
    var that = this;
    var res_id = e.target.dataset.res_id;
    var res_key = e.target.dataset.res_key;
    var openid = e.target.dataset.openid;
    utils.PostRequest(api_v_url+'/collect/recLogs', {
      'openid': openid,
      'res_id': res_id,
      'type': 2,
      'status': 0,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var collect_nums = data.result.nums;
      for (var i = 0; i < discovery_list.length; i++) {
        if (i == res_key) {
          discovery_list[i].is_collect = 0;
          discovery_list[i].collect_num = collect_nums;
        }
      }
      that.setData({
        discovery_list: discovery_list
      })
    },res=>{},{ isShowLoading: false })
    
  }, //取消收藏结束
  //点击分享按钮
  onShareAppMessage: function (res) {
    var that = this;
    var res_id = res.target.dataset.res_id;
    var res_key = res.target.dataset.res_key;
    var res_type = res.target.dataset.res_type;
    var openid = res.target.dataset.openid;
    var pubdetail = res.target.dataset.pubdetail;

    if (res_type == 1) {
      var img_url = pubdetail[0]['res_url'];
      var share_url = '/pages/share/pic?forscreen_id=' + res_id;
    } else {
      var img_url = pubdetail[0]['vide_img'];
      var share_url = '/pages/share/video?res_id=' + res_id + '&type=2';
    }

    if (res.from === 'button') {
      // 转发成功
      utils.PostRequest(api_v_url+'/share/recLogs', {
        'openid': openid,
        'res_id': res_id,
        'type': 2,
        'status': 1,
      }, (data, headers, cookies, errMsg, statusCode) => {
        for (var i = 0; i < discovery_list.length; i++) {
          if (i == res_key) {
            discovery_list[i].share_num++;
          }
        }
        that.setData({
          discovery_list: discovery_list
        })
      })
      
      // 来自页面内转发按钮
      return {
        title: '发现一个好玩的东西',
        path: share_url,
        imageUrl: img_url,
        success: function (res) {

        },
      }
    }
  }, // 分享结束
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
})