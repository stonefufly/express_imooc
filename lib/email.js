var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

module.exports = function(credentials){
	
	var smtpMailTransport = nodemailer.createTransport(smtpTransport({
		service: credentials.email.service,
		auth: {
			user: credentials.email.user,
			pass: credentials.email.password,
		}
	}));

	var from = '"NodejsExpressEmail Learn" <827309946@qq.com>';
	var errorRecipient = '827309946@qq.com';

	return {
		send: function(largeRecipientList, subj, html){

			var recipientLimit = 100;//向多个接收者发送邮件时，Gmail的每封邮件的接收者上限是100个
			for(var i=0; i<largeRecipientList.length/recipientLimit; i++){
				
				smtpMailTransport.sendMail({
			        from: from,
			        to: largeRecipientList.slice(i*recipientLimit, (i+1)*recipientLimit).join(','),
			        subject: subj,//邮件的主题
			        html: html,
			        generateTextFromHtml: true
			    }, function(err, response){
			        if(err){
			        	console.error('Unable to send email: ' + err.stack);
			        }
			        console.log('邮件发送成功');
			    });
			}
		    
		},

		emailError: function(message, filename, exception){ //网站出错时给开发者发送email通知

			var body = '<h1>NodejsExpressEmail Learn Site Error</h1>' +
				'message:<br><pre>' + message + '</pre><br>';
				
			if(exception) body += 'exception:<br><pre>' + exception + '</pre><br>';

			if(filename) body += 'filename:<br><pre>' + filename + '</pre><br>';

		    smtpMailTransport.sendMail({
		        from: from,
		        to: errorRecipient,
		        subject: 'NodejsExpressEmail Learn Site Error',
		        html: body,
		        generateTextFromHtml: true
		    }, function(err, response){
		        if(err){
		        	console.error('Unable to send email: ' + err.stack);
		        }
		        console.log('邮件发送成功');
		    });
		},
	};
};
