/*jslint */
/*global module */

module.exports = function (grunt) {

    grunt.loadTasks("../src");

    grunt.initConfig({
        gct: {
            options: {},
            task: {
                options: {},
                files: [{
                    expand : true,
                    cwd    : "src",
                    ext    : ".js",
                    dest   : "dest",
                    src    : "*.soy"
                }]
            }
        }
    });

    grunt.registerTask("default", "Test all.", ["gct"]);

};