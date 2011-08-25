autowatch = 1;
inlets = 1;
outlets = 2;

var functionHolder = {
    myDefault: null,
    easeOutCubic: function(t){
        output= (t-1)*(t-1)*(t-1)+1;
        outlet(0,output);
    },
    easeInCubic: function(t){
        output= t *t*t;
        outlet(0,output);
    }
};

function bang() {
    //initializes our JS Functions
    functionHolder["myDefault"] = null; //set myDefault to null;
    outlet(1,"clear"); //clear menu
    for (var objName in functionHolder) {
        if (functionHolder[objName] !== null) {
            //do not want MyDefault in list
            outlet(1,"append",objName); //add Function name to umenu
        }
    }
    
}

function select(functionName) {
    //selects function to call
    for (var objName in functionHolder) {
        if (functionHolder[objName] !== null) {
            if (objName === functionName) {
                functionHolder["myDefault"] = functionHolder[functionName];
            }
        }
    }
}

function msg_float(msgToTest) {
    //calls selected function
    if (functionHolder["myDefault"] !== null) {
        functionHolder["myDefault"](msgToTest);
    }
    else post("Error, no function selected\n");
}