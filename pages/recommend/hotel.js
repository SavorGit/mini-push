// pages/recommend/hotel.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cityArray: [
      ['中国'],
      ['北京市', '上海市', '广东省'],
      ['北京市']
    ],
    objectCityArray: [
      [{
        id: 0,
        name: '中国'
      }],
      [{
          id: 1,
          name: '北京市'
        },
        {
          id: 9,
          name: '上海市'
        },
        {
          id: 19,
          name: '广东省'
        }
      ],
      [{
        id: 35,
        name: '北京市'
      }]
    ],
    cityIndex: [0, 0, 0],

    areaArray: ['全部区域', '东城区', '西城区'],
    areaIndex: 0,

    cuisineArray: ['全部菜系', '川菜', '湘菜'],
    cuisineIndex: 0,

    perCapitaPayArray: ['人均价格', '100以下', '100-200', '200以上'],
    perCapitaPayIndex: 0
  },
  bindCityPickerColumnChange: function(e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      cityArray: this.data.cityArray,
      objectCityArray: this.data.objectCityArray,
      cityIndex: this.data.cityIndex
    };
    data.cityIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 1:
        switch (data.cityIndex[1]) {
          case 0:
            data.cityArray[2] = ['北京市'];
            data.objectCityArray[2] = [{
              id: 35,
              name: '北京市'
            }];
            break;
          case 1:
            data.cityArray[2] = ['上海市'];
            data.objectCityArray[2] = [{
              id: 107,
              name: '上海市'
            }];
            break;
          case 2:
            data.cityArray[2] = ['广州市', '深圳市'];
            data.objectCityArray[2] = [{
              id: 236,
              name: '广州市'
            }, {
              id: 246,
              name: '深圳市'
            }];
            break;
        }
        data.cityIndex[2] = 0;
        break;
    }
    console.log(data.cityIndex);
    this.setData(data);
  },
  bindCityPickerChange: function(e) {
    var cityObject = this.data.objectCityArray[2][e.detail.value[2]];
    console.log('picker发送选择改变，携带值为', e.detail.value, cityObject)
    this.setData({
      cityIndex: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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