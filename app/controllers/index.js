var Movie = require('../models/movie.js');
var Category = require('../models/category.js');

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
				title:'imooc 首页',
				categories: categories
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