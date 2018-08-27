// pages/forscreen/forscreen.js
const app = getApp();
var openid;                     //用户小程序唯一标识
var box_mac = '';               //机顶盒mac
var page = 1;                    //当前节目单页数
Page({
  /**
 * 页面的初始数据
 */
  data: {
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
  },//输入三维数字验证码结束
  
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
            happy_vedio_title:res.data.result.name,
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
  //选择照片上电视
  chooseImage(e) {
    var that = this;
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid  = e.currentTarget.dataset.openid;
    
    wx.navigateTo({
      url: '/pages/forscreen/forimages/index?box_mac='+box_mac+'&openid='+openid,
    })
  },
  
  //选择视频投屏
  chooseVedio(e){
    var that = this
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    wx.navigateTo({
      url: '/pages/forscreen/forvideo/index?box_mac=' + box_mac + '&openid=' + openid,
    })
  },
  
  /**/
  boxShow(e){//视频点播让盒子播放
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid  = e.currentTarget.dataset.openid;
    var vediourl = e.currentTarget.dataset.vediourl;
    var forscreen_char = e.currentTarget.dataset.name;
    
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