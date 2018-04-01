/*
  Node system by Marius Van Nieuwenhuyse
*/

var increment = 0;
var variables = [];



var execPlumbSource = {
    isSource: true,
    isTarget: false,
    connector: "Bezier",
    endpoint: "Dot",
    scope: "flow"
};
var execPlumbTarget = {
    isSource: false,
    isTarget: true,
    connector: "Bezier",
    endpoint: "Dot",
    scope: "flow"
};
var varPlumbSource = {
    isSource: true,
    isTarget: false,
    connector: "Bezier",
    endpoint: ["Rectangle", {
        width: 15,
        height: 15
    }],
    scope: "var",
    paintStyle: {
        fillStyle: "#b05842",
        strokeStyle: "#b05842"
    },
    connectorStyle: {
        strokeStyle: "#b05842",
        lineWidth: 4
    },
    maxConnections: 100
};
var varPlumbTarget = {
    isSource: false,
    isTarget: true,
    connector: "Bezier",
    endpoint: ["Rectangle", {
        width: 15,
        height: 15
    }],
    scope: "var",
    paintStyle: {
        fillStyle: "#b05842",
        strokeStyle: "#b05842"
    },
    connectorStyle: {
        strokeStyle: "#b05842",
        lineWidth: 4
    }
};




var nodeList = [];

/* Nodes classes */

class node {
    constructor(draggable, left, right) {
        var self = this;
        this.id = increment;
        this.strId = "node_id_" + this.id;
        $(".NodeSpace").append("<div oncontextmenu='return false;' class='node id_" + increment + "' id='node_id_" + increment + "' value='" + this.id + "'><div class='inputs'></div><div class='outputs'></div><div class='nodeContainer'>node</div></div>");
        this.dom = $(".id_" + increment);
        this.container = $(".id_" + increment + " .nodeContainer");
        this.nodeType = "node";
        this.isVariable = false;
        this.starter = false;
        /**
         * execute updateControllers()
         * @type {Boolean}
         */
        this.needInputUpdate = false;
        if (right) {
            jsPlumb.addEndpoint("node_id_" + this.id, {
                anchor: [1, 0, 0, 0, 0, 0, "Right"]
            }, execPlumbSource);
        }
        if (left) {
            jsPlumb.addEndpoint("node_id_" + this.id, {
                anchor: [0, 0, 0, 0, 0, 0, "Left"]
            }, execPlumbTarget);
        }
        if (draggable) {
            jsPlumb.draggable("node_id_" + this.id);
        }
        increment++;
        nodeList.push(self);
        $("#" + this.strId).on('contextmenu', function(event) {
            if (event.which == 3) {
                var source = event.currentTarget;
                source = $(source).attr('value');
                source = getTargetFromId(source);
                if (source.starter === false) {
                    $(source.dom).remove();
                    nodeList.splice(nodeList.indexOf(source), 1);
                    jsPlumb.remove(source.strId);
                }
            }
        });
    }
    onConnect(event) {}
    updateNode(text) {
        self.container.replaceWith(text);
    }
    exec() {}

}

class Print extends node {
    constructor() {
        super(true, true, true);
        this.container.replaceWith("<div>Print</div><input name='content' type='text' placeholder='text'/>");
        this.nodeType = "print";
        this.controlled = false;
        this.controller = null;
        jsPlumb.addEndpoint("node_id_" + this.id, {
            anchor: [0, 0.5, 0, 0, 0, 0, "Left"]
        }, varPlumbTarget);
    }
    exec() {
        var val = null;
        if (!this.controlled) {
            val = $(this.dom).find("input");
            val = val.val();
        } else {
            val = this.controller.getValue();
        }
        var logger = new Logger();
        logger.text(val);
    }
    control(controller) {
        this.controlled = true;
        this.controller = controller;
        $(this.dom).find("input[name='content']").hide();
    }
    unControl() {
        this.controlled = false;
        this.controller = null;
        $(this.dom).find("input[name='content']").show();
    }
}

class Starter extends node {
    constructor() {
        super(true, false, true);
        this.container.replaceWith("<div>Starter</div>");
        this.dom.addClass("starter");
        this.nodeType = "starter";
        this.starter = true;
    }
}

