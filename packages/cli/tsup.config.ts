import {defineConfig} from 'tsup'

export default defineConfig({
	clean: true,
	dts: true,
	entry: ['src/index.tsx'],
	format: ['esm'],
	minify: true,
	treeshake: true,
	splitting: false,
})
