//m4losceleton.js

//a js/m4l router for osc information from OSCeleton
//FYI SINGLE USER MODE ONLY!

//the usuals
autowatch = 1;
inlets = 2;
outlets = 2;

//some constants;
var lcdWidth = 200; //ui-window width
var lcdHeight = 150;//ui-window height
var selectedParameter; //selected device
var mapLeft = false;
var mapRight = false;

//build a basic data type to hold joint info
var joint = function(thisx, thisy, thisz, thisname) {
    this.name = thisname;
    this.x = thisx;
    this.y = thisy;
    this.z = thisz;
    this.mappedAxis = null;
    this.minmax = [1.,1.];
    return this;
}
//extend the data type to hold an update function
joint.prototype.update = function(thisx, thisy, thisz) {
    this.x = thisx;
    this.y = thisy;
    this.z = thisz;

    if (this.name === "l_hand") {

        if (this.mappedAxis === "X") {
            outlet(0,this.name,this.x * this.minmax[1]);                            
            user["l_param"].set("value",this.x*this.minmax[1]);
        }
        else if (this.mappedAxis === "Y") {
            outlet(0,this.name,(this.y * this.minmax[1]));
            user["l_param"].set("value",this.y*this.minmax[1]);

        }
        else if (this.mappedAxis === "Z") {
            outlet(0,this.name,(this.z * this.minmax[1]));
            user["l_param"].set("value",this.z*this.minmax[1]);   
        }
            
        else outlet(0,this.name,this.x * this.minmax[1]);
    }
    else if (this.name === "r_hand") {
        if (this.mappedAxis === "X") {
            user["r_param"].set("value",this.x*this.minmax[1]);
            
            outlet(0,this.name,this.x * this.minmax[1]);
        }
        else if (this.mappedAxis === "Y") {
            outlet(0,this.name,(this.y * this.minmax[1]));
            user["r_param"].set("value",this.y*this.minmax[1]);
        }
        else if (this.mappedAxis === "Z") {
            outlet(0,this.name,(this.z * this.minmax[1]));
            user["r_param"].set("value",this.z*this.minmax[1]);              
        }
            
        else  outlet(0,this.name,this.x * this.minmax[1]);
    }

}
//extend it again to add a map function
joint.prototype.map = function(val) {
    if (val === "X" || val === "Y" || val === "Z") {
        this.mappedAxis = val;
     
    }
}
//using object-notation to create a user to hold our joints
var user = {
    l_hand: new joint(.5,.5,.5,"l_hand"),
    r_hand: new joint(.5,.5,.5,"r_hand"),
    l_param: null,
    r_param: null
};
//functions to be called from max, bang draws the lcd UI
function bang() {
    outlet(1,"clear");
    if (user["l_hand"]) {     
        outlet(1,"frameoval",Number(user["l_hand"].x *lcdWidth),Number(user["l_hand"].y*lcdHeight),Number((user["l_hand"].x *lcdWidth)+ 10),Number((user["l_hand"].y*lcdHeight)+10));
    }
    if (user["r_hand"]) {
        outlet(1,"frameoval",Number(user["r_hand"].x *lcdWidth),Number(user["r_hand"].y*lcdHeight),Number((user["r_hand"].x *lcdWidth)+ 10),Number((user["r_hand"].y*lcdHeight)+10));
    }
}
//init initializes the LiveAPI stuff
function init() {
    selectedParameter = new LiveAPI(selectedParameterCallback,"live_set view selected_parameter");
    selectedParameter.mode = 1;
    user["l_param"] = new LiveAPI(l_paramCallback);
    user["r_param"] = new LiveAPI(r_paramCallback);
    user["l_hand"] = new joint(.5,.5,.5,"l_hand");
    user["r_hand"] = new joint(.5,.5,.5, "r_hand");
}
//this is a callback function for our selectedParameter
function selectedParameterCallback(args) {
    if (args[0] === "id") {
        if (mapLeft === true) {
            user["l_param"].id = args[1]; //change paramater to select param
            user["l_hand"].map("X");
            outlet(0,"l_hand","setminmax",user["l_param"].get("min"),user["l_param"].get("max"));	                   
            user["l_hand"].minmax = [user["l_param"].get("min"),user["l_param"].get("max")];            
            mapLeft = false;
        }
        if (mapRight === true) {
            user["r_param"].id = args[1]; //change paramater to select param
            user["r_hand"].map("X");
            outlet(0,"r_hand","setminmax",user["r_param"].get("min"),user["r_param"].get("max"));	       
            user["r_hand"].minmax = [user["r_param"].get("min"),user["r_param"].get("max")];
            mapRight = false;           
        }
    }
}
//and one for our left hand
function l_paramCallback(args) {
    if(args[0] === "value") {
        //value changed in Live
        
    }    
    if(args[0] === "id") {
    outlet(0,"l_hand","setminmax",user["l_param"].get("min"),user["l_param"].get("max"));	    
    }    
}
//and for our right hand
function r_paramCallback(args) {
    if(args[0] === "value") {
        //value changed in Live
        
    }
    if(args[0] === "id") {
    outlet(0,"r_hand","setminmax",user["r_param"].get("min"),user["r_param"].get("max"));	    
    }
}

//anything catches any message not mapped to a function and checks its args
function anything() {
    callingargs = arrayfromargs(arguments);
     if (inlet === 1) {
        //ui commands
        if (callingargs[0] === "map") {
            if (messagename === "l_hand") {
                mapLeft = true;
            }
            else if (messagename === "r_hand") {
                mapRight = true;
            }
        }
        else user[messagename].map(callingargs[0]);
        
    }
    else if (inlet === 0) {
        //osceleton messages
        if (arguments.length) {
            //split the incoming osc message at the "/" character
            tempArray = messagename.split("/");
            //tempArray[0] is a blank space, so therefore we check tempArray[1]
            //for the JS function to call
            if (tempArray[1] === "new_user") {
                //a new user is recognized in OSCeleton
            }
            else if (tempArray[1] === "user") {
                //user is found, but no skeleton data yet
                //format of message is: /user/1 positionx positiony posotionz
            }
            else if (tempArray[1] === "new_skel") {
                //new skeleton is recognized    
            }
            else if (tempArray[1] === "joint") {
                //if the joint calling this message is the right or left hand
                if (callingargs[0] === "r_hand" || callingargs[0] === "l_hand") {
                        user[callingargs[0]].update(callingargs[2],callingargs[3],callingargs[4]);    
                        //post(user[callingargs[0]].x + " "+ user[callingargs[0]].y + " " + user[callingargs[0]].z + "\n");
                }
            }  
        }        
    }
    
}