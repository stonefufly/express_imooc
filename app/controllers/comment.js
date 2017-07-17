var Comment = require('../models/comment.js');

//post comment
exports.save = function(req,res){
	//console.log('>>>>>>>>>>>>>>'+JSON.stringify(req.body));
	//console.log('>>>>>>>>>>>>>>'+JSON.stringify(req.query));
	console.log('路径后跟的查询字符串：'+JSON.stringify(req.query.qstr));
	var _comment = req.body.comment;
	var movieId = _comment.movie;

	if(req.xhr || req.accepts('json,html') === 'json'){
		//如果是ajax提交表单（req.xhr为ture）或者User-Agent明确要求响应类型JSON优先于HTML（req.accepts('json,html')是JSON），则返回JSON数据
		
		var comment = new Comment(_comment);
		
		comment.save(function(err, comment){

			if(err){
				console.log(err);
				res.send({error: 'assess submit error !'});
			}else{
				res.send({success: true});
			}
		});
	} else {
		//否则返回一个重定向
		if(_comment.cid){
			//如果是回复评论
			Comment.findById(_comment.cid, function(err, comment){
				var reply = {
					from: _comment.from,
					to: _comment.tid,
					content: _comment.content
				}

				comment.reply.push(reply);

				comment.save(function(err, comment){

					if(err){
						console.log(err);
						res.redirect(500, '500');
					}

					res.redirect(303, '/movie/'+ movieId + '/find');
				});
			});
		}
		else {
			//如果是直接评论电影
			var comment = new Comment(_comment);
		
			comment.save(function(err, comment){

				if(err){
					console.log(err);
					res.redirect(500, '500');
				}
				res.redirect(303, '/movie/'+ movieId + '/find');
			});
		}
	}
};