var assert = require('assert');
var exec = require('child_process').exec;
var fs = require('fs');
var mkdirp = require('mkdirp');
var mocha = require('mocha');
var path = require('path');
var request = require('supertest');
var rimraf = require('rimraf');
var spawn = require('child_process').spawn;

var binPath = path.resolve(__dirname, '../bin/koa');
var tempDir = path.resolve(__dirname, '../temp');

var timeout = 150000

describe('koa(1)', function () {
  mocha.before(function (done) {
    this.timeout(timeout);
    cleanup(done);
  });

  mocha.after(function (done) {
    this.timeout(timeout);
    cleanup(done);
  });

  describe('(no args)', function () {
    var dir;
    var files;
    var output;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(timeout);
      cleanup(dir, done);
    });

    it('should create basic app', function (done) {
      run(dir, ['--koa1'], function (err, stdout) {
        if (err) return done(err);
        files = parseCreatedFiles(stdout, dir);
        output = stdout;
        assert.equal(files.length, 19);
        done();
      });
    });

    it('should provide debug instructions', function () {
      assert.ok(/DEBUG=app-(?:[0-9\.]+):\* (?:\& )?npm start/.test(output));
    });

    it('should have basic files', function () {
      assert.notEqual(files.indexOf('bin/www'), -1);
      assert.notEqual(files.indexOf('app.js'), -1);
      assert.notEqual(files.indexOf('gulpfile.js'), -1);
      assert.notEqual(files.indexOf('log4js.json'), -1);
      assert.notEqual(files.indexOf('package.json'), -1);
    });

    it('should have jade templates', function () {
      assert.notEqual(files.indexOf('views/error.jade'), -1);
      assert.notEqual(files.indexOf('views/index.jade'), -1);
      assert.notEqual(files.indexOf('views/layout.jade'), -1);
    });

    it('should have a package.json file', function () {
      var file = path.resolve(dir, 'package.json');
      var contents = fs.readFileSync(file, 'utf8');
      assert.equal(contents, '{\n'
        + '  "name": ' + JSON.stringify(path.basename(dir)) + ',\n'
        + '  "version": "0.0.0",\n'
        + '  "private": true,\n'
        + '  "scripts": {\n'
        + '    "start": "node ./bin/www",\n'
        + '    "test": "gulp"\n'
        + '  },\n'
        + '  "dependencies": {\n'
        + '    "co": "^4.6.0",\n'
        + '    "jade": "~1.11.0",\n'
        + '    "koa": "^1.1.2",\n'
        + '    "koa-bodyparser": "^2.0.1",\n'
        + '    "koa-json": "^1.1.1",\n'
        + '    "koa-log4": "^1.0.1",\n'
        + '    "koa-onerror": "^1.2.1",\n'
        + '    "koa-router": "^5.3.0",\n'
        + '    "koa-static": "^1.5.2",\n'
        + '    "koa-views": "^3.1.0"\n'
        + '  },\n'
        + '  "devDependencies": {\n'
        + '    "del": "^2.2.0",\n'
        + '    "gulp": "^3.9.1",\n'
        + '    "gulp-concat": "^2.6.0",\n'
        + '    "gulp-cssmin": "^0.1.7",\n'
        + '    "gulp-nodemon": "^2.0.6",\n'
        + '    "gulp-sourcemaps": "^1.6.0",\n'
        + '    "gulp-uglify": "^1.5.3"\n'
        + '  }\n'
        + '}');
    });

    it('should have installable dependencies', function (done) {
      this.timeout(timeout);
      npmInstall(dir, done);
    });

    it('should export an koa app from app.js', function () {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);
      assert.equal(typeof app, 'object');
      assert.equal(typeof app.callback, 'function');
      assert.equal(typeof app.createContext, 'function'); 
    });

    it('should respond to HTTP request', function (done) {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);

      request(app.callback())
      .get('/')
      .expect(200, /<title>Welcome to Koa<\/title>/, done);
    });

    it('should generate a 404', function (done) {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);

      request(app.callback())
      .get('/does_not_exist')
      .expect(404, /Not Found/, done);
    });
  });

  describe('--ejs', function () {
    var dir;
    var files;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(timeout);
      cleanup(dir, done);
    });

    it('should create basic app with ejs templates', function (done) {
      run(dir, ['--koa1', '--ejs'], function (err, stdout) {
        if (err) return done(err);
        files = parseCreatedFiles(stdout, dir);
        assert.equal(files.length, 18, 'should have 18 files');
        done();
      });
    });

    it('should have basic files', function () {
      assert.notEqual(files.indexOf('bin/www'), -1, 'should have bin/www file');
      assert.notEqual(files.indexOf('app.js'), -1, 'should have app.js file');
      assert.notEqual(files.indexOf('gulpfile.js'), -1);
      assert.notEqual(files.indexOf('log4js.json'), -1);
      assert.notEqual(files.indexOf('package.json'), -1, 'should have package.json file');
    });

    it('should have ejs templates', function () {
      assert.notEqual(files.indexOf('views/error.ejs'), -1, 'should have views/error.ejs file');
      assert.notEqual(files.indexOf('views/index.ejs'), -1, 'should have views/index.ejs file');
    });

    it('should have installable dependencies', function (done) {
      this.timeout(timeout);
      npmInstall(dir, done);
    });

    it('should export an koa app from app.js', function () {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);
      assert.equal(typeof app, 'object');
      assert.equal(typeof app.callback, 'function');
      assert.equal(typeof app.createContext, 'function'); 
    });

    it('should respond to HTTP request', function (done) {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);

      request(app.callback())
      .get('/')
      .expect(200, /<title>Welcome to Koa<\/title>/, done);
    });

    it('should generate a 404', function (done) {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);

      request(app.callback())
      .get('/does_not_exist')
      .expect(404, /Not Found/, done);
    });
  });

  describe('--git', function () {
    var dir;
    var files;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(timeout);
      cleanup(dir, done);
    });

    it('should create basic app with git files', function (done) {
      run(dir, ['--koa1', '--git'], function (err, stdout) {
        if (err) return done(err);
        files = parseCreatedFiles(stdout, dir);
        assert.equal(files.length, 20, 'should have 20 files');
        done();
      });
    });

    it('should have basic files', function () {
      assert.notEqual(files.indexOf('bin/www'), -1, 'should have bin/www file');
      assert.notEqual(files.indexOf('app.js'), -1, 'should have app.js file');
      assert.notEqual(files.indexOf('gulpfile.js'), -1);
      assert.notEqual(files.indexOf('log4js.json'), -1);
      assert.notEqual(files.indexOf('package.json'), -1, 'should have package.json file');
    });

    it('should have .gitignore', function () {
      assert.notEqual(files.indexOf('.gitignore'), -1, 'should have .gitignore file');
    });

    it('should have jade templates', function () {
      assert.notEqual(files.indexOf('views/error.jade'), -1);
      assert.notEqual(files.indexOf('views/index.jade'), -1);
      assert.notEqual(files.indexOf('views/layout.jade'), -1);
    });
    
    it('should have installable dependencies', function (done) {
      this.timeout(timeout);
      npmInstall(dir, done);
    });
    
    it('should export an koa app from app.js', function () {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);
      assert.equal(typeof app, 'object');
      assert.equal(typeof app.callback, 'function');
      assert.equal(typeof app.createContext, 'function'); 
    });
    
    it('should respond to HTTP request', function (done) {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);

      request(app.callback())
      .get('/')
      .expect(200, /<title>Welcome to Koa<\/title>/, done);
    });

    it('should generate a 404', function (done) {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);

      request(app.callback())
      .get('/does_not_exist')
      .expect(404, /Not Found/, done);
    });
  });

  describe('-h', function () {
    var dir;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(timeout);
      cleanup(dir, done);
    });

    it('should print usage', function (done) {
      run(dir, ['-h'], function (err, stdout) {
        if (err) return done(err);
        var files = parseCreatedFiles(stdout, dir);
        assert.equal(files.length, 0);
        assert.ok(/Usage: koa/.test(stdout));
        assert.ok(/--help/.test(stdout));
        assert.ok(/--version/.test(stdout));
        assert.ok(/--koa1/.test(stdout));
        done();
      });
    });
  });

  describe('--hbs', function () {
    var dir;
    var files;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(timeout);
      cleanup(dir, done);
    });

    it('should create basic app with hbs templates', function (done) {
      run(dir, ['--koa1', '--hbs'], function (err, stdout) {
        if (err) return done(err);
        files = parseCreatedFiles(stdout, dir);
        assert.equal(files.length, 19);
        done();
      });
    });

    it('should have basic files', function () {
      assert.notEqual(files.indexOf('bin/www'), -1);
      assert.notEqual(files.indexOf('app.js'), -1);
      assert.notEqual(files.indexOf('gulpfile.js'), -1);
      assert.notEqual(files.indexOf('log4js.json'), -1);
      assert.notEqual(files.indexOf('package.json'), -1);
    });

    it('should have hbs in package dependencies', function () {
      var file = path.resolve(dir, 'package.json');
      var contents = fs.readFileSync(file, 'utf8');
      var dependencies = JSON.parse(contents).dependencies;
      assert.ok(typeof dependencies.hbs === 'string');
    });

    it('should have hbs templates', function () {
      assert.notEqual(files.indexOf('views/error.hbs'), -1);
      assert.notEqual(files.indexOf('views/index.hbs'), -1);
      assert.notEqual(files.indexOf('views/layout.hbs'), -1);
    });

    it('should have installable dependencies', function (done) {
      this.timeout(timeout);
      npmInstall(dir, done);
    });

    it('should export an koa app from app.js', function () {
      var file = path.resolve(dir, 'app.js');
      var app = require(file);
      assert.equal(typeof app, 'object');
      assert.equal(typeof app.callback, 'function');
      assert.equal(typeof app.createContext, 'function'); 
    });

    // it('should respond to HTTP request', function (done) {
    //   var file = path.resolve(dir, 'app.js');
    //   var app = require(file);

    //   request(app.callback())
    //   .get('/')
    //   .expect(200, /<title>Welcome to Koa<\/title>/, done);
    // });

    // it('should generate a 404', function (done) {
    //   var file = path.resolve(dir, 'app.js');
    //   var app = require(file);

    //   request(app.callback())
    //   .get('/does_not_exist')
    //   .expect(404, /Not Found/, done);
    // });
  });

  describe('--help', function () {
    var dir;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(timeout);
      cleanup(dir, done);
    });

    it('should print usage', function (done) {
      run(dir, ['--help'], function (err, stdout) {
        if (err) return done(err);
        var files = parseCreatedFiles(stdout, dir);
        assert.equal(files.length, 0);
        assert.ok(/Usage: koa/.test(stdout));
        assert.ok(/--help/.test(stdout));
        assert.ok(/--version/.test(stdout));
        assert.ok(/--koa1/.test(stdout));
        done();
      });
    });
  });
});

