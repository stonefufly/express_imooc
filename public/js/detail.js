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
});