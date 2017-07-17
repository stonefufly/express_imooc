module.exports = function(grunt){

	//加载插件
	[
		'grunt-contrib-watch',//有文件添加修改或删除就会重新执行在它里面注册好的任务
		'grunt-nodemon',//事实监听入口文件（app.js）有改动的话就自动重启入口文件（app.js）
		'grunt-concurrent',//针对慢任务开发的插件，优化慢任务构建的时间，跑多个阻塞的任务
		'grunt-mocha-test',//单元测试，用的是mocha框架

		'grunt-contrib-less',//less编译
	 	'grunt-contrib-uglify',//js压缩
	 	'grunt-contrib-cssmin',
	 	'grunt-hashres',
	  	'grunt-contrib-jshint',//约束编程规范的，检查语法的

	].forEach(function(task){
		grunt.loadNpmTasks(task);
	});

	//配置任务
	grunt.initConfig({
		watch:{
			jade:{
				files: ['views/**'],
				options: {
					livereload: true //当文件出现改动会重新启动服务
				}
			},
			js: {
				files: ['public/js/**','models/**/*.js','schemas/**/*.js'],
				tasks: ['jshint'],//语法检查
				options: {
					livereload: true //当文件出现改动会重新启动服务
				}
			},
			uglify: {
		        files: ['public/**/*.js'],
		        tasks: ['jshint'],
		        options: {
		          livereload: true
		        }
		    },
		    styles: {
		        files: ['public/**/*.less'],
		        tasks: ['less'],
		        options: {
		          nospawn: true
		        }
		    }
		},

		jshint: {//编程规范，语法检查的配置
      		options: {
        		jshintrc: '.jshintrc',//监控和检查依赖的文件，在根目录下
        		ignores: ['public/libs/**/*.js']
     		},
      		all: ['public/js/*.js', 'test/**/*.js', 'app/**/*.js']//这些目录下的文件的监控，和语法的检查
    	},

    	less: {//less编译配置
	      development: {
	        options: {
	          compress: true,
	          yuicompress: true,
	          optimization: 2
	        },
	        files: {
	          'public/css/index.css': 'less/index.less',
	          'public/css/style.css': 'less/style.less'
	        }
	      }
	    },
	    
	    //一旦有大量的js和css，打包和缩小会产生极大的性能提升
	    //第三方库（例如Bootstrap）同样这么打包以提高性能
	    uglify: {//js压缩配置
	      all: {
	        files: {
	          'public/build/app.min.js': ['public/js/**/*.js']//将所有js压缩到app.min.js文件中
	        }
	      }
	    },

		cssmin: {//css压缩配置
			combine: {
				files: {
					'public/css/app.css': ['public/css/**/*.css', '!public/css/app*.css']//将所有css放到一个app.css中，不包含它自己生成的文件
				}
			},
			minify: {										//然后缩小合并css到app.min.css文件中
				src: 'public/css/app.css',
				dest: 'public/build/app.min.css',
			},
		},
		//给打包和缩小的css和js文件添加指纹，以便在更新网站时可以马上看到这些变化，而不是要等到缓存的版本到期
		hashres: {
			options: {
				fileNameFormat: '${name}.${hash}.${ext}'
			},
			all: {
				src: [//要重命名的文件，hashres会生成文件的哈希并追加到文件名上
					'public/build/app.min.js',
					'public/build/app.min.css',
				],
				dest: [
					'config.js',
				]
			},
		},

		nodemon: {
			dev: { //开发环境
				options: {
					file: 'app.js', //当前入口文件
					args: [],
					ignoredFiles: ['README.md','node_modules/**','.DS_Store'],//忽略的文件
					watchedExtensions: ['js'],
					watchedFolders: ['app','config'],
					debug: true,
					delayTime: 1, //如果有大批量文件需要编译的的时候不必每个文件改动都会重启一次，而是等待多少多少毫秒后再来重启服务
					env: {
						PORT: 3000 //端口为3000
					},
					cwd: __dirname //目录是当前的目录
				}
			}
		},

		concurrent: {//配置默认测试任务
	      tasks: ['nodemon', 'watch', 'less', 'uglify', 'jshint'],
	      options: {
	        logConcurrentOutput: true
	      }
	    },

	    mochaTest: {//配置测试任务
			options: {
				reporter: 'spec'
			},
			src: ['test/**/*.js']//要测试的多个目录([test文件夹下的所有js文件,其它目录等等])
		}
		
	});

	

	//配置grunt参数
	grunt.option('force',true);//开发中不会因为语法错误和警告而中断整个grunt的整个服务

	//注册一个默认的任务
	grunt.registerTask('default',['concurrent']);
	//注册测试任务
	grunt.registerTask('test',['mochaTest']);//mochaTest为调用的任务的名字
	//注册一个生成静态资源的任务
	grunt.registerTask('static', ['less', 'cssmin', 'uglify', 'hashres']);
}