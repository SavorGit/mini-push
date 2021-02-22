// pages/forscreen/forvideo/index.js
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp();
var tmp;
var openid;
var policy;
var signature;
var postf; //上传文件扩展名
var box_mac = '';
var forscreen_char = '';
var res_sup_time;
var page = 1;
var res_size;
var forscreen_history_list;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var oss_upload_url = app.globalData.oss_upload_url;
var oss_url = app.globalData.oss_url;
var pubdetail = [];
var upload_task;
var chunkSize       //每块post大小
var  maxConcurrency //并发量
var  limit_video_size //超过10M读文件写
var  tail_lenth    //尾部大小
var fm;
var max_video_size;         //极简投屏最大M数限制
var max_user_forvideo_size; //主干版超过XXM走极简投屏
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    showVedio: true,
    showRechoose: false,
    upload_vedio_temp: '',
    oss_video_url: '',
    duration: 0,
    //upload_vedio_img_temp:'',
    vedio_percent: 0,
    item: [{
        'name': '公开时显示餐厅信息',
        'value': '1',
        'checked': true,
        'disabled': false
      },
      {
        'name': '公开发表，公众可见',
        'value': '2',
        'checked': false,
        'disabled': false
      },

    ],
    is_pub_hotelinfo: 1, //是否公开酒楼信息
    is_share: 0, //是否分享到发现栏目
    //is_btn_disabel: true,

    is_classic_disabel:true,
    is_speed_disabel:true,
    avatarUrl: '',
    nickName: '',
    replay_video_url: '',
    is_replay_disabel: false,
    djs: 10,
    forscreen_history_list: '',
    hiddens: true, //上拉加载中,
    wifi_hidden:true,
    load_fresh_char: '',
    is_view_control: false,
    is_view_control: true,
    is_open_control: false,
    showGuidedMaskBeforLaunch: false,
    showGuidedMaskAfterLaunch: false,
    res_head_desc: '视频',
    compressed:true,  //默认压缩
    launchType:'classic',

    cancel_for:'',
    isOpenWind:false, //是否显示投屏状态弹窗
    // isWifi:是否显示WIFI连接提示  isError:是否显示错误信息 title 弹窗标题 step:步骤 progress:进度条 tip:正在投屏，请稍候 
    openWind:{'isWifi':false,'isError':false,'title':'','step':1,'progress':0,'tip':''}, 
    cutDownTime:'3', // 3S   倒计时
    DevOpsTips:'', //耗时23秒
    showModal_2:false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(e) {
    wx.hideShareMenu();
    var that = this
    fm = wx.getFileSystemManager()
    upload_task = {};
    that.getOssParam();//获取oss上传参数
    box_mac = e.box_mac;
    var openid = e.openid;
    var hotel_info = app.globalData.hotel_info;
    chunkSize = hotel_info.chunkSize;
    maxConcurrency = hotel_info.maxConcurrency;
    limit_video_size = hotel_info.limit_video_size;
    tail_lenth = hotel_info.tail_lenth;
    max_video_size = hotel_info.max_video_size;
    max_user_forvideo_size = hotel_info.max_user_forvideo_size;
    var user_info = wx.getStorageSync("savor_user_info");
    var avatarUrl = user_info.avatarUrl;
    var nickName = user_info.nickName;
    if(typeof(e.is_compress)!='undefined'){
      var is_compress = e.is_compress
    }else {
      var is_compress = 1
    }
    if(is_compress==1){
      var compressed = true;
    }else if(is_compress==0){
      var compressed = false;
    }
    that.setData({
      hotel_info:hotel_info,
      openid: openid,
      box_mac: box_mac,
      upload_vedio_temp: '',
      avatarUrl: avatarUrl,
      nickName: nickName,
      is_compress:is_compress,
      max_video_size:app.changeKb(max_video_size)
    })
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      compressed:compressed,
      success: function(res) {

        var filePath = res.tempFilePath
        var video_size = res.size;
        
        if(video_size>max_video_size && app.globalData.sys_info.platform=='ios'){
          
          that.setData({showModal_2:true,vide_size_str:app.changeKb(video_size)})
          
        }else {
          that.setData({
            showVedio: true,
            //is_btn_disabel: false,
            is_classic_disabel:false,
            is_speed_disabel:false,
            upload_vedio_temp: res.tempFilePath,
            duration: res.duration,
            size: video_size,
            vide_size_str:app.changeKb(video_size)
          });
          lead(openid);
          mta.Event.stat('LaunchVideoWithNet_Launch_ChooseVideo', {
            'status': 'success'
          });
        } 
      },
      fail: function(res) {
        if(res.errMsg=='chooseVideo:fail copy video file fail!'){
          wx.showModal({
            title:'选择视频文件失败',
            content:'小程序临时文件过大,请您选择小视频投屏或者手动删除小程序后重新扫码进入',
            showCancel:false,
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1,
                })
              }
            }
          })
        }else {
          wx.navigateBack({
            delta: 1,
          });
        }
        
        mta.Event.stat('LaunchVideoWithNet_Launch_ChooseVideo', {
          'status': 'fail'
        });
      }
    });
    //引导蒙层
    function lead(openid) {
      var user_info = wx.getStorageSync('savor_user_info');
      var guide_prompt = user_info.guide_prompt;
      if (typeof(guide_prompt) != 'undefined') {
        if (guide_prompt.length == 0) {
          that.setData({
            showGuidedMaskBeforLaunch: true,
          })
        } else {
          var is_lead = 1;
          for (var i = 0; i < guide_prompt.length; i++) {
            if (guide_prompt[i] == 3) {
              is_lead = 0;

              break;
            }
          }
          if (is_lead == 1) {
            that.setData({
              showGuidedMaskBeforLaunch: true,
            })
          }
        }
      }
    }
  },
  getOssParam:function(){
    var that = this;
    wx.request({
      url: api_v_url + '/Index/getOssParams',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function(rest) {
        policy = rest.data.policy;
        signature = rest.data.signature;
      }
    });
  },
  //点击经典投屏按钮
  classicForVideo:function(res){
    var that = this;
    var form_data = res;
    var box_mac = res.box_mac;
    var openid = res.openid;
    var video = res.video;
    var duration = res.duration;
    var avatarUrl = res.avatarUrl;
    var nickName = res.nickName;
    var is_pub_hotelinfo = res.is_pub_hotelinfo;
    var is_share = res.is_share;
    var public_text = res.public_text;
    var is_assist = 0;
    res_size = res.size;
    if (is_share == 1) {
      is_assist = 1;
    }
    var openWind = that.data.openWind;
    openWind.title = '您正在使用经典投屏';
    openWind.tip   = '视频正在处理中';

    that.setData({
      isOpenWind:true,
      openWind:openWind,
      //load_fresh_char: '亲^_^投屏中,请稍后...',
      //hiddens: false,
      //is_btn_disabel: true,
      //is_open_control: true,
      is_classic_disabel:true,
      is_speed_disabel:true,
      is_share: is_share,
      is_assist: is_assist
    })

    utils.PostRequest(api_v_url + '/User/isForscreenIng', {
      box_mac: box_mac
    }, (data, headers, cookies, errMsg, statusCode) => {
      var is_forscreen = data.result.is_forscreen;
      if (is_forscreen == 1) {
        wx.showModal({
          title: '确认要打断投屏',
          content: '当前电视正在进行投屏,继续投屏有可能打断当前投屏中的内容.',
          success: function(res) {
            if (res.confirm) {
              that.uploadOssVedio(policy, signature, video, box_mac, openid, is_pub_hotelinfo, is_share, duration, avatarUrl, nickName, public_text,form_data);
              if (public_text = '' || typeof (public_text) == 'undefined') {
                public_text = 0;
              } else {
                public_text = 1;
              }
              utils.tryCatch(mta.Event.stat('forscreenVedio', { 'ispublictext': public_text, 'ispublic': is_share, 'isforscreen': 1 }));
            } else if (res.cancel) {
              
              that.setData({
                isOpenWind:false,
                is_classic_disabel:false,
                is_speed_disabel:false,
              })
              if (public_text = '' || typeof (public_text) == 'undefined') {
                public_text = 0;
              } else {
                public_text = 1;
              }
              utils.tryCatch(mta.Event.stat('forscreenVedio', { 'ispublictext': public_text, 'ispublic': is_share, 'isforscreen': 0 }));
            }
          }
        })
        
      } else {
        that.uploadOssVedio(policy, signature, video, box_mac, openid, is_pub_hotelinfo, is_share, duration, avatarUrl, nickName, public_text,form_data);
        if (public_text = '' || typeof (public_text) == 'undefined') {
          public_text = 0;
        } else {
          public_text = 1;
        }
        utils.tryCatch(mta.Event.stat('forscreenVedio', { 'ispublictext': public_text, 'ispublic': is_share, 'isforscreen': 0 }));
      }
    },res=>{},{ isShowLoading: false })
    
  },
  uploadOssVedio:function (policy, signature, video, box_mac, openid, is_pub_hotelinfo, is_share, duration, avatarUrl, nickName, public_text,form_data) {
    var that = this;
    var filename = video; //视频url
    var index1 = filename.lastIndexOf(".");
    var index2 = filename.length;
    
    var postf_t = filename.substring(index1, index2); //后缀名
    var timestamp = (new Date()).valueOf();
    res_sup_time = timestamp;
    var timer_90 = setTimeout(function () {
      
      that.setData({
        showModal_3:true,
        isOpenWind:false,
      })
      //upload_task.abort();
      //that.speedForVideo(form_data,hotel_info,1)
    
    }, 10000);
    //第一步上传视频
    upload_task = wx.uploadFile({
      url: oss_upload_url,
      filePath: filename,
      name: 'file',

      formData: {
        Bucket: "redian-produce",
        name: filename,
        key: "forscreen/resource/" + timestamp + postf_t,
        policy: policy,
        OSSAccessKeyId: app.globalData.oss_access_key_id,
        sucess_action_status: "200",
        signature: signature
      },
      success: function(res) {
        that.setData({
          showModal_3:false,
        })
        clearTimeout(timer_90)
        that.videoPushNetty(timestamp,postf_t,box_mac,openid, is_pub_hotelinfo, is_share, duration, avatarUrl, nickName, public_text);
        
      }
    });
    
    
    upload_task.onProgressUpdate((res) => {
      var openWind = that.data.openWind;
      openWind.progress = res.progress
      that.setData({
        openWind:openWind,
        
      });
      if (res.progress == 100) {
        
      }
    });
  },
  videoPushNetty:function(timestamp,postf_t,box_mac,openid, is_pub_hotelinfo, is_share, duration, avatarUrl, nickName, public_text){
    //第二步正在投屏
    var that = this;
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var res_eup_time = (new Date()).valueOf();
    var openWind = that.data.openWind;
    openWind.step = 2;
    openWind.tip  = '正在投屏,请稍后';
    utils.PostRequest(api_url + '/Netty/Index/pushnetty', {
      box_mac: box_mac,
      msg: '{ "action":2, "url": "forscreen/resource/' + timestamp + postf_t + '", "filename":"' + timestamp + postf_t + '","openid":"' + openid + '","resource_type":2,"video_id":"' + timestamp + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '","forscreen_id":"' + timestamp + '","res_sup_time":"'+res_sup_time+'","res_eup_time":"'+res_eup_time+'","resource_size":'+res_size+',"serial_number":"'+app.globalData.serial_number+'"}',
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        openWind:openWind,
        showVedio: false,
        oss_video_url: oss_url + "/forscreen/resource/" + timestamp + postf_t,
        upload_vedio_temp: '',
        is_view_control: true,
        hiddens: true,
        is_open_control: false,
        forscreen_id: timestamp
      })
      //倒计时关闭窗口
      that.closeOpenWind();

      that.setData({
        upload_vedio_cover: oss_url + '/forscreen/resource/' + timestamp + postf_t + '?x-oss-process=video/snapshot,t_2000,f_jpg,w_450,m_fast',
      })
      utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
        openid: openid,
        box_mac: box_mac,
        action: 2,
        resource_type: 2,
        mobile_brand: mobile_brand,
        mobile_model: mobile_model,
        forscreen_char: forscreen_char,
        public_text: public_text,
        imgs: '["forscreen/resource/' + timestamp + postf_t + '"]',
        resource_id: timestamp,
        res_sup_time: res_sup_time,
        res_eup_time: res_eup_time,
        resource_size: res_size,
        is_pub_hotelinfo: is_pub_hotelinfo,
        is_share: is_share,
        forscreen_id: timestamp,
        duration: duration,
        res_nums: 1,
        serial_number:app.globalData.serial_number
      }, (data, headers, cookies, errMsg, statusCode) => {
        //获取历史投屏记录
        that.getHistoryList(openid,box_mac,page,0);
        
      },res=>{},{ isShowLoading: false })
    }, res_eup_time => {
      openWind.isError = true;
      openWind.tip     = '投屏失败';
      that.setData({
        openWind:openWind,
      })

    }, { isShowLoading: false })

    
    try {
      let consumeDuration = res_eup_time - timestamp;
      mta.Event.stat('LaunchVideoWithNet_Launching_OSSDuration', {
        'duration': Math.round(parseInt(consumeDuration) / 100) / 10
      });
    } catch (e) {
      //TODO nothing
    }
  },
  getHistoryList:function(openid,box_mac,page,is_speed= 0){
    
    var that = this;
    utils.PostRequest(api_v_url + '/ForscreenHistory/getList', {
      openid: openid,
      box_mac: box_mac,
      page: page,
      is_speed:is_speed,
    }, (data, headers, cookies, errMsg, statusCode) => {
      if(is_speed==0){//普通投屏
        var forscreen_history_list = data.result;

        if (JSON.stringify(forscreen_history_list) == "{}") {
          that.setData({
            forscreen_history_list: ''
          })
        } else {
          for(let i=forscreen_history_list.length-1; i>=0; i--){
            if(forscreen_history_list[i].is_speed == 1){
              forscreen_history_list.splice(i,1);
            }
          }
          that.setData({
            forscreen_history_list: forscreen_history_list
          })
        }
      }else if(is_speed==1){//极简投屏
        var forscreen_history_list = data.result;
        if (JSON.stringify(forscreen_history_list) == "{}") {
          that.setData({
            forscreen_history_list: ''
          })
        } else {
          var hotel_info = that.data.hotel_info;
          //请求盒子接口   如果盒子接口有数据插入到  forscreen_history_list
          if(app.globalData.is_getjj_history){
            wx.request({
              url: 'http://' + hotel_info.intranet_ip + ':8080/h5/projectionLog?deviceId='+openid+'&box_mac='+box_mac+'&openid='+openid,
              success:function(res){
                //console.log('盒子数据');
                //console.log(res)
                if(res.data.code==10000){
                  //console.log('云端数据')
                  //console.log(forscreen_history_list);
                  
                  
                  var speed_history_list = res.data.result;
                  
                  for(let i in forscreen_history_list){
                    if(forscreen_history_list[i].is_speed==1 && forscreen_history_list[i].res_type==2){ //视频
                      for(let j in speed_history_list){
                        if(forscreen_history_list[i].forscreen_id == speed_history_list[j].forscreen_id){
                          forscreen_history_list[i].res_type = speed_history_list[j].resource_type;
                          forscreen_history_list[i].list[0].imgurl   = speed_history_list[j].list[0].media_screenshot_path;
                          forscreen_history_list[i].is_speed = 1;
                          forscreen_history_list[i].is_box_have = 1;
                        }
                      }
                      
                    }else if(forscreen_history_list[i].is_speed==1 && forscreen_history_list[i].res_type==1){//照片
                      for(let j in speed_history_list){
                        if(forscreen_history_list[i].forscreen_id == speed_history_list[j].forscreen_id){
  
                          for(let k in forscreen_history_list[i].list){
                            forscreen_history_list[i].list[k].imgurl = speed_history_list[j].list[k].media_screenshot_path
                          }
  
                          forscreen_history_list[i].is_speed = 1;
                          forscreen_history_list[i].is_box_have = 1;
                        }
                      }
                    }
  
                    
                    
                  }
  
                  
                  
                }else{
                  
                }
                for(let i=forscreen_history_list.length-1; i>=0; i--){
                  if(forscreen_history_list[i].is_speed == 1 && forscreen_history_list[i].is_box_have==0){
                    forscreen_history_list.splice(i,1);
                  }
                }
                //console.log('最终数据');
                //console.log(forscreen_history_list);
                that.setData({forscreen_history_list:forscreen_history_list})  
              },fail:function(e){
                for(let i=forscreen_history_list.length-1; i>=0; i--){
                  if(forscreen_history_list[i].is_speed == 1 && forscreen_history_list[i].is_box_have==0){
                    forscreen_history_list.splice(i,1);
                  }
                }
                that.setData({forscreen_history_list:forscreen_history_list})  
              }
            })
          }else {
            for(let i=forscreen_history_list.length-1; i>=0; i--){
              if(forscreen_history_list[i].is_speed == 1 && forscreen_history_list[i].is_box_have==0){
                forscreen_history_list.splice(i,1);
              }
            }
            that.setData({forscreen_history_list:forscreen_history_list})  
          }
          
        }
      }
      
    },res=>{},{ isShowLoading: false })


  },
  speedForVideo:function(res,hotel_info,cTs=0){
    var that = this;
    that.linkHotelWifi(res,hotel_info,cTs)


  },
  linkHotelWifi:function(data,hotel_info,cTs){
    var that = this;
    var box_mac = data.box_mac;

    var wifi_name = hotel_info.wifi_name;
    var wifi_mac = hotel_info.wifi_mac;
    var use_wifi_password = hotel_info.wifi_password;
    var box_mac = hotel_info.box_mac
    var video_size = that.data.size;

    if (hotel_info.wifi_name != '') {
      var openWind = that.data.openWind;
      openWind.isWifi = true,
      openWind.step = 1;
      openWind.title = '您正在使用极速投屏';
      openWind.tip   = '包间wifi链接中';
      that.setData({
        isOpenWind:true,
        openWind:openWind,
      })
      wx.startWifi({
        success: function (res) {
          //console.log('wifi_start_sucess')
          wx.getConnectedWifi({
            
            success: function (res) {
              //console.log(res);
              //console.log('getConnectedWifi_success');
              //第一步链接wifi
              if (res.errMsg == 'getConnectedWifi:ok') {
                if (res.wifi.SSID == wifi_name) {//链接的是本包间wifi
                  //console.log('wifiok')
                  wx.stopWifi({
                  })
                  //第二步开始投屏
                  if(video_size>limit_video_size){
                    that.burstReadVideoFile(data,hotel_info,);
                  }else {
                    that.speedUploadVideo(hotel_info,data);
                  }
                  app.globalData.change_link_type = 2;
                } else {//链接的不是本包间wifi
                  that.connectWifi(wifi_name, wifi_mac, use_wifi_password, box_mac,hotel_info,data,cTs);
                }
              } else {
                //当前打开wifi 但是没有链接任何wifi
                that.connectWifi(wifi_name, wifi_mac, use_wifi_password, box_mac,hotel_info,data,cTs);
              }
              //wx.hideLoading()
            }, fail: function (res) {
              var err_msg = 'wifi链接失败';
              if(res.errMsg == 'getConnectedWifi:fail:currentWifi is null' || res.errMsg=='getConnectedWifi:fail no wifi is connected.'){
                //console.log('99999--'+cTs);
                that.connectWifi(wifi_name, wifi_mac, use_wifi_password, box_mac,hotel_info,data,cTs);
              }else if(res.errMsg == 'getConnectedWifi:fail:netInfo is null'){
                that.speedUploadVideo(hotel_info,data);
              }
              else {
                if (res.errCode == 12005) { //安卓特有  未打开wifi
                  err_msg = '请打开您的手机Wifi';
                  
                } else if (res.errCode == 12006) {//Android 特有，未打开 GPS 定位开关
                  err_msg = '请打开您的手机GPS';
                  
                } else if(res.errCode == 12007){//用户拒绝授权链接 Wi-Fi

                  if(cTs==1){
                    that.classicForVideo(data)
                    return false;
                  }
                }else if(res.errCode== 12010){
                  err_msg = '请确认并打开wifi';
                  
                }else {
                  if (hotel_info.wifi_password == '') {
                    var us_wifi_password = '空';
                  } else {
                    var us_wifi_password = hotel_info.wifi_password;
                  }
                  var msg = '请手动连接包间wifi:' + hotel_info.wifi_name + ',密码为' + us_wifi_password+'。连上wifi投屏更快哦！';
                  
                }
                openWind.tip = err_msg;
                openWind.isError = true;
                that.setData({
                  openWind:openWind
                })
              
                
              }
              
            },
          })
        }, fail: function (res) {
          
          openWind.tip = res.errMsg;
          openWind.isError = true;
          that.setData({
            openWind:openWind
          })
          
        }
      })
    }else {
      app.showToast('该电视暂不支持极速投屏');
    }

  },
  connectWifi:function(wifi_name, wifi_mac, use_wifi_password, box_mac,hotel_info,data,cTs=0){
    var that = this;
    that.setData({up_imgs:[]})
    
    var video_size = that.data.size;
    var openWind = that.data.openWind;
    var clearTime8 = setTimeout(() => {
            wx.stopWifi({
              success: (res) => {},
            })
            that.setData({isOpenWind:false});
            wx.showModal({
              title: 'wifi链接超时',
              content: '未成功链接对应的包间wifi,您可以重试链接wifi或者尝试经典投屏',
              cancelText:'经典投屏',
              confirmText:'重试',
              success: function (res) {
                if (res.confirm) {
                  
                  that.linkHotelWifi(data,hotel_info)
                  //that.tipsForLaunchWindowRetry();
                }else {
                  that.setData({
                    launchType:'classic',
                    
                  })
                  that.tipsForLaunchWindowRetry(false);
                  
                }
              }
            })
            var timeout_err_info = '{"errCode":13000,"errMsg":"connectWifi:fail internal error."}'
            that.recordWifiErr(timeout_err_info,box_mac,data.openid);
    },hotel_info.wifi_timeout_time);
    var wifi_start_time = (new Date()).valueOf();
    wx.connectWifi({
      SSID: wifi_name,
      BSSID: wifi_mac,
      password: use_wifi_password,
      success: function (reswifi) {
        console.log(reswifi);
        console.log('来了')
        if(reswifi.errMsg=='connectWifi:ok' && typeof(reswifi.wifi)!='undefined'){
          var wifi_end_time = (new Date()).valueOf();
          var diff_time = wifi_end_time - wifi_start_time;
          console.log('wiif链接时间'+diff_time)
          clearTimeout(clearTime8);
          //app.showToast('wifi链接成功');
          if(video_size>limit_video_size){
            that.burstReadVideoFile(data,hotel_info);
          }else {
            that.speedUploadVideo(hotel_info,data);
            
          }
          app.globalData.change_link_type = 2;
          return true; 
        }else{
          
          wx.onWifiConnected((result) => {
            
            if(result.wifi.SSID==wifi_name){
              var wifi_end_time = (new Date()).valueOf();
              var diff_time = wifi_end_time - wifi_start_time;
              console.log('wiif链接时间'+diff_time)
              clearTimeout(clearTime8);
              //app.showToast('wifi链接成功');
              if(video_size>limit_video_size){
                that.burstReadVideoFile(data,hotel_info);
              }else {
                that.speedUploadVideo(hotel_info,data);
                
              }
              app.globalData.change_link_type = 2;
              return true; 
            }
            
          },()=>{
            clearTimeout(clearTime8);
            openWind.tip = 'wifi链接失败';
            openWind.isError = true;
            that.setData({
              openWind:openWind
            })
          })
        }

        
      }, fail: function (res) {
        //console.log('connectWifi_fail');
        clearTimeout(clearTime8);
        var err_msg = 'wifi链接失败';
        if(res.errCode==12000){
        }else {
          if (res.errCode == 12005) { //安卓特有  未打开wifi
            err_msg = '请打开您的手机Wifi';
            
          } else if (res.errCode == 12006) {//Android 特有，未打开 GPS 定位开关
            err_msg = '请打开您的手机GPS';
            
          } else if(res.errCode == 12007){//用户拒绝授权链接 Wi-Fi
          
            if(cTs==1){
              that.setData({isOpenWind:'false',openWind:{'isWifi':false,'isError':false,'title':'','step':1,'progress':0,'tip':''}})
              that.classicForVideo(data)
              return false;
            }
          }else if(res.errCode==12010){
            err_msg = '请确认并打开wifi';
            
          }else {
            if (use_wifi_password == '') {
              var wifi_password_str = '空';
            } else {
              var wifi_password_str = use_wifi_password;
            }
            var err_msg = '请手动连接包间wifi:' + wifi_name + ',密码为' + wifi_password_str+'。连上wifi投屏更快哦！';
            
          }
          //console.log('go on');
          openWind.tip = err_msg;
          openWind.isError = true;
          that.setData({
            openWind:openWind
          })
          
          var err_info = JSON.stringify(res);
          that.recordWifiErr(err_info,box_mac,data.openid);
        }
      }
    })
  },
  recordWifiErr:function(err_info,box_mac,openid){
    utils.PostRequest(api_v_url + '/datalog/recordWifiErr', {
      err_info: err_info,
      box_mac: box_mac,
      openid:openid,
      mobile_brand:app.globalData.sys_info.brand,
      mobile_model:app.globalData.sys_info.model,
      platform:app.globalData.sys_info.platform,
      version:app.globalData.sys_info.version,
      system:app.globalData.sys_info.system
    }, (data, headers, cookies, errMsg, statusCode) => {

    }, re => { }, { isShowLoading: false })
    
  },
  burstReadVideoFile(data,hotel_info){
    var that = this;
    var video_url = data.video;
    var start_time = (new Date()).valueOf()
    console.log('start_time:'+start_time)
    var openWind = that.data.openWind;
    openWind.step = 2;
    openWind.tip = '视频处理中';
    that.setData({
      cancel_for:'',
      openWind:openWind,
      is_classic_disabel:true,
      is_speed_disabel:true,
      readfile_start_time:start_time,
    })

    var forscreen_id = (new Date()).valueOf();
    var filePath = that.data.upload_vedio_temp;
    var fileName = forscreen_id
    var box_mac  = data.box_mac;
    var video_size = that.data.size
    var step_size = chunkSize
    let length   = tail_lenth
    let position = video_size - length


    let video_param = fm.readFileSync(filePath,'base64',position,length);
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var openid = data.openid;
    var duration = data.duration;
    var avatarUrl = data.avatarUrl;
    var nickName = data.nickName;
    
    wx.request({
      url: 'http://' + hotel_info.intranet_ip + ':8080/videoUploadSpeed'+'?position='+position+'&chunkSize='+length+'&box_mac='+box_mac+'&forscreen_id='+forscreen_id+'&deviceId=' + openid+ '&deviceName=' + mobile_brand + '&web=true' + '&filename=' + fileName + '&device_model=' + mobile_model + '&resource_size=' + video_size + '&duration=' + duration + '&action=3&resource_type=2&avatarUrl=' + avatarUrl + "&nickName=" + nickName+'&serial_number='+app.globalData.serial_number,
      method:'POST',
      data:video_param,
      success(res_part){
        video_param = null;
        var file_data_list = [];
        var index=0;
        for(var i=0;i<position;i++){
          var tmp = {'param_video':'','section':'','iv':'','step_size':'','index':''};
          var end = app.plus(i,step_size);
          if(end >=position){
            end = app.accSubtr(position,1);
            step_size = app.accSubtr(position,i);
          }else {
            end = app.accSubtr(end,1);
          }
          if(i>=position){//说明读完了
            console.log('读完了');
          }else {//没读完
            
            var section = i+','+end;
            tmp.section     = section;
            tmp.iv          = i;
            tmp.step_size   = step_size;
            tmp.index = index;
            index++;
            
          }
          file_data_list.push(tmp);
          i = app.plus(i,step_size);
          i = app.accSubtr(i,1);
        }
        that.postConcurrencyPromisedata(0,file_data_list,filePath,fileName,video_size,forscreen_id,hotel_info,video_url,data)

        
      },fail:function(res){
        if(res.errMsg=='request:fail 似乎已断开与互联网的连接。'){
          openWind.tip = '请打开设置-找到微信app-打开本地网络开关';
        }
        else {
          openWind.tip = '投屏失败，请重试！';
        }
        
        openWind.isError = true;
        that.setData({
          openWind:openWind,
          is_classic_disabel:false,
          is_speed_disabel:false,
          hiddens: true,
        })
      }
    })
  },
  postConcurrencyPromisedata:function(start,file_data_list,filePath,fileName,video_size,forscreen_id,hotel_info,video_url,data){
    var that = this;
    var openWind = that.data.openWind;
    if(start>file_data_list.length){
      return false
    }
    if(that.data.cancel_for==1){
      return false;
    }
    var that = this
    let block_data_list = file_data_list.slice(start, start + maxConcurrency);
    let promise_arr = that.pushPromiseData(block_data_list,filePath,fileName,video_size,forscreen_id,hotel_info,data,file_data_list.length)
    //var flag =0;
    
    Promise.all(promise_arr).then(res_full_data => {
      let tmp_full_data = []
      let is_break = 0;
      for (var j= 0; j< res_full_data.length; j++) {
        if(res_full_data[j]['data']['code']==10000){
          tmp_full_data.push(res_full_data[j]['data'])
        }
        if(res_full_data[j]['data']['code']==10012){
          is_break = 1;
        }
      }
      if(res_full_data.length == tmp_full_data.length){

        let end_time = (new Date()).valueOf()
        let use_time = end_time - that.data.readfile_start_time
  
        
        let now_start = start + maxConcurrency
        var progress  = parseInt((now_start / file_data_list.length)*100) ;
        openWind.progress = progress;
        that.setData({
          openWind:openWind,
        })
        if(now_start>=file_data_list.length){
          
          openWind.step = 3;
          openWind.tip = '正在投屏,请稍后';
          that.setData({
            openWind:openWind,
            is_upload: 1,
            vedio_url: video_url,
            oss_video_url:video_url,
            filename: fileName,
            resouce_size: data.size,
            duration: that.data.duration,
            intranet_ip: hotel_info.intranet_ip,
            hiddens: true,
            showVedio: false,
          })
          //倒计时关闭窗口
          that.closeOpenWind();
          var openid = data.openid;
          var box_mac = data.box_mac;
          //极简版upload上传记录历史投屏
          utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
            openid: data.openid,
            box_mac: data.box_mac,
            action: 2,
            resource_type: 2,
            mobile_brand: app.globalData.mobile_brand,
            mobile_model: app.globalData.mobile_model,
            forscreen_char: '',
            public_text: '',
            imgs: '[]',
            resource_id: forscreen_id,
            resource_size: data.size,
            is_pub_hotelinfo: 0,
            is_share: 0,
            forscreen_id: forscreen_id,
            duration: that.data.duration,
            res_nums: 1,
            serial_number:app.globalData.serial_number,
            is_speed:1,
          }, (data, headers, cookies, errMsg, statusCode) => {
            that.getHistoryList(openid,box_mac,1,1);
          },res=>{},{ isShowLoading: false })



        }


        that.postConcurrencyPromisedata(now_start,file_data_list,filePath,fileName,video_size,forscreen_id,hotel_info,video_url,data)
      }else{
        if(is_break==0){
          openWind.tip = '投屏失败，请重试！';
        }else {
          openWind.tip = '您的投屏已被其他用户打断。';
        }
        
        openWind.isError = true;
        that.setData({
          openWind:openWind,
          is_classic_disabel:false,
          is_speed_disabel:false,
          hiddens: true,
        })
      }
    }).catch(function(reason) {
      var block_data_list = reason;
      let promise_arr_err = that.pushPromiseData(block_data_list,filePath,fileName,video_size,forscreen_id,hotel_info,data,file_data_list.length)
      Promise.all(promise_arr_err).then(res_full_data => {
        let tmp_full_data = []
        for (var j= 0; j< res_full_data.length; j++) {
          if(res_full_data[j]['data']['code']==10000){
            tmp_full_data.push(res_full_data[j]['data'])
          }
        }
        if(res_full_data.length == tmp_full_data.length){
          //console.log('return data eq')
          let end_time = (new Date()).valueOf()
          let use_time = end_time - that.data.readfile_start_time
          //console.log('total_use_time:'+use_time)
          
          let now_start = start + maxConcurrency
          var progress  = parseInt((now_start / file_data_list.length)*100) ;
          openWind.progress = progress;
          that.setData({
            openWind:openWind,
          })
          if(now_start>=file_data_list.length){
            
            openWind.step = 3;
            openWind.tip = '正在投屏,请稍后';
            that.setData({
              openWind:openWind,
              is_upload: 1,
              vedio_url: video_url,
              oss_video_url:video_url,
              filename: fileName,
              resouce_size: data.size,
              duration: that.data.duration,
              intranet_ip: hotel_info.intranet_ip,
              hiddens: true,
              showVedio: false,
            })
            //倒计时关闭窗口
            that.closeOpenWind();
          }
          that.postConcurrencyPromisedata(now_start,file_data_list,filePath,fileName,video_size,forscreen_id,hotel_info,video_url,data)
        }else{
          openWind.tip = '投屏失败，请重试！';
          openWind.isError = true;
          that.setData({
            openWind:openWind,
            is_classic_disabel:false,
            is_speed_disabel:false,
            hiddens: true,
          })
        }
      }).catch(function(reason) {
        //console.log('重发失败')
        openWind.tip = '投屏失败，请重试！';
        openWind.isError = true;
        that.setData({
          openWind:openWind,
          is_classic_disabel:false,
          is_speed_disabel:false,
          hiddens: true,
        })
      })
      //console.log('promise reject failed reason', reason)
      
    })
  },
  pushPromiseData:function(box_data_list,filePath,fileName,totalSize,forscreen_id,hotel_info,data,t_len){
    //et fm = wx.getFileSystemManager()
    var that = this

    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var openid = data.openid;
    var duration = data.duration;
    var avatarUrl = data.avatarUrl;
    var nickName = data.nickName;
    var box_mac  = data.box_mac;
    let data_num = box_data_list.length
    var promise_arr = []
    var totalChunks = t_len; 
    for (var i = 0; i < data_num; i++) {
      var promise_name='promise'+i;
      promise_name = new Promise(function (resolve, reject) {
        
        let dinfo = box_data_list[i]
        let index = dinfo['index']
        let video_param = fm.readFileSync(filePath,'base64',dinfo['iv'],dinfo['step_size']);
        
        wx.request({
          url: 'http://' + hotel_info.intranet_ip + ':8080/videoUploadSpeed'+'?index='+index+ '&box_mac='+ box_mac+'&chunkSize='+dinfo['step_size']+'&forscreen_id='+forscreen_id+'&deviceId=' + openid+ '&deviceName=' + mobile_brand + '&web=true' + '&filename=' + fileName + '&device_model=' + mobile_model + '&resource_size=' + totalSize + '&duration=' + duration + '&action=3&resource_type=2&avatarUrl=' + avatarUrl + "&nickName=" + nickName+'&serial_number='+app.globalData.serial_number+'&totalChunks='+totalChunks+'&position='+dinfo['iv'],
          method:'POST',
          data:video_param,
          success(res_part){
            resolve(res_part)
            video_param =  null;
          },fail:function(res_err){
            reject(box_data_list);
            //console.log(box_data_list)
          }
        })
      });
      promise_arr.push(promise_name)
    }
    return promise_arr
},
  speedUploadVideo:function(hotel_info,data){
    var that = this;
    var box_mac = data.box_mac;
    var openid = data.openid;
    var video = data.video;
    var duration = data.duration;
    var avatarUrl = data.avatarUrl;
    var nickName = data.nickName;
    //console.log('极简上传');
    var intranet_ip = hotel_info.intranet_ip;
    var video_url = data.video;
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var forscreen_id = (new Date()).valueOf();
    var filename = forscreen_id;
    var start_time = forscreen_id; 
    var resouce_size  = data.size;
    var openWind = that.data.openWind;
    openWind.step = 2;
    openWind.tip = '视频处理中';
    that.setData({
      openWind:openWind,
      is_classic_disabel:true,
      is_speed_disabel:true,
      
    })
    
    var intranet_ip = hotel_info.intranet_ip;
    var video_url = video;
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var forscreen_id = (new Date()).valueOf();
    var filename = forscreen_id;
    var start_time = forscreen_id; 
    var upload_vedio_temp = that.data.upload_vedio_temp;
    if(upload_vedio_temp!=''){
      upload_task = wx.uploadFile({
        url: 'http://' + intranet_ip + ':8080/videoH5?deviceId=' + openid + '&box_mac=' + box_mac + '&deviceName=' + mobile_brand + '&web=true&forscreen_id=' + forscreen_id + '&filename=' + filename + '&device_model=' + mobile_model + '&resource_size=' + resouce_size + '&duration=' + duration + '&action=2&resource_type=2&avatarUrl=' + avatarUrl + "&nickName=" + nickName+'&serial_number='+app.globalData.serial_number,
        filePath: video_url,
        name: 'fileUpload',
        success: function(res) {
          var info_rt = JSON.parse(res.data);
          if (info_rt.code == 10000) {
            openWind.step = 3;
            openWind.tip = '正在投屏,请稍后';
            that.setData({
              openWind:openWind,
              is_upload: 1,
              vedio_url: video_url,
              oss_video_url:video_url,
              filename: filename,
              resouce_size: resouce_size,
              duration: duration,
              intranet_ip: intranet_ip,
              hiddens: true,
              showVedio: false,
            })
            //倒计时关闭窗口
            that.closeOpenWind();
            
            utils.tryCatch(mta.Event.stat('wifiVideoForscreen', { 'status': 1 }));
  
            var end_time = (new Date()).valueOf(); 
            var diff_time = end_time - start_time;
  
            //极简版upload上传记录历史投屏
            utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
              openid: openid,
              box_mac: box_mac,
              action: 2,
              resource_type: 2,
              mobile_brand: mobile_brand,
              mobile_model: mobile_model,
              forscreen_char: '',
              public_text: '',
              imgs: '[]',
              resource_id: forscreen_id,
              resource_size: resouce_size,
              is_pub_hotelinfo: 0,
              is_share: 0,
              forscreen_id: forscreen_id,
              duration: duration,
              res_nums: 1,
              serial_number:app.globalData.serial_number,
              is_speed:1,
            }, (data, headers, cookies, errMsg, statusCode) => {
              that.getHistoryList(openid,box_mac,page,1);
            })
            utils.tryCatch(mta.Event.stat('wifiVideoUploadWastTime', { 'uploadtime': diff_time }));
          } else if (res.code == 1001) {
            openWind.tip = '投屏失败，请重试！';
            openWind.isError = true;
            that.setData({
              openWind:openWind,
              is_classic_disabel:false,
              is_speed_disabel:false,
              hiddens: true,
            })
            app.showToast('投屏失败，请重试！')
            
            utils.tryCatch(mta.Event.stat('wifiVideoForscreen', { 'status': 0 }));
          }else if(res.code==-1){
            openWind.tip = '系统繁忙，请重试';
            openWind.isError = true;
            that.setData({
              openWind:openWind,
              is_classic_disabel:false,
              is_speed_disabel:false,
              hiddens: true,
              is_forscreen: 1,
            })
            app.showToast('系统繁忙，请重试');
          }
        },
        fail: function({errMsg}) {
          //clearInterval(time_80);
          openWind.tip = '投屏失败,请确认是否连接本包间wifi！';
          openWind.isError = true;
          that.setData({
            openWind:openWind,
            is_btn_disabel: false,
            is_classic_disabel:false,
            is_speed_disabel:false,
            hiddens: true,
          })
          app.showToast('投屏失败,请确认是否连接本包间wifi！',3000,'none',true);
          
          utils.tryCatch(mta.Event.stat('wifiVideoForscreen', { 'status': 0 }));
        }
      })
      upload_task.onProgressUpdate((res) => {
        var openWind = that.data.openWind;
        openWind.progress = res.progress
        that.setData({
          openWind:openWind,
          
        });
        if (res.progress == 100) {
          
        }
      });
    }
    
  },
  //点击投屏
  forscreen_video: function(res) {
    var that = this;
    var openWind = that.data.openWind;
    openWind= {'isWifi':false,'isError':false,'title':'','step':1,'progress':0,'tip':''};
    that.setData({
      cutDownTime:3,
      openWind:openWind,
    })
    var launchType = res.detail.target.dataset.launch_type;
    var hotel_info = that.data.hotel_info;
    that.setData({
      form_data:res.detail.value,
      launchType:launchType,
    })
    if(launchType=='classic'){//经典投屏
      var forscreen_method = hotel_info.forscreen_method;
      var speed_forscreen_method = forscreen_method.substr(2,1);
      if(res.detail.value.size>=max_user_forvideo_size && speed_forscreen_method==1){
        that.setData({launchType:'speed'})
        that.speedForVideo(res.detail.value,hotel_info,1)

      }else {
        app.globalData.change_link_type = 1;
        that.classicForVideo(res.detail.value);
      }
      mta.Event.stat('clickVideoForscreen',{'openid':res.detail.value.openid,'boxmac':res.detail.value.box_mac,'ftype':1})
    }else {//极速投屏
      
      //that.burstReadVideoFile(res.detail.value,hotel_info);
      that.speedForVideo(res.detail.value,hotel_info)
      mta.Event.stat('clickVideoForscreen',{'openid':res.detail.value.openid,'boxmac':res.detail.value.box_mac,'ftype':2})
    }
  },
  //重新选择视频
  chooseVedio(e) {
    var that = this;
    that.removeSavedFile();
    var is_compress = that.data.is_compress;
    if(is_compress==1){
      var compressed = true;
    }else if(is_compress==0){
      var compressed = false;
    }
    try {
      mta.Event.stat('LaunchVideoWithNet_AfterLaunch_RechooseVideo', {
        'openid': that.data.openid
      });
    } catch (e) {
      //TODO nothing
    }
    var openWind= {'isWifi':false,'isError':false,'title':'','step':1,'progress':0,'tip':''};
  
    that.setData({
      item: [{
          'name': '公开时显示餐厅信息',
          'value': '1',
          'checked': true,
          'disabled': false
        },
        {
          'name': '公开发表，公众可见',
          'value': '2',
          'checked': false,
          'disabled': false
        },
      ],
      //launchType:'classic',
      is_view_forscreen_char:true,
      is_share: 0,
      showVedio: true,
      //is_btn_disabel: true,
      is_classic_disabel:true,
      is_speed_disabel:true,
      openWind:openWind,
      cutDownTime:3,
      showModal_2:false
    });
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      compressed:compressed,
      success: function(res) {

        var filePath = res.tempFilePath
        var video_size = res.size
        if(video_size>max_video_size && app.globalData.sys_info.platform=='ios'){
          that.setData({showModal_2:true,vide_size_str:app.changeKb(video_size)})
          
        }else {
          that.setData({
            showVedio: true,
            //is_btn_disabel: false,
            is_classic_disabel:false,
            is_speed_disabel:false,
            upload_vedio_temp: res.tempFilePath,
            duration: res.duration,
            size: video_size,
            vide_size_str:app.changeKb(video_size)
          })
        }
        mta.Event.stat('LaunchVideoWithNet_Launch_ChooseVideo', {
          'status': 'success'
        });
      },
      fail: function(res) {
        if(res.errMsg=='chooseVideo:fail copy video file fail!'){
          wx.showModal({
            title:'选择视频文件失败',
            content:'小程序临时文件过大,请您选择小视频投屏或者手动删除小程序后重新扫码进入',
            showCancel:false,
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1,
                })
              }
            }
          })
          //app.showToast('请选择小视屏或者删除小程序清理缓存');
        }else {
          wx.navigateBack({
            delta: 1,
          })
          that.setData({
            showVedio: false,
            is_classic_disabel:true,
            is_speed_disabel:true,
          });
          mta.Event.stat('LaunchVideoWithNet_Launch_ChooseVideo', {
            'status': 'fail'
          });
        }
        
      }
    });
  },
  closeOpenWind:function(){
    var that = this;
    var cutDownTime = that.data.cutDownTime;
    var djs = cutDownTime -1;
    var interval = setInterval(function(){ 
      that.setData({
        cutDownTime:djs
      })
      if(djs<=0){
        clearInterval(interval);
        that.setData({isOpenWind:false})
      }
      djs --;
    }, 1000)
  },
  tipsForLaunchWindowCancel:function(){
    var that = this;
    wx.navigateBack({
      delta: 1,
    })
    this.setData({isOpenWind:false,is_classic_disabel:false,'is_speed_disabel':false,'cancel_for':1})
    
    //console.log('cancel++++++++++++++++++++');
    var hotel_info = that.data.hotel_info;
    var openid = this.data.openid;
    var box_mac = this.data.box_mac;
    var video_size = this.data.size;
  
    if(app.globalData.change_link_type==2 && video_size>limit_video_size){
      app.controlExitForscreen(openid, box_mac,hotel_info,that,0,0);
    }else if(app.globalData.change_link_type==2 && video_size<=limit_video_size){

      if(app.isFunction(upload_task.abort)){

        upload_task.abort();
      }
      
    }else if(app.globalData.change_link_type==1 && video_size<=max_user_forvideo_size){
      if(app.isFunction(upload_task.abort)){
        upload_task.abort();
      }
    }
    
    
    
  },
  //retryForscreen
  tipsForLaunchWindowRetry:function(is_limit = true){
    var that = this;
    var hotel_info = that.data.hotel_info;
    var form_data  = that.data.form_data;
    var launchType = that.data.launchType;
    that.setData({
      openWind:{'isWifi':false,'isError':false,'title':'','step':1,'progress':0,'tip':''}
    })
    if(launchType=='classic'){//经典投屏
      that.classicForVideo(form_data);
    }else {//极速投屏
      that.speedForVideo(form_data,hotel_info);
    }
  },
  tipsForLaunchWindowDevOps:function(e){
    
    this.setData({is_vew_cutdown_time:true})
  },
  //退出投屏
  exitForscreend(e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.boxmac;
    var hotel_info = that.data.hotel_info;
    var timestamp = (new Date()).valueOf();
    app.controlExitForscreen(openid, box_mac,hotel_info ,that,1);
    
  },
  //是否公开显示餐厅信息
  checkboxChange: function(e) {
    var that = this;
    var check_lenth = e.detail.value.length;
    var check_arr = e.detail.value;
    if (check_lenth == 2) {
      that.setData({
        is_share: 1,
        is_pub_hotelinfo: 1
      })
    } else if (check_lenth == 1) {
      if (check_arr[0] == 1) {
        that.setData({
          is_share: 0,
          is_pub_hotelinfo: 1
        })
      } else if (check_arr[0] == 2) {
        that.setData({
          is_share: 1,
          is_pub_hotelinfo: 0
        })
      }
    } else if (check_lenth == 0) {
      that.setData({
        is_pub_hotelinfo: 0,
        is_share: 0
      })
    }
    var check_arr = e.detail.value;
  }, //是否公开显示餐厅信息结束
  
  replayHistory: function(e) {
    //console.log(e);
    var that = this;
    var box_mac = e.target.dataset.box_mac;

    var is_speed = e.target.dataset.is_speed;
    //console.log(is_speed)
    if(is_speed==1){
      var openid = e.target.dataset.openid;
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      var forscreen_id = (new Date()).valueOf();
      /*var forscreen_id = e.target.dataset.forscreen_id;
      var filename     = e.target.dataset.filename;
      var resouce_size = e.target.dataset.resource_size;*/
      var avatarUrl    = e.target.dataset.avatarurl;
      var nickName     = e.target.dataset.nickname;
      //var duration     = e.target.dataset.duration;
      var hotel_info  = that.data.hotel_info;
      var res_type    = e.target.dataset.res_type;
      if(res_type==1){
        var res_list = e.target.dataset.res_list;
        var img_lenth = res_list.length;
        for(let i in res_list){
          var forscreen_char = res_list[i].forscreen_char;
          var filename       = res_list[i].resource_id;
          var img_size       = res_list[i].resource_size;
          //console.log("http://" + hotel_info.intranet_ip + ":8080/picH5?isThumbnail=1&imageId=20170301&deviceId=" + openid + "&box_mac=" + box_mac + "&deviceName=" + mobile_brand + "&rotation=90&imageType=1&web=true&forscreen_id=" + forscreen_id + '&forscreen_char=' + forscreen_char + '&filename=' + filename + '&device_model=' + mobile_model + '&resource_size=' + img_size + '&action=4&resource_type=1&avatarUrl=' + avatarUrl + "&nickName=" + nickName + "&forscreen_nums=" + img_lenth+"&serial_number="+app.globalData.serial_number);
          wx.request({
            url: "http://" + hotel_info.intranet_ip + ":8080/picH5?isThumbnail=1&imageId=20170301&deviceId=" + openid + "&box_mac=" + box_mac + "&deviceName=" + mobile_brand + "&rotation=90&imageType=1&web=true&forscreen_id=" + forscreen_id + '&forscreen_char=' + forscreen_char + '&filename=' + filename + '&device_model=' + mobile_model + '&resource_size=' + img_size + '&action=4&resource_type=1&avatarUrl=' + avatarUrl + "&nickName=" + nickName + "&forscreen_nums=" + img_lenth+"&serial_number="+app.globalData.serial_number,
            success:function(res){
              //console.log(res);
              if(res.data.code==10000){
                if(i==res_list.length - 1){
                  app.showToast('重投成功，电视即将播放');
                }
                
              }else{
                app.showToast('重投失败');
              }
            },fail:function(e){
              app.showToast('重投失败');
            }
          })
        }
        

      }else{
        
        
        var res_list = e.target.dataset.res_list;
        
        var filename     = e.target.dataset.forscreen_id;
        var resouce_size = res_list[0].resource_size;
        var duration     = parseInt(res_list[0].duration);
        //console.log('http://' + hotel_info.intranet_ip + ':8080/videoH5?deviceId=' + openid + '&box_mac=' + box_mac + '&deviceName=' + mobile_brand + '&web=true&forscreen_id=' + forscreen_id + '&filename=' + filename + '&device_model=' + mobile_model + '&resource_size=' + resouce_size + '&duration=' + duration + '&action=2&resource_type=2&avatarUrl=' + avatarUrl + "&nickName=" + nickName+'&serial_number='+app.globalData.serial_number)
        wx.request({
          url: 'http://' + hotel_info.intranet_ip + ':8080/videoH5?deviceId=' + openid + '&box_mac=' + box_mac + '&deviceName=' + mobile_brand + '&web=true&forscreen_id=' + forscreen_id + '&filename=' + filename + '&device_model=' + mobile_model + '&resource_size=' + resouce_size + '&duration=' + duration + '&action=2&resource_type=2&avatarUrl=' + avatarUrl + "&nickName=" + nickName+'&serial_number='+app.globalData.serial_number,
          
          success:function(res){
            //console.log(res)
            if(res.data.code==10000){
              app.showToast('重投成功，电视即将播放');
            }else{
              app.showToast('重投失败');
            }
          },fail:function(e){
            app.showToast('重投失败');
          }
        })
      }
      
    }else{
      var action = 8; //重新播放
      var forscreen_id = (new Date()).valueOf(); //投屏id
      var res_type = e.target.dataset.res_type;
      var res_list = e.target.dataset.res_list;
      var res_nums = res_list.length;
      pubdetail = []
      for(var i=0;i<res_nums;i++){
        var tmp = {forscreen_url:'',res_id:'',filename:'',resource_size:'',duration:0,quality_type:''};
        tmp.forscreen_url = res_list[i].forscreen_url;
        tmp.res_id        = res_list[i].resource_id;
        tmp.filename      = res_list[i].filename;
        tmp.resource_size = res_list[i].resource_size;
        tmp.quality_type  = res_list[i].quality_type;
        tmp.forscreen_char = res_list[i].forscreen_char;
        tmp.duration      = 0;
        pubdetail[i] = tmp;
      }
      app.boxShow(box_mac, forscreen_id, pubdetail, res_type, res_nums, action, '', that);
    }
    
  },
  //上拉刷新
  loadMore: function(e) {
    var that = this;
    var openid = e.target.dataset.openid;
    var box_mac = e.target.dataset.box_mac;
    var launchType = e.target.dataset.launchtype;
    if(launchType =='classic'){
      var is_speed = 0;
    }else{
      var is_speed = 1;
    }
    page = page + 1;
    
    that.getHistoryList(openid,box_mac,page,is_speed);

    
    
  },
  changeVolume: function(e) {
    var box_mac = e.target.dataset.box_mac;
    var change_type = e.target.dataset.change_type;
    utils.PostRequest(api_url + '/Netty/Index/pushnetty', {
      box_mac: box_mac,
      msg: '{"action":31,"change_type":' + change_type + '}',
    }, (data, headers, cookies, errMsg, statusCode) => {
      
    },res=>{},{ isShowLoading: false })

    
    utils.tryCatch(mta.Event.stat('controlChangeVolume', { 'changetype': change_type }))
  },
  closeJump: function(e) {
    var that = this;
    that.setData({
      is_show_jump: false,
    })
  },
  //遥控呼大码
  callQrCode: utils.throttle(function(e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    app.controlCallQrcode(openid, box_mac, qrcode_img);
  }, 3000), //呼大码结束
  //打开遥控器
  openControl: function(e) {
    var that = this;
    var qrcode_url = api_v_url + '/index/getBoxQr?box_mac=' + box_mac + '&type=3';
    that.setData({
      is_open_control: true,
      popRemoteControlWindow: true,
      qrcode_img: qrcode_url
    })
    utils.tryCatch(
      mta.Event.stat('openControl', {
      'linktype': app.globalData.link_type
      })
    );
    
  },
  //关闭遥控
  closeControl: function(e) {
    var that = this;
    that.setData({
      is_open_control: false,
      popRemoteControlWindow: false,
    })
    mta.Event.stat("closecontrol", {})
  },
  //遥控退出投屏
  exitForscreen: function(e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var hotel_info = that.data.hotel_info;
    app.controlExitForscreen(openid, box_mac,hotel_info,that);
  },
  //遥控调整音量
  changeVolume: function(e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeVolume(openid, box_mac, change_type);

  },
  //遥控切换节目
  changeProgram: function(e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeProgram(openid, box_mac, change_type);
  },
  //我要助力
  assist: function(e) {
    //console.log(e);
    var that = this;
    var forscreen_id = e.detail.value.forscreen_id;
    var openid = e.detail.value.openid;
    var box_mac = e.detail.value.box_mac;
    
    if (typeof(forscreen_id) == 'undefined') {
      wx.showToast({
        title: '助力参数异常，请重试或重选视频',
        icon: 'none',
        duration: 2000
      })

    } else {
      utils.PostRequest(api_v_url + '/ForscreenHelp/helpplay', {
        forscreen_id: forscreen_id,
        openid: openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        var rec_id = data.result.forscreen_id;
        wx.navigateTo({
          url: '/pages/mine/assist/index?forscreen_id=' + rec_id + "&box_mac=" + box_mac + "&inside=1",
        })
        
      },res=>{
        wx.showToast({
          title: '助力参数异常，请重选照片',
          icon: 'none',
          duration: 2000
        })
      })
      
    }
  },
  phonecallevent: function(e) {
    var tel = e.target.dataset.tel;
    wx.makePhoneCall({
      phoneNumber: tel,
      success:function(res){
        utils.tryCatch(mta.Event.stat('forVideoPhoneCall', { 'status': 1 }));
        
      },fail:function(res){
        utils.tryCatch(mta.Event.stat('forVideoPhoneCall', { 'status': 0 }));
      }
    })
  },
  closeLead: function(e) {
    var that = this;
    var type = e.currentTarget.dataset.type;
    var openid = e.currentTarget.dataset.openid;
    if (type == 3) {
      that.setData({
        showGuidedMaskBeforLaunch: false,
      })
    } else if (type == 4) {
      that.setData({
        showGuidedMaskAfterLaunch: false,
      })
    }
    utils.PostRequest(api_v_url + '/content/guidePrompt', {
      openid: openid,
      type: type,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var user_info = wx.getStorageSync('savor_user_info');

      user_info.guide_prompt.push(type);
      wx.setStorageSync('savor_user_info', user_info);
    })

    
  },
  goToBack: function (e) {
    var that = this;
    var showVedio = that.data.showVedio;
    if (showVedio==true){
      var status = 0; 
    }else {
      var status = 1;
    }
    app.goToBack(status);
  },
  cancelMaxVideo:function(){
    this.setData({showModal_2:false})
    wx.navigateBack({
      delta: 1,
    })
  },
  timeoutUploadCancel:function(e){
    var that = this;
    that.setData({showModal_3:false,isOpenWind:true})
  },
  timeoutUploadConfirm:function(e){
    upload_task.abort();
    var that = this;
    var hotel_info = that.data.hotel_info;
    var form_data  = that.data.form_data;
    var launchType = that.data.launchType;
    that.setData({
      openWind:{'isWifi':false,'isError':false,'title':'','step':1,'progress':0,'tip':''}
    })
    that.speedForVideo(form_data,hotel_info);
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
    this.removeSavedFile();
    this.data.upload_vedio_temp = '';
    

  },
  removeSavedFile:function(e){
    //console.log(this.data.upload_vedio_temp)
    
    if(app.globalData.sys_info.platform=='android'){
      fm.unlink({
        filePath:this.data.upload_vedio_temp,
        success:function(e){
        },fail:function(e){
        }
      })
    }

    
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
  onShareAppMessage: function() {

  },
  // 投视频前播放
  onPlayBeforeLauch: function(e) {
    let self = this;
    mta.Event.stat('LaunchVideoWithNet_BeforeLaunch_PLAY', {
      'openid': self.data.openid,
      'video': self.data.upload_vedio_temp
    });
  },

  // 投视频后播放
  onPlayAfterLauch: function(e) {
    let self = this;
    mta.Event.stat('LaunchVideoWithNet_AfterLaunch_Play', {
      'openid': self.data.openid,
      'video': self.data.oss_video_url
    });
  },

  // 投视频后暂停
  onPauseAfterLauch: function(e) {
    let self = this;
    mta.Event.stat('LaunchVideoWithNet_AfterLaunch_Pause', {
      'openid': self.data.openid,
      'video': self.data.oss_video_url
    });
  },

  // 投视频后进入/退出全屏
  onFullScreenChangeAfterLauch: function(e) {
    let self = this;
    mta.Event.stat('LaunchVideoWithNet_AfterLaunch_FullScreen', {
      'openid': self.data.openid,
      'video': self.data.oss_video_url,
      'fullscreen': e.detail.fullScreen
    });
  },
})