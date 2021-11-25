//模組外部變數
var rsp ={		
		code:0,
		data:"",
		id:0,
		msg:"",
		sn:0,
		url:""		
	}

//模組內部變數及功能 	
module.exports = function(cfg){	
	this.mysql = require('mysql');  
	this.cfg = require(cfg);
	this.rsp = rsp;
	
	this.sqlPool = this.mysql.createPool(this.cfg.mysql); 

	this.setRSP = function (code,data,id,msg,sn,url){
		rsp.code=name;
		rsp.data=  data;
		rsp.id= id;
		rsp.sn = sn;
		rsp.url = url; 
	}
	 
	this.q = async function (cmd) {
		return new Promise( (resolve,reject)=>{ 
			this.sqlPool.getConnection((err,conn)=>{
				if(err){reject(err)}
				else
				{
					conn.query(cmd,(e,r) =>{
						if (e){reject(e)}
						else (resolve(r)) 
					});	 
					conn.release();
				}	
			})	 
		}) 
	}   
	
	this.w = function(obj){
		console.log(obj);		
	}
	
	this.dtf = function (oDate,mode) {
		var vYY = oDate.getYear()+1900;
		var vMM = '0'+(oDate.getMonth()+1);
		var vDD = '0'+oDate.getDate();
		
		var vHH = '0'+oDate.getHours();
		var vMm = '0'+oDate.getMinutes(); 
		var vSS = '0'+oDate.getSeconds();
		var vTime = '';

		switch (mode)
		{
			case 1:
				vTime= vYY+'-'+vMM.substring(vMM.length-2,vMM.length)+'-'+vDD.substring(vDD.length-2,vDD.length);
				break;
			case 11:
				vTime= vMM.substring(vMM.length-2,vMM.length)+'-'+vDD.substring(vDD.length-2,vDD.length);
				break;
			case 12:
				vTime= ('0'+vYY).substring(3,5)+''+vMM.substring(vMM.length-2,vMM.length)+''+vDD.substring(vDD.length-2,vDD.length);
				break;
			case 2:
				vTime += vHH.substring(vHH.length-2,vHH.length) +':'+vMm.substring(vMm.length-2,vMm.length)+':'+vSS.substring(vSS.length-2,vSS.length);
				break;
			case 22:
				vTime += vHH.substring(vHH.length-2,vHH.length) +':'+vMm.substring(vMm.length-2,vMm.length);
				break;
			case 5:
				var vYY2 = '1' + vYY
				vTime= vYY2.substring(vYY2.length-2,vYY2.length)+vMM.substring(vMM.length-2,vMM.length)
				break;
			
			default:
				vTime = vYY+'-'+vMM.substring(vMM.length-2,vMM.length)+'-'+vDD.substring(vDD.length-2,vDD.length);						
				vTime += ' ' + vHH.substring(vHH.length-2,vHH.length) +':'+vMm.substring(vMm.length-2,vMm.length)+':'+vSS.substring(vSS.length-2,vSS.length);
				break;
		}
		return vTime; 
	}	
}