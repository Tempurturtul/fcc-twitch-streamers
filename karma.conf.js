module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    phantomjsLauncher: {
      exitOnResourceError: true
    },
    frameworks: ['mocha', 'chai'],
    files: [
      'src/client/vendor/angular.min.js',
      'src/client/vendor/angular-cookies.min.js',
      'src/client/vendor/angular-mocks.js',
      'src/client/app/app.module.js',
      'src/client/app/**/*.module.js',
      'src/client/app/**/*.js',
      'src/client/app/**/*.spec.js'
    ]
  });
};
