var cluster = require('cluster');
//用多个应用集群扩展（假定在多核CPU系统上）
//用集群向外扩展可以实现单台服务器的性能最大化
function startWorker() {
    var worker = cluster.fork();//为系统中的每个CPU启动了一个工作线程
    console.log('CLUSTER: Worker %d started', worker.id);
}
//cluster.isMaster和cluster.isWorker决定了此时运行在哪个上下文中
if(cluster.isMaster){
    //此时在主线程的上下文中（当用node app_cluster.js直接运行它时）
    require('os').cpus().forEach(function(){
	    startWorker();
    });

    //记录所有断开的工作线程。如果工作线程断开了，它应该退出
    //因此我们可以等待exit事件然后繁衍一个新工作线程来代替它
    cluster.on('disconnect', function(worker){
        console.log('CLUSTER: Worker %d disconnected from the cluster.',
            worker.id);
    });

    //当有工作线程死掉（退出）时，创建一个工作线程代替它
    cluster.on('exit', function(worker, code, signal){
        console.log('CLUSTER: Worker %d died with exit code %d (%s)',
            worker.id, code, signal);
        startWorker();
    });

} else {
    //此时在工作线程的上下文中（在Node集群系统执行它时）
    //在这个工作线程上启动我们的应用服务器
    require('./express_imooc.js')();//既然我们将express_imooc.js配置为模块使用，只需要引入并立即调用它（记住：我们将它作为一个函数输出并启动服务器）

}