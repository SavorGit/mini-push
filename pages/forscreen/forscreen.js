// pages/forscreen/forscreen.js
const app = getApp();
var tmp ;
var openid;
var policy;
var signature;
var postf;   //上传文件扩展名
///var timestamp = (new Date()).valueOf();
var box_mac = '';
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
    openid :'',
    box_mac:'',
    tempFilePaths:'/images/pic_default.png',
    percent: '0',
    hotel_room:'',
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
            hotel_room: res.data.result.hotel_name + res.data.result.room_name
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
                  msg: '{"action":1,"code":' + code + '}',
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

    function uploadOss(policy, signature,res,box_mac,openid){
      var filename = res.tempFilePaths[0];
      var index1 = filename.lastIndexOf(".");
      var index2 = filename.length;
      var timestamp = (new Date()).valueOf();
      postf = filename.substring(index1, index2);//后缀名
      that.setData({
        tempFilePaths: res.tempFilePaths,
        loadingHidden: false
      });
      setTimeout(function () {
        that.setData({
          loadingHidden: true
        });
        that.update();
      }, 3000);
      /*console.log(policy);
      console.log(signature);
      console.log(res);
      console.log(box_mac);
      console.log(openid);*/
      var upload_task = wx.uploadFile({
        url: "https://oss.littlehotspot.com",
        filePath: res.tempFilePaths[0],
        name: 'file',
        formData: {
          Bucket: "redian-produce",
          name: res.tempFilePaths[0],
          key: "forscreen/resource/" + timestamp + postf,
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
              msg: '{ "action": 2, "url": "forscreen/resource/' + timestamp + postf + '", "filename":"' + timestamp + postf + '"}',
              req_id: timestamp
            },
            success: function (result) {
              
              /*wx.showToast({
                title: '发送投屏成功',
                icon: 'success',
                duration: 1000
              });*/
              
              wx.request({
                url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
                header:{
                  'content-type': 'application/json'
                },
                data:{
                  openid : openid,
                  box_mac:box_mac,
                  imgs: '["forscreen/resource/' + timestamp + postf +'"]'
                },

              });
              that.setData({
                showExit: true,
                showFirst: false,
                showSecond:true,
                showView:false,
                percent:0
                
              })
              //console.log(that.data);

            },
          })
          
        },
        fial: function ({ errMsg }) {
          console.log('uploadImage fial,errMsg is', errMsg)
        },
        

      });
      upload_task.onProgressUpdate((res) => {
        that.setData({
          percent: res.progress
        })
      })
    }
    function uploadInfos( res,box_mac,openid){
      
      wx.request({
        url: 'https://mobile.littlehotspot.com/Smallapp/Index/getOssParams',
        headers: {
          'Content-Type': 'application/json'
        },
        success: function (rest) {

          policy = rest.data.policy;
          signature = rest.data.signature;
          uploadOss(policy, signature, res, box_mac,openid);
        }
      })
      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      //var tempFilePaths = res.tempFilePaths
      /**/
    }
    
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        uploadInfos(res, box_mac, openid);
      }
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
        msg: '{ "action": 3}',
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
  }
})