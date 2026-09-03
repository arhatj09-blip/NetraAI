declare module 'plotly.js-dist-min' {
  import * as Plotly from 'plotly.js';
  export = Plotly;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
