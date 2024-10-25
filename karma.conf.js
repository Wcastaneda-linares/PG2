module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // opciones adicionales para Jasmine
      },
      clearContext: false // deja visible la salida de Jasmine en el navegador
    },
    jasmineHtmlReporter: {
      suppressAll: true // elimina los trazos duplicados
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/app'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'], // Usa el modo Headless de Chrome
    singleRun: false,
    restartOnFileChange: true,
    
    // Agregar estos parámetros para evitar desconexiones prematuras
    browserDisconnectTimeout: 10000, // 10 segundos para reconectar
    browserNoActivityTimeout: 60000, // 60 segundos de espera por inactividad
    captureTimeout: 120000 // 2 minutos para capturar el navegador
  });
};
