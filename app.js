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
  boxShow(box_mac = '', forscreen_id, pubdetail, res_type, res_len, action, hotel_info, aps) {
    var that = this;

    if (box_mac == '') {
      this.scanQrcode();
    } else {
      var user_info = wx.getStorageSync("savor_user_info");
      that.tpst(box_mac, forscreen_id, pubdetail, res_type, res_len, action, hotel_info);
    }
  }, //电视播放结束
  tpst: function (box_mac = '', forscreen_id, pubdetail, res_type, res_len, action, hotel_info) {
    var that = this;
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
              }
            }
          })
        } else {
          that.tprc(box_mac, forscreen_id, pubdetail, res_type, res_len, action, hotel_info);
        }
      }
    });
  },
  tprc: function (box_mac = '', forscreen_id, pubdetail, res_type, res_len, action, hotel_info) {
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    var avatarUrl = user_info.avatarUrl;
    var nickName = user_info.nickName;
    var openid = user_info.openid;
    var forscreen_char = '';
    var mobile_brand = that.globalData.mobile_brand;
    var mobile_model = that.globalData.mobile_model;
    var serial_number = that.globalData.serial_number;
    var res_id = forscreen_id;
    var forscreen_id = (new Date()).valueOf();
    if(action==8){
      var title = '重投成功，电视即将播放';
    }else {
      var title = '点播成功,电视即将开始播放';
    }
    if (res_type == 1) {
      //图集
      forscreen_char = pubdetail[0].forscreen_char;
      var res_obj = [];
      var msg = { action: 10,  openid: openid, img_nums: res_len, forscreen_char: forscreen_char, forscreen_id: forscreen_id, avatarUrl: avatarUrl, nickName: nickName,serial_number:serial_number}
      for (var i = 0; i < pubdetail.length; i++) {
        var quality = '';
        var quality_type = 0;
        if(action==8){
          if(typeof(pubdetail[i].quality_type)!='undefind' && pubdetail[i].quality_type<=3){
            var qualityList = that.globalData.qualityList;
            for(let j in qualityList){
              if(pubdetail[i].quality_type== qualityList[j].value){
                quality = qualityList[j].quality;
                quality_type = qualityList[j].value;
                break;
              }
            }
            pubdetail[i].resource_size = 0;
          }
        }
        var order = i + 1;
        wx.request({ //start
          url: that.globalData.api_v_url + '/index/recordForScreenPics',
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
            is_share: 0,
            resource_type:1,
            quality_type:quality_type,
            serial_number:that.globalData.serial_number
          },success: function (ret) {

          }
        }); //end
        var url = pubdetail[i]['forscreen_url'] +quality;
        var filename = pubdetail[i]['filename'];
        var res_id = pubdetail[i]['res_id'];
        if(typeof(pubdetail[i]['resource_size'])!='undefined'){
          var resource_size = pubdetail[i]['resource_size'];
        }else {
          var resource_size = 0;
        }
        res_obj [i]= {url: url ,filename: filename ,order: order ,img_id:res_id,resource_size:resource_size };
      }
      msg.img_list = res_obj
      msg = JSON.stringify(msg)
      wx.request({
        url: that.globalData.api_url + '/Netty/Index/pushnetty',
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        data: {
          box_mac: box_mac,
          msg: msg
        },
        success: function (result) {
          
          wx.showToast({
            title: title,
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

    } else { //视频投屏
      for (var i = 0; i < res_len; i++) {
        if(typeof(pubdetail[i]['duration'])=='undefined' || pubdetail[i]['duration']==''){
          pubdetail[i]['duration'] = 0;
        }
        wx.request({
          url: that.globalData.api_v_url + '/index/recordForScreenPics',
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
            imgs: '["' + pubdetail[i]['forscreen_url'] + '"]',
            resource_id: pubdetail[i]['res_id'],
            res_sup_time: 0,
            res_eup_time: 0,
            resource_size: pubdetail[i]['resource_size'],
            is_pub_hotelinfo: 0,
            is_share: 0,
            forscreen_id: forscreen_id,
            duration: parseInt(pubdetail[i]['duration']),
            resource_type:2,
            serial_number:serial_number
          },
          success: function (ret) { }
        });
        if(action==5){
          var netty_action = 5
          var url = that.globalData.oss_url+"/"+pubdetail[i]['forscreen_url']
          var msg = '{ "action":'+netty_action+', "url": "' + url+ '", "filename":"' + pubdetail[i]['filename'] + '","openid":"' + openid + '","resource_type":2,"video_id":"' + pubdetail[i]['res_id'] + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '","forscreen_id":"' + forscreen_id + '","resource_size":"'+pubdetail[i]['resource_size']+'","serial_number":"'+serial_number+'"}';
        }else if(action ==13){
          var msg = {};
          msg.action = 13;
          msg.forscreen_id = forscreen_id;
          msg.goods_id = pubdetail[i].res_id;
          msg.qrcode_url = pubdetail[i].qrcode_url;
          msg.url      = pubdetail[i].forscreen_url;
          msg = JSON.stringify(msg)
        }else {
          var netty_action = 2
          var url = pubdetail[i]['forscreen_url']
          var msg = '{ "action":'+netty_action+', "url": "' + url+ '", "filename":"' + pubdetail[i]['filename'] + '","openid":"' + openid + '","resource_type":2,"video_id":"' + pubdetail[i]['res_id'] + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '","forscreen_id":"' + forscreen_id + '","resource_size":"'+pubdetail[i]['resource_size']+'","serial_number":"'+serial_number+'"}';
        }
        wx.request({
          url: that.globalData.api_url + '/Netty/Index/pushnetty',
          headers: {
            'Content-Type': 'application/json'
          },
          method: "POST",
          data: {
            box_mac: box_mac,
            msg: msg,
          },
          success: function (result) {
            wx.showToast({
              title: title,
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
  controlExitForscreen: function (openid, box_mac, hotel_info='', aps,is_back=0,showtost=1) {
    var that = this;
    var change_link_type = that.globalData.change_link_type;
    var forscreen_type = hotel_info.forscreen_type;
    var link_type = 1;
    if(change_link_type ==''){
      link_type = forscreen_type
    }else{
      link_type = change_link_type;
    }
    console.log(link_type+'link_type')
    if (link_type == 1 || hotel_info=='') {
      var timestamp = (new Date()).valueOf();
      wx.request({
        url: that.globalData.api_url + '/Netty/Index/pushnetty',
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        data: {
          box_mac: box_mac,
          msg: '{ "action": 3,"openid":"' + openid + '"}',
        },
        success: function (res) {
          if(is_back!=0){
            wx.navigateBack({
              delta: 1,
            })
          }
          if(showtost==1){
            wx.showToast({
              title: '退出成功',
              icon: 'none',
              duration: 2000
            });
          } 
          
        },
        fail: function (res) {
          if(showtost==1){
            wx.showToast({
              title: '网络异常，退出失败',
              icon: 'none',
              duration: 2000
            })
          }
          
        }
      })
    } else if (link_type == 2) {
      wx.request({
        url: "http://" + hotel_info.intranet_ip + ":8080/h5/stop?deviceId=" + openid + "&box_mac=" + box_mac + "&web=true",
        success: function (res) {
          if (res.data.code == 10000) {
            if(is_back!=0){
              wx.navigateBack({
                delta: 1,
              })
            }
            if(showtost==1){
              wx.showToast({
                title: '退出成功',
                icon: 'none',
                duration: 2000
              });
            }
            
          }else {
            if(showtost==1){
              wx.showToast({
                title: '退出失败',
                icon: 'none',
                duration: 2000
              });
            }
            
          }
        },
        fail: function ({ errMsg }) {
          if(showtost==1){
            wx.showToast({
              title: '退出失败',
              icon: 'none',
              duration: 2000
            });
          }
          
        },
      })
    }
    mta.Event.stat("controlexitforscreen", {})
  }, //退出投屏结束
  //遥控器呼玛
  controlCallQrcode: function (openid, box_mac, qrcode_img, hotel_info='', aps) {
    var that = this;
    if (box_mac) {
      var change_link_type = that.globalData.change_link_type;
      var forscreen_type = hotel_info.forscreen_type;
      var link_type = 1;
      if(change_link_type ==''){
        link_type = forscreen_type
      }else{
        link_type = change_link_type;
      }
      if(link_type==1 || hotel_info==''){
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
                      url: that.globalData.api_url + '/Netty/Index/pushnetty',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      method: "POST",
                      data: {
                        box_mac: box_mac,
                        msg: '{ "action": 9,"url":"' + qrcode_url + '","openid":"'+openid+'","forscreen_id":"'+timestamp+'","serial_number":"'+that.globalData.serial_number+'"}',
                      },
                      success: function () {
                        /*wx.showToast({
                          title: '呼玛成功，电视即将展示',
                          icon: 'none',
                          duration: 2000
                        });*/
                        wx.request({
                          url: that.globalData.api_v_url + '/index/recordForScreenPics',
                          header: {
                            'content-type': 'application/json'
                          },
                          data: {
                            forscreen_id:timestamp,
                            openid: openid,
                            box_mac: box_mac,
                            action: 9,
                            mobile_brand: mobile_brand,
                            mobile_model: mobile_model,
                            imgs: '[]',
                            serial_number:that.globalData.serial_number
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
                url: that.globalData.api_url + '/Netty/Index/pushnetty',
                headers: {
                  'Content-Type': 'application/json'
                },
                method: "POST",
                data: {
                  box_mac: box_mac,
                  msg: '{ "action": 9,"url":"' + qrcode_url + '","openid":"'+openid+'","forscreen_id":"'+timestamp+'","serial_number":"'+that.globalData.serial_number+'"}',
                },
                success: function () {
                  /*wx.showToast({
                    title: '呼玛成功，电视即将展示',
                    icon: 'none',
                    duration: 2000
                  });*/
                  wx.request({
                    url: that.globalData.api_v_url + '/index/recordForScreenPics',
                    header: {
                      'content-type': 'application/json'
                    },
                    data: {
                      forscreen_id:timestamp,
                      openid: openid,
                      box_mac: box_mac,
                      action: 9,
                      mobile_brand: mobile_brand,
                      mobile_model: mobile_model,
                      imgs: '[]',
                      serial_number:that.globalData.serial_number
                    },
                  })
                }
              })
            }
          }
        })
      }else {
        wx.request({
          url: "http://" + hotel_info.intranet_ip + ":8080/showMiniProgramCode?deviceId=" + openid + "&box_mac=" + box_mac + "&web=true&serial_number="+that.globalData.serial_number,
          success: function (res) {
            if (res.data.code == 10000) {
              wx.showToast({
                title: '呼码成功',
                icon: 'none',
                duration: 2000
              });
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
            
          },
        })
      }
    }
    mta.Event.stat("controlcallqrcode", {})
  },
  //遥控器控制音量
  controlChangeVolume: function (openid, box_mac, change_type, hotel_info='', aps) {
    var that = this;
    var change_link_type = that.globalData.change_link_type;
    var forscreen_type = hotel_info.forscreen_type;
    var link_type = 1;
    if(change_link_type ==''){
      link_type = forscreen_type
    }else{
      link_type = change_link_type;
    }
    if (link_type == 1 || hotel_info=='') {
      wx.request({
        url: that.globalData.api_url + '/Netty/Index/pushnetty',
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        data: {
          box_mac: box_mac,
          msg: '{"action":31,"change_type":' + change_type + '}',
        },
      })
    } else if (link_type == 2) {
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
        url: "http://" + hotel_info.intranet_ip + ":8080/volume?action=" + change_type + "&deviceId=" + openid + "&box_mac=" + box_mac + "&projectId=" + timestamp + "&web=true&serial_number="+that.globalData.serial_number,
        success: function (res) {
          if (res.data.code == 10000) {
            wx.showToast({
              title: change_type_name + '成功',
              icon: 'none',
              duration: 2000
            })
          } else {
            wx.showToast({
              title: '投屏过程中才可控制音量',
              icon: 'none',
              duration: 2000
            })
          }
        }, fail: function () {
          wx.showToast({
            title: '投屏过程中才可控制音量',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
    if (change_type == 3) {
      change_type = 1;
    }
    if (change_type == 4) {
      change_type = 2;
    }
    mta.Event.stat('controlChangeVolume', { 'changetype': change_type })
  },
  //遥控控制节目
  controlChangeProgram: function (openid, box_mac, change_type, hotel_info='', aps) {
    var that = this;
    var change_link_type = that.globalData.change_link_type;
    var forscreen_type = hotel_info.forscreen_type;
    var link_type = 1;
    if(change_link_type ==''){
      link_type = forscreen_type
    }else{
      link_type = change_link_type;
    }
    if (link_type == 1 || hotel_info=='') {

      wx.request({
        url: that.globalData.api_url + '/Netty/Index/pushnetty',
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        data: {
          box_mac: box_mac,
          msg: '{"action":32,"change_type":' + change_type + '}',
        },
      })
    } else if (link_type == 2) {
      var timestamp = (new Date()).valueOf();
      wx.request({
        url: "http://" + hotel_info.intranet_ip + ":8080/switchProgram?action=" + change_type + "&deviceId=" + openid + "&box_mac=" + box_mac + "&projectId=" + timestamp + "&web=true&serial_number="+that.globalData.serial_number,
        success: function (res) {

          if (res.data.code == 10000) {
            wx.showToast({
              title: '切换成功',
              icon: 'none',
              duration: 2000
            })
          } else if (res.data.code == 1001) {
            wx.showToast({
              title: '切换失败',
              icon: 'none',
              duration: 2000
            })
          } else {
            wx.showToast({
              title: '电视投屏中，切换无效',
              icon: 'none',
              duration: 2000
            })
          }
        }, fail: function () {
          
        }
      })
    }
    mta.Event.stat('controlChangePro', { 'changetype': change_type })
  },
  //扫码
  scanQrcode: function (pageid = 1) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: "您可扫码链接\n热点合作餐厅电视使用此功能",
      showCancel: true,
      confirmText: '立即扫码',
      success: function (res) {
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
          let pages = getCurrentPages();
          let currPage = null;
          if (pages.length) {
            currPage = pages[pages.length - 1];
          }
          mta.Event.stat('scanQrcode', { 'scantype': 1, 'url': currPage.__route__ })
        } else {
          let pages = getCurrentPages();
          let currPage = null;
          if (pages.length) {
            currPage = pages[pages.length - 1];
          }
          mta.Event.stat('scanQrcode', { 'scantype': 0, 'url': currPage.__route__ })
        }
      }
    });

    let pages = getCurrentPages();
    let currPage = null;
    if (pages.length) {
      currPage = pages[pages.length - 1];
    }
    mta.Event.stat('popScanQrcode', { 'url': currPage.__route__ })
  },
  onLaunch: function () {
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
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
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
          success: function (res) {
            if(res.data.code==10000){
              that.globalData.openid = res.data.result.openid;
              that.globalData.session_key = res.data.result.session_key;
              that.globalData.Official_article_url = res.data.result.official_account_article_url
              if (that.openidCallback) {
                if(that.globalData.serial_number==''){
                  that.globalData.serial_number = that.globalData.not_link_box_pre+res.data.result.openid+'_'+(new Date()).valueOf();
                }
                that.openidCallback(res.data.result.openid);
              }
            }else {
              wx.reLaunch({
                url: '/pages/index/index',
              })
            }
            
          },fail:function(){
            wx.reLaunch({
              url: '/pages/index/index',
            })
          }
        })
      }
    })
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.mobile_brand = res.brand;
        that.globalData.mobile_model = res.model;
      }
    })
  },
  onShow: function (options) {
    var app = this;
    wx.getSystemInfo({
      success: function (res) {
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
  onHide: function (e) {
    let pages = getCurrentPages();
    let currPage = null;
    if (pages.length) {
      currPage = pages[pages.length - 1];
    }
    mta.Event.stat('onAppHide', { 'url': currPage.__route__ })
  },
  goToBack: function (params = 0) {
    let pages = getCurrentPages();
    let currPage = null;
    if (pages.length) {
      currPage = pages[pages.length - 1];
    }
    mta.Event.stat('goToBack', { 'url': currPage.__route__, 'params': params })
  },
  checkMobile: function (mobile) {

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
  //乘法
  accMul: function (arg1, arg2){
    var m = 0,
      s1 = arg1.toString(),
      s2 = arg2.toString();
    try { m += s1.split(".")[1].length } catch (e) { }
    try { m += s2.split(".")[1].length } catch (e) { }
    return  Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
  },
  //加法
  plus:function (num1, num2) {
    const num1Digits = (num1.toString().split('.')[1] || '').length;
    const num2Digits = (num2.toString().split('.')[1] || '').length;
    const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
    return (num1 * baseNum + num2 * baseNum) / baseNum;
  },
  //减法
  accSubtr:function(arg1, arg2) {
    var r1, r2, m, n;
    try { r1 = arg1.toString().split(".")[1].length } catch(e) { r1 = 0 }
    try { r2 = arg2.toString().split(".")[1].length } catch(e) { r2 = 0 }
    m = Math.pow(10, Math.max(r1, r2));
    //动态控制精度长度
    n = (r1 >= r2) ? r1 : r2;
    return((arg1 * m - arg2 * m) / m); //.toFixed(n)
},
changeKb:function (limit){
  var size = "";
  var unit = "";
  if(limit < 1 * 1024){                            //小于1KB，则转化成B
      size = limit.toFixed(2) 
      unit = "B"
  }else if(limit < 1 * 1024 * 1024){            //小于1MB，则转化成KB
      size = (limit/1024).toFixed(2) 
      unit = "K";
  }else if(limit < 1 * 1024 * 1024 * 1024){        //小于1GB，则转化成MB
      size = (limit/(1024 * 1024)).toFixed(2) 
      unit = "M";
  }else{                                            //其他转化成GB
      size = (limit/(1024 * 1024 * 1024)).toFixed(2) 
      unit = "G";
  }

  var sizeStr = size + "";                        //转成字符串
  var index = sizeStr.indexOf(".");                    //获取小数点处的索引
  var dou = sizeStr.substr(index + 1 ,2)            //获取小数点后两位的值
  if(dou == "00"){                                //判断后两位是否为00，如果是则删除00
      return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
  }
  if(limit < 1 * 1024 * 1024){
    size = parseInt(size)
  }else if(limit>=10*1024*1024){
    size = parseInt(size);
  }

  return size+unit;
},
  compareVersion: function (v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    const len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
      v1.push('0')
    }
    while (v2.length < len) {
      v2.push('0')
    }

    for (let i = 0; i < len; i++) {
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
  in_array: function (stringToSearch, arrayToSearch, keys = '') {
    for (var s = 0; s < arrayToSearch.length; s++) {
      if (keys != '') {
        var thisEntry = arrayToSearch[s][keys].toString();
      } else {
        var thisEntry = arrayToSearch[s].toString();
      }

      if (thisEntry == stringToSearch) {
        return true;
      }
    }
    return false;
  },

  linkHotelWifi: function (hotel_info, that,launchType = '') {
    var aps = this;
    var is_minimal = wx.getStorageSync(aps.globalData.cache_key + 'is_minimal');//是否扫码标准版
    var room_ssid = hotel_info.wifi_name;
    if (typeof (is_minimal) == 'undefined' || is_minimal == '') {//非极简版
      if (hotel_info.forscreen_type == 2 ) {//后台推荐用极简版
        aps.jugeLinkType(hotel_info, that,launchType);

        mta.Event.stat('linkMode', { 'linktype': '2' })
      } else {//后台推荐用标准版 
        //不做任何改变
        aps.globalData.link_type = 1;
        that.setData({
          link_type: 1,
          wifiErr: { 'is_open': 0, 'msg': '', 'confirm': '确定', 'calcle': '取消', 'type': 0 },
        })
      }
      mta.Event.stat('linkMode', { 'linktype': '1' })
    } else {//扫极简版
      aps.jugeLinkType(hotel_info, that,launchType);
      mta.Event.stat('linkMode', { 'linktype': '2' })
    }
  },
  jugeLinkType: function (hotel_info, that,launchType) {
    var aps = this;
    //第一步  判断客户端基础库版本
    var sdk_version = aps.globalData.sys_info.SDKVersion;
    if (aps.compareVersion(sdk_version, aps.globalData.min_sdk_version) >= 0) {
      //客户端基础库版本 支持链接wifi
      var wifi_name = hotel_info.wifi_name;
      var wifi_mac = hotel_info.wifi_mac;
      var use_wifi_password = hotel_info.wifi_password;
      var box_mac = hotel_info.box_mac
      if (hotel_info.wifi_name != '') {
        //第二步  判断当前连接的wifi是否为当前包间wifi
        
        wx.startWifi({
          success: function (res) {
            wx.getConnectedWifi({
              success: function (res) {
                console.log(res)
                if (res.errMsg == 'getConnectedWifi:ok') {
                  if (res.wifi.SSID == wifi_name) {//链接的是本包间wifi
                    wx.stopWifi({

                    })
                    // if (aps.wifiOkCallback) {

                    //   aps.wifiOkCallback(1);
                    // }
                    that.setData({
                      link_type: 2,
                      wifiErr: { 'is_open': 0, 'msg': '', 'confirm': '确定', 'calcle': '取消', 'type': 0 }
                    })
                    aps.globalData.link_type = 2;
                    that.setData({
                      wifi_hidden: true,
                    })
                    if(launchType!=''){
                      that.setData({
                        launchType:launchType
                      })
                      aps.globalData.change_link_type = 2;
                    }
                    //wx.hideLoading()
                  } else {//链接的不是本包间wifi
                    aps.connectWifi(wifi_name, wifi_mac, use_wifi_password, box_mac, that,launchType);
                  }
                } else {
                  //当前打开wifi 但是没有链接任何wifi
                  aps.connectWifi(wifi_name, wifi_mac, use_wifi_password, box_mac, that,launchType);
                  
                }
                //wx.hideLoading()
              }, fail: function (res) {
                var err_msg = 'wifi链接失败';
                if(res.errMsg == 'getConnectedWifi:fail:currentWifi is null' || res.errMsg=='getConnectedWifi:fail no wifi is connected.'){
                  aps.connectWifi(wifi_name, wifi_mac, use_wifi_password, box_mac, that,launchType);
                }else {
                  if (res.errCode == 12005) { //安卓特有  未打开wifi
                    err_msg = '请打开您的手机Wifi';
                    that.setData({
                      wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要打开您手机的wifi,连上wifi投屏更快哦！', 'confirm': '确定', 'calcle': '取消', 'type': 1 }
                    })
                  } else if (res.errCode == 12006) {//Android 特有，未打开 GPS 定位开关
                    err_msg = '请打开您的手机GPS';
                    that.setData({
                      wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要打开您手机的GPS定位,连上wifi投屏更快哦！', 'confirm': '确定', 'calcle': '取消', 'type': 2 }
                    })
                  } else if(res.errCode == 12007){//用户拒绝授权链接 Wi-Fi
                    that.setData({
                      wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,连上wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
                    })
                  }else if(res.errCode== 12010){
                    err_msg = '请确认并打开wifi';
                    /*that.setData({
                      wifiErr: { 'is_open': 1, 'msg': '请确认并打开wifi', 'confirm': '重试', 'calcle': '', 'type': 3 }
                    })*/
                  }else {
                    if (hotel_info.wifi_password == '') {
                      var us_wifi_password = '空';
                    } else {
                      var us_wifi_password = hotel_info.wifi_password;
                    }
                    var msg = '请手动连接包间wifi:' + hotel_info.wifi_name + ',密码为' + us_wifi_password+'。连上wifi投屏更快哦！';
                    that.setData({
                      wifiErr: { 'is_open': 1, 'msg': msg, 'confirm': '重试', 'type': 4 }
                    })
                  }
                  if(launchType!=''){
                    wx.showToast({
                      title: err_msg,
                      icon: 'none',
                      duration:5000
                    })
                  }
                  var err_info = JSON.stringify(res);
                  wx.request({
                    url: aps.globalData.api_v_url + '/datalog/recordWifiErr',
                    data: {
                      err_info: err_info,
                      box_mac: hotel_info.box_mac,
                      openid:aps.globalData.openid,
                      mobile_brand:aps.globalData.sys_info.brand,
                      mobile_model:aps.globalData.sys_info.model,
                      platform:aps.globalData.sys_info.platform,
                      version:aps.globalData.sys_info.version,
                      system:aps.globalData.sys_info.system
                    }
                  })
                  //wx.hideLoading()
                  that.setData({
                    wifi_hidden: true,
                  })
                  
                  wx.stopWifi({

                  })
                  mta.Event.stat('linkWifiErro', { 'wifierrocode': res.errCode, 'wifierromsg': res.errMsg })
                }
                mta.Event.stat('linkWifiErro', { 'wifierrocode': res.errCode, 'wifierromsg': res.errMsg })
              },
            })
          }, fail: function (res) {
            //未获取成功 重试弹窗
            //wx.hideLoading()
            that.setData({
              wifi_hidden: true,
            })
            
          }, complete: function (res) {

          }
        })
      } else {
        that.setData({
          wifiErr: { 'is_open': 1, 'msg': '亲，该包间电视暂不能投屏，请更换其他包间', 'confirm': '我知道了', 'type': 5 }
        })
        if(launchType!=''){
          wx.showToast({
            title: '该电视暂不支持极速投屏',
            icon:'none',
            duration:5000,
          })
        }
      }

    } else {//客户端基础库版本不支持链接wifi 直接使用标准版
      that.setData({
        link_type: 1,
        wifiErr: { 'is_open': 1, 'msg': '当前微信版本过低,升级后才能使用本小程序', 'confirm': '我知道了', 'calcle': '', 'type': 5 },
      })
      if(launchType!=''){
        wx.showToast({
          title: '微信版本过低！',
          icon:'none',
          duration:5000,
        })
      }
    }
  },
  connectWifi: function (wifi_name, wifi_mac, use_wifi_password, box_mac, that,launchType) {
    var aps = this;
    //if(aps.globalData.sys_info.platform=='ios'){
      that.setData({
       wifi_hidden: false,
      })
    //}
    
    wx.connectWifi({
      SSID: wifi_name,
      BSSID: wifi_mac,
      password: use_wifi_password,
      success: function (reswifi) {
        if(reswifi.errMsg=='connectWifi:ok' && typeof(reswifi.wifi)!='undefined'){
          that.setData({
            wifiErr: { 'is_open': 0, 'msg': '', 'confirm': '确定', 'calcle': '取消', 'type': 0 },
            link_type: 2
          })
          aps.globalData.link_type = 2;
          
          that.setData({
            launchType:'speed'
          })
          aps.globalData.change_link_type = 2;
          
          wx.showToast({
            title: 'wifi链接成功',
            icon: 'success',
            duration: 2000,
            mask:true,
          });
          that.setData({wifi_hidden:true})
        }else {
          wx.onWifiConnected((result) => {
            if(result.wifi.SSID==wifi_name){
              // if (aps.wifiOkCallback) {
  
              //   aps.wifiOkCallback(1);
              // }
              
              that.setData({
                wifiErr: { 'is_open': 0, 'msg': '', 'confirm': '确定', 'calcle': '取消', 'type': 0 },
                link_type: 2
              })
              aps.globalData.link_type = 2;
              
              that.setData({
                launchType:'speed'
              })
              aps.globalData.change_link_type = 2;
              
              wx.showToast({
                title: 'wifi链接成功',
                icon: 'success',
                duration: 2000,
                mask:true,
              });
              that.setData({wifi_hidden:true})
              
            }
            
          },()=>{
            that.setData({
              wifi_hidden: true,
            })
            wx.showToast({
              title: 'wifi链接失败',
              icon: 'success',
              duration: 2000
            });
          })
        }
        
        
      }, fail: function (res) {
        var err_msg = 'wifi链接失败';
        that.setData({
          wifi_hidden: true,
        })
        if(res.errCode==12000){

        }else {
          if (res.errCode == 12005) { //安卓特有  未打开wifi
            err_msg = '请打开您的手机Wifi';
            that.setData({
              wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要打开您手机的wifi,连上wifi投屏更快哦！', 'confirm': '确定', 'calcle': '取消', 'type': 1 }
            })
          } else if (res.errCode == 12006) {//Android 特有，未打开 GPS 定位开关
            err_msg = '请打开您的手机GPS';
            that.setData({
              wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要打开您手机的GPS定位,连上wifi投屏更快哦！', 'confirm': '确定', 'calcle': '取消', 'type': 2 }
            })
          } else if(res.errCode == 12007){//用户拒绝授权链接 Wi-Fi
            that.setData({
              wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,连上wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
            })
          }else if(res.errCode==12010){
            err_msg = '请确认并打开wifi';
            /*that.setData({
              wifiErr: { 'is_open': 1, 'msg': '请确认并打开wifi', 'confirm': '重试', 'calcle': '', 'type': 3 }
            })*/
          }else {
            if (use_wifi_password == '') {
              var wifi_password_str = '空';
            } else {
              var wifi_password_str = use_wifi_password;
            }
            var msg = '请手动连接包间wifi:' + wifi_name + ',密码为' + wifi_password_str+'。连上wifi投屏更快哦！';
            that.setData({
              wifiErr: { 'is_open': 1, 'msg': msg, 'confirm': '重试', 'type': 4 }
            })
          }
          if(launchType!=''){
            wx.showToast({
              title: err_msg,
              icon: 'none',
              duration:5000
            })
          }
          var err_info = JSON.stringify(res);
          wx.request({
            url: aps.globalData.api_v_url + '/datalog/recordWifiErr',
            data: {
              err_info: err_info,
              box_mac: box_mac,
              openid:aps.globalData.openid,
              mobile_brand:aps.globalData.sys_info.brand,
              mobile_model:aps.globalData.sys_info.model,
              platform:aps.globalData.sys_info.platform,
              version:aps.globalData.sys_info.version,
              system:aps.globalData.sys_info.system
            }
          })
        }
      }, complete: function (res) {
        
        
        
        //wx.hideLoading()
        
      }
    })
    

  },
  showToast: function (title, duration = 2000, icon = 'none', mask = 'false') {
    wx.showToast({
      title: title,
      icon: icon,
      duration: duration,
      mask: mask,
    })
  },
  sleep:function(delay) {
    var start = (new Date()).getTime();
    while ((new Date()).getTime() - start < delay) {
      continue;
    }
  },
  isInteger:function (obj) {
    return obj % 1 === 0
  },
  /**
   * 拨打订餐电话
   */
  phonecallevent: function (tel) {
    wx.makePhoneCall({
      phoneNumber: tel,
      success:function(e){
      },fail:function(e){
      }
    })
  },
  isRegister:function(openid,self,page_id =0,is_have_link=0){
    var that = this;
    var colose_official_account = wx.getStorageSync(that.globalData.cache_key+'colose_official_account');
    if(colose_official_account==1){
      self.setData({is_view_official_account:false})
    }else{
      wx.request({
        url: that.globalData.api_v_url+'/User/isRegister',
        data: {
          openid: openid,
          page_id:page_id,
          is_have_link:is_have_link,
        },success:function(res){
          if(res.data.code==10000){
            var user_info = res.data.result.userinfo;
            wx.setStorageSync(that.globalData.cache_key+'user_info', user_info);
            if(user_info.subscribe ==1){
              self.setData({
                is_view_official_account:false,
                use_time:user_info.use_time,
                showMsgToase:user_info.use_time.is_show
              })
              that.globalData.is_view_official_account = false
            }else {
              self.setData({
                use_time:user_info.use_time,
                showMsgToase:user_info.use_time.is_show,
                is_view_official_account:true,

              })
              that.globalData.is_view_official_account = true
            }
          }
        }
      })
    }
    
  },
  globalData: {
    openid: '',
    session_key: '',
    box_mac: '',
    mobile_brand: '',
    mobile_model: '',
    statusBarHeight: 0,
    jd_appid: 'wx91d27dbf599dff74',
    api_url: 'https://mobile.littlehotspot.com',
    api_v_url:'https://mobile.littlehotspot.com/Smallapp46',
    oss_upload_url: 'https://image.littlehotspot.com',
    netty_url: 'https:/netty-push.littlehotspot.com',
    oss_url: 'https://oss.littlehotspot.com',
    Official_account_url:'https://mobile.littlehotspot.com/h5/official/getuserinfo/p/',
    Official_article_url:'',
    oss_bucket: 'redian-produce',
    oss_access_key_id:'LTAI4SFjj1AsowpVFZNXOBCVqRHDs',
    link_type: 0,  //1:外网投屏  2：直连投屏
    sys_info: wx.getSystemInfoSync(),
    cache_key: 'savor_',
    min_sdk_version: '1.6.0',
    wifiErr: { 'is_open': 0, 'msg': '', 'confirm': '确定', 'calcle': '取消', 'type': 0 },
    hotel_info: {},       //链接酒楼电视的信息
    change_link_type :0,  //是否手动切换投屏方式 0:未切换 1：外网投屏 2:直连投屏

    not_link_box_pre:'N_',
    have_link_box_pre:'Y_',
    serial_number:'',
    is_view_official_account:false,
    qualityList:[],
    is_getjj_history:0,
  }
})