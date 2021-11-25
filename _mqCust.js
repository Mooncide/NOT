function cMqttCust (m){ 
    this.process = async (ch,pld) =>{
		console.log("process ",pld,"for",ch);
	}   
} 
exports = module.exports = cMqttCust