class Alert extends node {
    constructor() {
        super(true, true, true);
        this.container.replaceWith("<div>Alert</div><input name='content' type='text' placeholder='text'/>");
        this.nodeType = "alert";
        this.controlled = false;
        this.controller = null;
        jsPlumb.addEndpoint("node_id_" + this.id, {
            anchor: [0, 0.5, 0, 0, 0, 0, "Left"]
        }, varPlumbTarget);
    }
    exec() {
        var val = null;
        if (!this.controlled) {
            val = $(this.dom).find("input");
            val = val.val();
        } else {
            val = this.controller.getValue();
        }
        alert(val);
    }
    control(controller) {
        this.controlled = true;
        this.controller = controller;
        $(this.dom).find("input[name='content']").hide();
    }
    unControl() {
        this.controlled = false;
        this.controller = null;
        $(this.dom).find("input[name='content']").show();
    }
}

class Clear extends node {
    constructor() {
        super(true, true, true);
        this.container.replaceWith("<div>Clear</div>");
        this.nodeType = "clear";
    }
    exec() {
        var logger = new Logger();
        logger.cls();
    }
}

class VarNode extends node {
    constructor(draggable, left, right) {
        super(draggable, left, right);
        //this.container.replaceWith("<div>Variable</div>");
        this.nodeType = "Variable";
        this.isVariable = true;
    }
    getValue() {}
}

class Value extends VarNode {
    constructor() {
        super(true, false, false);
        this.container.replaceWith("<div>Value</div><input name='valueBox' type='text' placeholder='text'/>Type: <select class='select_varType'><option value='text'>Text</option><option value='number'>Number</option></select>");
        $(this.dom).addClass("nodeValue");
        this.nodeType = "value";
        $(this.dom).find("select").change(this.onChange);
        this.outputType = "text";
        jsPlumb.addEndpoint("node_id_" + this.id, {
            anchor: "Right"
        }, varPlumbSource);
    }
    getValue() {
        var val = $(this.dom).find("input");
        val = val.val();
        if (this.outputType == "number") {
            val = parseFloat(val);
        }
        return val;
    }
    onChange(e) {
        var value = $(e.currentTarget).val();
        var input = $(e.currentTarget).parent().find("input[name='valueBox']");
        var obj = getTargetFromId($(e.currentTarget).parent().attr('value'));
        input.attr("type", value);
        input.attr("placeholder", value);
        obj.outputType = value;
    }
}

class Append extends VarNode {
    constructor() {
        super(true, false, false);
        this.container.replaceWith("<div>Append</div><br/><input type='checkbox' name='cb_isSpace'/> Space<br/>");
        this.nodeType = "append";
        jsPlumb.addEndpoint("node_id_" + this.id, {
            anchor: [0, (1 / 3), 0, 0, 0, 0, "Left"]
        }, varPlumbTarget);
        jsPlumb.addEndpoint("node_id_" + this.id, {
            anchor: [0, (2 / 3), 0, 0, 0, 0, "Left"]
        }, varPlumbTarget);
        jsPlumb.addEndpoint("node_id_" + this.id, {
            anchor: [1, (1 / 2), 0, 0, 0, 0, "Right"]
        }, varPlumbSource);
        this.controllers = [null, null];
        this.needInputUpdate = true;
    }
    get isSpace() {
        return $(this.dom).find("input[name='cb_isSpace']").prop("checked");
    }
    getValue() {
        if (this.controllers[0] === null || this.controllers[1] === null || this.controllers[0] === undefined || this.controllers[1] === undefined) {
            var logger = new Logger();
            logger.text("Error on Append node (need connection)");
            return "";
        }
        var val1 = this.controllers[0].getValue();
        var val2 = this.controllers[1].getValue();
        var between = "";
        if (this.isSpace) {
            between = " ";
        }
        return val1 + between + val2;
    }
    updateControllers() {
        var res = jsPlumb.getConnections({
            scope: "var",
            target: this.strId
        });
        this.controllers = [];
        for (var i = 0; i < res.length; i++) {
            var temp = res[i];
            if (temp !== undefined) {
                var source = temp.source;
                source = $(source).attr('value');
                source = getTargetFromId(source);
                this.controllers.push(source);
            } else {
                this.controllers.push(null);
            }
        }
        if (this.controllers.length === 0) {
            this.controllers = [null, null];
        } else if (this.controllers.length === 0) {
            this.controllers.push(null);
        }
    }
}

