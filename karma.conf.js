module.exports = (config) => {
  config.set({
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
  });
};
