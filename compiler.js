module.exports = { compile: compile };

var falafel = require('falafel');

var isKeyword = {
  isKeyword: function findEnvDecls (id) {
    return id === 'env' ? true : undefined ;
  }
};

function precompile(source) {
    return source.replace(/env\s+(\S+)\s*?=(?!=)/gm, function (_, $1) {
      return '$ENV.' + $1 + ' = ';
    })
}

function postWrap(source) {
  return (
    '(function () { var env = require(\'env\'); $ENV = env.create(/* root env */)' +
    source +
    '}())'
  );
}

function onNode(node) {
  var type = node.type;
  if (type === 'FunctionExpression') {
    var src = node.source()
        .replace(/^function.*?\(/, 'function ($ENV, ')
        .replace(/^function \(\$ENV,\s+\)/, 'function ($ENV)')  // zero-argument case
    node.update('env.bindLexical($ENV, ' + src + ')');
  } else if (type === 'CallExpression') {
    var argSrc =
      node.arguments.map(function (n) { return n.source(); }).join(', ');
    if (argSrc.length > 0) { argSrc = ', ' + argSrc }
    if (node.callee.type === 'MemberExpression') {
      node.update('env.callMethod($ENV, ' + node.callee.object.source()
        + ', "' + node.callee.property.name + '"' + argSrc + ')');
    } else {
      node.update('env.call($ENV, ' + node.callee.source() + argSrc + ')');
    }
  } else if (type === 'UnaryExpression' && node.keyword === 'env') {
    node.update('$ENV.' + node.argument.source());
  } 
}

function compile(codeStr) {
  codeStr = precompile(codeStr);
  var compiled = falafel(codeStr, isKeyword, onNode);
  return postWrap(compiled + '');
}

// Direct execution
if (module.parent === null) {
  process.stdout.write(compile(
    require('fs').readFileSync(
      process.argv[2],
      { encoding: 'utf8' })));
}

/* vim: set sw=2 sts=2 et: */
