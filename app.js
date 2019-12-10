//app.js
var mta = require('./utils/mta_analysis.js');
App({
  
  recordFormId(openid, formId) {
    var that = this;
    if (formId != 'the formId is a mock one') {
      wx.request({
        url: that.globalData.api_url + '/Smallapp3/content/addFormid',
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        data: {
          openid: openid,
          formid: formId,
        }
      })
    }
  },
  //电视播放
  boxShow(box_mac = '', forscreen_id, pubdetail, res_type, res_len,action,hotel_info,aps) {
    var that = this;
    
    if (box_mac == '') {
      this.scanQrcode();
    } else {
      var user_info = wx.getStorageSync("savor_user_info");
      if(that.globalData.link_type==1){
        

        that.tpst(box_mac , forscreen_id, pubdetail, res_type, res_len, action, hotel_info);
        
        
      }else {
        var timestamp = (new Date()).valueOf();
        if(action==11 || action==12 ){
          var media_url_str = '[';
          var space = '';
          for(var i=0;i<pubdetail.length;i++){
            media_url_str += space + '{"forscreen_url":"' + pubdetail[i].forscreen_url +'","filename":"'+pubdetail[i].filename+'"}';
            space = ',';
          }
          media_url_str += ']';
          
          wx.request({
            url: 'http://' + hotel_info.intranet_ip + ":8080/h5/discover_ondemand?deviceId=" + user_info.openid + "&box_mac=" + box_mac + "&web=true&media_id=" + forscreen_id + "&resource_type=" + res_type + "&forscreen_id=" + timestamp + "&media_url=" + media_url_str + '&avatarUrl=' + user_info.avatarUrl + "&nickName=" + user_info.nickName,
            success: function (res) {
              if (res.data.code == 10000) {
                wx.showToast({
                  title: '点播成功,电视即将开始播放',
                  icon: 'none',
                  duration: 2000
                });
              } else {
                that.linkHotelWifi(hotel_info, aps)
                wx.showToast({
                  title: '网络异常,点播失败',
                  icon: 'none',
                  duration: 2000
                })
              }
            }, fail: function (res) {
              that.linkHotelWifi(hotel_info, aps)
              wx.showToast({
                title: '网络异常,点播失败',
                icon: 'none',
                duration: 2000
              })
            }
          })
        }else if(action==5){//优选
          
          for (var i = 0; i < res_len; i++) {
            
            wx.request({
              url: "http://" + hotel_info.intranet_ip + ":8080/h5/goods_ondemand?deviceId=" + user_info.openid + "&box_mac=" + box_mac + "&web=true&media_id=" + forscreen_id + "&forscreen_id=" + timestamp + "&media_name=" + pubdetail[0]['filename'] + "&media_url=" + pubdetail[0]['res_url'] + '&avatarUrl=' + user_info.avatarUrl + "&nickName=" + user_info.nickName,
              success:function(res){
                if(res.data.code==10000){
                  wx.showToast({
                    title: '点播成功,电视即将开始播放',
                    icon: 'none',
                    duration: 2000
                  });
                }else {
                  that.linkHotelWifi(hotel_info, aps)
                  wx.showToast({
                    title: '网络异常,点播失败',
                    icon: 'none',
                    duration: 2000
                  })
                }
              },fail:function(res){
                that.linkHotelWifi(hotel_info, aps)
                wx.showToast({
                  title: '网络异常,点播失败',
                  icon: 'none',
                  duration: 2000
                })
              }
            })
          }

        }
      }
      
    }
  }, //电视播放结束
  tpst: function (box_mac = '', forscreen_id, pubdetail, res_type, res_len, action, hotel_info){
    var that = this;
    
    //var forscreen_id = (new Date()).valueOf();
    wx.request({
      url: that.globalData.api_url + '/smallapp21/User/isForscreenIng',
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
                
                that.tprc(box_mac, forscreen_id, pubdetail, res_type, res_len, action, hotel_info);
              } else { }
            }
          })
        } else {
          
          that.tprc(box_mac, forscreen_id, pubdetail, res_type, res_len, action, hotel_info);
        }
      }
    });
  },
  tprc: function (box_mac = '', forscreen_id, pubdetail, res_type, res_len, action, hotel_info){
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    var avatarUrl = user_info.avatarUrl;
    var nickName = user_info.nickName;
    var openid = user_info.openid;
    var forscreen_char = '';
    var mobile_brand = that.globalData.mobile_brand;
    var mobile_model = that.globalData.mobile_model;
    var res_id = forscreen_id;
    var forscreen_id = (new Date()).valueOf();
    
    if (res_type == 1) {
      for (var i = 0; i < pubdetail.length; i++) {
        var order = i + 1;
        wx.request({ //start
          url: that.globalData.api_url + '/Smallapp/index/recordForScreenPics',
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
          url: that.globalData.api_url + '/Netty/Index/index',
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
      for (var i = 0; i < res_len; i++) {
        wx.request({
          url: that.globalData.api_url + '/Smallapp/index/recordForScreenPics',
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
          success: function (ret) { }
        });
        
        wx.request({
          url: that.globalData.api_url + '/Netty/Index/index',
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
      url: that.globalData.api_url + '/Smallapp21/CollectCount/recCount',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        res_id: res_id
      },

    })
  },
  controlExitForscreen: function (openid, box_mac, hotel_info,aps) {
    var that = this;
    var link_type = that.globalData.link_type;
    //openid = e.currentTarget.dataset.openid;
    //box_mac = e.currentTarget.dataset.boxmac;
    if (link_type==1){
      var timestamp = (new Date()).valueOf();
      wx.request({
        url: that.globalData.api_url + '/Netty/Index/index',
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        data: {
          box_mac: box_mac,
          msg: '{ "action": 3,"openid":"' + openid + '"}',
        },
        success: function (res) {
          wx.showToast({
            title: '退出成功',
            icon: 'none',
            duration: 2000
          });
        },
        fail: function (res) {
          wx.showToast({
            title: '网络异常，退出失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
    } else if (link_type==2){
      wx.request({
        url: "http://" + hotel_info.intranet_ip + ":8080/h5/stop?deviceId=" + openid + "&box_mac=" + box_mac+"&web=true",
        success: function (res) {
          if (res.data.code==10000){
            wx.showToast({
              title: '退出成功',
              icon: 'none',
              duration: 2000
            });
          }else if(res.data.code==1001){
            aps.setData({
              wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
            })
          }
          else {
            wx.showToast({
              title: '退出失败',
              icon: 'none',
              duration: 2000
            });
          }
        },
        fail: function ({ errMsg }) {
          aps.setData({
            wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
          })
        },
      })
    }
    
  }, //退出投屏结束
  //遥控器呼玛
  controlCallQrcode: function(openid, box_mac, qrcode_img,hotel_info,aps) {
    var that = this;
    if (box_mac) {
      var link_type = that.globalData.link_type;
      if(link_type==1){
        var timestamp = (new Date()).valueOf();
        var qrcode_url = that.globalData.api_url + '/Smallapp/index/getBoxQr?box_mac=' + box_mac + '&type=3';
        var mobile_brand = this.globalData.mobile_brand;
        var mobile_model = this.globalData.mobile_model;

        wx.request({
          url: that.globalData.api_url + '/smallapp21/User/isForscreenIng',
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
                    wx.request({
                      url: that.globalData.api_url + '/Netty/Index/index',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      method: "POST",
                      data: {
                        box_mac: box_mac,
                        msg: '{ "action": 9,"url":"' + qrcode_url + '"}',
                      },
                      success: function () {
                        wx.showToast({
                          title: '呼玛成功，电视即将展示',
                          icon: 'none',
                          duration: 2000
                        });
                        wx.request({
                          url: that.globalData.api_url + '/Smallapp/index/recordForScreenPics',
                          header: {
                            'content-type': 'application/json'
                          },
                          data: {
                            openid: openid,
                            box_mac: box_mac,
                            action: 9,
                            mobile_brand: mobile_brand,
                            mobile_model: mobile_model,
                            imgs: '[]'
                          },

                        })
                      }
                    })
                  } else {

                  }
                }
              })
            } else {
              wx.request({
                url: that.globalData.api_url + '/Netty/Index/index',
                headers: {
                  'Content-Type': 'application/json'
                },
                method: "POST",
                data: {
                  box_mac: box_mac,
                  msg: '{ "action": 9,"url":"' + qrcode_url + '"}',
                },
                success: function () {
                  wx.showToast({
                    title: '呼玛成功，电视即将展示',
                    icon: 'none',
                    duration: 2000
                  });
                  wx.request({
                    url: that.globalData.api_url + '/Smallapp/index/recordForScreenPics',
                    header: {
                      'content-type': 'application/json'
                    },
                    data: {
                      openid: openid,
                      box_mac: box_mac,
                      action: 9,
                      mobile_brand: mobile_brand,
                      mobile_model: mobile_model,
                      imgs: '[]'
                    },
                  })
                }
              })
            }
          }
        })
      }else {
        wx.request({
          url: "http://" + hotel_info.intranet_ip + ":8080/showMiniProgramCode?deviceId=" + openid + "&box_mac="+box_mac+"&web=true",
          success: function (res) {
            if (res.data.code == 10000) {
              wx.showToast({
                title: '呼码成功',
                icon: 'none',
                duration: 2000
              });
            }else if(res.data.code==1001){
              aps.setData({
                wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
              })
            }else {
              wx.showToast({
                title: '呼码失败',
                icon: 'none',
                duration: 2000
              });
            }

          },
          fial: function ({ errMsg }) {
            wx.showToast({
              title: '呼码失败',
              icon: 'none',
              duration: 2000
            });
            aps.setData({
              wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
            })
          },
        })
      }
      
      
    }
  },
  //遥控器控制音量
  controlChangeVolume: function (openid,box_mac, change_type,hotel_info,aps) {
    var that = this;
    var link_type = that.globalData.link_type;
    if(link_type==1){
      wx.request({
        url: that.globalData.api_url + '/Netty/Index/index',
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        data: {
          box_mac: box_mac,
          msg: '{"action":31,"change_type":' + change_type + '}',
        },
      })
    }else if(link_type==2){
      var timestamp = (new Date()).valueOf();
      var change_type_name = '';
      if (change_type == 1) {
        change_type = 3
        change_type_name = '减小音量'
      } else if (change_type == 2) {
        change_type = 4
        change_type_name = '增大音量'
      }
      wx.request({
        url: "http://" + hotel_info.intranet_ip + ":8080/volume?action=" + change_type + "&deviceId=" + openid + "&box_mac=" + box_mac+"&projectId=" + timestamp + "&web=true",
        success: function (res) {
          if (res.data.code == 10000) {
            wx.showToast({
              title: change_type_name + '成功',
              icon: 'none',
              duration: 2000
            })
          } else if (res.data.result==1001){
            aps.setData({
              wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
            })
          }else {
            wx.showToast({
              title: '投屏过程中才可控制音量',
              icon: 'none',
              duration: 2000
            })
          }
        }, fail: function () {
          aps.setData({
            wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
          })
        }
      })
    }
  },
  //遥控控制节目
  controlChangeProgram: function (openid, box_mac, change_type, hotel_info, aps) {
    var that = this;
    var link_type = that.globalData.link_type;
    if(link_type==1){
      
      wx.request({
        url: that.globalData.api_url + '/Netty/Index/index',
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        data: {
          box_mac: box_mac,
          msg: '{"action":32,"change_type":' + change_type + '}',
        },
      })
    }else if(link_type==2){
      var timestamp = (new Date()).valueOf();
      wx.request({
        url: "http://" + hotel_info.intranet_ip + ":8080/switchProgram?action=" + change_type + "&deviceId=" + openid + "&box_mac="+box_mac+"&projectId=" + timestamp + "&web=true",
        success: function (res) {
          
          if (res.data.code == 10000) {
            wx.showToast({
              title: '切换成功',
              icon: 'none',
              duration: 2000
            })
          } else if (res.data.code == 1001) {
            aps.setData({
              wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
            })
          } else {
            wx.showToast({
              title: '电视投屏中，切换无效',
              icon: 'none',
              duration: 2000
            })
          }
        }, fail: function () {
          aps.setData({
            wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
          })
        }
      })
    }
    
  },
  //扫码
  scanQrcode: function() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: "您可扫码链接热点合作餐厅电视,使用此功能",
      showCancel: true,
      confirmText: '立即扫码',
      success: function(res) {
        if (res.confirm == true) {
          wx.scanCode({
            onlyFromCamera: true,
            success: (res) => {
              if (res.scanType == 'QR_CODE') {
                var selemite = res.result.indexOf("?");
                var params = res.result.substring(selemite, res.result.length);

                params = '/pages/forscreen/forscreen' + params;
                wx.navigateTo({
                  url: params
                })
              } else if (res.scanType == 'WX_CODE') {
                wx.navigateTo({
                  url: '/' + res.path
                })
              }
            }
          })
        }
      }
    });
  },
  onLaunch: function() {
    var oss_tmp_key = this.globalData.oss_access_key_id;
    var oss_access_key_id = '';
    for (var n = 0; n < oss_tmp_key.length; n++) {
      if (n == 0 || n % 5 != 0) {
        oss_access_key_id += oss_tmp_key[n];
      }
    }
    this.globalData.oss_access_key_id = oss_access_key_id
    mta.App.init({
      "appID": "500700115",
      "eventID": "500704113",
      "autoReport": true,
      "statParam": true,
      "ignoreParams": [],
      "statPullDownFresh": true,
      "statShareApp": true,
      "statReachBottom": true
    });
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function(res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function() {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function(res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function() {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
    var that = this
    wx.login({
      success: res => {
        var code = res.code; //返回code
        wx.request({
          url: that.globalData.api_url + '/smallapp/index/getOpenid',
          data: {
            "code": code
          },
          header: {
            'content-type': 'application/json'
          },
          success: function(res) {
            that.globalData.openid = res.data.result.openid;
            that.globalData.session_key = res.data.result.session_key;
            if (that.openidCallback) {

              that.openidCallback(res.data.result.openid);
            }
          }
        })
      }
    })
    wx.getSystemInfo({
      success: function(res) {
        that.globalData.mobile_brand = res.brand;
        that.globalData.mobile_model = res.model;
      }
    })
  },
  onShow: function(options) {
    var app = this;
    wx.getSystemInfo({
      success: function(res) {
        app.globalData.statusBarHeight = res.statusBarHeight;
        app.SystemInfo = {
          SDKVersion: res.SDKVersion,
          batteryLevel: res.batteryLevel,
          brand: res.brand,
          errMsg: res.errMsg,
          fontSizeSetting: res.fontSizeSetting,
          language: res.language,
          model: res.model,
          pixelRatio: res.pixelRatio,
          platform: res.platform,
          statusBarHeight: res.statusBarHeight,
          system: res.system,
          version: res.version,
          safeArea: res.safeArea,
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
          window: {
            width: res.windowWidth,
            height: res.windowHeight
          },
          screenWidth: res.screenWidth,
          screenHeight: res.screenHeight,
          screen: {
            width: res.screenWidth,
            height: res.screenHeight
          },
          screenBottomSpace: (res.screenHeight - res.safeArea.bottom),
          documentWidth: res.safeArea.width,
          documentHeight: res.safeArea.bottom - res.statusBarHeight
        };
      }
    })
  },
  checkMobile: function(mobile) {

    var myreg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(19[0-9]{1}))+\d{8})$/;
    if (mobile.length == 0) {

      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 2000
      })
      return false;
    } else if (mobile.length < 11) {
      wx.showToast({
        title: '手机号长度有误！',
        icon: 'none',
        duration: 2000
      })
      return false;
    } else if (!myreg.test(mobile)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    return true;
  },
  compareVersion:function (v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    const len = Math.max(v1.length, v2.length)

    while(v1.length <len) {
        v1.push('0')
      }
    while(v2.length <len) {
        v2.push('0')
      }

    for(let i = 0; i<len; i++) {
      const num1 = parseInt(v1[i])
      const num2 = parseInt(v2[i])

      if (num1 > num2) {
        return 1
      } else if (num1 < num2) {
        return -1
      }
    }

    return 0
  },
  in_array:function(stringToSearch, arrayToSearch,keys='') {
    for(var s = 0; s<arrayToSearch.length; s++) {
      if(keys!=''){
        var thisEntry = arrayToSearch[s][keys].toString();
      }else {
        var thisEntry = arrayToSearch[s].toString();
      }
      
      if (thisEntry == stringToSearch) {
        return true;
      }
   }
    return false;
  },

  linkHotelWifi:function(hotel_info,that){
    var aps = this;
    
    var is_minimal = wx.getStorageSync(aps.globalData.cache_key + 'is_minimal');//是否扫码标准版
    var room_ssid = hotel_info.wifi_name;
    if (typeof (is_minimal) == 'undefined' || is_minimal == '') {//非极简版
      if (hotel_info.forscreen_type == 2) {//后台推荐用极简版
        aps.jugeLinkType(hotel_info,that);

        
      } else {//后台推荐用标准版 
        //不做任何改变
        aps.globalData.link_type = 1;
        that.setData({
          link_type: 1,
          wifiErr: { 'is_open': 0, 'msg': '', 'confirm': '确定', 'calcle': '取消', 'type': 0 },
        })
      }

    } else {//扫极简版
      aps.jugeLinkType(hotel_info, that);
    }
  },
  jugeLinkType: function (hotel_info,that){
    var aps = this;
    //第一步  判断客户端基础库版本
    var sdk_version = aps.globalData.sys_info.SDKVersion;
    if (aps.compareVersion(sdk_version, aps.globalData.min_sdk_version) >= 0) {
      //客户端基础库版本 支持链接wifi
      var wifi_name = hotel_info.wifi_name;
      var wifi_mac = hotel_info.wifi_mac;
      var use_wifi_password = hotel_info.wifi_password;
      var box_mac = hotel_info.box_mac
      if(hotel_info.wifi_name!=''){
        //第二步  判断当前连接的wifi是否为当前包间wifi
        that.setData({
          wifi_hidden: false,
        })
        wx.startWifi({
          success: function (res) {
            wx.getConnectedWifi({
              success: function (res) {
                if (res.errMsg == 'getConnectedWifi:ok') {
                  if (res.wifi.SSID == wifi_name) {//链接的是本包间wifi
                    wx.stopWifi({
                      
                    })
                    if (aps.wifiOkCallback) {

                      aps.wifiOkCallback(1);
                    }
                    that.setData({
                      link_type: 2,
                      wifiErr: { 'is_open': 0, 'msg': '', 'confirm': '确定', 'calcle': '取消', 'type': 0 }
                    })
                    aps.globalData.link_type = 2;
                    that.setData({
                      wifi_hidden: true,
                    })
                    wx.hideLoading()
                  } else {//链接的不是本包间wifi
                    wx.stopWifi({

                    })
                    aps.connectWifi(wifi_name, wifi_mac, use_wifi_password, box_mac, that);

                  }
                } else {
                  //当前打开wifi 但是没有链接任何wifi
                  wx.stopWifi({

                  })
                  aps.connectWifi(wifi_name, wifi_mac, use_wifi_password, box_mac, that);
                }
                wx.hideLoading()
              }, fail: function (res) {
                wx.hideLoading()
                that.setData({
                  wifi_hidden: true,
                })
                if (res.errCode == 12005) { //安卓特有  未打开wifi
                  that.setData({
                    wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要打开您手机的wifi,链接wifi投屏更快哦！', 'confirm': '确定', 'calcle': '取消', 'type': 1 }
                  })
                } else if (res.errCode == 12006) {
                  that.setData({
                    wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要打开您手机的GPS定位,链接wifi投屏更快哦！', 'confirm': '确定', 'calcle': '取消', 'type': 2 }
                  })
                } else if (res.errMsg == 'getConnectedWifi:fail:currentWifi is null') {
                  that.setData({
                    wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
                  })
                }
                else if (res.errMsg == 'getConnectedWifi:fail no wifi is connected.') {
                  that.setData({
                    wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要打开您手机的wifi,链接wifi投屏更快哦！', 'confirm': '确定', 'calcle': '取消', 'type': 1 }
                  })
                } else if (res.errMsg == 'getConnectedWifi:fail:not invoke startWifi') {

                } else if (res.errMsg == 'connectWifi:fail:duplicated request') {
                  that.setData({
                    wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要打开您手机的wifi,链接wifi投屏更快哦！', 'confirm': '确定', 'calcle': '取消', 'type': 1 }
                  })
                  wx.showToast({
                    title: 'wifi链接失败',
                  })
                }
                else {
                  if (hotel_info.wifi_password == '') {
                    var us_wifi_password = '空';
                  } else {
                    var us_wifi_password = hotel_info.wifi_password;
                  }
                  var msg = '请连接wifi:' + hotel_info.wifi_name + ',密码为' + us_wifi_password;
                  that.setData({
                    wifiErr: { 'is_open': 1, 'msg': msg, 'confirm': '重试', 'type': 4 }
                  })
                }

                var err_info = JSON.stringify(res);
                wx.request({
                  url: aps.globalData.api_url + '/Smallappsimple/Index/recordWifiErr',
                  data: {
                    err_info: err_info,
                    box_mac: hotel_info.box_mac
                  }
                })
                wx.stopWifi({

                })
              },
            })
          }, fail: function (res) {
            //未获取成功 重试弹窗
            wx.hideLoading()
            that.setData({
              wifi_hidden: true,
            })
            wx.stopWifi({

            })
          }, complete: function (res) {
            wx.stopWifi({

            })
          }
        })
      }else {
        that.setData({
          wifiErr: { 'is_open': 1, 'msg': '亲，该包间电视暂不能投屏，请更换其他包间', 'confirm': '我知道了', 'type': 5 }
        })
      }
      
    } else {//客户端基础库版本不支持链接wifi 直接使用标准版
      that.setData({
        link_type: 1,
        wifiErr: { 'is_open': 1, 'msg': '当前微信版本过低,升级后才能使用本小程序', 'confirm': '我知道了', 'calcle': '', 'type': 5 },
      })
    }
  },
  connectWifi: function (wifi_name, wifi_mac, use_wifi_password, box_mac, that) {
    var aps = this;
    
    wx.startWifi({
      success: function (res) {
        /*wx.showLoading({
          title: 'wifi链接中',
        })*/
        wx.connectWifi({
          SSID: wifi_name,
          BSSID: wifi_mac,
          password: use_wifi_password,
          success: function (reswifi) {
            if (aps.wifiOkCallback) {

              aps.wifiOkCallback(1);
            }
            that.setData({
              wifiErr: { 'is_open': 0, 'msg': '', 'confirm': '确定', 'calcle': '取消', 'type': 0 }
            })

            that.setData({ 
              wifiErr: { 'is_open': 0, 'msg': '', 'confirm': '确定', 'calcle': '取消', 'type': 0 }, 
              link_type: 2 
              },() => {
              that.setData({
                wifi_hidden: true,
              })
              aps.globalData.link_type = 2;

              wx.showToast({
                title: 'wifi链接成功',
                icon: 'success',
                duration: 2000
              });
              
              wx.hideLoading()
            })

            that.setData({
              wifi_hidden: true,
            })
            aps.globalData.link_type = 2;

            wx.showToast({
              title: 'wifi链接成功',
              icon: 'success',
              duration: 2000
            });

            wx.hideLoading()


            
          }, fail: function (res) {
            that.setData({
              wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
            })
            wx.hideLoading();
            that.setData({
              wifi_hidden: true,
            })
            var err_info = JSON.stringify(res);
            wx.request({
              url: aps.globalData.api_url +'/Smallappsimple/Index/recordWifiErr',
              data: {
                err_info: err_info,
                box_mac: box_mac
              }
            })
          }, complete: function (res) {
            wx.hideLoading()
            that.setData({
              wifi_hidden: true,
            })
            wx.stopWifi({

            })
          }
        })
      },fail:function(){
        that.setData({
          wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
        })
        wx.hideLoading()
        that.setData({
          wifi_hidden: true,
        })
        wx.stopWifi({

        })
      },
      complete:function(){
        //wx.hideLoading();
      }
    })
    setTimeout(function () {
      wx.stopWifi({

      })
    }, 10000)
    
  },
  globalData: {
    openid: '',
    session_key: '',
    box_mac: '',
    mobile_brand: '',
    mobile_model: '',
    statusBarHeight: 0,
    rest_appid: 'wxc395eb4b44563af1',
    jijian_appid: 'wx7883a4327329a67c',
    jd_appid: 'wx91d27dbf599dff74',
    api_url: 'https://mobile.littlehotspot.com',
    oss_upload_url: 'https://image.littlehotspot.com',
    netty_url: 'https://netty-push.littlehotspot.com',
    oss_url: 'https://oss.littlehotspot.com',
    oss_bucket: 'redian-produce',
    oss_access_key_id: 'LTAITBjXOpORHKfXlOX',
    link_type:0,  //1:外网投屏  2：直连投屏
    sys_info: wx.getSystemInfoSync(),
    cache_key:'savor_',
    min_sdk_version:'1.6.0',
    wifiErr: { 'is_open': 0, 'msg': '','confirm':'确定','calcle':'取消','type':0 },
    hotel_info:{},
    optimize_data:[],    //优选列表
    public_list:[],      //我的公开
    collect_list:[],     //我的收藏 
    
    hotels:[],
  }
})