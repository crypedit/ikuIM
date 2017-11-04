var app = getApp()

var testmsgs = {
  info: {
    from: 'me',
    to: 'you'
  },
  username: '',
  yourname: 'me',
  msg: {
    type: 'here',
    data: 'value',
    url: '',
  },
  style: 'txt',
  time: 'time',
  mid: 'msg.type + msg.id'
}
Page({
    data: {
        chatMsg: [
          testmsgs,
          testmsgs,
          testmsgs,
          testmsgs
        ],
        yourname: '',
        myName: '',
        sendInfo: '',
        userMessage: '',
        inputMessage: '',
        indicatorDots: true,
        interval: 5000,
        duration: 1000,
        view: 'scroll_view',
        toView: '',
        msgView: {},
        buddy: null,
    },
    onLoad: function (options) {
        var that = this
        that.buddy = getApp().globalData.buddy
    },
    onShow: function () {
        var that = this
        this.setData({
            inputMessage: ''
        })
    },
    bindMessage: function (e) {
      var that = this
      that.setData({
        userMessage: e.detail.value
      })
    },
    cleanInput: function () {
      var that = this
      that.setData({
        sendInfo: that.data.userMessage
      })
    },
    sendMessage: function () {

      if (!this.data.userMessage.trim()) return;

        var that = this
        var msgData = {
          info: {
            from: 'msg.from',
            to: 'msg.to'
          },
          username: '',
          yourname: 'msg.from',
          msg: {
            type: 'txt',
            data: 'value',
            url: 'msg.url'
          },
          style: 'txt',
          time: 'time',
          mid: 'msgid-'+that.data.chatMsg.length+1
        }
        that.data.chatMsg.push(msgData)
        this.setData({
          chatMsg: that.data.chatMsg,
          toView: msgData.mid
        })
    },

    receiveMsg: function (msg, type) {
        var that = this
        var myName = wx.getStorageSync('myUsername')
        if (msg.from == that.data.yourname || msg.to == that.data.yourname) {
            that.data.chatMsg.push(msgData)
        }
    },
    
    quitChatRoom: function(){
        console.log('ScareCrow');
        var option = {
            roomId: '21873157013506',
            success: function(){
                console.log("quitChatRoom");
            }
        }
        WebIM.conn.quitChatRoom(option);
    },
})