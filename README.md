# koa-generator
Express like generator with [standard style](https://github.com/feross/standard) and gulp-nodemon

## Installation

```sh
$ npm install -g koa-gen
```

## Usage

Create the app:

* for `koa v2`
```bash
$ koa /tmp/foo && cd /tmp/foo
```

* for `koa v1`
```bash
$ koa -1 /tmp/foo && cd /tmp/foo
```

Install dependencies:

```bash
$ npm install
```

Rock and Roll

```bash
$ npm start
```

or with gulp and nodemon

```bash
$ npm test
```

## Command Line Options

This generator can also be further configured with the following command line flags.

    -h, --help          output usage information
    -V, --version       output the version number
    -1, --koa1          use Koa v1.x (defaults to Koa v2.x)
    -e, --ejs           add ejs engine support (defaults to jade)
        --hbs           add handlebars engine support
    -H, --hogan         add hogan.js engine support
    -c, --css <engine>  add stylesheet <engine> support (less|stylus|compass|sass) (defaults to plain css)
        --git           add .gitignore
    -f, --force         force on non-empty directory

## License

[MIT](LICENSE)
