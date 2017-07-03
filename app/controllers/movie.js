var Movie = require('../models/movie.js');//获取movie模型
var Comment = require('../models/comment.js');
var Category = require('../models/category.js');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

//detail page
exports.detail = function(req,res){
	var id = req.params.id;

	Movie.findById(id, function(err,movie){

		if(err){
			console.log(err);
		}

		Movie.update({_id: id}, {$inc: {pv: 1}}, function(err){//更新电影的访问量每次加1
			if(err){
				console.log(err);
			}
		});

		Comment
			.find({movie: id})//根据电影id查询关联的评论对象数组
			.populate('from', 'name')//对数组的每个评论对象查询from关联的User对象的name值，填充到评论对象里的from引用的User对象里(默认是把Id也查询并填充进去的)
			.populate('reply.from reply.to', 'name')//对评论者和被评论者的名字的关联查询
			.exec(function(err, comments){//完成后执行此函数
				//console.log('comments: '+comments);
				res.render('detail',{
					title:'imooc 详情页'+ movie.title,
					movie: movie,
					comments: comments,
					message: {infos: ['信息1','信息2','信息3']}
				});
			});
		
	});
};

//admin page
exports.new = function(req,res){

	Category.find({}, function(err, categories){
		res.render('admin',{
		title:'imooc 后台录入页',
		movie: {},
		categories: categories
	});
	});
};

//admin update movie
exports.update = function(req,res){
	var id = req.params.id;

	if(id){

		Movie.findById(id, function(err, movie){
			Category.find({}, function(err, categories){
				res.render('admin',{
					title: 'imooc 后台更新页',
					movie: movie,
					categories: categories
				});
			});
		});
	}
};
//admin poster
exports.savePoster = function(req, res, next){

	console.log(req.files);
	var posterData = req.files.uploadPoster;//通过name获取到上传的文件（利用引入的app.use(express.multipart())中间件）
	var filePath = posterData.path;//获取文件的路径
	var originalFilename = posterData.originalFilename;//获取文件的原始名字

	if(originalFilename){
		//有图片传入
		fs.readFile(filePath, function(err, data){//data是获取文件的二进制数据

			var timestamp = Date.now();//创建时间戳来命名上传来的文件
			var type = posterData.type.split('/')[1];//获取文件的type值（posterData.type是'image/png'）切割后的文件后缀（png）
			var poster = timestamp + '.' + type;//文件新名
			//存入服务器的文件中
			var newPath = path.join(__dirname, '../../', '/public/upload/' + poster);//生成服务器存文件的地址
			//__dirname 这个全局变量解析为正在执行的脚本的所在目录，/home/sites/app.js中的脚本中的__dirname解析为/home/sites
			fs.writeFile(newPath, data, function(err){//内存将文件写到服务器的硬盘上

				if(!err){
					req.poster = poster;//将写入后的名字挂到request中
				}
				next();//进入下个流程（Movie.save）
			});
			
		});
	}
	else{
		next();
	}
}
//admin post movie
exports.save = function(req,res){
	var id = req.body.movie._id;//console.log(">>>>>>>>>"+JSON.stringify(id));
	var movieObj = req.body.movie;//console.log(">>>>>>>>>"+JSON.stringify(movieObj));
	var _movie;

	if(req.poster){
		//如果request中挂有poster，则有图片传入
		movieObj.poster = req.poster;//重置要添加或修改的电影的海报地址poster为上传到本地图片的名字
	}
	if(id){
		//修改
		Movie.findById(id, function(err, movie){
			if(err){
				console.log(err);
			}

			_movie = _.extend(movie, movieObj);//把数据库中的movie替换为新的post过来的movie
			_movie.save(function(err, movie){

				if(!err){
					res.redirect('/movie/'+ movie.id + '/find');//重定向到详情页
				}else{
					console.log(err);
				}
			});
		});
	}else{
		//添加
		_movie = new Movie(movieObj);

		var categoryId = movieObj.category;
		var categoryName = movieObj.catetoryName;

		_movie.save(function(err, movie){//movie是保存到数据库后的id有值的对象
			
			if(!err){
				
				if(categoryId){
					//如果选择了分类单选
					Category.findById(categoryId, function(err, category){

						category.movies.push(movie._id);

						category.save(function(err, category){

							res.redirect('/movie/'+ movie._id + '/find');
						});
					});
				}else if(categoryName){
					//如果填写了新增的分类名，则是同时新增分类
					var category = new Category({
						name: categoryName,
						movies: [movie._id]
					});

					category.save(function(err, category){

						movie.category = category._id;//更新已保存的movie的category字段，category字段之前为空
						movie.save(function(err, movie){

							res.redirect('/movie/'+ movie._id + '/find');
						});
					});
				}
			}else{
				console.log(err);
				res.redirect('/admin/movie/new');
			}
		});
	}
};

//list page
exports.list = function(req,res){
	Movie.fetch(function(err,movies){
		if(err){
			console.log(err);
		}

		res.render('list',{
			title:'imooc 列表页',
			movies: movies
		});
	});
};

//list delete movie
exports.delete = function(req,res){
	var id = req.query.id;//因为请求是通过问号后面追加参数的形式发送过来的，所以用此方式获取参数

	if(id){
		Movie.remove({_id: id}, function(err,movie){
			
			// if(!movie){
			// 	if(err){
			// 		console.log(err);
			// 	}
			// 	return next(new NotFound('Document not found'));
			// }
			if(err){
				console.log(err);

				//res.json和res.send两个方法相同作用：
				//1.将响应代码设置为200，
				//2.Content-Type头设置为application/json,
				//3.将javascript对象转换为JSON字符串

				//不同点：
				//res.send被设计为高层的响应工具，它可以发送：
				//1.空白的响应 res.send();
				//2.一些JSON res.send({greet: 'ohai'});
				//3.一些HTML res.send('<p>some html</p>'); 如果给res.send方法传递一个字符串，则它假设你发送的是HTML，如果给res.json方法传递一个字符串，则它以JSON形式发送字符串
				//4.一些纯文本 res.send('text', {'Content-Type': 'text/plain'}, 201);
				//5.什么都没有的404响应 res.send(404);	res.send(err, 422);  res.send(200);
				//res.json则只是发送JSON

				//res.json({success: 0});
				res.send({success: 0});
			}else{
				//删除成功
				//res.json({success: 1});//给客户端的返回一个json数据
				res.send({success: 1});
			}
		})
	}
};