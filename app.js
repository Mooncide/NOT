// maho tools
let mqClt = {};	
const cMaho = require('./_maho');
const cMQTTClient = require('./_mqtt');	 

const m 	= new cMaho("./app.conf"); 	 
 

//	main flow ------------------------------------------------------------------------------
const main = async ()=>{ 
	mqClt = new cMQTTClient(m,{role:'Master',room:'rooma',id:'K'});  
} 

main(); 

