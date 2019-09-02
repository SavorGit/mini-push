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



module.exports.PostRequest = function(url, data, success) {
  wx.request({
    url: url,
    headers: {
      'Content-Type': 'application/json'
    },
    data: data,
    method: "POST",
    success: success
  });
}

module.exports.GetRequest = function(url, data, success) {
  wx.request({
    url: url,
    headers: {
      'Content-Type': 'application/json'
    },
    data: data,
    method: "GET",
    success: success
  });
}


module.exports.TouchMoveHandler = function(systemInfo, touchMoveExecuteTrip) {
  this.options = {
    systemInfo: systemInfo,
    touchMoveExecuteTrip: touchMoveExecuteTrip
  }
  this.Event = {
    Start: 0x00,
    Less3Item: 0x01,
    UndifindedStartTouchEvent: 0x90,
    UndifindedEndTouchEvent: 0x99,
    LeftSlide: 0x10,
    LeftSlideMoved: 0x19,
    RightSlide: 0x20,
    RightSlideMoved: 0x29,
    ReturnToOrigin: 0x80,
    ReturnToOriginMoved: 0x89
  };

  /**
   * 滑动处理
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
    var handler = this;
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
    var moveExecuteTrip = handler.options.touchMoveExecuteTrip / handler.options.systemInfo.pixelRatio;
    var tripLeft = endEvent.touches[0].pageX - startEvent.touches[0].pageX;
    var tripTop = endEvent.touches[0].pageY - startEvent.touches[0].pageY + handler.options.systemInfo.statusBarHeight + 46;
    var tripX = endEvent.touches[0].pageX - startEvent.touches[0].pageX;
    var tripY = endEvent.touches[0].pageY - startEvent.touches[0].pageY;
    if (tripX <= -1 * moveExecuteTrip) { // 向左滑动处理
      var x = (handler.options.systemInfo.screen.width + tripLeft) * -1;
      handler.callbackHandel(callbackFunction, handler.Event.LeftSlide, page, startEvent, endEvent, tripTop, tripLeft, x);
      handler.moveOnhorizontalHandel(page, startEvent, endEvent, tripTop, tripLeft, x);
      handler.callbackHandel(callbackFunction, handler.Event.LeftSlideMoved, page, startEvent, endEvent, tripTop, tripLeft, x);
    } else if (tripX >= moveExecuteTrip) { // 向右滑动处理
      var x = handler.options.systemInfo.screen.width - tripLeft;
      handler.callbackHandel(callbackFunction, handler.Event.RightSlide, page, startEvent, endEvent, tripTop, tripLeft, x);
      handler.moveOnhorizontalHandel(page, startEvent, endEvent, tripTop, tripLeft, x);
      handler.callbackHandel(callbackFunction, handler.Event.RightSlideMoved, page, startEvent, endEvent, tripTop, tripLeft, x);
    } else {
      handler.callbackHandel(callbackFunction, handler.Event.ReturnToOrigin, page, startEvent, endEvent, tripTop, tripLeft);
      handler.returnToOriginHandel(page, startEvent, endEvent);
      handler.callbackHandel(callbackFunction, handler.Event.ReturnToOriginMoved, page, startEvent, endEvent, tripTop, tripLeft);
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
    var handler = this;
    var animation = wx.createAnimation({
      // duration: 100,
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
        cards: [{
          x: 0,
          y: handler.options.systemInfo.statusBarHeight + 46
        }]
      });
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
   */
  this.moveOnhorizontalHandel = function(page, startEvent, endEvent, top, left, x) {
    console.log(page, startEvent, endEvent, top, left, x);
    var handler = this;
    var animation = wx.createAnimation({
      duration: 400,
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
      var cards_img = page.data.cards_img;
      cards_img.splice(0, 1);
      page.setData({
        animationData: {},
        cards_img: cards_img
      });
      if (cards_img < 3) {
        handler.callbackHandel(callbackFunction, handler.Event.Less3Item, page, startEvent, endEvent, tripTop, tripLeft);
      }
    }, 400);
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
    var handler = this;
    if (typeof(callback) != 'function') {
      return;
    }
    callback(handleEvent, page, startEvent, endEvent, top, left, x);
  }
};