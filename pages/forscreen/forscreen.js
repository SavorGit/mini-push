// pages/forscreen/forscreen.js
const app = getApp();
var openid;                     //用户小程序唯一标识
var box_mac = '';               //机顶盒mac
var code_type ='';
var nowtime;
var api_url = app.globalData.api_url;
Page({
  /**
 * 页面的初始数据
 */
  data: { 
  },
  
  
  //进来加载页面：
  onLoad: function (options) {
    wx.request({
      url: api_url+'/smallapp21/index/getConfig',
      success: function (e) {
        wx.setStorage({
          key: 'savor_now_time',
          data: e.data.result,
        })
      }
    })
    var sysconfig = wx.getStorageSync("savor_now_time");
    nowtime = sysconfig.sys_time;
    
    if (typeof (options.scene) != 'undefined') {
      var scene = decodeURIComponent(options.scene);

      linkHotelBox(scene);

    }else if(typeof(options.s) !='undefined'){
      var s = options.s
      wx.request({
        url: api_url + '/Smallapp21/index/getQrcontent',
        headers: {
          'Content-Type': 'application/json'
        },
        data:{
          content: s
        },
        success:function(res){
          if(res.data.code==10000){
            var scene = res.data.result.content;
            linkHotelBox(scene);
          }else {
            /*wx.switchTab({
              url: '../index/index',
              success: function (e) {
                
                wx.showToast({
                  title: '二维码已过期',
                  icon: 'none',
                  duration: 2000
                });
              }
            });*/
            wx.reLaunch({
              url: '/pages/index/index',
            })
            wx.showToast({
              title: '二维码已过期',
              icon: 'none',
              duration: 2000
            });
          }
        }
      })
    } else if (typeof (options.q) !='undefined'){
      var q = decodeURIComponent(options.q);
      var selemite = q.indexOf("?");
      var pams = q.substring(selemite+3,q.length);
      wx.request({
        url: api_url + '/Smallapp21/index/getQrcontent',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          content: pams
        },
        success:function(res){
          if (res.data.code == 10000) {
            var scene = res.data.result.content;
            linkHotelBox(scene);
          }else {
            /*wx.switchTab({
              url: '../index/index',
              success: function (e) {
                wx.showToast({
                  title: '二维码已过期',
                  icon: 'none',
                  duration: 2000
                });
              }
            });*/
            wx.reLaunch({
              url: '/pages/index/index',
            })
            wx.showToast({
              title: '二维码已过期',
              icon: 'none',
              duration: 2000
            });
          }
        }
      })
    }
    function linkHotelBox(scene){
      var scene_arr = scene.split('_');
      box_mac = scene_arr[0];
      code_type = scene_arr[1];
      var jz_time = scene_arr[2];
      //console.log(scene_arr);
      //return false;
      var that = this
      wx.login({
        success: res => {
          var code = res.code; //返回code
          wx.request({
            url: api_url + '/smallapp/index/getOpenid',
            data: { "code": code },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {

              if (jz_time) {//判断二维码时间是否超过两个小时
                //var fztime = 7200000;
                var fztime = sysconfig.exp_time;
                var difftime = nowtime - jz_time;
                if (difftime > fztime) {
                  wx.request({
                    url: api_url + '/smallapp21/index/recOverQrcodeLog',
                    data: {
                      "openid": res.data.result.openid,
                      "box_mac": box_mac,
                      "type": code_type,
                      "is_overtime": 1
                    },
                    header: {
                      'content-type': 'application/json'
                    },
                  })
                  /*wx.switchTab({
                    url: '../index/index',
                    success: function (e) {
                      var page = getCurrentPages().pop();
                      if (page == undefined || page == null) return;
                      page.onLoad();
                      wx.showToast({
                        title: '小程序码已过期',
                        icon: 'none',
                        duration: 2000
                      });
                    }
                  });*/
                  wx.reLaunch({
                    url: '/pages/index/index',
                  })
                  wx.showToast({
                    title: '二维码已过期',
                    icon: 'none',
                    duration: 2000
                  });
                  return false;
                }
              }
              if (code_type == 7) {
                wx.request({
                  url: api_url + '/smallapp3/index/recodeQrcodeLog',
                  data: {
                    openid: res.data.result.openid,
                    type: 7
                  },
                  success: function (rts) {
                    wx.reLaunch({
                      url: '../index/index',
                    })
                  }, fail: function (rts) {
                    wx.reLaunch({
                      url: '../index/index',
                    })
                  }
                })
              } else {
                wx.request({
                  url: api_url + '/smallapp21/index/isHaveCallBox',
                  data: { "openid": res.data.result.openid },
                  header: {
                    'content-type': 'application/json'
                  },
                  success: function (rets) {
                    if (rets.data.result.is_have == 1) {
                      wx.reLaunch({
                        url: '../index/index',
                      })
                    }
                  }
                });
                setInfos(box_mac, res.data.result.openid, code_type);
              }
              //console.log(res.data.result.openid);
            }
          })
        }
      });
    }
    function setInfos(box_mac, openid,code_type) {
      //发送随机码给电视显示 (默认用户不用填写三位呼玛)
      wx.request({
        url: api_url+'/Smallapp21/Index/genCode',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
         'box_mac': box_mac,
         'openid' : openid,
         'type'   : code_type
        },
        method: "POST",
        success: function (res) {
          var timestamp = (new Date()).valueOf();
          var is_have = res.data.result.is_have;
          if (is_have == 0) {
            var code = res.data.result.code;
            wx.request({
              url: api_url+'/Netty/Index/index',
              headers: {
                'Content-Type': 'application/json'
              },
              method: "POST",
              data: {
                box_mac: box_mac,
                msg: '{"action":1,"code":' + code + ',"openid":"' + openid + '"}',
              },
              success:function(rt){
                if (rt.data.code != 10000) {
                  wx.showToast({
                    title: '该电视暂不能投屏',
                    icon: 'none',
                    duration: 2000
                  })
                } 
              }
            })
          } else if (is_have == 1) {
            wx.reLaunch({
              url: '../index/index',
            })
          }
        }
      })
    }
  },
})