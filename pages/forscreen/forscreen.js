// pages/forscreen/forscreen.js
const app = getApp();
var tmp ;
var openid;
var policy;
var signature;
var postf;   //上传文件扩展名
///var timestamp = (new Date()).valueOf();
var box_mac = '';
var upimgs = [];
var post_imgs = [];
var img_lenth = 0;
var oss_img = [];
var tmp_percent = [];
var forscreen_char = '';
var pic_show_cur = [];
var page = 1;
Page({
  /**
 * 页面的初始数据
 */
  data: {
    loadingHidden: true,
    Length: 3,        //输入框个数
    isFocus: false,    //聚焦
    Value: "",        //输入的内容
    ispassword: false, //是否密文显示 true为密文， false为明文。
    pwds:"",
    showView: false,     //是否显示投屏选择图片
    showCode: false,      //显示填写验证码
    showExit: false,     //是否显示退出投屏
    showFirst:true,
    showSecond:false,
    showThird:false,
    showVedio:false,     //投屏视频
    openid :'',
    box_mac:'',
    tempFilePaths:'/images/pic_default.png',
    percent : '',
    hotel_room:'',
    up_imgs:'',
    tmp_percent :[],
    pic_show_cur:[],
    program_list:[],
    hiddens:true,
    upload_vedio_temp:'',   //投屏视频封面图
    vedio_percent:100,
    happy_vedio_url:'' ,          //生日视频url
    happy_vedio_name:''          //生日视频名称
  },
  Focus(e) {
    var that = this;
    var inputValue = e.detail.value;
    that.setData({
      Value: inputValue,
    });

    var code_len = inputValue.length;
    if(code_len==3){

      wx.request({
        url: 'https://mobile.littlehotspot.com/smallapp/index/checkcode',
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
            that.setData({
              showView: (!that.data.showView),
              showCode: (!that.data.showCode),
              isFocus:false
            })
          }

        },
        fial: function ({ errMsg }) {
          console.log('errMsg is', errMsg)
        }
      })
    } 
  },
  Tap() {
    var that = this;
    that.setData({
      isFocus: true,
    })
  },
  
  //进来加载页面：
  onLoad: function (options) {
    box_mac = decodeURIComponent(options.scene);
    var that = this
    wx.request({//获取机顶盒节目单列表
      url: 'https://mobile.littlehotspot.com/Smallapp/BoxProgram/getBoxProgramList',
      header:{
        'Content-Type': 'application/json'
      },
      data:{
        box_mac:box_mac,
        page:page,
      },
      method:"POST",
      success:function(res){
        that.setData({
          program_list:res.data.result
        })
      }
    })

    function getHotelInfo(box_mac){
      wx.request({
        url: 'https://mobile.littlehotspot.com/Smallapp/Index/getHotelInfo',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          box_mac: box_mac,
        },
        method: "POST",
        success: function (res) {
          that.setData({
            hotel_room: res.data.result.hotel_name + res.data.result.room_name,
            happy_vedio_url:res.data.result.vedio_url,
            happy_vedio_name: res.data.result.file_name,
          })
        }
      })
    }
      function setInfos(box_mac,openid){
        that.setData({
          box_mac: box_mac,
          openid:openid
        });
        //发送随机码给电视显示 
        wx.request({
          url: 'https://mobile.littlehotspot.com/Smallapp/Index/genCode',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            box_mac: box_mac,
            openid: openid
          },
          method: "POST",
          success: function (res) {
            var is_have = res.data.is_have;
            var timestamp = (new Date()).valueOf();
            if (is_have == 0) {
             that.setData({
               isFocus:true,
               showCode:true,
               showView:false,
             })
              var code = res.data.code;
              wx.request({
                url: 'https://netty-push.littlehotspot.com/push/box',
                header: {
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST",
                data: {
                  box_mac: box_mac,
                  cmd: 'call-mini-program',
                  msg: '{"action":1,"code":' + code + ',"openid":"'+openid+'"}',
                  req_id: timestamp
                },
                success: function (rt) {
                  
                  if (rt.data.code != 10000) {
                    wx.showToast({
                      title: '该电视暂不能投屏',
                      icon: 'none',
                      duration: 2000
                    })
                  }else {
                    getHotelInfo(box_mac);
                  }
                }
              });
              
            } else if (is_have == 1) {
              that.setData({
                showView: (!that.data.showView),
                showCode: false,
              });
              getHotelInfo(box_mac);
            }
          }
        })
      }
      wx.login({
        success: res => {
          var code = res.code; //返回code
          wx.request({
            url: 'https://mobile.littlehotspot.com/smallapp/index/getOpenid',
            data: { "code": code },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              //console.log(res.data.result.openid);
              //app.globalData.openid = res.data.result.openid;
              setInfos(box_mac, res.data.result.openid);
            }
          })
        }
      });
      
  },
  
  chooseImage(e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.boxmac;
    that.setData({
      up_imgs:[],
      tmp_percent:[],
      tmp_imgs:[],
      pic_show_cur:[]

    })
    function uploadInfos( res,box_mac,openid){
      var img_len = res.tempFilePaths.length;
      if (img_len > 0 && img_len < 10) {
        var tmp_imgs = [];
        for(var i=0;i<img_len;i++){
          tmp_imgs[i] = {"tmp_img":res.tempFilePaths[i]};
        }
        that.setData({
          showExit: true,
          showFirst: false,
          showSecond: true,
          showView: false,
          showThird:false,
          percent: 0,
          up_imgs: tmp_imgs,
          img_lenth:img_len,

        })
      }
     
      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      //var tempFilePaths = res.tempFilePaths
      /**/
    }
    
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        uploadInfos(res, box_mac, openid);
        that.setData({
          showTpBt:true,
          showThird: false,
        })
      }
    })
  },
  up_forscreen(e){
    var that = this;
    img_lenth = e.detail.value.img_lenth;
    openid = e.detail.value.openid;
    box_mac = e.detail.value.box_mac;
    forscreen_char = e.detail.value.forscreen_char;


    
    if (e.detail.value.upimgs0 != '' && e.detail.value.upimgs0 !=undefined) upimgs[0] =e.detail.value.upimgs0;
    if (e.detail.value.upimgs1 != '' && e.detail.value.upimgs1 != undefined) upimgs[1] = e.detail.value.upimgs1;
    if (e.detail.value.upimgs2 != '' && e.detail.value.upimgs2 != undefined) upimgs[2] = e.detail.value.upimgs2;
    if (e.detail.value.upimgs3 != '' && e.detail.value.upimgs3 != undefined) upimgs[3] = e.detail.value.upimgs3;
    if (e.detail.value.upimgs4 != '' && e.detail.value.upimgs4 != undefined) upimgs[4] = e.detail.value.upimgs4;
    if (e.detail.value.upimgs5 != '' && e.detail.value.upimgs5 != undefined) upimgs[5] = e.detail.value.upimgs5;
    if (e.detail.value.upimgs6 != '' && e.detail.value.upimgs6 != undefined) upimgs[6] = e.detail.value.upimgs6;
    if (e.detail.value.upimgs7 != '' && e.detail.value.upimgs7 != undefined) upimgs[7] = e.detail.value.upimgs7;
    if (e.detail.value.upimgs8 != '' && e.detail.value.upimgs8 != undefined) upimgs[8] = e.detail.value.upimgs8;

    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/Index/getOssParams',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (rest) {

        policy = rest.data.policy;
        signature = rest.data.signature;
        uploadOss_multy(policy, signature, upimgs, box_mac, openid, img_lenth, forscreen_char);
      }
    });
    function uploadOssNew(policy, signature, img_url, box_mac, openid, timestamp, flag, img_len, forscreen_char, forscreen_id) {

      var filename = img_url;
      var index1 = filename.lastIndexOf(".");
      var index2 = filename.length;
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      var order = flag+1;
      var postf_t = filename.substring(index1, index2);//后缀名
      var postf_w = filename.substring(index1+1, index2);//后缀名
      console.log(postf_w);
      
      var upload_task = wx.uploadFile({
        url: "https://image.littlehotspot.com",
        filePath: img_url,
        name: 'file',
        header:{
          'Content-Type': 'image/' + postf_w
        },
        formData: {
          Bucket: "redian-produce",
          name: img_url,
          key: "forscreen/resource/" + timestamp + postf_t,
          policy: policy,
          OSSAccessKeyId: "LTAITjXOpRHKflOX",
          sucess_action_status: "200",
          signature: signature

        },

        success: function (res) {
          wx.request({
            url: "https://netty-push.littlehotspot.com/push/box",
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            data: {
              box_mac: box_mac,
              cmd: 'call-mini-program',
              msg: '{ "action": 4, "resource_type":2, "url": "forscreen/resource/' + timestamp + postf_t + '", "filename":"' + timestamp + postf_t + '","openid":"' + openid + '","img_nums":' + img_len + ',"forscreen_char":"' + forscreen_char + '","order":' + order +',"forscreen_id":"'+forscreen_id+'"}',
              req_id: timestamp
            },
            success: function (result) {
              wx.request({
                url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
                header: {
                  'content-type': 'application/json'
                },
                data: {
                  openid: openid,
                  box_mac: box_mac,
                  action:  4,
                  mobile_brand:mobile_brand,
                  mobile_model: mobile_model,
                  forscreen_char:forscreen_char,
                  imgs: '["forscreen/resource/' + timestamp + postf_t + '"]'
                },
              });
              that.setData({
                showExit: true,
                showFirst: false,
                showSecond: true,
                showView: false,
                percent: 0
              })
            },
          })
        },
        complete:function(es){
          tmp_percent[flag] = { "percent": 100 };
          that.setData({
            tmp_percent: tmp_percent
          })
        },
        fial: function ({ errMsg }) {
          console.log('uploadImage fial,errMsg is', errMsg)
        },
      });
      upload_task.onProgressUpdate((res) => {
        tmp_percent[flag] = { "percent": res.progress };
        console.log(res.progress);
        that.setData({
          tmp_percent: tmp_percent
        })
      
      })
      
    }
    function uploadOss_multy(policy, signature, upimgs, box_mac, openid, img_len, forscreen_char) {
       //console.log(img_len);
      var tmp_imgs = [];
      var forscreen_id = (new Date()).valueOf();
       for(var i=0; i<img_len;i++){
         var filename = upimgs[i];
         var index1 = filename.lastIndexOf(".");
         var index2 = filename.length;
         var timestamp = (new Date()).valueOf();
         postf = filename.substring(index1, index2);//后缀名
         post_imgs[i] = "forscreen/resource/" + timestamp + postf;
        
         tmp_imgs[i] = { "oss_img":post_imgs[i]};
         that.setData({
           tmp_imgs: tmp_imgs
         });
         uploadOssNew(policy, signature, filename, box_mac, openid, timestamp, i, img_len, forscreen_char, forscreen_id);
       }
       that.setData({
         showThird:true,
         showTpBt:false
       });
    }
  }, 
  up_single_pic(e){
    var that = this;
    box_mac = e.target.dataset.boxmac;
    openid  = e.target.dataset.openid;
    var forscreen_img =  e.target.dataset.img;
    var pos = forscreen_img.lastIndexOf('/');
    var filename = forscreen_img.substring(pos + 1); 
    var timestamp = (new Date()).valueOf();
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var img_index = e.target.dataset.imgindex;
    var img_len = e.target.dataset.imglen;
    for(var p=0;p<img_len;p++){
      if(img_index==p){
        pic_show_cur[p] = true;
        
      }else {
        pic_show_cur[p] = false;
      }
      that.setData({
        pic_show_cur: pic_show_cur
      })
    }
    wx.request({
      url: "https://netty-push.littlehotspot.com/push/box",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        cmd: 'call-mini-program',
        msg: '{ "action": 2,"resource_type":1, "url": "' + forscreen_img + '", "filename":"' + filename+ '","openid":"'+openid+'"}',
        req_id: timestamp
      },
      success: function (result) {
        wx.request({
          url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
          header: {
            'content-type': 'application/json'
          },
          data: {
            openid: openid,
            box_mac: box_mac,
            action:2,
            resource_type:1,
            mobile_brand: mobile_brand,
            mobile_model: mobile_model,
            imgs: '["'+forscreen_img+'"]'
          },
        });
      },
    })
  },
  exitForscreen(e){
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac= e.currentTarget.dataset.boxmac;
    var timestamp = (new Date()).valueOf();
    wx.request({
      url: "https://netty-push.littlehotspot.com/push/box",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        cmd: 'call-mini-program',
        msg: '{ "action": 3,"openid":"'+openid+'"}',
        req_id: timestamp
      },
      success: function (res){
        wx.showToast({
          title: '退出成功',
          icon: 'none',
          duration: 2000
        });
        that.setData({
          showFirst:true,
          showExit: false,
          showSecond:false,
          showView:true,
          showThird:false,
          showVedio:false,

        })

      },
      fail:function (res){
        wx.showToast({
          title: '网络异常，退出失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  chooseVedio(e){//选择视频投屏
    var that = this
    var box_mac= e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    that.setData({
      upload_vedio_temp: '',
    })

    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: function (res) {
        uploadVedio(res,box_mac,openid);
      }
    });
    function uploadVedio(video,box_mac,openid){
      wx.request({
        url: 'https://mobile.littlehotspot.com/Smallapp/Index/getOssParams',
        headers: {
          'Content-Type': 'application/json'
        },
        success: function (rest) {
          policy = rest.data.policy;
          signature = rest.data.signature;
          uploadOssVedio(policy, signature, video, box_mac, openid);
        }
      });
    }
    function uploadOssVedio(policy, signature, video, box_mac, openid){
      
      var filename = video.tempFilePath;          //视频url
      //var filename_img = video.thumbTempFilePath; //视频封面图
      console.log(video);
      var index1 = filename.lastIndexOf(".");
      var index2 = filename.length;
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      var postf_t = filename.substring(index1, index2);//后缀名
      var timestamp = (new Date()).valueOf();
      
      var upload_task = wx.uploadFile({
        url: "https://image.littlehotspot.com",
        filePath: filename,
        name: 'file',
        
        formData: {
          Bucket: "redian-produce",
          name: filename,
          key: "forscreen/resource/" + timestamp + postf_t,
          policy: policy,
          OSSAccessKeyId: "LTAITjXOpRHKflOX",
          sucess_action_status: "200",
          signature: signature

        },
        success:function(res){
          
          wx.request({
            url: "https://netty-push.littlehotspot.com/push/box",
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            data: {
              box_mac: box_mac,
              cmd: 'call-mini-program',
              msg: '{ "action":2, "url": "forscreen/resource/' + timestamp + postf_t + '", "filename":"' + timestamp + postf_t + '","openid":"' + openid + '","resource_type":2}',
              req_id: timestamp
            },
            success: function (result) {
              wx.request({
                url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
                header: {
                  'content-type': 'application/json'
                },
                data: {
                  openid: openid,
                  box_mac: box_mac,
                  action:2,
                  resource_type:2,
                  mobile_brand: mobile_brand,
                  mobile_model: mobile_model,
                  forscreen_char: forscreen_char,
                  imgs: '["forscreen/resource/' + timestamp + postf_t + '"]'
                },
              });
              
            },
          });
        }
      });
      upload_task.onProgressUpdate((res) => {
        console.log(res.progress);
        that.setData({
          vedio_percent: res.progress
        })

      });
      that.setData({
        showExit: false,
        showFirst: false,
        showSecond: false,
        showView: false,
        showThird: false,
        showVedio: true,
        upload_vedio_temp: filename

      });
    }
  },
  boxShow(e){//视频点播让盒子播放
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid  = e.currentTarget.dataset.openid;
    var vediourl = e.currentTarget.dataset.vediourl;
    
    var index1 = vediourl.lastIndexOf("/");
    var index2 = vediourl.length;
    var filename = vediourl.substring(index1+1, index2);//后缀名
    var timestamp = (new Date()).valueOf();
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    wx.request({
      url: "https://netty-push.littlehotspot.com/push/box",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        cmd: 'call-mini-program',
        msg: '{ "action": 5,"url":"' + vediourl + '","filename":"'+filename+'"}',
        req_id: timestamp
      },
      success: function (res) {
        wx.showToast({
          title: '点播成功,电视即将开始播放',
          icon: 'none',
          duration: 2000
        });
        wx.request({
          url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
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
            imgs: '["media/resource/' + filename+ '"]'
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
  },
  // 上拉加载
  loadMore: function (e) {
    var that= this;
    var box_mac = e.currentTarget.dataset.boxmac;
    page = page+1;
    that.setData({
      hiddens:false,
    })
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/BoxProgram/getBoxProgramList',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        box_mac: box_mac,
        page: page,
      },
      method: "POST",
      success: function (res) {
        that.setData({
          program_list: res.data.result,
          hiddens: true,
        })
      }
    })
  },
  //断开连接
  breakLink:function (e){
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.boxmac;
    var timestamp = (new Date()).valueOf();
    wx.request({
      url: "https://netty-push.littlehotspot.com/push/box",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        cmd: 'call-mini-program',
        msg: '{ "action": 3,"openid":"' + openid + '"}',
        req_id: timestamp
      },
      success: function (res) {
        wx.navigateTo({
          url: '/pages/index/index',
        })

      },
      fail: function (res) {
        wx.showToast({
          title: '网络异常，断开失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }
})