/*
    https://www.npmjs.com/package/mqtt#client
    Client automatically handles the following:
        Regular server pings
        QoS flow
        Automatic reconnections
        Start publishing before being connected
*/
/*
	210401:
		This case is for PAYGO token  process,
		so this mqtt client listen only one channel 'paygoger'.
		
*/
function cMQTTClient (m,info){ 
    this.mqtt = require('mqtt'); 
	this.manufacturer = "K";
	
    this.room = info.room
    this.id = info.id
    this.role = info.role
     
    const pkg =(pld)=>{ 
        var o = {
            "id":this.id
            ,"role":this.role
            ,"pld":pld
        } 
        return JSON.stringify(o)
    }
    this.conf = {
        clientId:this.id,
		host:m.cfg.mqtt.server,
		port:m.cfg.mqtt.port,
		protocol:'mqtt',
		username:m.cfg.mqtt.user,
		password:m.cfg.mqtt.pwd,	
        will:{topic:m.cfg.mqtt.proj +"/glb/lwt",payload:pkg(info),qos:1,retain:0}
    }
    
    this.mqc = this.mqtt.connect(this.conf)

	this.mqc.on('connect',(pld)=>{ 
        console.log("mqtt connected.",this.room,m.cfg.mqtt.proj,this.conf.clientId)  
        this.mqc.subscribe(m.cfg.mqtt.proj+"/"+this.room+"/#",{qos: 1}) 
		
	})

	this.mqc.on('error',function(e){		
		console.log(e)
	})

	this.mqc.on("message",(topic,data)=>{
		try
		{  
			const obj = JSON.parse(data.toString());
			const ach = topic.split("/"); 
			//console.log(ach,obj);
			
			if (ach[0]==m.cfg.mqtt.proj && ach[1]==this.room)
			{
				//########### console.log("here paygo api doing",ach,obj ) ############
				var o = obj.pld
				switch (o.fn)
				{ 
					default:
						console.log(ach, obj)
					break;
				}			
			} 
		}
		catch (err){
			console.log ("error:" + topic + ", " + err.message);
			console.log(data.toString())
		} 	
	})

    this.pub = (ch,pld) =>{  
        this.mqc.publish(m.cfg.mqtt.proj+"/"+ch,pkg(pld))
    }

    this.glb = (ch,pld)=>{ 
        this.mqc.publish(m.cfg.mqtt.proj+"/glb/"+ch,pkg(pld))
    }
    this.chn = (ch,pld)=>{ 
        this.mqc.publish(m.cfg.mqtt.proj+"/"+this.room+"/"+ch,pkg(pld))
    }
	
	this.pyExe = (ch,fn,_path,_args)=>{  
		let { PythonShell } = require('python-shell')
							
		let options = {
			pythonPath:"python",
			args:_args 
		} 
		PythonShell.run(_path, options, (err, data) => {
			var r = {
				fn:fn,
				code:0,
				pld:{}
			}
			if (err)
			{				
				r.code=-1
				r.pld=err
			}				
			else	
			{
				r.code=1
				r.pld=data
			}
			this.pub(ch,r)				 
			
		})
	}
	
	
	this.newID = async (tb,header,digit) =>{
		if(!digit)
			digit=6
			
		var c = "select indexno from "+tb+" "
			c+= " where enable=1 "
			c+= " and date_format(createDate,'%Y:%m')= date_format(current_date,'%Y:%m')"
			c+= " order by syssn desc limit 1 "
			
		var rs = ""
		
		await m.q(c).then((r)=>{
			var srn = ""
				for ( i=0;i<digit;i++) 
					srn +="0"
				
			rs = header + m.dtf(new Date(),5)
			 
			if (r.length==0)
			{	 
				srn +="1" 
				rs += srn.substring(srn.length-digit,srn.length);
			} 
			else
			{ 
				var lastID = r[0].indexno
				var	tmp = lastID.substring(lastID.length-digit,lastID.length);
				var n =   parseInt(tmp)+1  ;
					srn +=  String(n)
				rs += srn.substring(srn.length-digit,srn.length);  
			}
		}).catch((e)=>{
			console.log("newID err",e) 
		}) 
		return rs
	}
	
	this.reg = async (gwname,mac,ver) =>{
	
		var c = ""
 
		var o = {
			fn:"reg"
			,code:0		 
			,sn:0	
			,id:"" 		 
			,name:""	
			,key:this.manufacturer 	 
		}	
		
		var dvid = await this.newID("gtws","GT")
		 
			
		var rnd = Math.random().toString()
			rnd = rnd.substring(rnd.length-10,rnd.length)
			
		var seckey = gwname.substring(2,gwname.length) + rnd
		 
		 
		c  = " INSERT INTO gtws (indexno,gw003,gw005,gw009"
		c += ",gw012,gw013,gw006) "
		c += " VALUES "
		c += " ('"+dvid+"','"+gwname+"','"+ver+"','"+mac+"'"
		c += ",'"+Math.round(new Date().getTime()/1000)+"'"
		c += ",'"+seckey+"'"
		c += ",'"+this.manufacturer+"'"
		c += ")"
		c += " ON DUPLICATE KEY UPDATE "
		c += " ModifyDate=current_timestamp(6)"
		c += ",gw005='" +ver+ "'" 
		c += "; "  
		
		
		await m.q(c).then(async (r)=>{			
			c = "select "
			c += " syssn as 'sn'"
			c += ",indexno as 'id'"
			c += ",gw003 as 'name'"
			c += ",gw009 as 'mac'"
			c += ",gw012 as 'stcode'"
			c += ",gw013 as 'key'"
			c += " from gtws where enable=1 and gw009='" +mac+ "'"			 		
			
			await m.q(c).then(r2=>{  
				o.sn = r2[0].sn;
				o.id = r2[0].id;
				o.code=r2[0].stcode;
				o.name= r2[0].name;
				o.key = r2[0].key; 
			})
		})
		console.log("reg rs",o)
		this.pub(gwname,o); 
	}
	
	this.alive = async (gwname,cnt) =>{
		var c = ""
 	  
		c += " UPDATE gtws set "
		c += " GW011 = current_timestamp(6)"
		c += ",GW014 = '" +cnt+ "'"
		c += " where Enable=1 and GW003='" + gwname + "'"  
		c += "; "  
		
		var x = await m.q(c)		
		//console.log(x)
		
	}
} 
exports = module.exports = cMQTTClient

// outer functin 
