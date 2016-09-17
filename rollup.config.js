import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'snabbdom-app.js',
  dest: 'public/bundle.js',
  plugins: [babel(), nodeResolve()]
}
