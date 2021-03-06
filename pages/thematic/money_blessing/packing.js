// 抢红包-发红包 pages/thematic/money_blessing/packing.js
const utils = require('../../../utils/util.js')
const app = getApp();
var openid;
var box_mac;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    blessingArray: [],
    blessingIndex: 0,
    
    rangeArray: [],
    rangeIndex: 0,
    //rangeid:1,
    blessid: 1,
    sex:1,
    hiddens:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    openid = options.openid;
    box_mac= options.box_mac;
    var type = 2;    //默认发红包入口
    if(typeof(options.type)!='undefined'){
      type = options.type;
    }
    /*if(type==4){            //商务或者生日聚餐入口
      var rangeid = 3;

    }else{
      var rangeid = 1;
    }*/
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    that.setData({
      type:type,
      openid: openid,
      box_mac: box_mac,
      avatarUrl: user_info.avatarUrl,
      //rangeid:rangeid
      
    })
    //获取发送红包 祝福语 发送范围配置
    utils.PostRequest(api_v_url+'/Redpacket/getConfig', {
      type: type
    }, (data, headers, cookies, errMsg, statusCode) => {
      var range_list = data.result.range_list;
      var rangeid = range_list[0].id
      that.setData({
        blessingArray: data.result.bless,
        rangeArray:data.result.range,
        range_list:data.result.range_list,
        rangeid:rangeid
      })
    },res=>{
      wx.navigateBack({
        delta: 1,
      })
      app.showToast('该电视暂不支持发送红包');
      
    })

  },
  //监测红包总金额
  setTotalCount:function(res){
    var regu = "^([0-9]*[.0-9])$"; // 小数测试
    var re = new RegExp(regu);
    var totalCount = res.detail.value;
    if(totalCount!=''){

      if ( totalCount.substr(0, 1) == '.') {
          return '';
      }
      if (totalCount.search(re) == -1) {
        
        totalCount = Math.round(totalCount * 100) / 100;
        if (parseFloat(totalCount).toString() == "NaN") {
          return '';
        }
        return parseFloat(totalCount).toString() ;

      }
      //totalCount = parseFloat(totalCount).toFixed(2);
      if (totalCount > 500) {
        return 500;
      }
      if(totalCount<1){
        return 1;
      }
    }
    /*var obj = res.detail;
    if (obj.value != '' && obj.value.substr(0, 1) == '.') {
      obj.value = "";
    }
    obj.value = obj.value.replace(/^0*(0\.|[1-9])/, '$1');//解决 粘贴不生效
    obj.value = obj.value.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符
    obj.value = obj.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的     
    obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数     
    if (obj.value.indexOf(".") < 0 && obj.value != "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
      if (obj.value.substr(0, 1) == '0' && obj.value.length == 2) {
        obj.value = obj.value.substr(1, obj.value.length);
      }
    }
    console.log(obj.value);
    return obj.value;*/

  },
  //监测发红包个数
  setTotalNums:function(res){
    var totalNums = res.detail.value;
    if(totalNums!=''){
      if (totalNums <= 0) {
        return 1;
      }
      if(totalNums>500){
        return 500;
      }
    }   
  },
  sexChange:function(res){
    var that = this;
    var sex = res.detail.value;
    that.setData({
      sex:sex,
    })
  },
  bindBlessPickerChange:function(res){
    var that = this;
    var blessid = parseInt(res.detail.value)+1;
    that.setData({
      blessingIndex:res.detail.value,
      blessid: blessid,
    })
  },
  bindRangePickerChange:function(res){
    var that = this;
    var type = that.data.type;
    console.log(res.detail.value)
    var range_list = that.data.range_list;
    var rangeIndex = res.detail.value
    var rangeid = range_list[rangeIndex].id;
    that.setData({rangeIndex:rangeIndex,rangeid:rangeid})
    /*if(type==2){
      var rangeid = parseInt(res.detail.value)+1;
      that.setData({
        rangeIndex:res.detail.value,
        rangeid: rangeid
      })
    }else {
      that.setData({
        rangeid: 3
      })
    }*/
  },
  sendRedPacket:function(res){
    var that = this;
    
    var totalcount = res.detail.value.totalcount;
    if(totalcount==''){
      wx.showToast({
        title: '请输入红包金额',
        icon: 'none',
        duration: 2000
      });
      return false;
    }else {
      totalcount = parseFloat(totalcount);
      if(isNaN(totalcount)){
        wx.showToast({
          title: '请输入1-500的红包金额',
          icon: 'none',
          duration: 2000
        });
        return false;
      }
      if(totalcount>500 || totalcount<1){
        wx.showToast({
          title: '请输入1-500的红包金额',
          icon: 'none',
          duration: 2000
        });
        return false;
      }
    }
    var totalnums = res.detail.value.totalnums;
    if(totalnums==''){
      wx.showToast({
        title: '请输入红包个数',
        icon: 'none',
        duration: 2000
      });
      return false;
    }else {
      totalnums = parseInt(totalnums);
      if (isNaN(totalnums) ){
        wx.showToast({
          title: '请输入1-500的红包个数',
          icon: 'none',
          duration: 2000
        });
        return false;
      }
      if(totalnums>500 || totalnums<1){
        wx.showToast({
          title: '请输入1-500的红包个数',
          icon: 'none',
          duration: 2000
        });
        return false;
      }
    }
    var surname = res.detail.value.surname.replace(/\s+/g, '');
    if(surname ==''){
      wx.showToast({
        title: '请输入姓氏',
        icon: 'none',
        duration: 2000
      });
      return false;
    }

    var sex = res.detail.value.sex;
    var blessid = res.detail.value.blessid;
    var rangeid = res.detail.value.rangeid;
    var openid = res.detail.value.openid;
    var box_mac = res.detail.value.box_mac;

    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var forscreen_id = (new Date()).valueOf();
    that.setData({
      hiddens: false,
    })
    //发送电视红包
    wx.request({
      url: api_v_url+'/redpacket/sendTvbonus',
      header: {
        'content-type': 'application/json',
        'serial-number':app.globalData.serial_number
      },
      data: {
        amount: totalnums,
        bless_id:blessid,
        mac: box_mac,
        open_id:openid,
        scope:rangeid,
        sex:sex,
        surname: surname,
        total_money:totalcount,
      },
      success:function(res){
        if(res.data.code==10000){
          if(res.data.result.pk_type==1){//微信扫二维码支付
            that.setData({
              hiddens: true,
            })
            var order_id = res.data.result.order_id;
            var jump_url = res.data.result.jump_url;
            jump_url = encodeURIComponent(jump_url);

            //记录发红包日志
            utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
              forscreen_id: forscreen_id,
              openid: openid,
              box_mac: box_mac,
              action: 120,
              mobile_brand: mobile_brand,
              mobile_model: mobile_model,

              imgs: '[]',
              resource_id: order_id,
              serial_number:app.globalData.serial_number
            }, (data, headers, cookies, errMsg, statusCode) => {

            })
            wx.navigateTo({
              url: '/pages/thematic/money_blessing/pay_result?order_id=' + order_id + '&jump_url=' + jump_url,
            })
          }else if(res.data.result.pk_type==2){//微信小程序支付api
            

            wx.requestPayment({
              'timeStamp': res.data.result.payinfo.timeStamp,
              'nonceStr': res.data.result.payinfo.nonceStr,
              'package': res.data.result.payinfo.package,
              'signType': 'MD5',
              'paySign': res.data.result.payinfo.paySign,
              success(res) {
                that.setData({
                  hiddens: true,
                })
                wx.showToast({
                  title: '支付成功',
                  duration: 2000,
                  icon: 'success',
                })
                setTimeout(function () {
                  wx.redirectTo({
                    url: '/pages/thematic/money_blessing/main?openid=' + openid+"&box_mac="+box_mac
                  })
                }, 1000);
                
              },
              fail(res) {
                if (res.errMsg == "requestPayment:fail cancel") {
                  wx.showToast({
                    title: '支付取消',
                    icon:'none',
                    duration: 1200
                  })

                } else {

                  wx.showToast({
                    title: '支付失败',
                    icon:'none',
                    duration: 2000
                  })

                }
                that.setData({
                  hiddens: true,
                })
              }
            })
          }
        } else if (res.data.code == 90118) {
          that.setData({
            hiddens: true,
          })
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          });
        }else if(res.data.code==90117){
          that.setData({
            hiddens: true,
          })
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          });
        }else {
          that.setData({
            hiddens: true,
          })
          wx.showToast({
            title: '发送红包失败',
            icon: 'none',
            duration: 2000
          });
          wx.navigateTo({
            url: '/pages/thematic/money_blessing/main?openid='+openid+'&box_mac='+box_mac,
          })
        }
      }
    })
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
    
    wx.removeStorage({key: 'pay_info',});
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

  }
})