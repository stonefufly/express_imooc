$(document).ready(function(){
	$('.del').click(function(e){

		var target = $(e.target);//获取点击的按钮
		var id = target.data('id');//获取data-id的值
		var tr = $('.item-id-'+id);//获取要删除的行doc

		$.ajax({
			type: 'DELETE',
			url: '/admin/movie/list?id='+id
		})
		.done(function(results){
			if(results.success === 1){
				if(tr.length > 0){
					tr.remove();
				}
			}
		});
	});

	$('#douban').blur(function(){
		var douban = $(this);
		var id = douban.val();

		if(id){
			$.ajax({
				url: 'https://api.douban.com/v2/movie/subject/' + id,
				cache: true,
				type: 'get',
				dataType: 'jsonp',
				crossDomain: true,//跨域
				jsonp: 'callback',//jsonp用来回传参数的名字
				success: function(data){

					$('#inputTitle').val(data.title);
					$('#inputDoctor').val(data.directors[0].name);
					$('#inputCountry').val(data.countries[0]);
					$('#inputPoster').val(data.images.large);
					$('#inputYear').val(data.year);
					$('#inputSummary').val(data.summary);
				}
			});
		}
	});
});