var Q = require('q');
var http = require('http');

module.exports = (function(){
	//用一个IIFE（立即调用函数表达式）来封装缓存，这样就不会有那么多变量污染全局命名空间

	//天气缓存
	var c = {
		refreshed: 0,
		refreshing: false,
		updateFrequency: 360000,//1小时
		weatherinfos: [
			{city:"北京",cityid:"101010100",temp1:"",temp2:"",weather:"",ptime:""},
			{city:"深圳",cityid:"101280601",temp1:"",temp2:"",weather:"",ptime:""},
			{city:"海口",cityid:"101310101",temp1:"",temp2:"",weather:"",ptime:""}
		]
	};
	return function(){
		
		if(!c.refreshing && Date.now() > c.refreshed + c.updateFrequency){
			//初始化天气缓存
			c.refreshing = true;//防止缓存过期时出现多次，冗余的API调用

			var promises = [];

			c.weatherinfos.forEach(function(winfo){

				var deferred = Q.defer();

				var url = 'http://www.weather.com.cn/data/cityinfo/'+winfo.cityid+'.html';
				http.get(url, function(res){
					//异步执行
					var body = '';
					res.on('data', function(chunk){
						body += chunk;
					});
					res.on('end', function(){
						
						body = JSON.parse(body);
						winfo.temp1 = body.weatherinfo.temp1;
						winfo.temp2 = body.weatherinfo.temp2;
						winfo.weather = body.weatherinfo.weather;
						winfo.ptime = body.weatherinfo.ptime;

						deferred.resolve();
					});
				});
				promises.push(deferred);
			});
			Q.all(promises).then(function(){

				//在所有promise都resolve后异步执行此处（等待所有异步都结束后执行此处）
				c.refreshing = false;
				c.refreshed = Date.now();
			});
		}
		//直接运行到此处，不等待所有异步都结束
		return {weatherinfos: c.weatherinfos};
	}
})();