class Operation extends VarNode {
    constructor() {
        super(true, false, false);
        this.container.replaceWith(
            "<div>Operation</div><br/>" +
            "<select name='opType'>" +
            "<option value='plus'>+</option>" +
            "<option value='minus'>-</option>" +
            "<option value='multiply'>x</option>" +
            "<option value='div'>/</option>" +
            "</select>"
        );
        this.nodeType = "operation";
        jsPlumb.addEndpoint("node_id_" + this.id, {
            anchor: [0, (1 / 3), 0, 0, 0, 0, "Left"]
        }, varPlumbTarget);
        jsPlumb.addEndpoint("node_id_" + this.id, {
            anchor: [0, (2 / 3), 0, 0, 0, 0, "Left"]
        }, varPlumbTarget);
        jsPlumb.addEndpoint("node_id_" + this.id, {
            anchor: [1, (1 / 2), 0, 0, 0, 0, "Right"]
        }, varPlumbSource);
        this.controllers = [null, null];
        this.needInputUpdate = true;
        this.operation = 'plus';
        $(this.dom).find("select").change(this.onChange);
    }
    updateControllers() {
        var res = jsPlumb.getConnections({
            scope: "var",
            target: this.strId
        });
        this.controllers = [];
        for (var i = 0; i < res.length; i++) {
            var temp = res[i];
            if (temp !== undefined) {
                var source = temp.source;
                source = $(source).attr('value');
                source = getTargetFromId(source);
                this.controllers.push(source);
            } else {
                this.controllers.push(null);
            }
        }
        if (this.controllers.length === 0) {
            this.controllers = [null, null];
        } else if (this.controllers.length === 0) {
            this.controllers.push(null);
        }
    }
    getValue() {
        if (this.controllers[0] === null || this.controllers[1] === null || this.controllers[0] === undefined || this.controllers[1] === undefined) {
            var logger = new Logger();
            logger.text("Error on Append node (need connection)");
            return "";
        }
        var val1 = this.controllers[0].getValue();
        var val2 = this.controllers[1].getValue();
        if (((typeof val1) == 'number') && ((typeof val2) == 'number')) {
            switch (this.operation) {
                case 'plus':
                    return val1 + val2;
                case 'minus':
                    return val1 - val2;
                case 'multiply':
                    return val1 * val2;
                case 'div':
                    return val1 / val2;
            }
        } else {
            return 0;
        }
    }
    onChange(e) {
        var value = $(e.currentTarget).val();
        var obj = getTargetFromId($(e.currentTarget).parent().attr('value'));
        obj.operation = value;
    }
}

class VariableSet extends node {
    constructor() {
        super(true, true, true);
        this.container.replaceWith("<div>Set</div><input placeholder='name' type='text' name='name'/><input placeholder='value' type='text' name='content'/>");
        this.nodeType = "variableset";
        this.controlled = false;
        this.controller = null;
        jsPlumb.addEndpoint("node_id_" + this.id, {
            anchor: [0, 0.5, 0, 0, 0, 0, "Left"]
        }, varPlumbTarget);
    }
    exec() {
        var val = "";
        var name = "";
        var nameInput = $(this.dom).find("input[name='name']");
        name = nameInput.val();
        if (this.controlled) {
            val = this.controller.getValue();
        } else {
            var valInput = $(this.dom).find("input[name='content']");
            val = valInput.val();
        }
        var variable = {
            name: name,
            value: val
        };
        setVar(variable);
    }
    control(controller) {
        this.controlled = true;
        this.controller = controller;
        $(this.dom).find("input[name='content']").hide();
    }
    unControl() {
        this.controlled = false;
        this.controller = null;
        $(this.dom).find("input[name='content']").show();
    }
}

class VariableGet extends VarNode {
    constructor() {
        super(true, false, false);
        this.nodeType = "value";
        this.container.replaceWith("<div>Get</div><input placeholder='name' type='text' name='name'/>");
        //this.outputType = "text";
        jsPlumb.addEndpoint("node_id_" + this.id, {
            anchor: "Right"
        }, varPlumbSource);
    }
    getValue() {
        var name = $(this.dom).find("input[name='name']").val();
        var variable = getVarByName(name);
        return variable.value;
    }
}




