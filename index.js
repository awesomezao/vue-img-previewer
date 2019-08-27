import ImgPreview from './src/components/ImgPreview/ImgPreview';

const install = function (VUe) {
  Vue.Component('ImgPreview', ImgPreview);
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export { ImgPreview }

export default {
  version: '0.2.1',
  install,
  ImgPreview,
  ImgPreview: ImgPreview
}

