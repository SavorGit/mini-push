// 抢红包-抢红包 pages/thematic/money_blessing/grab.js
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
var netty_url = app.globalData.netty_url;
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
                url: api_url+'/Smallapp21/index/recordForScreenPics',
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
                    } else {
                      //如果已授权   请求获取扫电视红包小程序码结果
                      wx.request({
                        url: api_url+'/Smallapp3/redpacket/getScanresult',
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
                                url: api_url+'//Smallapp3/redpacket/grabBonusResult',
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
                    url: api_url+'/Smallapp21/index/recordForScreenPics',
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
                        } else {
                          //如果已授权   请求获取扫电视红包小程序码结果
                          wx.request({
                            url: api_url+'/Smallapp3/redpacket/getScanresult',
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
                                    url: api_url+'//Smallapp3/redpacket/grabBonusResult',
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
    if (res.detail.errMsg == 'getUserInfo:ok') {
      wx.getUserInfo({
        success(rets) {

          wx.request({
            url: api_url+'/smallapp3/User/registerCom',
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
                  url: api_url+'/Smallapp3/redpacket/getScanresult',
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
                          url: api_url+'//Smallapp3/redpacket/grabBonusResult',
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
    }else {
      wx.request({
        url: api_url+'/smallapp21/User/refuseRegister',
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
      app.scanQrcode();
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
      app.scanQrcode();
    } else {
      wx.navigateTo({
        url: '/pages/forscreen/forvideo/index?box_mac=' + box_mac + '&openid=' + openid + '&is_open_simple=' + is_open_simple,
      })
    }


  },
  showHappy:function(e){
    var box_mac = e.currentTarget.dataset.box_mac;
    var openid = e.currentTarget.dataset.openid;
    if (box_mac == '' || box_mac=='undefined') {
      app.scanQrcode();
    }else {
      wx.navigateTo({
        url: '/pages/thematic/birthday/list?openid=' + openid + '&box_mac=' + box_mac,
      })
    }
  },
  demand:function(res){//点播节目
    wx.switchTab({
      url: '/pages/demand/index',
    })
  },
  boxShow(e) {//视频点播让盒子播放 生日歌
    var box_mac = e.currentTarget.dataset.boxmac;
    if (box_mac == '') {
      app.scanQrcode();
    }else {
      var openid = e.currentTarget.dataset.openid;
      var vediourl = e.currentTarget.dataset.vediourl;
      var forscreen_char = e.currentTarget.dataset.name;

      var index1 = vediourl.lastIndexOf("/");
      var index2 = vediourl.length;
      var filename = vediourl.substring(index1 + 1, index2);//后缀名
      var timestamp = (new Date()).valueOf();
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      wx.request({
        url: netty_url+"/push/box",
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST",
        data: {
          box_mac: box_mac,
          cmd: 'call-mini-program',
          msg: '{ "action": 5,"url":"' + vediourl + '","filename":"' + filename + '"}',
          req_id: timestamp
        },
        success: function (res) {
          wx.showToast({
            title: '点播成功,电视即将开始播放',
            icon: 'none',
            duration: 5000
          });
          wx.request({
            url: api_url+'/Smallapp/index/recordForScreenPics',
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
              imgs: '["media/resource/' + filename + '"]'
            },
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
    
  },
  //电视播放
  boxShow(e) {
    var box_mac = e.target.dataset.boxmac;
    var find_id = e.target.dataset.forscreen_id
    if (box_mac == '') {
      app.scanQrcode();
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
        url: api_url+'/smallapp21/User/isForscreenIng',
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
                        url: api_url+'/Smallapp/index/recordForScreenPics',
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
                        url: api_url+'/Netty/Index/index',
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
                    url: api_url+'/Smallapp21/CollectCount/recCount',
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
                  url: api_url+'/Smallapp/index/recordForScreenPics',
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
                  url: api_url+'/Netty/Index/index',
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
              url: api_url+'/Smallapp21/CollectCount/recCount',
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