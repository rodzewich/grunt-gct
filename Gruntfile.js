/*jslint */
/*global module */

var spawn = require("child_process").spawn,
    url   = require("url"),
    http  = require("http"),
    path  = require("path"),
    fs    = require("fs");

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
    function displayPropertyWithPadding(property, value) {
        var array = new Array(12 - property.length);
        grunt.log.writeln(array.join(" ") + property.green + " " + value);
    }
    function displayError(error) {
        grunt.log.write(">>".red + " " + String(error.name).red + " " + error.message);
    }
    function displayErrorContent(content) {
        content.split(/(?:\n|\r)+/).forEach(function (item) {
            item = item.replace(/\s+$/, "");
            item = item.replace(/\s+/, " ");
            if (item) {
                while (item) {
                    item = item.replace(/^\s+/, "");
                    grunt.log.write(">>".red + " ");
                    grunt.log.writeln(item.substr(0, columns - 3));
                    item = item.substr(columns - 3);
                }
            }
        });
    }
    function mkdir(dir, callback) {
        deferred([
            function (iterate) {
                fs.exists(dir, function (exists) {
                    if (exists) {
                        callback(null);
                    } else {
                        iterate();
                    }
                });
            },
            function () {
                mkdir(path.dirname(dir), function (error) {
                    if (error) {
                        callback(error);
                    } else {
                        fs.mkdir(dir, function (error) {
                            callback(error || null);
                        });
                    }
                });
            }
        ]);
    }
    function download(uri, callback) {
        deferred([
            function (next) {
                mkdir("temp", function (error) {
                    if (error) {
                        callback(error, null);
                    } else {
                        next();
                    }
                })
            },
            function () {
                var filename = path.basename(url.parse(uri).pathname),
                    stream = fs.createWriteStream(path.join("temp", filename));
                stream.on('finish', function() {
                    callback(null, filename);
                });
                http.get(uri, function(response) {
                    response.on('data', function(data) {
                        stream.write(data);
                    });
                    response.on('end', function() {
                        stream.end();
                    });
                });
            }
        ]);
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        uglify: {
            options: {
                banner: grunt.file.read("src/banner.txt")
            },
            compile: {
                files: [{
                    expand : false,
                    dest   : "tasks/gct.js",
                    src    : "src/*.js"
                }]
            }
        }
    });

    grunt.registerTask("update", "Update dependencies", function () {
        var exists,
            compiler,
            extractor,
            done = this.async(),
            COMPILER_ADDRESS = "http://closure-templates.googlecode.com/files/closure-templates-for-javascript-latest.zip",
            EXTRACTOR_ADDRESS = "http://closure-templates.googlecode.com/files/closure-templates-msg-extractor-latest.zip";
        deferred([
            function (next) {
                fs.exists("bin", function (result) {
                    exists = result;
                    next();
                });
            },
            function (next) {
                var command,
                    output = [];
                if (exists) {
                    command = spawn("/usr/bin/env", ["rm", "-rf", "bin"]);
                    command.stderr.on("data", function (data) {
                        output.push(data.toString("utf8"));
                    });
                    command.stdout.on("data", function (data) {
                        output.push(data.toString("utf8"));
                    });
                    command.on("close", function (code) {
                        if (code !== 0) {
                            displayErrorContent(output.join(""));
                            done(false);
                        } else {
                            displayPropertyWithPadding("clean", "rm -rf bin");
                            next();
                        }
                    });
                } else {
                    next();
                }
            },
            function (next) {
                mkdir("bin/compiler", function (error) {
                    if (error) {
                        displayError(error);
                        done(false);
                    } else {
                        displayPropertyWithPadding("mkdir", "bin/compiler");
                        next();
                    }
                });
            },
            function (next) {
                mkdir("bin/extractor", function (error) {
                    if (error) {
                        displayError(error);
                        done(false);
                    } else {
                        displayPropertyWithPadding("mkdir", "bin/extractor");
                        next();
                    }
                });
            },
            function (next) {
                download(COMPILER_ADDRESS, function (error, filename) {
                    if (error) {
                        displayError(error);
                        done(false);
                    } else {
                        compiler = filename;
                        displayPropertyWithPadding("download", COMPILER_ADDRESS);
                        next();
                    }
                });
            },
            function (next) {
                var command = spawn("/usr/bin/env", ["unzip", path.join("temp", compiler), "-d", "bin/compiler"]),
                    output = [];
                command.stderr.on("data", function (data) {
                    output.push(data.toString("utf8"));
                });
                command.stdout.on("data", function (data) {
                    output.push(data.toString("utf8"));
                });
                command.on("close", function (code) {
                    if (code !== 0) {
                        displayErrorContent(output.join(""));
                        done(false);
                    } else {
                        displayPropertyWithPadding("extract", "unzip " + path.join("temp", compiler) + " -d bin/compiler");
                        next();
                    }
                });
            },
            function (next) {
                download(EXTRACTOR_ADDRESS, function (error, filename) {
                    if (error) {
                        displayError(error);
                        done(false);
                    } else {
                        extractor = filename;
                        displayPropertyWithPadding("download", EXTRACTOR_ADDRESS);
                        next();
                    }
                });
            },
            function (next) {
                var command = spawn("/usr/bin/env", ["unzip", path.join("temp", extractor), "-d", "bin/extractor"]),
                    output = [];
                command.stderr.on("data", function (data) {
                    output.push(data.toString("utf8"));
                });
                command.stdout.on("data", function (data) {
                    output.push(data.toString("utf8"));
                });
                command.on("close", function (code) {
                    if (code !== 0) {
                        displayErrorContent(output.join(""));
                        done(false);
                    } else {
                        displayPropertyWithPadding("extract", "unzip " + path.join("temp", extractor) + " -d bin/extractor");
                        next();
                    }
                });
            },
            function (next) {
                var command = spawn("/usr/bin/env", ["rm", "-rf", "temp"]),
                    output = [];
                command.stderr.on("data", function (data) {
                    output.push(data.toString("utf8"));
                });
                command.stdout.on("data", function (data) {
                    output.push(data.toString("utf8"));
                });
                command.on("close", function (code) {
                    if (code !== 0) {
                        displayErrorContent(output.join(""));
                        done(false);
                    } else {
                        displayPropertyWithPadding("clean", "rm -rf temp");
                        next();
                    }
                });
            },
            function () {
                done(true);
            }
        ]);
    });

    grunt.registerTask("compile", "Compile package", ["uglify:compile"]);

    grunt.registerTask("default", "Build package", ["update", "compile"]);

};