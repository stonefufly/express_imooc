var http = require('http');
var credentials = require('../lib/credentials.js');

module.exports = function(query, cb){

    var options = {
        hostname: 'api.map.baidu.com',
        path: '/geocoder/v2/?address=' +
            encodeURIComponent(query) + //把字符串作为 URI 组件进行编码
            '&ak=' + credentials.baiduApiKey +
            '&output=json'//输出格式为json或者xml
    };

    http.request(options, function(res){
        
        //console.log('Status: '+res.statusCode);
        var data = '';
        res.on('data', function(chunk){
            data += chunk;
        });
        res.on('end', function(){
            
            data = JSON.parse(data);
            if(data.result){
                cb(null, data.result.location);
            } else {
                cb("No results found.", null);
            }
        });
    }).end();
};
