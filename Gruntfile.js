/*jslint */
/*global module */

var http = require('http'),
    fs   = require('fs');

module.exports = function (grunt) {

    grunt.loadNpmTasks("grunt-contrib-uglify");

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

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        uglify: {
            options: {
                banner: grunt.file.read("src/banner.txt")
            },
            tasks: {
                files: [{
                    expand : false,
                    dest   : "tasks/favicon.js",
                    src    : "src/*.js"
                }]
            }
        }
    });

    grunt.registerTask("update", "Update dependencies", function () {
        var exists = false;
        deferred([
            function (next) {
                fs.exist("temp", function (result) {
                    exists = result;
                    next();
                });
            },
            function (next) {
                if (exists) {
                    next();
                } else {
                    fs.mkdir("temp", function (error) {
                        if (error) {
                            // todo: display error
                        } else {
                            next();
                        }
                    });
                }
            },
            function (next) {
                var file = fs.createWriteStream("temp/templates.zip");
                http.get("https://closure-templates.googlecode.com/files/closure-templates-for-javascript-latest.zip", function(response) {
                    response.pipe(file);
                    next();
                });
            },
            function (next) {
                // unzip file.zip -d destination_folder
            },
            function () {
                var file = fs.createWriteStream("temp/extractor.zip");
                http.get("https://closure-templates.googlecode.com/files/closure-templates-msg-extractor-latest.zip", function(response) {
                    response.pipe(file);
                });
            },
            function (next) {
                // unzip file.zip -d destination_folder
            }
        ]);
    });

    grunt.registerTask("default", "Build package.", ["uglify:tasks"]);

};