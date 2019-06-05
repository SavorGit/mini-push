//  抢红包-主页 pages/thematic/money_blessing/main.js
const app = getApp();
var openid;
var box_mac;
var order_id;
var api_url = app.globalData.api_url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    jump_url:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (options != undefined) {
      order_id = options.order_id;
      var jump_url = decodeURIComponent(options.jump_url);
      that.setData({
        pay_result_url: jump_url,
      })
      wx.setStorage({
        key: 'pay_info',
        data: { 'order_id': order_id }
      })
    }else {
      var pay_info = wx.getStorageSync('pay_info')
      var user_info = wx.getStorageSync('savor_user_info');
      var openid    = user_info.openid;
      order_id = pay_info.order_id;
      
      wx.request({
        url: api_url+'/Smallapp3/redpacket/getresult',
        header: {
          'content-type': 'application/json'
        },
        data:{
          order_id:order_id,
          open_id:openid,
        },
        success:function(res){
          //console.log(res);
          if(res.data.code==10000){
            var pay_status = res.data.result.status;
            var jump_url   = res.data.result.jump_url;
            if (pay_status==0){

            } else if (pay_status == 1) { //付款码到电视

            } else if (pay_status == 2) { //付款中

            } else if (pay_status == 3) {  //付款失败
              
              wx.navigateBack({
                delta: 1
              })
              wx.showToast({
                title: '支付失败',
                icon: 'none',
                duration: 2000
              }); 
            } else if(pay_status==4){ //付款成功
              that.setData({
                pay_result_url: jump_url,
              })
            } 
          }
        }
      })

      // console.log(pay_info);
      // var jump_url = decodeURIComponent(pay_info.jump_url);
      // that.setData({
      //    pay_result_url: jump_url,
      // })
      
    }
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onLoad()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})