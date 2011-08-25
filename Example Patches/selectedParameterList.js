autowatch = 1;
inlets = 1;
outlets = 1;

var selectedParameter;
var thisParameter;

function init() {

	selectedParameter = new LiveAPI(selectedParameterCallback,"live_set view selected_parameter");
	selectedParameter.mode = 1;
	thisParameter = new LiveAPI(thisParameterCallback);
	thisParameter.property = "value";
	clear();
}

function thisParameterCallback(args) {

	if (args[0] === "value") {
		
		outlet(0,"dial","set",args[1]); //default value
		
	}
}

function clear() {
	outlet(0,"umenu","clear");
}

function selectedParameterCallback(args) {

	if (args[0]==="id" && args[1] != 0) {
	
		outlet(0,"umenu","append","id:",args[1],"-",selectedParameter.get("name"));
		//adds the id# and name of parameter that is selected
	}

}

function select(separator1,id,separator2,paramName) {

	post("Select called with " + separator1, id, separator2, paramName);
	post();
	thisParameter.id = id;
	outlet(0,"dial","setminmax",thisParameter.get("min"),thisParameter.get("max"));	
	outlet(0,"dial","set",thisParameter.get("value")); //default value
}

function msg_int(int_to_test) {
	if (thisParameter) {
		thisParameter.set("value",int_to_test);
	}
}