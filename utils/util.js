const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime,
  formatNumber: formatNumber
}

module.exports.throttle = function(fn, gapTime) {
  if (gapTime == null || gapTime == undefined) {
    gapTime = 1500
  }

  let _lastTime = null

  // 返回新的函数
  return function() {
    let _nowTime = +new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments) //将this和参数传给原函数
      _lastTime = _nowTime
    }
  }
}


const PostRequest = (url, data, success) => {
  wx.request({
    url: url,
    headers: {
      'Content-Type': 'application/json'
    },
    data: data,
    method: "POST",
    success: typeof(success) == "function" ? success : function() {}
  });
}
module.exports.PostRequest = PostRequest;

const GetRequest = (url, data, success) => {
  wx.request({
    url: url,
    headers: {
      'Content-Type': 'application/json'
    },
    data: data,
    method: "GET",
    success: typeof(success) == "function" ? success : function() {}
  });
}
module.exports.GetRequest = GetRequest;


const TouchMoveHandler = function(systemInfo, touchMoveExecuteTrip) {
  this.options = {
    systemInfo: systemInfo,
    touchMoveExecuteTrip: touchMoveExecuteTrip
  }
  this.Event = { // 滑动事件定义
    Start: 0x00, // 滑动开始
    InsufficientData: 0x01, // 数据量不足
    UndifindedStartTouchEvent: 0x90, // 没有开始滑动事件
    UndifindedEndTouchEvent: 0x99, // 没有结束滑动事件
    UndifindedSlideType: 0x92, // 没有滑动类型
    LeftSlide: 0x10, // 向左滑动开始
    LeftSlideMoved: 0x19, // 向左滑动完成
    RightSlide: 0x20, // 向右滑动开始
    RightSlideMoved: 0x29, // 向右滑动完成
    ReturnToOrigin: 0x80, // 返回原点滑动开始
    ReturnToOriginMoved: 0x89 // 返回原点滑动完成
  };
  this.SlideType = { // 滑动类型定义
    LeftSlide: -1, // 向左滑动
    RightSlide: 1 // 向右滑动
  };

  /**
   * 手指滑动处理
   *
   * @para page                页面对象
   * @para startEvent          开始滑动的事件
   * @para endEvent            结束滑动的事件
   * @para callbackFunction    执行动画完成后回调函数。返回 Argument{
   *                                                           handleEvent // 处理事件
   *                                                           page // 页面对象
   *                                                           startEvent // 手指滑动开始事件
   *                                                           endEvent // 手指滑动结束事件
   *                                                           top // 元素上边距
   *                                                           left // 元素左边距
   *                                                           x // 元素移动距离
   *                                                      }
   */
  this.touchMoveHandle = function(page, startEvent, endEvent, callbackFunction) {
    // console.log(page, startEvent, endEvent);
    let handler = this;
    handler.callbackHandel(callbackFunction, handler.Event.Start, page, startEvent, endEvent);
    if (typeof(startEvent) != 'object' || startEvent == null) {
      handler.callbackHandel(callbackFunction, handler.Event.UndifindedStartTouchEvent, page, startEvent, endEvent);
      console.error('start-touch-event is null');
      return;
    }
    if (typeof(endEvent) != 'object' || endEvent == null) {
      handler.callbackHandel(callbackFunction, handler.Event.UndifindedEndTouchEvent, page, startEvent, endEvent);
      console.error('end-touch-event is null');
      return;
    }
    let moveExecuteTrip = handler.options.touchMoveExecuteTrip / handler.options.systemInfo.pixelRatio;
    let tripLeft = endEvent.touches[0].pageX - startEvent.touches[0].pageX;
    let tripTop = endEvent.touches[0].pageY - startEvent.touches[0].pageY + handler.options.systemInfo.statusBarHeight + 46;
    let tripX = endEvent.touches[0].pageX - startEvent.touches[0].pageX;
    let tripY = endEvent.touches[0].pageY - startEvent.touches[0].pageY;
    if (tripX <= -1 * moveExecuteTrip) { // 向左滑动处理
      let x = (handler.options.systemInfo.screen.width + tripLeft) * -1;
      handler.callbackHandel(callbackFunction, handler.Event.LeftSlide, page, startEvent, endEvent, tripTop, tripLeft, x);
      handler.moveOnhorizontalHandel(page, tripTop, tripLeft, x, startEvent, endEvent, callbackFunction);
      handler.callbackHandel(callbackFunction, handler.Event.LeftSlideMoved, page, startEvent, endEvent, tripTop, tripLeft, x);
    } else if (tripX >= moveExecuteTrip) { // 向右滑动处理
      let x = handler.options.systemInfo.screen.width - tripLeft;
      handler.callbackHandel(callbackFunction, handler.Event.RightSlide, page, startEvent, endEvent, tripTop, tripLeft, x);
      handler.moveOnhorizontalHandel(page, tripTop, tripLeft, x, startEvent, endEvent, callbackFunction);
      handler.callbackHandel(callbackFunction, handler.Event.RightSlideMoved, page, startEvent, endEvent, tripTop, tripLeft, x);
    } else {
      handler.callbackHandel(callbackFunction, handler.Event.ReturnToOrigin, page, startEvent, endEvent, tripTop, tripLeft);
      handler.returnToOriginHandel(page, startEvent, endEvent);
      handler.callbackHandel(callbackFunction, handler.Event.ReturnToOriginMoved, page, startEvent, endEvent, tripTop, tripLeft);
    }
  };

  /**
   * 点击滑动处理
   *
   * @para page                页面对象
   * @para slideType           滑动类型
   * @para wechartEvent        微信的事件
   * @para callbackFunction    执行动画完成后回调函数。返回 Argument{
   *                                                           handleEvent // 处理事件
   *                                                           page // 页面对象
   *                                                           startEvent // 手指滑动开始事件
   *                                                           endEvent // 手指滑动结束事件
   *                                                           top // 元素上边距
   *                                                           left // 元素左边距
   *                                                           x // 元素移动距离
   *                                                      }
   */
  this.clickMoveHandle = function(page, slideType, trip, wechartEvent, callbackFunction) {
    // console.log(page, startEvent, endEvent);
    let handler = this;
    let startEvent = wechartEvent,
      endEvent = wechartEvent;
    handler.callbackHandel(callbackFunction, handler.Event.Start, page, startEvent, endEvent);
    if (typeof(slideType) != 'number') {
      handler.callbackHandel(callbackFunction, handler.Event.UndifindedSlideType, page, startEvent, endEvent);
      console.error('start-event is null');
      return;
    }
    if (typeof(trip) != 'number') {
      handler.callbackHandel(callbackFunction, handler.Event.UndifindedSlideType, page, startEvent, endEvent);
      console.error('trip is null');
      return;
    }
    let moveExecuteTrip = handler.options.touchMoveExecuteTrip / handler.options.systemInfo.pixelRatio;
    let tripLeft = 0;
    let tripTop = handler.options.systemInfo.statusBarHeight + 46;
    if (slideType === handler.SlideType.LeftSlide) { // 向左滑动处理
      let x = trip * -1 / handler.options.systemInfo.pixelRatio;
      handler.callbackHandel(callbackFunction, handler.Event.LeftSlide, page, startEvent, endEvent, tripTop, tripLeft, x);
      handler.moveOnhorizontalHandel(page, tripTop, tripLeft, x, startEvent, endEvent, callbackFunction);
      handler.callbackHandel(callbackFunction, handler.Event.LeftSlideMoved, page, startEvent, endEvent, tripTop, tripLeft, x);
    } else if (slideType === handler.SlideType.RightSlide) { // 向右滑动处理
      let x = trip / handler.options.systemInfo.pixelRatio;
      handler.callbackHandel(callbackFunction, handler.Event.RightSlide, page, startEvent, endEvent, tripTop, tripLeft, x);
      handler.moveOnhorizontalHandel(page, tripTop, tripLeft, x, startEvent, endEvent, callbackFunction);
      handler.callbackHandel(callbackFunction, handler.Event.RightSlideMoved, page, startEvent, endEvent, tripTop, tripLeft, x);
    }
  };

  /**
   * 返回原点处理
   *
   * @para page                页面对象
   * @para startEvent          开始滑动的事件
   * @para endEvent            结束滑动的事件
   */
  this.returnToOriginHandel = function(page, startEvent, endEvent) {
    let handler = this;
    wx.showLoading({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    });
    let animation = wx.createAnimation({
      duration: 100,
      // timingFunction: 'cubic-bezier(.8,.2,.1,0.8)'
    });
    animation.left(0).top(handler.options.systemInfo.statusBarHeight + 46).step({
      duration: 100,
      timingFunction: 'ease'
    });
    page.setData({
      animationData: animation.export()
    });
    setTimeout(function() {
      page.setData({
        animationData: {},
        // cards: [{
        //   x: 0,
        //   y: handler.options.systemInfo.statusBarHeight + 46
        // }]
      });
      wx.hideLoading();
    }, 100);
  };

  /**
   * 水平移动处理
   *
   * @para page                页面对象
   * @para startEvent          开始滑动的事件
   * @para endEvent            结束滑动的事件
   * @para top                 上边距
   * @para left                左边距
   * @para x                   水平滑动行程
   * @para callbackFunction    执行动画完成后回调函数。返回 Argument{
   *                                                           handleEvent // 处理事件
   *                                                           page // 页面对象
   *                                                           startEvent // 手指滑动开始事件
   *                                                           endEvent // 手指滑动结束事件
   *                                                           top // 元素上边距
   *                                                           left // 元素左边距
   *                                                           x // 元素移动距离
   *                                                      }
   */
  this.moveOnhorizontalHandel = function(page, top, left, x, startEvent, endEvent, callbackFunction) {
    console.log("TouchMoveHandler.moveOnhorizontalHandel(page, top, left, x, startEvent, endEvent, callbackFunction)", page, startEvent, endEvent, top, left, x);
    let handler = this;
    wx.showLoading({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    });
    let animation = wx.createAnimation({
      duration: 350,
      // timingFunction: 'cubic-bezier(.8,.2,.1,0.8)'
    });
    animation.left(left).top(top).translateX(x).translateY(0).step({
      duration: 300,
      timingFunction: 'linear'
    });
    animation.left(0).top(handler.options.systemInfo.statusBarHeight + 46).translateX(0).translateY(0).step({
      duration: 10,
      // timingFunction: 'step-start'
      timingFunction: 'ease-out'
    });
    page.setData({
      animationData: animation.export()
    });
    setTimeout(function() {
      let cards_img = page.data.cards_img;
      cards_img.splice(0, 1);
      page.setData({
        animationData: {},
        cards_img: cards_img,
        // cards: [{
        //   x: 0,
        //   y: handler.options.systemInfo.statusBarHeight + 46
        // }]
      });
      console.log("TouchMoveHandler.moveOnhorizontalHandel(page, top, left, x, startEvent, endEvent, callbackFunction)#setTimeout", cards_img);
      wx.hideLoading();
      if (cards_img.length <= 3) {
        handler.callbackHandel(callbackFunction, handler.Event.InsufficientData, page, startEvent, endEvent, top, left, x);
      }
    }, 350);
  };

  /**
   * 回调处理
   *
   * @para callback            执行动画完成后回调函数
   * @para handleEvent         处理事件
   * @para page                页面对象
   * @para startEvent          开始滑动的事件
   * @para endEvent            结束滑动的事件
   * @para top                 上边距
   * @para left                左边距
   * @para x                   水平滑动行程
   */
  this.callbackHandel = function(callback, handleEvent, page, startEvent, endEvent, top, left, x) {
    let handler = this;
    if (typeof(callback) != 'function') {
      return;
    }
    callback(handleEvent, page, startEvent, endEvent, top, left, x);
  }
};
module.exports.TouchMoveHandler = TouchMoveHandler;