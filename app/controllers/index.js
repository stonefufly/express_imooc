var Movie = require('../models/movie.js');
var Category = require('../models/category.js');
var somesay = require('../../lib/somesay.js');

var credentials = require('../../lib/credentials.js');
var emailService = require('../../lib/email.js')(credentials);
var weather = require('../../lib/weather.js');


//匹配所有路径
exports.allBefore = function(req, res, next){

	console.log('在所有路由之前执行此函数');

	//------------群发邮件
	//emailService.emailError('添加电影数据出错！', __filename, new Error('hhahaah'));
	var largeRecipientList = ['stonefufly@gmail.com','taiduxx@163.com'];//大量的邮件接收者(邮件地址数组)

	//第一次调用render避开了正常的渲染过程（提供了一个回调函数，这样可以防止视图的结果渲染到浏览器中，而回调函数在参数html中接收到渲染好的视图）
	res.render('email/email_to_you', { layout: null, data: {name:'stone'} }, function(err,html){
		//指定layout:null来防止使用我们的布局文件

	    if(err){
	    	console.log('error in email template:'+JSON.stringify(err));
	    }else{
	    	//emailService.send(largeRecipientList, '群发邮件的主题', html);
	    }
	});

	//第二次调用render,这次结果会像往常一样将html响应发给浏览器
    //res.render('email-result', { data: data });
    //-------------
    
	next();//进入后续处理，如果不调用next()则管道就被终止,不会再有处理器或中间件做后续处理
};
//index page
exports.index = function(req,res){

	Category
	.find({})
	.populate({
		path: 'movies',
		select: 'title poster',
			options: {limit: 6}//只获取关联的6条movie数据
		})
	.exec(function(err, categories){

			//console.log('user in session: '+JSON.stringify(req.session.user));
			if(err){
				console.log(err);
			}
			res.render('index',{
				layout: 'layout',
				title:'imooc 首页',
				categories: categories,
				somesay: somesay.getSay(),
				weathers: weather()
			});//视图引擎jade默认会返回text/html的内容类型和200的状态码
		});
};

//search page
exports.search = function(req,res){
	var catId = req.query.cat;
	var page = parseInt(req.query.p, 10) || 0;//页号(转为整型)如果p为空则默认是0
	var count = 2;//每页显示的数据个数
	var index = page * count;//本页起始索引

	var q = req.query.q;

	if(catId){
		//分页查询分类关联的电影数组
		Category
		.find({_id: catId})
		.populate({
			path: 'movies',
			select: 'title poster',
		options: {limit: count, skip: index}//查询每个category关联的movie数组，从movie数组的index索引处开始查询，查询count条数据
	})
	.exec(function(err, categories){//查询出来的数组categories只有一条数据

		//console.log('user in session: '+JSON.stringify(req.session.user));
		if(err){
			console.log(err);
		}

		var category = categories[0] || {};

		//查询分类关联的电影总数
		var query = {};
		if(catId){
			query.category = catId;
		}
	Movie.count(query,function(err, total){//使用 count 返回特定查询(query)的文档数 total

		res.render('results',{
			title:'imooc 结果列表页面',
			keyword: category.name,//分类名
			currentPage: (page+1),
			totalPage: Math.ceil(total/2),//Math.ceil是向上舍入取整
			query: 'cat='+ category._id,
			category: category
		});
	});
});
}else{
		//搜索
		Movie
		.find({title: new RegExp(q+'.*', 'i')})// new RegExp(q+'.*', 'i')是创建一个模糊匹配的正则
		.skip(index)
		.limit(count)
		.exec(function(err, movies){
			if(err){
				console.log(err);
			}

			var category = {};
			category.movies = movies;

		//查询分类关联的电影总数
		var query = {};
		if(q){
			query.title = new RegExp(q+'.*', 'i');
		}
	Movie.count(query,function(err, total){//使用 count 返回特定查询(query)的文档数 total

		res.render('results',{
			title:'imooc 结果列表页面',
			keyword: '搜索：'+q,//分类名
			currentPage: (page+1),
			totalPage: Math.ceil(total/2),//Math.ceil是向上舍入取整
			query: 'q='+ q,
			category: category
		});
	});
});
	}

	
};

exports.xmlData = function(req, res){

	var products = [{id:1,name:'aaa',price:1.2},{id:1,name:'bbb',price:3.5},{id:1,name:'ccc',price:0.9}];

	var toursXml = '<?xml version="1.0"?><tours>' +
		products.map(function(p){
			return '<tour price="' + p.price + '" id="' + p.id + '">' + p.name + '</tour>';
		}).join('') + '</tours>';

	var toursText = products.map(function(p){
		return p.id + ': ' + p.name +' ('+ p.price + ')';
	}).join('\n');

	res.format({//根据接收请求报头发送不同的内容
		'application/json': function(){
			res.json(tours);
		},
		'application/xml': function(){
			res.type('application/xml');
			res.send(toursXml);
		},
		'text/xml': function(){
			res.type('text/xml');
			res.send(toursXml);
		},
		'text/plain': function(){
			res.type('text/plain');
			res.send(toursXml);
		},
		'text/html': function(){
			res.type('text/html');
			res.send('<b>hello word</b>');
		}
	});
}
