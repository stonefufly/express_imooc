	
	function formToJson(formObj){
		
	   var o={};
	   var a=formObj.serializeArray();
	   $.each(a, function() {

	       if(this.value){
	           if (o[this.name]) {
	               if (!o[this.name].push) {
	                   o[this.name]=[ o[this.name] ];
	               }
	                   o[this.name].push(this.value || null);
	           }else {
	               if($("[name='"+this.name+"']:checkbox",formObj).length){
	                   o[this.name]=[this.value];
	               }else{
	                   o[this.name]=this.value || null;
	               }
	           }
	       }
	   });
	  
	   return o;
	};