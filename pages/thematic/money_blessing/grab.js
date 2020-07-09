// 抢红包-抢红包 pages/thematic/money_blessing/grab.js
var mta = require('../../../utils/mta_analysis.js');
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
var netty_url = app.globalData.netty_url;
var pageid=61;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    wxAuthLogin: false,
    order_status :0,
    is_open_simple: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //wx.hideShareMenu();
    var that = this;
    scene = decodeURIComponent(options.scene);
    var tims = (new Date()).valueOf();
    var scene_arr = scene.split('_');
    order_id = scene_arr[0];
    box_mac = scene_arr[1];
    var redpackt_qrcode_createtime = scene_arr[2];  //红包生成时间
    wx.request({
      url: api_url+'/smallapp3/index/getConfig',
      success: function (e) {
        if(e.data.code==10000){
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
            })
            if (app.globalData.openid && app.globalData.openid != '') {
              that.setData({
                openid: app.globalData.openid
              })
              openid = app.globalData.openid;
              var forscreen_id = (new Date()).valueOf();
              var mobile_brand = app.globalData.mobile_brand;
              var mobile_model = app.globalData.mobile_model;
              //记录扫码抢红包日志
              wx.request({
                url: api_v_url+'/index/recordForScreenPics',
                header: {
                  'content-type': 'application/json'
                },
                data: {
                  forscreen_id: forscreen_id,
                  openid: openid,
                  box_mac: box_mac,
                  action: 121,
                  mobile_brand: mobile_brand,
                  mobile_model: mobile_model,

                  imgs: '[]',
                  resource_id: order_id,
                  serial_number:app.globalData.serial_number

                },
              })
              //判断用户是否注册
              wx.request({
                url: api_url+'/smallapp3/User/isRegister',
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
                      wx.request({
                        url: api_v_url+'/redpacket/getScanresult',
                        header: {
                          'content-type': 'application/json'
                        },
                        data: {
                          "open_id": openid,
                          "order_id": order_id,
                          "box_mac": box_mac,
                        },
                        success: function (res) {
                          if (res.data.code == 10000) {
                            app.globalData.serial_number = app.globalData.have_link_box_pre+openid+'_'+(new Date()).valueOf();
                            var order_status = res.data.result.status;
                            if (order_status == 4 || order_status == 0) {
                              wx.redirectTo({
                                url: '/pages/thematic/money_blessing/receive_h5?jump_url=' + encodeURIComponent(res.data.result.jump_url),
                              })

                            } else if (order_status == 1 || order_status == 2) {
                              that.setData({
                                order_status: res.data.result.status,
                                avatarUrl: res.data.result.avatarUrl,
                                bless: res.data.result.bless,
                                nickName: res.data.result.nickName,
                                order_id: res.data.result.order_id,
                                money: res.data.result.money,
                                is_open_simple: is_open_simple
                              })
                              getRedpacketJx(openid);

                            } else if (order_status == 3) {
                              wx.request({
                                url: api_v_url+'/redpacket/grabBonusResult',
                                header: {
                                  'content-type': 'application/json'
                                },
                                data: {
                                  order_id: order_id,
                                  user_id: res.data.result.user_id,
                                  sign: res.data.result.sign,
                                },
                                success: function (rt) {
                                  if (rt.data.code == 10000) {
                                    that.setData({
                                      order_status: res.data.result.status,
                                      avatarUrl: res.data.result.avatarUrl,
                                      bless: res.data.result.bless,
                                      nickName: res.data.result.nickName,
                                      order_id: res.data.result.order_id,
                                      money: res.data.result.money,
                                    })
                                  } else {
                                    wx.reLaunch({
                                      url: '/pages/index/index',
                                    })
                                    wx.showToast({
                                      title: '红包领取失败',
                                      icon: 'none',
                                      duration: 2000,
                                    })
                                  }
                                }
                              })
                            } else if (order_status == 5) {
                              wx.redirectTo({
                                url: '/pages/thematic/money_blessing/grab_detail?order_id=' + order_id + "&box_mac=" + box_mac,
                              })
                            }
                          } else {
                            wx.reLaunch({
                              url: '/pages/index/index',
                            })
                            wx.showToast({
                              title: '该红包不可领取',
                              icon: 'none',
                              duration: 2000,
                            })
                          }

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
                  //记录扫码抢红包日志
                  wx.request({
                    url: api_v_url+'/index/recordForScreenPics',
                    header: {
                      'content-type': 'application/json'
                    },
                    data: {
                      forscreen_id: forscreen_id,
                      openid: openid,
                      box_mac: box_mac,
                      action: 121,
                      mobile_brand: mobile_brand,
                      mobile_model: mobile_model,

                      imgs: '[]',
                      resource_id: order_id,
                      serial_number:app.globalData.serial_number

                    },
                  })
                  //判断用户是否注册
                  wx.request({
                    url: api_url+'/smallapp3/User/isRegister',
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
                          wx.request({
                            url: api_v_url+'/redpacket/getScanresult',
                            header: {
                              'content-type': 'application/json'
                            },
                            data: {
                              "open_id": openid,
                              "order_id": order_id,
                              "box_mac": box_mac
                            },
                            success: function (res) {
                              if (res.data.code == 10000) {
                                app.globalData.serial_number = app.globalData.have_link_box_pre+openid+'_'+(new Date()).valueOf();
                                var order_status = res.data.result.status;
                                if (order_status == 4 || order_status == 0) {
                                  wx.redirectTo({
                                    url: '/pages/thematic/money_blessing/receive_h5?jump_url=' + encodeURIComponent(res.data.result.jump_url),
                                  })

                                } else if (order_status == 1 || order_status == 2) {
                                  that.setData({
                                    order_status: res.data.result.status,
                                    avatarUrl: res.data.result.avatarUrl,
                                    bless: res.data.result.bless,
                                    nickName: res.data.result.nickName,
                                    order_id: res.data.result.order_id,
                                    money: res.data.result.money,
                                    is_open_simple: is_open_simple,
                                  })
                                  getRedpacketJx(openid);
                                } else if (order_status == 3) {
                                  wx.request({
                                    url: api_v_url+'/redpacket/grabBonusResult',
                                    header: {
                                      'content-type': 'application/json'
                                    },
                                    data: {
                                      order_id: order_id,
                                      user_id: res.data.result.user_id,
                                      sign: res.data.result.sign,
                                    },
                                    success: function (rt) {
                                      if (rt.data.code == 10000) {
                                        that.setData({
                                          order_status: res.data.result.status,
                                          avatarUrl: res.data.result.avatarUrl,
                                          bless: res.data.result.bless,
                                          nickName: res.data.result.nickName,
                                          order_id: res.data.result.order_id,
                                          money: res.data.result.money,
                                        })
                                      } else {
                                        wx.reLaunch({
                                          url: '/pages/index/index',
                                        })
                                        wx.showToast({
                                          title: '红包领取失败',
                                          icon: 'none',
                                          duration: 2000,
                                        })
                                      }
                                    }
                                  })
                                } else if (order_status == 5) {
                                  wx.redirectTo({
                                    url: '/pages/thematic/money_blessing/grab_detail?order_id=' + order_id,
                                  })
                                }
                              } else {
                                wx.reLaunch({
                                  url: '/pages/index/index',
                                })
                                wx.showToast({
                                  title: '该红包不可领取',
                                  icon: 'none',
                                  duration: 2000,
                                })
                              }

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
                }
              }
            }
            function getRedpacketJx(openid) {
              wx.request({
                url: api_url+'/Smallapp3/Find/redPacketJx',
                header: {
                  'content-type': 'application/json'
                },
                data: {
                  openid: openid,
                },
                success: function (res) {
                  if (res.data.code == 10000) {
                    discovery_list = res.data.result
                    that.setData({
                      discovery_list: res.data.result,
                    })
                  }
                }
              })
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
              'content-type': 'application/json'
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
                // wx.navigateTo({
                //   url: '/pages/thematic/money_blessing/grab?scene='+order_id+'_'+box_mac,
                // })
                //that.onLoad()
                //this.onLoad();
                //that.reload();
                //如果已授权   请求获取扫电视红包小程序码结果
                wx.request({
                  url: api_v_url+'/redpacket/getScanresult',
                  header: {
                    'content-type': 'application/json'
                  },
                  data: {
                    "open_id": openid,
                    "order_id": order_id,
                    "box_mac": box_mac,
                  },
                  success: function (res) {
                    if (res.data.code == 10000) {
                      app.globalData.serial_number = app.globalData.have_link_box_pre+openid+'_'+(new Date()).valueOf();
                      var order_status = res.data.result.status;
                      if (order_status == 4 || order_status == 0) {
                        wx.redirectTo({
                          url: '/pages/thematic/money_blessing/receive_h5?jump_url=' + encodeURIComponent(res.data.result.jump_url),
                        })

                      } else if (order_status == 1 || order_status == 2) {
                        that.setData({
                          order_status: res.data.result.status,
                          avatarUrl: res.data.result.avatarUrl,
                          bless: res.data.result.bless,
                          nickName: res.data.result.nickName,
                          order_id: res.data.result.order_id,
                          money: res.data.result.money,
                          is_open_simple: is_open_simple
                        })
                        getRedpacketJx(openid);
                      } else if (order_status == 3) {
                        wx.request({
                          url: api_v_url+'/redpacket/grabBonusResult',
                          header: {
                            'content-type': 'application/json'
                          },
                          data: {
                            order_id: order_id,
                            user_id: res.data.result.user_id,
                            sign: res.data.result.sign,
                          },
                          success: function (rt) {
                            if (rt.data.code == 10000) {
                              that.setData({
                                order_status: res.data.result.status,
                                avatarUrl: res.data.result.avatarUrl,
                                bless: res.data.result.bless,
                                nickName: res.data.result.nickName,
                                order_id: res.data.result.order_id,
                                money: res.data.result.money,
                              })
                            } else {
                              wx.reLaunch({
                                url: '/pages/index/index',
                              })
                              wx.showToast({
                                title: '红包领取失败',
                                icon: 'none',
                                duration: 2000,
                              })
                            }
                          }
                        })
                      } else if (order_status == 5) {
                        wx.redirectTo({
                          url: '/pages/thematic/money_blessing/grab_detail?order_id=' + order_id,
                        })
                      }
                    } else {
                      wx.reLaunch({
                        url: '/pages/index/index',
                      })
                      wx.showToast({
                        title: '该红包不可领取',
                        icon: 'none',
                        duration: 2000,
                      })
                    }

                  }
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
      wx.request({
        url: api_v_url+'/User/refuseRegister',
        data: {
          'openid': openid,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.code == 10000) {
            user_info['is_wx_auth'] = 1;
            wx.setStorage({
              key: 'savor_user_info',
              data: user_info,
            })

          } else {
            wx.showToast({
              title: '拒绝失败,请重试',
              icon: 'none',
              duration: 2000
            });
          }

        }
      })
      mta.Event.stat("refuseauth", {})
    }  
    function getRedpacketJx(openid) {
      wx.request({
        url: api_url+'/Smallapp3/Find/redPacketJx',
        header: {
          'content-type': 'application/json'
        },
        data: {
          openid: openid,
        },
        success: function (res) {
          if (res.data.code == 10000) {
            discovery_list = res.data.result
            that.setData({
              discovery_list: res.data.result,
            })
          }
        }
      })
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
    wx.request({
      url: api_url+'/Smallapp21/index/closeauthLog',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openid: openid,
        box_mac: box_mac,
      },

    })
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
    var box_mac = e.currentTarget.dataset.box_mac;
    var openid = e.currentTarget.dataset.openid;
    var is_open_simple = e.currentTarget.dataset.is_open_simple;
    if (box_mac == '') {
      app.scanQrcode(pageid);
    } else {
      wx.navigateTo({
        url: '/pages/forscreen/forimages/index?box_mac=' + box_mac + '&openid=' + openid + '&is_open_simple=' + is_open_simple,
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
    wx.request({
      url: api_url+'/Smallapp/collect/recLogs',
      header: {
        'content-type': 'application/json'
      },
      data: {
        'openid': openid,
        'res_id': res_id,
        'type': 2,
        'status': 1,
      },
      success: function (e) {
        var collect_nums = e.data.result.nums;
        for (var i = 0; i < discovery_list.length; i++) {
          if (i == res_key) {
            discovery_list[i].is_collect = 1;
            discovery_list[i].collect_num = collect_nums;
          }
        }
        that.setData({
          discovery_list: discovery_list
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
  }, //收藏资源结束
  //取消收藏
  cancCollect: function (e) {
    var that = this;
    var res_id = e.target.dataset.res_id;
    var res_key = e.target.dataset.res_key;
    var openid = e.target.dataset.openid;
    wx.request({
      url: api_url+'/Smallapp/collect/recLogs',
      header: {
        'content-type': 'application/json'
      },
      data: {
        'openid': openid,
        'res_id': res_id,
        'type': 2,
        'status': 0,
      },
      success: function (e) {
        var collect_nums = e.data.result.nums;
        for (var i = 0; i < discovery_list.length; i++) {
          if (i == res_key) {
            discovery_list[i].is_collect = 0;
            discovery_list[i].collect_num = collect_nums;
          }
        }
        that.setData({
          discovery_list: discovery_list
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
      wx.request({
        url: api_url+'/Smallapp/share/recLogs',
        header: {
          'content-type': 'application/json'
        },
        data: {
          'openid': openid,
          'res_id': res_id,
          'type': 2,
          'status': 1,
        },
        success: function (e) {
          for (var i = 0; i < discovery_list.length; i++) {
            if (i == res_key) {
              discovery_list[i].share_num++;
            }
          }
          that.setData({
            discovery_list: discovery_list
          })

        },
        fail: function ({
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