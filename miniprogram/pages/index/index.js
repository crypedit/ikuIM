//index.js
//获取应用实例
var app = getApp()
const DSA = require('../../lib/otr/lib/dsa.js')
const TextMessage = require('../../lib/leancloud-realtime.js').TextMessage

Page({
  data: {
    motto: '正在创建房间...',
    progress: '0',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    buddyInfo: {},
    shareable: '/pages/index/index',
    myKey: null,
  },
  buddy: null,
  conv: null,
  onShareAppMessage: function () {
    console.log(this.shareableURL())
    return {
      title: this.data.userInfo.nickName + '邀请您加入一对一密聊，点击打开近默小程序',
      desc: this.data.userInfo.nickName + '邀请您加入一对一密聊，点击打开近默小程序',
      path: '/pages/index/index' + this.shareableURL()
    }
  },

  shareableURL: function () {
    var that = this
    that.updateProgress(55)
    return '?' +
      'buddy=' +
      encodeURIComponent(that.data.userInfo.nickName) +
      '&target=' +
      encodeURIComponent(that.data.userInfo.nickName + '-' + that.data.buddyInfo.nickName) +
      '&conv=' + encodeURIComponent(that.conv.id)
  },

  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  updateProgress: function (num) {
    var that = this
    that.setData({
      progress: num
    })
    switch (num) {
      case 10: that.setData({
        motto: '正在创建房间...'
      })
        break
      case 20: that.setData({
        motto: '正在创建秘钥...'
      })
        break
      case 30: that.setData({
        motto: '正在连接服务器...'
      })
        break
      case 50: that.setData({
        motto: '请点右上角分享给你需要私密聊天的微信用户'
      })
        break
      case 55: that.setData({
        motto: '正在等待对方加入... '
      })
        break
      case 60: that.setData({
    motto: '正在等待对方响应...'
  })
        break
      case 100: that.setData({
    motto: '会话已建立'
  })
        wx.navigateTo({
    url: '../chatroom/chatroom' + '?buddy=' + that.data.buddyInfo.nickName
  })
        break
    }
  },

  initAKE: function () {
    var that = this
    var options = {
      fragment_size: 140,
      send_interval: 200,
      priv: that.myKey
    }
    that.myKey = wx.getStorageSync('myKey')
    if (that.myKey) {
      console.log('Using stored DSA')
    } else {
      console.log('Generating DSA...')
      that.myKey = new DSA()
      console.log('Generating DSA done')
      wx.setStorageSync('myKey', that.myKey)
    }

    var OTR = require('../../lib/otr/lib/otr.js')
    var buddy = new OTR(options)
    this.buddy = buddy

    buddy.REQUIRE_ENCRYPTION = true

    buddy.on('ui', function (msg, encrypted, meta) {
      console.log("message to display to the user: " + msg)
      // encrypted === true, if the received msg was encrypted
      console.log("(optional) with receiveMsg attached meta data: " + meta)
    })

    buddy.on('io', function (msg, meta) {
      console.log("message to send to buddy: " + msg)
      console.log("(optional) with sendMsg attached meta data: " + meta)
      that.conv.send(new TextMessage(msg))
    })

    buddy.on('error', function (err, severity) {
      if (severity === 'error')  // either 'error' or 'warn'
        console.error("error occurred: " + err)
    })

    buddy.on('status', function (state) {
      switch (state) {
        case OTR.CONST.STATUS_AKE_SUCCESS:
          // sucessfully ake'd with buddy
          // check if buddy.msgstate === OTR.CONST.MSGSTATE_ENCRYPTED

          that.updateProgress(100)
          app.buddies[that.data.buddyInfo.nickName] = buddy
          app.currentBuddy = buddy
          break
        case OTR.CONST.STATUS_END_OTR:
          // if buddy.msgstate === OTR.CONST.MSGSTATE_FINISHED
          // inform the user that his correspondent has closed his end
          // of the private connection and the user should do the same
          break
      }
    })
  },

  receiveMsg: function (rcvmsg) {
    var that = this
    that.buddy.receiveMsg(rcvmsg)
  },

  onLoad: function (options) {
    this.getUserInfo()
    if (options.buddy) {
      console.log(options.buddy, options.target, options.conv)
      this.joinConversation(options.buddy, options.target, options.conv)
    } else {
      this.initConversation()
    }
  },

  getUserInfo: function () {
    var that = this
    if (app.globalData.userInfo) {
      that.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (that.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          that.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  joinConversation: function (buddy, target, conv) {
    var that = this
    that.updateProgress(20)
    that.initAKE()
    that.updateProgress(30)
    that.setData({
      buddyInfo: { nickName: buddy },
    })
    app.leancloudRealtime.createIMClient(target).then(function (me) {

      return me.getConversation(conv);
    }).then(function (conversation) {
      conversation.on('message', function (message, conversation) {
        console.log(message.text)
        that.receiveMsg(message.text)
      });
      return conversation.join();
    }).then(function (conversation) {
      console.log('加入成功', conversation.members);
      conversation.send(new TextMessage('?OTRv23?'))
      that.conv = conversation
      that.updateProgress(60)

    }).catch(console.error);

  },

  initConversation: function () {
    var that = this
    that.updateProgress(20)
    that.initAKE()
    that.updateProgress(30)
    that.setData({
      buddyInfo: { nickName: String(Math.floor(1000 + Math.random() * 9000)) },
    })
    app.leancloudRealtime.createIMClient(that.data.userInfo.nickName).then(function (me) {
      return me.createConversation({
        members: [encodeURIComponent(that.data.userInfo.nickName + '-' + that.data.buddyInfo.nickName)],
        name: 'Anonymous',
        unique: true,
      });
    }).then(function (conversation) {
      that.conv = conversation
      conversation.on('message', function (message, conversation) {
        that.receiveMsg(message.text)
      });
      console.log(that.shareableURL())
    }).then(function () {
      that.updateProgress(50)
    }).catch(console.error);
  }
})