var Category = require('../models/category.js');

//admin page
exports.new = function(req,res){
	res.render('category_admin',{
		title:'imooc 后台分类录入页',
		category: {}
	});
};


//admin post category
exports.save = function(req,res){

	var _category = req.body.category;

	var category = new Category(_category);

	category.save(function(err, category){//category是保存到数据库后的id有值的对象
			
		if(err){
			console.log(err);
		}
		res.redirect('/admin/category/list');
	});
};


//categorylist page
exports.list = function(req,res){
	Category.fetch(function(err,categories){
		if(err){
			console.log(err);
		}

		res.render('category_list',{
			title:'imooc 电影分类列表页',
			categories: categories
		});
	});
};