function cleanup(dir, callback) {
  if (typeof dir === 'function') {
    callback = dir;
    dir = tempDir;
  }

  rimraf(tempDir, function (err) {
    callback(err);
  });
}

function createEnvironment(callback) {
  var num = process.pid + Math.random();
  var dir = path.join(tempDir, ('app-' + num));

  mkdirp(dir, function ondir(err) {
    if (err) return callback(err);
    callback(null, dir);
  });
}

function npmInstall(dir, callback) {
  exec('npm install', {cwd: dir}, function (err, stderr) {
    if (err) {
      err.message += stderr;
      callback(err);
      return;
    }

    callback();
  });
}

function parseCreatedFiles(output, dir) {
  var files = [];
  var lines = output.split(/[\r\n]+/);
  var match;

  for (var i = 0; i < lines.length; i++) {
    if ((match = /create.*?: (.*)$/.exec(lines[i]))) {
      var file = match[1];

      if (dir) {
        file = path.resolve(dir, file);
        file = path.relative(dir, file);
      }

      file = file.replace(/\\/g, '/');
      files.push(file);
    }
  }

  return files;
}

function run(dir, args, callback) {
  var argv = [binPath].concat(args);
  var exec = process.argv[0];
  var stderr = '';
  var stdout = '';

  var child = spawn(exec, argv, {
    cwd: dir
  });

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', function ondata(str) {
    stdout += str;
  });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', function ondata(str) {
    process.stderr.write(str);
    stderr += str;
  });

  child.on('close', onclose);
  child.on('error', callback);

  function onclose(code) {
    var err = null;

    try {
      assert.equal(stderr, '');
      assert.strictEqual(code, 0);
    } catch (e) {
      err = e;
    }

    callback(err, stdout.replace(/\x1b\[(\d+)m/g, '_color_$1_'));
  }
}
