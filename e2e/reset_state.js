var userId = USER_ID;
var baseUrl = ADMIN_BASE_URL;
var authHeader = 'Basic YWRtaW46dGVhY3Vw';
var headers = {
    'Authorization': authHeader,
    'Content-Type': 'application/x-www-form-urlencoded'
};

http.post(baseUrl + '/admin/users/' + userId + '/reset', {
    headers: headers,
    body: '_method=patch'
});

http.post(baseUrl + '/admin/users/' + userId + '/reset_messaging', {
    headers: headers,
    body: '_method=patch'
});

output.resetDone = 'true';
