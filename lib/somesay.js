/*这是自定义模块，不能放在node_modules目录中*/
/*这里要特别注意全局变量输出的用法。如果你想让一个东西在模块外可见，必须把它加到exports上。在模块外可以访问到函数getFortune，但数组fortuneCookies是完全隐藏起来的*/
var somesayCookies = ["have a good time","you are the best","you can see that"];

exports.getSay = function(){
	var idx = Math.floor(Math.random()*somesayCookies.length);
	return somesayCookies[idx];
}