module.exports = (config) => {
  const karmaConfig = {
    browsers: ['Chrome'],
    singleRun: true,
    frameworks: ['browserify', 'tap'],
    files: ['test/**/*.js'],
    preprocessors: {
      'test/**/*.js': ['browserify'],
    },
    reporters: ['dots'],
    browserify: {
      debug: true,
    },
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox'],
      },
    },
  };

  if (process.env.TRAVIS) {
    karmaConfig.browsers = ['Chrome_travis_ci'];
  }

  config.set(karmaConfig);
};
