var token = USER_TOKEN;
var baseUrl = API_BASE_URL;
var mentionPattern = /\[([^\]]+)\]\((\d+)\)/;

var resp = http.get(baseUrl + '/messages?token=' + token);
output.pollStatus = '' + resp.status;

if (resp.ok) {
    var data = json(resp.body);
    var messages = data.messages;
    output.pollMsgCount = '' + messages.length;

    for (var j = messages.length - 1; j >= 0; j--) {
        var msg = messages[j];
        if (msg.role === 'assistant' || msg.role === 'model') {
            var match = msg.content.match(mentionPattern);
            if (match) {
                output.mentionName = match[1];
                output.mentionUserId = match[2];
                output.found = 'true';
                break;
            }
        }
    }
}
