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
};