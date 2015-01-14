/*jslint */
/*global module, require, process */

var spawn   = require("child_process").spawn,
    rows    = process.stdout.rows,
    columns = process.stdout.columns,
    path    = require("path"),
    glob    = require("glob"),
    fs      = require("fs");

process.stdout.on("resize", function () {
    "use strict";
    rows    = process.stdout.rows;
    columns = process.stdout.columns;
});

module.exports = function (grunt) {
    "use strict";

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

    grunt.registerMultiTask("gct", "Google closure templates.", function () {

    });

    grunt.registerMultiTask("gce", "Google closure extractor.", function () {

        var self = this,
            files = self.files,
            length = files.length,
            done = self.async(),
            options;

        function getBool(value, defaults) {
            if (typeOf(value) === "undefined") {
                return !!defaults;
            }
            if (typeOf(value) === "string") {
                return ["off", "no", "false", "0", ""].indexOf(String(value).toLowerCase()) === -1;
            }
            return !!value;
        }

        function getOptions() {
            if (typeOf(options) === "undefined") {
                options = self.options() || {};
            }
            return options;
        }

        var allowExternalCalls;

        function getAllowExternalCalls() {
            var opt;
            if (typeOf(allowExternalCalls) === "undefined") {
                opt = getOptions();
                if (typeOf(opt.allowExternalCalls) !== "undefined" &&
                    getBool(opt.allowExternalCalls)) {
                    allowExternalCalls = "--allowExternalCalls";
                } else {
                    allowExternalCalls = "";
                }
            }
            return allowExternalCalls;
        }

        var bidiGlobalDir;

        function getBidiGlobalDir() {
            var opt,
                temp;
            if (typeOf(bidiGlobalDir) === "undefined") {
                opt = getOptions();
                if (typeOf(opt.bidiGlobalDir) !== "undefined") {
                    temp = String(opt.bidiGlobalDir || "").toLowerCase();
                    if (["ltr", "rtl"].indexOf(temp) === -1) {
                        throw new Error("bla bla bla");
                    }
                    if (temp === "ltr") {
                        bidiGlobalDir = "--bidiGlobalDir 1";
                    } else {
                        bidiGlobalDir = "--bidiGlobalDir -1";
                    }
                } else {
                    bidiGlobalDir = "";
                }
            }
            return bidiGlobalDir;
        }

        var codeStyle;

        function getCodeStyle() {
            var opt,
                temp;
            if (typeOf(codeStyle) === "undefined") {
                opt = getOptions();
                if (typeOf(opt.codeStyle) !== "undefined") {
                    temp = String(opt.codeStyle || "").toLowerCase();
                    if (["stringbuilder", "concat"].indexOf(temp) === -1) {
                        throw new Error("bla bla bla");
                    }
                    codeStyle = temp;
                }
            }
            return codeStyle;
        }

        function getDeps(callback) {
            glob("**/*.js", {}, function (error, files) {
            });
        }

        // --deps ITEM,ITEM,...
        // --srcs ITEM,ITEM,...


        // --cssHandlingScheme VAL !!!!!!!!!!!
        // --googMsgsAreExternal
        // --locales ITEM,ITEM,...
        // --shouldDeclareTopLevelNamespaces
        // --shouldGenerateGoogMsgDefs
        // --shouldGenerateJsdoc
        // --shouldProvideRequireSoyNamespaces
        // --useGoogIsRtlForBidiGlobalDir
        // --outputPathFormat VAL

        function compile() {}

    });

};