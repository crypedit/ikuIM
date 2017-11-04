var WebSocket = require('ws');
var ws = new WebSocket('wss://wechat.iku.im/ws');
var DSA = require('otr').DSA;
var OTR = require('otr').OTR;
console.log("creating DSA");
var myKey = new DSA();
console.log("created DSA: " + myKey.fingerprint());

function initAKE(options) {
    var buddy = new OTR(options);

    buddy.REQUIRE_ENCRYPTION = true

    buddy.on('ui', function (msg, encrypted, meta) {
        console.log(msg, encrypted)
    });

    buddy.on('io', function (msg, meta) {
        ws.send(
            JSON.stringify(
                {
                    "from":"alice",
                    "msg":msg
                }
            ));
    });

    buddy.on('error', function (err, severity) {
        if (severity === 'error')  // either 'error' or 'warn'
            console.error("error occurred: " + err);
    });

    buddy.on('status', function (state) {
      switch (state) {
        case OTR.CONST.STATUS_AKE_SUCCESS:
          // sucessfully ake'd with buddy
          // check if buddy.msgstate === OTR.CONST.MSGSTATE_ENCRYPTED

          break;
        case OTR.CONST.STATUS_END_OTR:
          // if buddy.msgstate === OTR.CONST.MSGSTATE_FINISHED
          // inform the user that his correspondent has closed his end
          // of the private connection and the user should do the same
          break;
      }
    })

    ws.on('message', function incoming(res) {
        var events = res.split('\n');
        events.forEach(
            function(e){
                console.log(e);
                try {
                    var data = JSON.parse(e);
                    if (data.from != 'alice') {
                        buddy.receiveMsg(data.msg);
                    }
                } catch (exception) {
                    console.error(data);
                }
            }
        );
    });
}

ws.on('open', function open() {
    var options = {
        fragment_size: 140,
        send_interval: 200,
        priv: myKey
    };
    initAKE(options);
    ws.send(
        JSON.stringify(
            {
                "from":"alice",
                "msg":"?OTRv23?"
            }
        ));
});
