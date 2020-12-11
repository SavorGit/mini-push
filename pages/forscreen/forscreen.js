// pages/forscreen/forscreen.js
const app = getApp();
const utils = require('../../utils/util.js')
var mta = require('../../utils/mta_analysis.js')
var openid;                     //用户小程序唯一标识
var box_mac = '';               //机顶盒mac
var code_type ='';
var nowtime;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
Page({
  /**
 * 页面的初始数据
 */
  data: { 
  },
  
  
  //进来加载页面：
  onLoad: function (options) {
    utils.PostRequest(api_url+'/smallapp21/index/getConfig', {
    }, (data, headers, cookies, errMsg, statusCode) => {
      wx.setStorage({
        key: 'savor_now_time',
        data: data.result,
      })
    },res=>{},{ isShowLoading: false })
    wx.showToast({
      title: '扫码中，请稍后',
    })
    var sysconfig = wx.getStorageSync("savor_now_time");
    app.globalData.change_link_type = 0;
    nowtime = sysconfig.sys_time;
    wx.removeStorageSync(app.globalData.cache_key+'is_closeComment');
    
    if (typeof (options.scene) != 'undefined') {//小程序码
      var scene = decodeURIComponent(options.scene);

      linkHotelBox(scene);

    }else if(typeof(options.s) !='undefined'){//小程序内扫普通二维码
      var s = options.s
      utils.PostRequest(api_url + '/Smallapp21/index/getQrcontent', {
        content: s
      }, (data, headers, cookies, errMsg, statusCode) => {
        var scene = data.result.content;
        linkHotelBox(scene);
      },res=>{
        wx.reLaunch({
          url: '/pages/index/index',
        })
        wx.showToast({
          title: '二维码已过期',
          icon: 'none',
          duration: 2000
        });
      },{ isShowLoading: false })

      
    } else if (typeof (options.q) !='undefined'){//微信扫普通二维码
      var q = decodeURIComponent(options.q);
      var selemite = q.indexOf("?");
      var pams = q.substring(selemite+3,q.length);

      var pams_arr = pams.split('_');
      if (pams_arr[0] =='ag'){
        
        
        var box_mac = pams_arr[1];
        var code_type = pams_arr[2] ;

        if(code_type==22){//普通购物
          var goods_info = { "goods_id": pams_arr[3], "goods_box_mac": pams_arr[1], "uid": pams_arr[4]};
          var launch_url = '/pages/index/index';
          wx.setStorageSync('savor_goods_info', goods_info)
          var pass_time = pams_arr[4];
        }else if(code_type==23){//京东联盟购物
          var launch_url = '/pages/demand/goods_detail?goods_id=' + pams_arr[3] + '&goods_box_mac=' + pams_arr[1] + '&uid=' + pams_arr[4] + '&is_header=1&box_mac='+pams_arr[1];
          var pass_time = pams_arr[5];
        }
        var linck_box_info = box_mac + '_' + code_type + '_' + pass_time;
        linkSaleHotelBox(box_mac,code_type,pass_time)
        wx.reLaunch({
          url: launch_url,
        }) 
      }else {
        utils.PostRequest(api_url + '/Smallapp21/index/getQrcontent', {
          content: pams
        }, (data, headers, cookies, errMsg, statusCode) => {
          var scene = data.result.content;
          linkHotelBox(scene);
        },res=>{
          wx.reLaunch({
            url: '/pages/index/index',
          })
          wx.showToast({
            title: '二维码已过期',
            icon: 'none',
            duration: 2000
          });
        },{ isShowLoading: false })

        
      }
    } else if (typeof (options.g) != 'undefined'){ //小程序内部扫销售端商品活动码
      console.log(options.g)
      var g = options.g;
      var g_arr = g.split('_');
      var box_mac = g_arr[1];
      var code_type = g_arr[2];
      if(code_type==22){
        var goods_info = { "goods_id": g_arr[3], "goods_box_mac": g_arr[1], "uid": g_arr[4] }
        wx.setStorageSync('savor_goods_info', goods_info)
        var launch_url = '/pages/index/index';
        var pass_time = g_arr[4];
      }else if(code_type==23){
        var launch_url = '/pages/demand/goods_detail?goods_id=' + g_arr[3] + '&goods_box_mac=' + g_arr[1] + '&uid=' + g_arr[4] + '&is_header=1&box_mac='+g_arr[1];
        var pass_time = g_arr[5];
      }
      linkSaleHotelBox(box_mac, code_type, pass_time)
      wx.reLaunch({
        url: launch_url,
      })
    }else{
      wx.reLaunch({
        url: '/pages/index/index',
      })
    }
    function linkSaleHotelBox(box_mac,code_type,jz_time){
      wx.login({
        success: res => {
          var code = res.code; //返回code

          utils.PostRequest(api_url + '/smallapp/index/getOpenid', {
            "code": code
          }, (data, headers, cookies, errMsg, statusCode) => {
            app.globalData.openid = data.result.openid;
            app.globalData.session_key = data.result.session_key;
            var openid = data.result.openid
            if (jz_time) {//判断二维码时间是否超过两个小时
              //var fztime = 7200000;
              var fztime = sysconfig.exp_time;
              var difftime = nowtime - jz_time;
              if (difftime > fztime) {

                utils.PostRequest(api_url + '/smallapp21/index/recOverQrcodeLog', {
                  "openid": openid,
                  "box_mac": box_mac,
                  "type": code_type,
                  "is_overtime": 1
                }, (data, headers, cookies, errMsg, statusCode) => {

                },res=>{},{ isShowLoading: false })
                
                
              }else {

                utils.PostRequest(api_url + '/Smallapp21/Index/genCode', {
                  'box_mac': box_mac,
                  'openid': openid,
                  'type': code_type,
                  'mobile_brand':app.globalData.mobile_brand,
                  'mobile_model':app.globalData.mobile_model
                }, (data, headers, cookies, errMsg, statusCode) => {
                  app.globalData.serial_number = app.globalData.have_link_box_pre+ openid+'_'+(new Date()).valueOf();
                },res=>{},{ isShowLoading: false })

                
              }
            }
          },res=>{},{ isShowLoading: false })
        }
      });
    }
    function linkHotelBox(scene){
      console.log(scene);
      var scene_arr = scene.split('_');
      box_mac = scene_arr[0];
      code_type = scene_arr[1];
      var jz_time = scene_arr[2];
      if(typeof(scene_arr[3])!='undefined' && scene_arr[3]==2){
        wx.setStorageSync('savor_is_minimal', 1);
      }else {
        try {
          wx.removeStorageSync('savor_is_minimal')
        } catch (e) {
          // Do something when catch error
        }
      }
      var that = this
      wx.login({
        success: res => {
          var code = res.code; //返回code
          utils.PostRequest(api_url + '/smallapp/index/getOpenid', {
            "code": code
          }, (data, headers, cookies, errMsg, statusCode) => {
            app.globalData.openid = data.result.openid;
            app.globalData.session_key = data.result.session_key;
            var openid = data.result.openid
            if (jz_time) {//判断二维码时间是否超过两个小时
              //var fztime = 7200000;
              var fztime = sysconfig.exp_time;
              var difftime = nowtime - jz_time;
              if (difftime > fztime) {
                utils.PostRequest(api_url + '/smallapp21/index/recOverQrcodeLog', {
                  "openid": openid,
                  "box_mac": box_mac,
                  "type": code_type,
                  "is_overtime": 1
                }, (data, headers, cookies, errMsg, statusCode) => {

                },res=>{},{ isShowLoading: false })

                
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
            setInfos(box_mac, openid, code_type);

          },res=>{
            wx.reLaunch({
              url: '/pages/index/index',
            })
          },{ isShowLoading: false })
        }
      });
    }
    function setInfos(box_mac, openid,code_type) {
      //发送随机码给电视显示 (默认用户不用填写三位呼玛)
      utils.PostRequest(api_url+'/Smallapp21/Index/genCode', {
        'box_mac': box_mac,
        'openid' : openid,
        'type'   : code_type,
        'mobile_brand':app.globalData.mobile_brand,
        'mobile_model':app.globalData.mobile_model
      }, (data, headers, cookies, errMsg, statusCode) => {
        var timestamp = (new Date()).valueOf();
        var is_have = data.result.is_have;
        if (is_have == 0) {
          
          mta.Event.stat('scanQrcodeResult', { 'linktype': 0 })
        } else if (is_have == 1) {
          mta.Event.stat('scanQrcodeResult', { 'linktype': 1 })
        }
        app.globalData.serial_number = app.globalData.have_link_box_pre+openid+'_'+(new Date()).valueOf();
        if(code_type==31){
          wx.reLaunch({
            url: '/games/pages/activity/din_dash?openid='+openid+'&box_mac='+box_mac,
          })
        } else {
          wx.reLaunch({
            url: '../index/index',
          })
        }  
      },res=>{
        wx.reLaunch({
          url: '../index/index',
        })
      },{ isShowLoading: false })
      
    }
  },
})