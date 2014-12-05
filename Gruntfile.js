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
            done = this.async();
        deferred([
            function (next) {
                fs.exists("bin", function (result) {
                    exists = result;
                    next();
                });
            },
            function (next) {
                var remove;
                if (exists) {
                    remove = spawn("/usr/bin/env", ["rm", "-rf", "bin"]);
                    remove.stderr.on("data", function (data) {
                        output.push(data.toString("utf8"));
                    });
                    remove.stdout.on("data", function (data) {
                        output.push(data.toString("utf8"));
                    });
                    remove.on("close", function (code) {
                        if (code !== 0) {
                            // todo: display error
                        } else {
                            grunt.log.writeln("remove bin");
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
                        // todo: display error
                    } else {
                        grunt.log.writeln("mkdir bin/compiler");
                        next();
                    }
                });
            },
            function (next) {
                mkdir("bin/extractor", function (error) {
                    if (error) {
                        // todo: display error
                    } else {
                        grunt.log.writeln("mkdir bin/extractor");
                        next();
                    }
                });
            },
            function (next) {
                download("http://closure-templates.googlecode.com/files/closure-templates-for-javascript-latest.zip", function (error, filename) {
                    if (error) {
                        // todo: display error
                    } else {
                        compiler = filename;
                        grunt.log.writeln("download compiler");
                        next();
                    }
                });
            },
            function (next) {
                var output = [],
                    unzip = spawn("/usr/bin/env", ["unzip", path.join("temp", compiler), "-d", "bin/compiler"]);
                unzip.stderr.on("data", function (data) {
                    output.push(data.toString("utf8"));
                });
                unzip.stdout.on("data", function (data) {
                    output.push(data.toString("utf8"));
                });
                unzip.on("close", function (code) {
                    if (code !== 0) {
                        // todo: fix this
                        grunt.log.writeln(output.join(""));
                    } else {
                        grunt.log.writeln("extract compiler");
                        next();
                    }
                });
            },
            function (next) {
                download("http://closure-templates.googlecode.com/files/closure-templates-msg-extractor-latest.zip", function (error, filename) {
                    if (error) {
                        // todo: display error
                    } else {
                        extractor = filename;
                        grunt.log.writeln("download extractor");
                        next();
                    }
                });
            },
            function (next) {
                var unzip = spawn("/usr/bin/env", ["unzip", path.join("temp", extractor), "-d", "bin/extractor"]);
                unzip.stderr.on("data", function (data) {
                    output.push(data.toString("utf8"));
                });
                unzip.stdout.on("data", function (data) {
                    output.push(data.toString("utf8"));
                });
                unzip.on("close", function (code) {
                    if (code !== 0) {
                        // todo: display error
                    } else {
                        grunt.log.writeln("extract extractor");
                        next();
                    }
                });
            },
            function (next) {
                var remove = spawn("/usr/bin/env", ["rm", "-rf", "temp"]);
                remove.stderr.on("data", function (data) {
                    output.push(data.toString("utf8"));
                });
                remove.stdout.on("data", function (data) {
                    output.push(data.toString("utf8"));
                });
                remove.on("close", function (code) {
                    if (code !== 0) {
                        // todo: display error
                    } else {
                        grunt.log.writeln("clean temp");
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