$(document).ready(function(){
	$('.comment').click(function(e){

		var target = $(this);
		var toId = target.data('tid');//获取data-tid的值
		var commentId = target.data('cid');

		if($('#toId').length > 0){
			//如果存在此隐藏域则修改其值
			$('#toId').value(toId);
		}
		else {
			$('<input>').attr({
				type: 'hidden',
				id: 'toId',
				name: 'comment[tid]',
				value: toId
			}).appendTo('#commentForm');
		}

		if($('#commentId').length > 0){
			//如果存在此隐藏域则修改其值
			$('#commentId').value(commentId);
		}
		else {
			$('<input>').attr({
				type: 'hidden',
				id: 'commentId',
				name: 'comment[cid]',
				value: commentId
			}).appendTo('#commentForm');
		}
	});

	$('.newsletterForm').on('submit', function(evt){

		evt.preventDefault();//取消事件的默认动作（阻止提交表单）

		var action = $(this).attr('action');
		var $container = $(this).closest('.formContainer');//向上遍历匹配到.formContainer

		//--------------------------------ajax json post------------------------------------

		// var json = formToJson($(this)); //自动将form表单封装成json
		// var jsonStr = JSON.stringify({comment:json});//用于从一个对象解析出字符串
		
		// $.ajax({
		// 	async: true,//异步
		// 	contentType: 'application/json;charset=utf-8',//发送信息至服务器时的内容编码类型
		// 	context: $container,//这对象用于设置ajax相关回调函数的上下文，也就是说，让回调函数内this指向这个对象
		// 	data: jsonStr,//发送到服务器的数据，将自动转为请求字符串，Get请求中将附加在URL后，必须为Key/Value格式，如果为数组，jquery将自动为不同值对应同一个名称，如{foo:["b1","b2"]}转换为'&foo=b1&foo=b2'
		// 	dataType: 'json',//预期服务器返回的数据类型
		// 	url: action,
		// 	type: 'POST',
		// 	success: function(data, textStatus){

		// 		alert(textStatus);//服务器返回状态

		// 		if(data.success){
		// 			$(this).html('<h2>Thank you!</h2>');
		// 		} else {
		// 			$(this).html('There was a problem: ' + data.error);
		// 		}
		// 	},
		// 	error: function(XMLHttpRequest, textStatus, errorThrown){
		// 		$(this).html('There was a problem.');
		// 		alert(XMLHttpRequest.status);
 	// 			alert(XMLHttpRequest.readyState);
 	// 			alert(textStatus);
		// 	},
		//    	complete: function(XMLHttpRequest, textStatus) {
		//  		//当请求完成后调用此函数，无论成功或失败
		//  		alert(textStatus);//描述请求类型的字符串
		//    	}
		// });

		//--------------------------------ajax url查询字符串 post------------------------------------
		//alert($(this).serialize());
		$.ajax({
			contentType: 'application/x-www-form-urlencoded',
			data: $(this).serialize(),//serialize()方法通过序列化表单值，创建URL编码文本字符串（类似'a=1&b=2'），序列化的值可在生成AJAX请求时用于URL查询字符串中。服务器端通过req.body.comment.from获取这个传过去的数据
			url: action,
			type: 'POST',
			success: function(data, textStatus){

				alert(textStatus);//服务器返回状态

				if(data.success){
					$container.html('<h2>Thank you!</h2>');
				} else {
					$container.html('There was a problem: ' + data.error);
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){
				$container.html('There was a problem.');
				alert(XMLHttpRequest.status);
 				alert(XMLHttpRequest.readyState);
 				alert(textStatus);
			},
		   	complete: function(XMLHttpRequest, textStatus) {
		 		//当请求完成后调用此函数，无论成功或失败
		 		alert(textStatus);//描述请求类型的字符串
		   	}
		});

	})
});