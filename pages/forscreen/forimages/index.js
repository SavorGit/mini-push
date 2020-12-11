const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp();
//var tmp;
var openid;
var policy;
var signature;
var postf;   //上传文件扩展名
var box_mac = '';
var imgsize = [];
var post_imgs = [];
var img_lenth = 0;
//var oss_img = [];
var forscreen_char = '';
var pic_show_cur = [];
var page = 1;
var forscreen_history_list;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var oss_upload_url = app.globalData.oss_upload_url;
var pubdetail = [];
var netty_push_info ;
var netty_push_img ;
var upload_task;
const admin = 1;
Page({
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    showSecond:false,    //页面是否展示
    showThird: false,    //重选照片 退出投屏
    showTpBt:true,       //投屏添加文字
    openid: '',          //微信用户唯一标识
    box_mac: '',         //机顶盒mac
    percent: '',         //上传图片百分比
    up_imgs: '',         //上传照片数组
    
    pic_show_cur: [],    //当前上传照片是否被选中,
    item: [
      { 'name': '公开时显示餐厅信息', 'value': '1', 'checked':true,'disabled': false },
      { 'name': '公开发表，公众可见', 'value': '2', 'checked': false, 'disabled': false },
      
    ],
    is_pub_hotelinfo:1,  //是否公开酒楼信息
    is_share :0,          //是否分享到发现栏目
    is_btn_disabel:false,
    avatarUrl:'',       //用户头像 
    nickName:'',        //用户昵称
    is_assist:0,       //是否助力
    showGuidedMaskBeforLaunch:false,
    showGuidedMaskAfterLaunch:false,
    res_head_desc:'图片',
    launchType:'classic',
    wifi_hidden: true,
    hiddens: true, //,
    qualityList:[],
    
    is_view_forscreen_char:true,
    isOpenWind:false, //是否显示投屏状态弹窗
    // isWifi:是否显示WIFI连接提示  isError:是否显示错误信息 title 弹窗标题 step:步骤 progress:进度条 tip:正在投屏，请稍候 
    openWind:{'isWifi':false,'isError':false,'title':'','step':1,'progress':0,'tip':''}, 
    cutDownTime:'3', // 3S   倒计时
    DevOpsTips:'', //耗时23秒
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    wx.hideShareMenu();
    var that = this;

    upload_task = {};
    that.getOssParam();//获取oss上传参数
    var hotel_info = app.globalData.hotel_info;
    var change_link_type = app.globalData.change_link_type;
    /*if(change_link_type==0){//未手动切换投屏方式
      if(hotel_info.forscreen_type==2){//直连投屏
        var launch_type = 'speed';
      }else if(hotel_info.forscreen_type==1){
        var launch_type = 'classic';
      }else {
        var launch_type = 'classic';
      }
    }else if(change_link_type==1){
      var launch_type = 'classic';
    }else if(change_link_type ==2){
      var launch_type = 'speed';
    }*/
    var user_info = wx.getStorageSync("savor_user_info");
    openid = e.openid;
    box_mac = e.box_mac;
    that.setData({
      qualityList:app.globalData.qualityList,
      hotel_info:hotel_info,
      openid: openid,
      box_mac: box_mac,
      up_imgs: [],
      tmp_imgs: [],
      pic_show_cur: [],
      avatarUrl: user_info.avatarUrl,
      nickName: user_info.nickName,
      is_btn_disabel:true

    });
    wx.chooseImage({
      count: 6, // 默认6
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        that.setData({
          showTpBt: true,
          showThird: false,
          showSecond: true,
          is_btn_disabel: false
        })
        uploadInfos(res, box_mac, openid);
        lead(openid);
        utils.tryCatch(mta.Event.stat('choosePic', { 'status': 1 }))
      },
      fail:function(res){
        wx.navigateBack({
          delta: 1
        })
        utils.tryCatch(mta.Event.stat('choosePic', { 'status': 0 }))
      }
    })
    function uploadInfos(res, box_mac, openid) {
      var img_len = res.tempFilePaths.length;
      if (img_len > 0 && img_len < 10) {
        var tmp_imgs = [];
        for (var i = 0; i < img_len; i++) {
          tmp_imgs[i] = { "tmp_img": res.tempFilePaths[i], 'resource_size': res.tempFiles[i].size,'oss_img':'','img_id':'','percent':'','is_sing_forscreen':''};
        }
        that.setData({
          showFirst: false,
          showSecond: true,
          showView: false,
          showThird: false,
          percent: 0,
          up_imgs: tmp_imgs,
          img_lenth: img_len,
        })
      }
    } 
    //引导蒙层
    function lead(openid){
      
      var user_info = wx.getStorageSync('savor_user_info');
      var guide_prompt = user_info.guide_prompt;
      if(typeof(guide_prompt)!='undefined'){
        if (guide_prompt.length == 0) {
          that.setData({
            showGuidedMaskBeforLaunch: true,
          })
        } else {
          var is_lead = 1;
          for (var i = 0; i < guide_prompt.length; i++) {
            if (guide_prompt[i] == 1) {
              is_lead = 0;
              break;
            }
          }
          if (is_lead == 1) {
            that.setData({
              showGuidedMaskBeforLaunch: true
            })
          }
        }
      }
      
    }
  },
  getOssParam:function(){
    var that = this;
    wx.request({
      url: api_url + '/Smallapp/Index/getOssParams',
      success: function(rest) {
        policy = rest.data.policy;
        signature = rest.data.signature;
      }
    });
  },

  chooseImage(e) {//重新选择照片开始
    var that = this;
    var openWind= {'isWifi':false,'isError':false,'title':'','step':1,'progress':0,'tip':''};
    that.setData({
      item: [
        { 'name': '公开时显示餐厅信息', 'value': '1', 'checked': true, 'disabled': false },
        { 'name': '公开发表，公众可见', 'value': '2', 'checked': false, 'disabled': false },

      ],
      is_view_forscreen_char:true,
      is_share:0,
      is_btn_disabel: true,
      openWind:openWind,
      cutDownTime:3,
    })
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.boxmac;
    
    wx.chooseImage({
      count: 6, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        that.setData({
          up_imgs: [],
          tmp_imgs: [],
          pic_show_cur: []

        });
        uploadInfos(res, box_mac, openid);
        that.setData({
          showTpBt: true,
          showThird: false,
          is_btn_disabel:false,
        })
        utils.tryCatch(mta.Event.stat('reChoosePic', { 'status': 1 }))
      },fail:function(res){
        utils.tryCatch(mta.Event.stat('reChoosePic', { 'status': 0 }))
      }
    })
    function uploadInfos(res, box_mac, openid) {
      var img_len = res.tempFilePaths.length;
      if (img_len > 0 && img_len < 10) {
        var tmp_imgs = [];
        for (var i = 0; i < img_len; i++) {
          tmp_imgs[i] = { "tmp_img": res.tempFilePaths[i], 'resource_size': res.tempFiles[i].size,'oss_img':'','img_id':'','percent':'','is_sing_forscreen':''};
        }
        that.setData({
          showFirst: false,
          showSecond: true,
          showView: false,
          showThird: false,
          percent: 0,
          up_imgs: tmp_imgs,
          img_lenth: img_len,

        })
      }
    }
  },//重新选择照片结束

  classicForImg:function(res){
    var that = this;
    var up_imgs = that.data.up_imgs;
    var hotel_info = that.data.hotel_info;
    img_lenth = res.img_lenth;
    openid = res.openid;
    box_mac = res.box_mac;
    forscreen_char = res.forscreen_char;
    var avatarUrl = res.avatarUrl;
    var nickName = res.nickName;

    netty_push_info={};
    netty_push_img = [];
    
    var public_text = res.public_text;
    if(typeof(public_text)=='undefined'){
      public_text = '';
    }
    var is_pub_hotelinfo = res.is_pub_hotelinfo;   //是否公开显示餐厅信息
    var is_share = res.is_share;
    that.lead(openid, is_share);
    var is_assist = 0;
    if(is_share==1){
      is_assist = 1
    }
    var openWind = that.data.openWind;
    openWind.title = '您正在使用经典投屏';
    openWind.tip   = '图片正在处理中';
    that.setData({
      is_view_forscreen_char:false,
      isOpenWind:true,
      openWind:openWind,
      //load_fresh_char: '亲^_^投屏中,请稍后...',
      //hiddens: false,
      is_btn_disabel: true,
      is_share: is_share,
      is_assist:is_assist
    })

    uploadOss_multy(forscreen_char, avatarUrl, nickName, public_text);
    function uploadOss_multy( forscreen_char, avatarUrl, nickName, public_text) {
     
      var forscreen_id = (new Date()).valueOf();
      netty_push_info.forscreen_id = forscreen_id;
      netty_push_info.action = 4;
      netty_push_info.resource_type = 2;
      netty_push_info.openid = openid;
      netty_push_info.forscreen_char = forscreen_char;
      netty_push_info.avatarUrl = avatarUrl;
      netty_push_info.nickName  = nickName;
      netty_push_info.res_sup_time = (new Date()).valueOf();
      var qualityList = app.globalData.qualityList;
      var quality_obj = {quality:'',quality_type:''};
      
      for(let j in qualityList){
        if(qualityList[j].checked==true){
          quality_obj.quality = qualityList[j].quality;
          quality_obj.quality_type    = qualityList[j].value;
          break;
        }
      }
      
      for (var i = 0; i < up_imgs.length; i++) {
        
        var res_sup_time = (new Date()).valueOf();
        var filename = up_imgs[i].tmp_img;
        var resource_size = up_imgs[i].resource_size;
        var index1 = filename.lastIndexOf(".");
        var index2 = filename.length;
        var timestamp = (new Date()).valueOf();
        postf = filename.substring(index1, index2);//后缀名
        post_imgs[i] = "forscreen/resource/" + timestamp + postf;

        up_imgs[i].oss_img = post_imgs[i];
        up_imgs[i].img_id  = timestamp;
        up_imgs[i].resource_size = resource_size
        
        //第二步
        uploadOssNew( filename, resource_size, timestamp, i,  forscreen_char, forscreen_id, res_sup_time, avatarUrl, nickName, public_text,quality_obj);
        app.sleep(1)
      }
    }
    function uploadOssNew(img_url, resource_size, timestamp, flag,forscreen_char, forscreen_id, res_sup_time, avatarUrl, nickName, public_text,quality_obj) {
      var img_len = up_imgs.length;
      var filename = img_url;
      var index1 = filename.lastIndexOf(".");
      var index2 = filename.length;
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      var order = flag + 1;
      var postf_t = filename.substring(index1, index2);//后缀名
      var postf_w = filename.substring(index1 + 1, index2);//后缀名
      upload_task = wx.uploadFile({
        url: oss_upload_url,
        filePath: img_url,
        name: 'file',
        header: {
          'Content-Type': 'image/' + postf_w
        },
        formData: {
          Bucket: "redian-produce",
          name: img_url,
          key: "forscreen/resource/" + timestamp + postf_t,
          policy: policy,
          OSSAccessKeyId: app.globalData.oss_access_key_id,
          sucess_action_status: "200",
          signature: signature

        },
        success: function (res) {
          var openWind = that.data.openWind;

          
          
          var res_eup_time = (new Date()).valueOf();
          var netty_tmp = {};
          netty_tmp.url = "forscreen/resource/" + timestamp + postf_t+quality_obj.quality;
          netty_tmp.filename = filename = timestamp + postf_t ;
          netty_tmp.order    = flag;
          netty_tmp.img_id   = timestamp;
          if(quality_obj.quality_type==3){
            netty_tmp.resource_size = resource_size;
          }else {
            netty_tmp.resource_size = 0;
          }
          
          netty_push_img.push(netty_tmp);

          var have_up_img_num = netty_push_img.length;
          var progress  =parseInt((have_up_img_num / img_len)*100) ;
          openWind.progress = progress;
          that.setData({openWind:openWind})
          
          utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
            forscreen_id: forscreen_id,
            openid: openid,
            box_mac: box_mac,
            action: 4,
            mobile_brand: mobile_brand,
            mobile_model: mobile_model,
            forscreen_char: forscreen_char,
            public_text: public_text,
            imgs: '["forscreen/resource/' + timestamp + postf_t + '"]',
            quality_type:quality_obj.quality_type,
            resource_id: timestamp,
            res_sup_time: res_sup_time,
            res_eup_time: res_eup_time,
            resource_size: resource_size,
            is_pub_hotelinfo: is_pub_hotelinfo,
            is_share: is_share,
            resource_type: 1,
            res_nums: img_len,
            serial_number:app.globalData.serial_number
          }, (data, headers, cookies, errMsg, statusCode) => {
            /*utils.PostRequest(api_v_url + '/ForscreenHistory/getList', {
              openid: openid,
              box_mac: box_mac,
              page: page,
            }, (data, headers, cookies, errMsg, statusCode) => {
              var hst_list = data.result;

              if (JSON.stringify(hst_list) == "{}") {
                that.setData({
                  forscreen_history_list: ''
                })
              } else {
                that.setData({
                  forscreen_history_list: data.result
                })
              }
            },res=>{},{ isShowLoading: false })*/
            
          },res=>{},{ isShowLoading: false })
          

          if (netty_push_img.length == img_len) {
            
            var end_time = (new Date()).valueOf();
            var diff_time = end_time - forscreen_id;
            netty_push_info.res_eup_time = (new Date()).valueOf();
            netty_push_info.serial_number = app.globalData.serial_number;
            utils.tryCatch(mta.Event.stat('forscreenImgWastTime', { 'uploadtime': diff_time })); 
            netty_push_info.img_list = netty_push_img;

            netty_push_info = JSON.stringify(netty_push_info);
            openWind.step = 2;
            openWind.tip  = '正在投屏,请稍后';
            that.setData({openWind:openWind});
            utils.PostRequest(api_url + '/Netty/Index/pushnetty', {
              box_mac: box_mac,
              msg: netty_push_info,
            }, (data, headers, cookies, errMsg, statusCode) => {
              app.globalData.change_link_type = 1;
              that.setData({
                showThird: true,
                hiddens:true,
                
                showTpBt: false,
                forscreen_id: forscreen_id,
              });
              //倒计时关闭窗口
              that.getHistoryList(openid,box_mac,1,0);
              that.closeOpenWind();
              
            },res=>{
              openWind.tip = '投屏失败，请重试！';
              openWind.isError = true;
              that.setData({
                openWind:openWind,
              })
            },{ isShowLoading: false })

            
          }
        },
        complete: function (es) {
          up_imgs[flag].percent = 100;
          that.setData({
            up_imgs: up_imgs
          })
        },
        fail: function ({ errMsg }) {
          
          wx.showToast({
            title: '投屏失败，请重试',
            icon:'none',
            duration:2000
          })
        },
      });
      upload_task.onProgressUpdate((res) => {
        up_imgs[flag].percent  = res.progress
        that.setData({
          up_imgs: up_imgs
        });
        if (res.progress==100){
          
          up_imgs[flag].is_sing_forscreen = 1;
          that.setData({
            up_imgs:up_imgs,
            showFirst: false,
            showSecond: true,
            showView: false,
            percent: 0
          })
        }
      })
    }
  },
  lead:function(openid, is_share) {
    var that = this;
    if(is_share==1){
      var user_info = wx.getStorageSync('savor_user_info');
      var guide_prompt = user_info.guide_prompt;
      if (typeof (guide_prompt) !='undefined'){
        if (guide_prompt.length == 0) {
          that.setData({
            showGuidedMaskAfterLaunch: true,
          })
        } else {
          var is_lead = 1;
          for (var i = 0; i < guide_prompt.length; i++) {
            if (guide_prompt[i] == 2) {
              is_lead = 0;
              break;
            }
          }
          if (is_lead == 1) {
            that.setData({
              showGuidedMaskAfterLaunch: true
            })
          }
        }
      }  
    } 
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
    this.setData({isOpenWind:false,is_btn_disabel:false})
    upload_task.abort();
  },
  //retryForscreen
  
  tipsForLaunchWindowRetry:function(){
    var that = this;
    var hotel_info = that.data.hotel_info;
    var form_data  = that.data.form_data;
    var launchType = that.data.launchType;
    that.setData({
      openWind:{'isWifi':false,'isError':false,'title':'','step':1,'progress':0,'tip':''}
    })
    if(launchType=='classic'){//经典投屏
      that.classicForImg(form_data);
    }else {//极速投屏
      that.speedForImg(form_data,hotel_info);
    }
  },
  speedForImg:function(form_data,hotel_info){
    var that = this;
    that.imgLinkHotelWifi(form_data,hotel_info);
  },
  imgLinkHotelWifi:function(data,hotel_info){
    var that = this;
    var wifi_name = hotel_info.wifi_name;
    var wifi_mac = hotel_info.wifi_mac;
    var use_wifi_password = hotel_info.wifi_password;
    var box_mac = hotel_info.box_mac
    if (hotel_info.wifi_name != '') {
      var openWind = that.data.openWind;
      openWind.isWifi = true,
      openWind.step = 1;
      openWind.title = '您正在使用极速投屏';
      openWind.tip   = '包间wifi链接中';
      that.setData({
        isOpenWind:true,
        openWind:openWind,
        is_view_forscreen_char:false,
      })

      wx.startWifi({
        success: function (res) {
          wx.getConnectedWifi({
            success: function (res) {
              //第一步链接wifi
              if (res.errMsg == 'getConnectedWifi:ok') {
                if (res.wifi.SSID == wifi_name) {//链接的是本包间wifi
                  wx.stopWifi({
                  })
                  app.globalData.link_type = 2;
                  //第二步开始投屏
                  that.speedUploadImg(hotel_info,data);

                } else {//链接的不是本包间wifi
                  that.imgConnectWifi(wifi_name, wifi_mac, use_wifi_password, box_mac,hotel_info,data);
                }
              } else {
                //当前打开wifi 但是没有链接任何wifi
                that.imgConnectWifi(wifi_name, wifi_mac, use_wifi_password, box_mac,hotel_info,data);
              }
              //wx.hideLoading()
            }, fail: function (res) {
              var err_msg = 'wifi链接失败';
              if(res.errMsg == 'getConnectedWifi:fail:currentWifi is null' || res.errMsg=='getConnectedWifi:fail no wifi is connected.'){
                that.imgConnectWifi(wifi_name, wifi_mac, use_wifi_password, box_mac,hotel_info,data);
              }else {
                if (res.errCode == 12005) { //安卓特有  未打开wifi
                  err_msg = '请打开您的手机Wifi';
                  
                } else if (res.errCode == 12006) {//Android 特有，未打开 GPS 定位开关
                  err_msg = '请打开您的手机GPS';
                  
                } else if(res.errCode == 12007){//用户拒绝授权链接 Wi-Fi
                  
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
  imgConnectWifi:function(wifi_name, wifi_mac, use_wifi_password, box_mac,hotel_info,data){
    var that = this;
    var openWind = that.data.openWind;
    wx.connectWifi({
      SSID: wifi_name,
      BSSID: wifi_mac,
      password: use_wifi_password,
      success: function (reswifi) {
        wx.onWifiConnected((result) => {
          
          if(result.wifi.SSID==wifi_name){
            if(admin ==1){
              //app.showToast('wifi链接成功');
              app.globalData.link_type = 2;
              that.speedUploadImg(hotel_info,data);
              return true;
            }
            
          }
          
        },()=>{
          openWind.tip = err_msg;
          openWind.isError = true;
          that.setData({
            openWind:openWind
          })
        })
      }, fail: function (res) {
        var err_msg = 'wifi链接失败';
        if(res.errCode==12000){
        }else {
          if (res.errCode == 12005) { //安卓特有  未打开wifi
            err_msg = '请打开您的手机Wifi';
            
          } else if (res.errCode == 12006) {//Android 特有，未打开 GPS 定位开关
            err_msg = '请打开您的手机GPS';
            
          } else if(res.errCode == 12007){//用户拒绝授权链接 Wi-Fi
            
          }else if(res.errCode==12010){
            err_msg = '请确认并打开wifi';
            
          }else {
            if (use_wifi_password == '') {
              var wifi_password_str = '空';
            } else {
              var wifi_password_str = use_wifi_password;
            }
            var msg = '请手动连接包间wifi:' + wifi_name + ',密码为' + wifi_password_str+'。连上wifi投屏更快哦！';
            
          }
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

    },res=>{},{ isShowLoading: false })
    
  },
  speedUploadImg:function(hotel_info,data){
    var that = this;

    var openWind = that.data.openWind;
    openWind.step = 2;
    openWind.tip = '图片处理中';
    that.setData({
      openWind:openWind,
      is_btn_disabel: true,
    })
    var forscreen_id = (new Date()).valueOf();
    var start_time   = (new Date()).getTime();
    var intranet_ip = hotel_info.intranet_ip;
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    
    var up_imgs = that.data.up_imgs;
    var hotel_info = that.data.hotel_info;
    img_lenth = up_imgs.length;
    openid = data.openid;
    box_mac = data.box_mac;
    forscreen_char = data.forscreen_char;
    var avatarUrl = data.avatarUrl;
    var nickName = data.nickName;
    
    var post_img_data = [];

    for (var i = 0; i < img_lenth; i++) {
      
      var filename = (new Date()).valueOf();
      up_imgs[i].img_id = filename;
      up_imgs[i].is_sing_forscreen = 1;
      up_imgs[i].percent = 100;
      var img_url = up_imgs[i].tmp_img;
      var img_size = up_imgs[i].resource_size;
      
      console.log("http://" + intranet_ip + ":8080/picH5?isThumbnail=1&imageId=20170301&deviceId=" + openid + "&box_mac=" + box_mac + "&deviceName=" + mobile_brand + "&rotation=90&imageType=1&web=true&forscreen_id=" + forscreen_id + '&forscreen_char=' + forscreen_char + '&filename=' + filename + '&device_model=' + mobile_model + '&resource_size=' + img_size + '&action=4&resource_type=1&avatarUrl=' + avatarUrl + "&nickName=" + nickName + "&forscreen_nums=" + img_lenth+"&serial_number="+app.globalData.serial_number);
      upload_task=wx.uploadFile({
        url: "http://" + intranet_ip + ":8080/picH5?isThumbnail=1&imageId=20170301&deviceId=" + openid + "&box_mac=" + box_mac + "&deviceName=" + mobile_brand + "&rotation=90&imageType=1&web=true&forscreen_id=" + forscreen_id + '&forscreen_char=' + forscreen_char + '&filename=' + filename + '&device_model=' + mobile_model + '&resource_size=' + img_size + '&action=4&resource_type=1&avatarUrl=' + avatarUrl + "&nickName=" + nickName + "&forscreen_nums=" + img_lenth+"&serial_number="+app.globalData.serial_number,
        filePath: img_url,
        name: 'fileUpload',
        success: function(res) {
          console.log(res)
          var box_post_data = {'filename':''};
          box_post_data.filename = filename;
          post_img_data.push(box_post_data);
          
          var have_up_img_num = post_img_data.length;
          var progress  =parseInt((have_up_img_num / img_lenth)*100) ;

          openWind.progress = progress;
          that.setData({openWind:openWind})


          if (post_img_data.length == img_lenth) {
            var end_time = (new Date()).getTime();
            var diff_time =  end_time - start_time;
            var info_rt = JSON.parse(res.data);
            if (info_rt.code == 1001) {
              
              openWind.tip = '投屏失败，请重试！';
              openWind.isError = true;
              that.setData({
                openWind:openWind,
                is_btn_disabel: false,
                hiddens: true,
              })
              
            }else {
              
              openWind.step = 3;
              openWind.tip = '正在投屏,请稍后';
              that.setData({
                openWind:openWind,
                showThird: true,
                hiddens:true,
                up_imgs: up_imgs,
                forscreen_char: forscreen_char,
                
              })
              that.getHistoryList(openid,box_mac,1,1)
              that.closeOpenWind();
              utils.tryCatch(mta.Event.stat('wifiPicForscreen', { 'picnums': up_imgs.length }));

            }
            utils.tryCatch(mta.Event.stat('wifiPicUploadWasteTime', { 'wasttime': diff_time }));
          }
        },
        fail: function({
          errMsg
        }) {
          if (i == img_lenth) {
            
            that.setData({
              is_btn_disabel: false,
              hiddens: true,
            })
            app.showToast('投屏失败,请确认是否连接本包间wifi！',3000,'none',true);
            
          }
        },
      });
      utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
        forscreen_id: forscreen_id,
        openid: openid,
        box_mac: box_mac,
        action: 4,
        mobile_brand: mobile_brand,
        mobile_model: mobile_model,
        forscreen_char: forscreen_char,
        public_text: '',
        imgs: '[]',
        resource_id: filename,
        resource_size: img_size,
        is_pub_hotelinfo: 0,
        is_share: 0,
        resource_type: 1,
        res_nums: img_lenth,
        serial_number:app.globalData.serial_number,
        is_speed:1,
      }, (data, headers, cookies, errMsg, statusCode) => {
        
      },res=>{},{ isShowLoading: false })
      app.sleep(1);
    }
  },
  getHistoryList:function(openid,box_mac,page,is_speed= 0){
    
    var that = this;
    utils.PostRequest(api_v_url + '/ForscreenHistory/getList', {
      openid: openid,
      box_mac: box_mac,
      page: page,
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
          
          wx.request({
            url: 'http://' + hotel_info.intranet_ip + ':8080/h5/projectionLog?openid='+openid+'&box_mac='+box_mac,
            success:function(res){
              console.log('盒子数据');
              console.log(res)
              if(res.data.code==10000){
                console.log('云端数据')
                console.log(forscreen_history_list);
                
                
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
              console.log('最终数据');
              console.log(forscreen_history_list);
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
        }
      }
      
    },res=>{},{ isShowLoading: false })


  },
  up_forscreen(e) {//多张图片投屏开始(不分享到发现)
    var that = this;
    var launchType = e.detail.target.dataset.launch_type;
    var up_imgs = that.data.up_imgs;
    var hotel_info = that.data.hotel_info;
    img_lenth = e.detail.value.img_lenth;
    openid = e.detail.value.openid;
    box_mac = e.detail.value.box_mac;
    forscreen_char = e.detail.value.forscreen_char;
    var avatarUrl = e.detail.value.avatarUrl;
    var nickName = e.detail.value.nickName;
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var openWind = {'isWifi':false,'isError':false,'title':'','step':1,'progress':0,'tip':''};
    that.setData({
      openWind:openWind,
      form_data:e.detail.value,
      launchType:launchType,
    })
    if(launchType=='classic'){//经典投屏
      that.classicForImg(e.detail.value);
      return false;

    }else if(launchType=='speed'){//极速投屏


      that.speedForImg(e.detail.value,hotel_info);
      return false;
      //return false;
      
    }
  }, //多张图片投屏结束(不分享到发现)
  up_single_pic(e) {//指定单张图片投屏开始
    var that = this;
    var launchType = that.data.launchType; //投屏方式
    box_mac = e.target.dataset.boxmac;
    openid = e.target.dataset.openid;
    var forscreen_img = e.target.dataset.img;
    var img_id  = e.target.dataset.img_id;
    
    var forscreen_id = (new Date()).valueOf();
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var img_index = e.target.dataset.imgindex;
    var img_len = e.target.dataset.imglen;
    var resource_size = e.target.dataset.resource_size

    var user_info = wx.getStorageSync("savor_user_info");
    var avatarUrl = user_info.avatarUrl;
    var nickName  = user_info.nickName;


    var hotel_info = that.data.hotel_info;
    if(launchType =='classic'){
      var pos = forscreen_img.lastIndexOf('/');
      var filename = forscreen_img.substring(pos + 1);
      for (var p = 0; p < img_len; p++) {
      
        if (img_index == p) {
          pic_show_cur[p] = true;
  
        } else {
          pic_show_cur[p] = false;
        }
        that.setData({
          pic_show_cur: pic_show_cur
        })
      }
      var qualityList = app.globalData.qualityList;
      var quality_obj = {quality:'',quality_type:''};
      
      for(let j in qualityList){
        if(qualityList[j].checked==true){
          quality_obj.quality = qualityList[j].quality;
          quality_obj.quality_type    = qualityList[j].value;
          break;
        }
      }


      var push_img = [];
      var push_info = {};
      push_info.forscreen_id = forscreen_id;
      push_info.action = 4;
      push_info.resource_type = 2;
      push_info.openid = openid;
      push_info.forscreen_char = forscreen_char;
      push_info.avatarUrl = avatarUrl;
      push_info.nickName  = nickName;
      push_info.serial_number = app.globalData.serial_number;
      push_info.quality_type = quality_obj.quality_type;
      var netty_tmp = {};
      netty_tmp.url = forscreen_img+quality_obj.quality ;
      netty_tmp.filename = filename ;
      netty_tmp.img_id   = img_id;
      if(quality_obj.quality_type==3){
        netty_tmp.resource_size = resource_size;
      }else {
        netty_tmp.resource_size = 0;
      }
      
  
      push_img.push(netty_tmp);
  
      push_info.img_list = push_img;
  
      push_info = JSON.stringify(push_info);
      utils.PostRequest(api_url+'/Netty/Index/pushnetty', {
        box_mac: box_mac,
        msg: push_info,
      }, (data, headers, cookies, errMsg, statusCode) => {

        utils.PostRequest(api_v_url+'/index/recordForScreenPics', {
          forscreen_id: forscreen_id,
            openid: openid,
            box_mac: box_mac,
            action: 2,
            resource_type: 1,
            mobile_brand: mobile_brand,
            mobile_model: mobile_model,
            imgs: '["' + forscreen_img + '"]',
            quality_type:quality_obj.quality_type,
            serial_number : app.globalData.serial_number
        }, (data, headers, cookies, errMsg, statusCode) => {

        },res=>{},{ isShowLoading: false })
        
      },res=>{
        wx.showToast({
          title: '投屏失败!',
          icon: 'none',
          duration: 2000,

        })
      },{ isShowLoading: false })

      
    }else if(launchType=='speed'){
      var intranet_ip = hotel_info.intranet_ip;
      var img_url = e.currentTarget.dataset.tmp_img;
      var filename = e.currentTarget.dataset.img_id;
      wx.uploadFile({
        url: "http://" + intranet_ip + ":8080/h5/singleImg?isThumbnail=1&imageId=20170301&deviceId=" + openid + "&box_mac=" + box_mac + "&deviceName=" + mobile_brand + "&rotation=90&imageType=1&web=true&forscreen_id=" + forscreen_id + '&forscreen_char=' + forscreen_char + '&filename=' + filename + '&device_model=' + mobile_model + '&resource_size=' + resource_size + '&action=2&resource_type=1&avatarUrl=' + avatarUrl + "&nickName=" + nickName+"&serial_number="+app.globalData.serial_number,
        filePath: img_url,
        name: 'fileUpload',
        success: function(res) {
          var info_rt = JSON.parse(res.data);
          if (info_rt.code == 1001) {
            
            app.showToast('投屏失败，请重试！')
    
          }else if(info_rt.code==-1){
            app.showToast('系统繁忙,请重试');
          }
        },
        fail: function({
          errMsg
        }) {
          /*wx.navigateBack({
            delta: 1,
          })*/
          app.showToast('投屏失败,请确认是否连接本包间wifi！',3000,'none',true);
        },
      });
      utils.tryCatch(mta.Event.stat("wifiswitchpic", {}));
    }
  },//指定单张图片投屏结束
  exitForscreen(e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.boxmac;
    var hotel_info = that.data.hotel_info;
    app.controlExitForscreen(openid, box_mac,hotel_info ,that,1);
  },//退出投屏结束
  //是否公开显示餐厅信息
  checkboxChange:function(e){
    var that = this;
    var check_lenth = e.detail.value.length;
    var check_arr = e.detail.value;
    if(check_lenth==2){
      that.setData({
        is_share: 1,
        is_pub_hotelinfo: 1
      })
    }else if(check_lenth==1){
      if (check_arr[0]==1){
        that.setData({
          is_share:0,
          is_pub_hotelinfo: 1
        })
      }else if(check_arr[0]==2){
        that.setData({
          is_share: 1,
          is_pub_hotelinfo:0
        })
      }
    }else if(check_lenth==0){
       that.setData({
         is_pub_hotelinfo: 0,
         is_share: 0
       })
    }
    var check_arr = e.detail.value;
    

  },//是否公开显示餐厅信息结束
  previewImage: function (e) {
    var current = e.target.dataset.src;
    var pkey = e.target.dataset.pkey;
    var urls = [];
    for (var row in current) {
      urls[row] = current[row]['res_url']

    }
    wx.previewImage({
      current: urls[pkey], // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
  replayHistory: function(e) {
    console.log(e);
    var that = this;
    var box_mac = e.target.dataset.box_mac;

    var is_speed = e.target.dataset.is_speed;
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
          console.log("http://" + hotel_info.intranet_ip + ":8080/picH5?isThumbnail=1&imageId=20170301&deviceId=" + openid + "&box_mac=" + box_mac + "&deviceName=" + mobile_brand + "&rotation=90&imageType=1&web=true&forscreen_id=" + forscreen_id + '&forscreen_char=' + forscreen_char + '&filename=' + filename + '&device_model=' + mobile_model + '&resource_size=' + img_size + '&action=4&resource_type=1&avatarUrl=' + avatarUrl + "&nickName=" + nickName + "&forscreen_nums=" + img_lenth+"&serial_number="+app.globalData.serial_number);
          wx.request({
            url: "http://" + hotel_info.intranet_ip + ":8080/picH5?isThumbnail=1&imageId=20170301&deviceId=" + openid + "&box_mac=" + box_mac + "&deviceName=" + mobile_brand + "&rotation=90&imageType=1&web=true&forscreen_id=" + forscreen_id + '&forscreen_char=' + forscreen_char + '&filename=' + filename + '&device_model=' + mobile_model + '&resource_size=' + img_size + '&action=4&resource_type=1&avatarUrl=' + avatarUrl + "&nickName=" + nickName + "&forscreen_nums=" + img_lenth+"&serial_number="+app.globalData.serial_number,
            success:function(res){
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
        wx.request({
          url: 'http://' + hotel_info.intranet_ip + ':8080/videoH5?deviceId=' + openid + '&box_mac=' + box_mac + '&deviceName=' + mobile_brand + '&web=true&forscreen_id=' + forscreen_id + '&filename=' + filename + '&device_model=' + mobile_model + '&resource_size=' + resouce_size + '&duration=' + duration + '&action=2&resource_type=2&avatarUrl=' + avatarUrl + "&nickName=" + nickName+'&serial_number='+app.globalData.serial_number,
          
          success:function(res){
            if(res.data.code==10000){
              console.log(res)
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
        tmp.duration      = 0;
        pubdetail[i] = tmp;
      }
      app.boxShow(box_mac, forscreen_id, pubdetail, res_type, res_nums, action, '', that);
    }
    
  },
  //上拉刷新
  loadMore: function (e) {
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
  
  upload_wait:function(e){
    wx.showToast({
      title: '该图片未上传成功,请稍后！',
      icon: 'none',
      duration: 2000
    });
  },
  //我要助力
  assist:function(e){
    var that = this;
    var openid = e.detail.value.openid;
    var box_mac = e.detail.value.box_mac;
    var forscreen_id = e.detail.value.forscreen_id;
    
    if (typeof (forscreen_id)=='undefined'){
      wx.showToast({
        title: '助力参数异常，请重试或重选照片',
        icon:'none',
        duration:2000
      })
      
    }else {
      utils.PostRequest(api_url +'/Smallapp3/ForscreenHelp/helpplay', {
        forscreen_id: forscreen_id,
        openid      : openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        var rec_id = data.result.forscreen_id;
        wx.navigateTo({
          url: '/pages/mine/assist/index?forscreen_id=' + rec_id + '&box_mac=' + box_mac +"&inside=1",
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
  phonecallevent: function (e) {
    var tel = e.target.dataset.tel;
    wx.makePhoneCall({
      phoneNumber: tel,
      success:function(res){
        utils.tryCatch(mta.Event.stat('forImgPhoneCall', { 'status': 1 }))
      },fail:function(res){
        utils.tryCatch(mta.Event.stat('forImgPhoneCall', { 'status': 0 }))
      }
    })
  },
  closeLead:function (e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    if(type==1){
      that.setData({
        showGuidedMaskBeforLaunch:false,
      })
    }else if(type==2){
      that.setData({
        showGuidedMaskAfterLaunch:false,
      })
    }
    utils.PostRequest(api_url + '/Smallapp3/content/guidePrompt', {
      openid: openid,
      type: type,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var user_info = wx.getStorageSync('savor_user_info');

      user_info.guide_prompt.push(type);
      wx.setStorageSync('savor_user_info', user_info);
    },res=>{},{ isShowLoading: false })
    
  },
  goToBack:function(e){
    var that = this;
    var params = that.data.showThird
    if(params==true){
      var status =1;
    }else {
      var status = 0;  
    }
    app.goToBack(status);
  },
  /**
   * 选择投屏类型
   */
  chooseLaunchType:function(e){
    let that=this;
    var hotel_info = that.data.hotel_info;
    let launchType=e.currentTarget.dataset.launch_type;
    
    if(launchType=='speed'){
      hotel_info.forscreen_type = 2;
      app.linkHotelWifi(hotel_info,that,'speed');
      mta.Event.stat('clickChangeLinkType',{'openid':openid,'linktype':2,'forscreentype':2,'boxmac':box_mac})
    }else {
      that.setData({launchType:launchType});
      app.globalData.change_link_type = 1;
      mta.Event.stat('clickChangeLinkType',{'openid':openid,'linktype':1,'forscreentype':2,'boxmac':box_mac})
    }


    
  },
  /**
   * 选择照片清晰度
   */
  RadoChange:function(e){
    var qualityList = this.data.qualityList;
    var q_value = e.detail.value;
    for(let i in qualityList){
      if(qualityList[i].checked==true){
        qualityList[i].checked = false;
      }
      if(qualityList[i].value == q_value){
        qualityList[i].checked = true;
      }
    } 
    app.globalData.qualityList = qualityList;
    this.setData({qualityList:qualityList})
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    
  },
  onUnload:function(){
    this.data.up_imgs = [];
   
  }
})