/* Core fnc */

$(document).ready(function() {
    $(".consolas").draggable();
    $("#loader").hide();
});

jsPlumb.ready(function() {
    new Starter();
    jsPlumb.bind("connection", onConnect);
    jsPlumb.bind("connectionDetached", onDisconnect);
    jsPlumb.bind("connectionMoved", onMoved);
});

function onConnect(event) {
    var logger = new Logger();
    var source = event.source;
    source = $(source).attr('value');
    source = getTargetFromId(source);
    var target = event.target;
    target = $(target).attr('value');
    target = getTargetFromId(target);
    if (source.isVariable && (target.nodeType == "print" || target.nodeType == "alert" || target.nodeType == "variableset")) {
        target.control(source);
    } else if (source.isVariable && target.needInputUpdate) {
        target.updateControllers();
    }
}

function onDisconnect(event) {
    var logger = new Logger();
    var source = event.source;
    source = $(source).attr('value');
    source = getTargetFromId(source);
    var target = event.target;
    target = $(target).attr('value');
    target = getTargetFromId(target);
    if (source.isVariable && (target.nodeType == "print" || target.nodeType == "alert" || target.nodeType == "variableset")) {
        target.unControl();
    } else if (source.isVariable && target.needInputUpdate) {
        target.updateControllers();
    }
}

function onMoved(event) {
    var logger = new Logger();
    var oldSource = event.originalSourceId;
    oldSource = $("#" + oldSource).attr('value');
    console.log(oldSource);
    oldSource = getTargetFromId(oldSource);
    var oldTarget = event.originalTargetId;
    oldTarget = $("#" + oldTarget).attr('value');
    console.log(oldTarget);
    oldTarget = getTargetFromId(oldTarget);
    if (oldSource.isVariable && (oldTarget.nodeType == "print" || oldTarget.nodeType == "alert" || oldTarget.nodeType == "variableset")) {
        oldTarget.unControl();

    } else if (oldSource.isVariable && oldTarget.needInputUpdate) {
        oldTarget.updateControllers();
    }
    var source = event.newSourceId;
    source = $(source).attr('value');
    source = getTargetFromId(source);
    var target = event.newTargetId;
    target = $(target).attr('value');
    target = getTargetFromId(target);
    if (source.isVariable && (target.nodeType == "print" || target.nodeType == "alert" || target.nodeType == "variableset")) {
        target.control(source);
    } else if (source.isVariable && target.needInputUpdate) {
        target.updateControllers();
    }
}

/**
 * return the object of the node
 * @param  {number} id id of the node
 * @return {node}    node object
 */
function getTargetFromId(id) {
    for (var i = 0; i < nodeList.length; i++) {
        var tempNode = nodeList[i];
        if (tempNode.id == id) {
            return tempNode;
        }
    }
    return false;
}

/**
 * get variable by name (false if not exists)
 * @param  {string} name name of the variable
 * @return {variable}      result
 */
function getVarByName(name) {
    for (var i = 0; i < variables.length; i++) {
        var tempVar = variables[i];
        if (tempVar.name == name) {
            return tempVar;
        }
    }
    return false;
}

/**
 * edit variable
 * @param {variable} variable var
 */
function setVar(variable) {
    var modif = false;
    for (var i = 0; i < variables.length; i++) {
        var tempVar = variables[i];
        if (tempVar.name == variable.name) {
            tempVar.value = variable.value;
            modif = true;
        }
    }
    if (!modif) {
        variables.push(variable);
    }
}

function run() {
    var logger = new Logger();
    logger.cls();
    variables = [];
    var startNode = "node_id_0";
    running = true;
    while (running) {
        var sourceConn = jsPlumb.getConnections({
            scope: "flow",
            source: startNode
        });
        if (sourceConn.length === 0) {
            running = false;
            break;
        }
        sourceConn = sourceConn[0];
        var target = sourceConn.target;
        var targetId = $(target).attr('value');
        var targetObj = getTargetFromId(targetId);

        targetObj.exec();
        startNode = targetObj.strId;
    }
}



/* Logger */

class Logger {
    text(text) {
        $(".console").append("<p>" + text + "</p><br/>");
    }
    cls() {
        $(".console").html("");
    }
}
