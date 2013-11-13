/* run the tests in ../functest */

var path = require('path');
var fs = require('fs');
require('../requireHook.js')();

var functestFolder = path.join(__dirname, '../functest');

var tests = fs.readdirSync(functestFolder)
  .filter(/r/.test.bind(/\.js*/))
  .filter(/r/.test.bind(/^[^.]/))
  .forEach(function (file) {
    require(path.join(functestFolder, file));
  });

/* vim: set sw=2 sts=2 et: */