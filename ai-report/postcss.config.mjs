/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Autoprefixer for browser compatibility
    autoprefixer: {},
    
    // CSS nano for minification in production
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
          colormin: true,
          minifyFontValues: true,
          minifySelectors: true,
        }],
      },
    }),
  },
};

export default config;
