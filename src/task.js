/*jslint */
/*global module, require, process */

var spawn   = require("child_process").spawn,
    rows    = process.stdout.rows,
    columns = process.stdout.columns,
    path    = require("path"),
    fs      = require("fs");

process.stdout.on("resize", function () {
    "use strict";
    rows    = process.stdout.rows;
    columns = process.stdout.columns;
});

module.exports = function (grunt) {
    "use strict";

    grunt.registerMultiTask("favicon", "description", function () {

    });

    function typeOf(value) {
        var type  = String(Object.prototype.toString.call(value) || '').slice(8, -1) || 'Object',
            types = ['Arguments', 'Array', 'Boolean', 'Date', 'Error', 'Function', 'Null', 'Number', 'Object', 'String', 'Undefined'];
        if (types.indexOf(type) !== -1) {
            type = type.toLowerCase();
        }
        return type;
    }
    function deferred(actions) {
        function iterate() {
            setTimeout(function () {
                var action = actions.shift();
                if (typeOf(action) === "function") {
                    action(iterate);
                }
            }, 0);
        }
        iterate();
    }





};