
var geocode = require('../lib/geocode.js');
var Dealer = require('../app/models/dealer.js');

module.exports = function(fs){
	// initialize dealers
	Dealer.find({}, function(err, dealers){
	    if(dealers.length) return;
		
		new Dealer({
			name: '石头科技',
			address1: '海淀区 颐和园路 5号',
			city: '北京',
			state: 'OR',
			zip: '97209',
			country: '中国',
			phone: '503-555-1212',
			active: true,
		}).save();

		new Dealer({
			name: '鱼鱼股份',
			address1: '黄浦区 雁荡路 46号',
			city: '上海',
			state: 'OR',
			zip: '97209',
			country: '中国',
			phone: '503-555-1212',
			active: true,
		}).save();

		new Dealer({
			name: '伟岸日用品',
			address1: '越秀区 环市东路 368号',
			city: '广州',
			state: 'OR',
			zip: '97701',
			country: '中国',
			phone: '503-555-1212',
			active: true,
		}).save();
		
	});


	//给代理商的地址做地理编码，并将结果保存到数据库中
	function geocodeDealer(dealer){

		//如果当前代理商的地址跟最近的一个地理编码匹配，则什么也不干直接返回，这样如果代理商的坐标是最新的，这个方法就非常快
	    var addr = dealer.getAddress(' ');
	    if(addr===dealer.geocodedAddress) return;   // already geocoded

	    if(dealerCache.geocodeCount >= dealerCache.geocodeLimit){
	        // has 24 hours passed since we last started geocoding?
	        //自上次做完地理编码已经过去24小时了么？
	        if(Date.now() > dealerCache.geocodeCount + 24 * 60 * 60 * 1000){
	            dealerCache.geocodeBegin = Date.now();
	            dealerCache.geocodeCount = 0;
	        } else {
	            // we can't geocode this now: we've
	            // reached our usage limit
	            //现在还不能做地理编码处理
	            //我们已经达到使用限制了
	            return;
	        }
	    }

		
	    geocode(addr, function(err, coords){
	    	//console.log('>>>>>>>>>'+JSON.stringify(coords));
	        if(err) return console.log('Geocoding failure for ' + addr);
	        dealer.lat = coords.lat;
	        dealer.lng = coords.lng;
	        dealer.save();
	    });
	}

	// optimize performance of dealer display
	//返回在地图上为每个数据添加标记的函数的字符串
	function dealersToGoogleMaps(dealers){

	    var js = 'function addMarkers(map){\n';
	    
	    var i=0;
	    dealers.forEach(function(d){

	    	++i;

	    	if(!d.lat || !d.lng) return;//跳过没有地理编码的代理商

	        var name = d.name.replace(/'/, '\\\'').replace(/\\/, '\\\\');//对name中的反斜杠做转义处理
	        var address = d.getAddress(' ').replace(/'/, '\\\'').replace(/\\/, '\\\\');

	        js += '\tvar point'+i+' = new BMap.Point(' + d.lng + ', ' + d.lat + ');\n' +
	        		'\tvar marker'+i+' = new BMap.Marker(point'+i+');\n' +// 创建标注
	        		'\tmap.addOverlay(marker'+i+');\n' +// 将标注添加到地图中
	        		'\taddClickHandler(\'' + name.replace(/'/, '\\') + '<br>地址：' + address + '\',marker'+i+');\n';//开启信息窗口
	    });
	    js += '}';
	    return js;
	}

	// 代理商缓存
	var dealerCache = {
	    lastRefreshed: 0,
	    refreshInterval: 60 * 60 * 1000,//谷歌地理编码API的限制是每24小时不能超过2500次请求
	    jsonUrl: '/dealers.json',
	    geocodeLimit: 2000,
	    geocodeCount: 0,
	    geocodeBegin: 0,
	};
	dealerCache.jsonFile = __dirname +
	    '/../public' + dealerCache.jsonUrl;

	//刷新代理商缓存函数
	dealerCache.refresh = function(cb){

	    if(Date.now() > dealerCache.lastRefreshed + dealerCache.refreshInterval){
	        // we need to refresh the cache
	        //我们要刷新缓存
	        Dealer.find({ active: true }, function(err, dealers){
	            if(err) return console.log('Error fetching dealers: '+
	                 err);

	            // geocodeDealer will do nothing if coordinates are up-to-date
	        	//如果坐标是最新的，geocodeDealer什么也不做
	            dealers.forEach(geocodeDealer);

	            // we now write all the dealers out to our cached JSON file
	            //现在将所有代理商写到缓存的JSON文件中
	            //要缓存的数据太大，但为了提高速度仍然要缓存它，但不能放在内存里，用一种在客户端超级快的办法，将数据缓存在JSON文件里
	            fs.writeFileSync(dealerCache.jsonFile, JSON.stringify(dealers));

	            //从显示中榨出点性能，在服务器端直接给出JavaScript来提升客户端性能
				fs.writeFileSync(__dirname + '/../public/js/dealers-googleMapMarkers.js', dealersToGoogleMaps(dealers));

	            // all done -- invoke callback
	            //搞定--调用回调
	            cb();
	        });
	    }

	};
	//及时更新缓存的数据
	//如果很多代理商发生了变化，有可能要花一个多小时刷新缓存，所以在刷新完成后用setTimeout等一个小时再刷新缓存
	function refreshDealerCacheForever(){
	    dealerCache.refresh(function(){
	        // call self after refresh interval
	        //刷新间隔结束后调用自己
	        setTimeout(refreshDealerCacheForever,
	            dealerCache.refreshInterval);
	    });
	}
	// create empty cache if it doesn't exist to prevent 404 errors
	//第一次启动应用时，缓存还不存在，所以先创建一个空的，以防止出现404错误
	if(!fs.existsSync(dealerCache.jsonFile)) fs.writeFileSync(JSON.stringify([]));
	// start refreshing cache
	//开始刷新缓存
	//添加或更新了代理商，代理商的地图信息出现在网站上所需的时间是刷新间隔加上地理编码所需的时间
	refreshDealerCacheForever();
};