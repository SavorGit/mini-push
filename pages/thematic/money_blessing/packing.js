// 抢红包-发红包 pages/thematic/money_blessing/packing.js
const app = getApp();
var openid;
var box_mac;
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
    rangeid:1,
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
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    that.setData({
      openid: openid,
      box_mac: box_mac,
      avatarUrl: user_info.avatarUrl,
      
    })
    //获取发送红包 祝福语 发送范围配置
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp3/Redpacket/getConfig',
      header: {
        'content-type': 'application/json'
      },
      data: {
        type: 2
      },
      success:function(res){
        if(res.data.code==10000){
          that.setData({
            blessingArray: res.data.result.bless,
            rangeArray:res.data.result.range

          })
        } else {
          wx.navigateBack({
            delta: 1,
          })
          wx.showToast({
            title: '该电视暂不支持发送红包',
            icon: 'none',
            duration: 2000
          });
        }
        
      },
    })

  },
  //监测红包总金额
  setTotalCount:function(res){
    var regu = "^([0-9]*[.0-9])$"; // 小数测试
    var re = new RegExp(regu);
    var totalCount = res.detail.value;
    if(totalCount!=''){
      if (totalCount.search(re) == -1) {

        totalCount = Math.round(totalCount * 100) / 100;
        if (parseFloat(totalCount).toString() == "NaN") {
          return '';
        }
        return totalCount;

      }
      //totalCount = parseFloat(totalCount).toFixed(2);
      if (totalCount > 500) {
        return 500;
      }
      if(totalCount<1){
        return 1;
      }
    }
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
    var rangeid = parseInt(res.detail.value)+1;
    that.setData({
      rangeIndex:res.detail.value,
      rangeid: rangeid
    })
  },
  sendRedPacket:function(res){
    var that = this;
    that.setData({
      hiddens:false,
    })
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
    var surname = res.detail.value.surname;
    var sex = res.detail.value.sex;
    var blessid = res.detail.value.blessid;
    var rangeid = res.detail.value.rangeid;
    var openid = res.detail.value.openid;
    var box_mnac = res.detail.value.box_mac;

    //发送电视红包
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp3/redpacket/sendTvbonus',
      header: {
        'content-type': 'application/json'
      },
      data: {
        amount: totalcount,
        bless_id:blessid,
        mac: box_mnac,
        open_id:openid,
        scope:rangeid,
        sex:sex,
        surname: surname,
        total_money:totalcount,
      },
      success:function(res){
        if(res.data.code==10000){
          that.setData({
            hiddens: true,
          })
          var order_id = res.data.result.order_id;
          var jump_url = res.data.result.jump_url;
          jump_url = encodeURIComponent (jump_url);
          wx.navigateTo({
            url: '/pages/thematic/money_blessing/pay_result?order_id='+order_id+'&jump_url='+jump_url,            
          })
        } else if (res.data.code == 90118) {
          that.setData({
            hiddens: true,
          })
          wx.showToast({
            title: '请输入正确的姓氏',
            icon: 'none',
            duration: 2000
          });
        }else {
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