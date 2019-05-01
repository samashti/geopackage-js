import pkg from './package.json';

export default {
	input: 'src/wkx.js',
	output: [
		{ file: pkg.main, format: 'umd', name: 'wkx' },
		{ file: pkg.module, format: 'esm' }
	]
};