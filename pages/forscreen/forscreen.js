// pages/forscreen/forscreen.js
const app = getApp();
var openid;                     //用户小程序唯一标识
var box_mac = '';               //机顶盒mac
var page = 1;                    //当前节目单页数
var nowtime;
var api_url = app.globalData.api_url;
Page({
  /**
 * 页面的初始数据
 */
  data: {
    imgUrls: [
      {
        "image": 'http://oss.littlehotspot.com/WeChat/MiniProgram/LaunchScreen/source/images/ads/ad_child_box.jpg',
        "target": "miniProgram",
        "appId":"wx71cdc83866d4d28f",
        "path":"pages/details/index?item_uid=3164341_629776",
        "extraData":""
      },
      {
        "image": 'http://oss.littlehotspot.com/WeChat/MiniProgram/LaunchScreen/source/images/ads/ad_child_box_1.jpg',
        "target": "miniProgram",
        "appId": "wx71cdc83866d4d28f",
        "path": "pages/details/index?item_uid=3164341_629776",
        "extraData": ""
      },
      {
        "image": 'http://oss.littlehotspot.com/WeChat/MiniProgram/LaunchScreen/source/images/ads/ad_child_box_2.jpg',
        "target": "miniProgram",
        "appId": "wx71cdc83866d4d28f",
        "path": "pages/details/index?item_uid=3164341_629776",
        "extraData": ""
      },
    ],
    indicatorDots: true,  //是否显示面板指示点
    autoplay: true,      //是否自动切换
    interval: 3000,       //自动切换时间间隔
    duration: 1000,       //滑动动画时长
    inputShowed: false,
    inputVal: "",

    Length: 3,                    //输入框个数
    isFocus: false,               //聚焦
    Value: "",                    //输入的内容
    ispassword: false,            //是否密文显示 true为密文， false为明文。
    pwds:"",                      //呼玛三位数字
    showView: false,              //是否显示投屏选择图片
    showCode: false,              //显示填写验证码
    openid :'',
    box_mac:'',
    hotel_room:'',                //当前连接的酒楼以及版位名称
    program_list:[],              //当前盒子播放节目单
    hiddens:true,                 //下拉刷新加载中
    happy_vedio_url:'' ,          //生日视频url
    happy_vedio_name:'',          //生日视频名称
    happy_vedio_title:''          //生日视频标题
  },
  Focus(e) {//输入三维数字验证码
    var that = this;
    var inputValue = e.detail.value;
    that.setData({
      Value: inputValue,
    });

    var code_len = inputValue.length;
    if(code_len==3){

      wx.request({
        url: api_url+'/smallapp/index/checkcode',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          code: inputValue,
          box_mac: e.target.dataset.boxmac,
          openid: e.target.dataset.openid
        },
        success: function (res) {
          
          if (res.data.is_right == 0) {
            
            //刷新页面
          } else if (res.data.is_right == 1) {
            wx.showToast({
              title: '验证码输入错误，请重新输入',
              icon: 'none',
              duration: 2000
            }),
              that.setData({
                Length: 3,        //输入框个数
                isFocus: true,    //聚焦
                Value: "",        //输入的内容
                ispassword: false, //是否密文显示 true为密文， false为明文。  
                pwds: '',

              })
          } else if (res.data.is_right == 2) {
            /*that.setData({
              showView: (!that.data.showView),
              showCode: (!that.data.showCode),
              isFocus:false
            })*/
            /**wx.navigateBack({
              delta: 1
            })**/
            wx.switchTab({
              url: '../index/index',
              success: function (e) {
                var page = getCurrentPages().pop();
                if (page == undefined || page == null) return;
                page.onLoad();
              }
            })
          }

        },
        fial: function ({ errMsg }) {
          console.log('errMsg is', errMsg)
        }
      })
    } 
  },//输入三维数字验证码结束
  
  Tap() {
    var that = this;
    that.setData({
      isFocus: true,
    })
  },
  
  //跳转到另一个小程序
  jumpMimiPro:function(e){
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid  = e.currentTarget.dataset.openid;
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var forscreen_char = 'wx71cdc83866d4d28f:pages/details/index?item_uid=3164341_629776';
    wx.request({
      url: api_url+'/Smallapp/index/recordForScreenPics',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openid: openid,
        box_mac: box_mac,
        action: 6,
        mobile_brand: mobile_brand,
        mobile_model: mobile_model,
        forscreen_char: forscreen_char,
        imgs: '[]'
      },
    });
  },
  //进来加载页面：
  onLoad: function (options) {
    /*wx.request({
      url: api_url+'/systemtime.php',
      success:function(e){
        wx.setStorage({
          key: 'savor_now_time',
          data: e.data,
        })
      }
    })*/
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
    //console.log(sysconfig);
    //return false;
    //console.log(nowtime);
    //box_mac = decodeURIComponent(options.scene);
    nowtime = sysconfig.sys_time;
    if(typeof(options.q)=='undefined'){
      var scene = decodeURIComponent(options.scene);
      
    }else {
      var q = decodeURIComponent(options.q);
      var selemite = q.indexOf("?");
      var scene = q.substring(selemite+7, q.length);
    }
    var scene_arr = scene.split('_');
    box_mac = scene_arr[0];
    var code_type = scene_arr[1];
    var jz_time = scene_arr[2];
    //console.log(scene_arr);
    //return false;
    var that = this
    wx.login({
      success: res => {
        var code = res.code; //返回code
        wx.request({
          url: api_url+'/smallapp/index/getOpenid',
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
                  url: api_url+'/smallapp21/index/recOverQrcodeLog',
                  data: { "openid": res.data.result.openid,
                          "box_mac":box_mac,
                          "type":code_type,
                          "is_overtime":1 },
                  header: {
                    'content-type': 'application/json'
                  },
                })
                wx.switchTab({
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
                });
                return false;
              }
            }
            if (code_type==7){
              wx.request({
                url: api_url+'/smallapp3/index/recodeQrcodeLog',
                data:{
                  openid:res.data.result.openid,
                  type :7
                },
                success:function(rts){
                  wx.reLaunch({
                    url: '../index/index',
                  })
                },fail:function(rts){
                  wx.reLaunch({
                    url: '../index/index',
                  })
                }
              })
            }else {
              wx.request({
                url: api_url+'/smallapp21/index/isHaveCallBox',
                data: { "openid": res.data.result.openid },
                header: {
                  'content-type': 'application/json'
                },
                success: function (rets) {

                  if (rets.data.result.is_have == 1) {
                    /*wx.switchTab({
                      url: '../index/index',
                      success: function (e) {
                        var page = getCurrentPages().pop();
                        if (page == undefined || page == null) return;
                        page.onLoad();
                      }
                    });*/
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
    function setInfos(box_mac, openid) {
      that.setData({
        box_mac: box_mac,
        openid: openid
      });
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
            that.setData({
              isFocus: true,
              showCode: true,
              showView: false,
            })
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
            /*wx.switchTab({
              url: '../index/index',
              success: function (e) {
                var page = getCurrentPages().pop();
                if (page == undefined || page == null) return;
                page.onLoad();
              }
            });*/
            wx.reLaunch({
              url: '../index/index',
            })
          }
        }
      })
    }
  },
})