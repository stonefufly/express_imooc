function addMarkers(map){
	var point1 = new BMap.Point(121.47631875666309, 31.226189391029088);
	var marker1 = new BMap.Marker(point1);
	map.addOverlay(marker1);
	addClickHandler('鱼鱼股份<br>地址：黄浦区 雁荡路 46号 上海, OR97209 中国',marker1);
	var point2 = new BMap.Point(116.31289304896046, 40.003377520545314);
	var marker2 = new BMap.Marker(point2);
	map.addOverlay(marker2);
	addClickHandler('石头科技<br>地址：海淀区 颐和园路 5号 北京, OR97209 中国',marker2);
	var point3 = new BMap.Point(113.29267548194977, 23.141757935832736);
	var marker3 = new BMap.Marker(point3);
	map.addOverlay(marker3);
	addClickHandler('伟岸日用品<br>地址：越秀区 环市东路 368号 广州, OR97701 中国',marker3);
}