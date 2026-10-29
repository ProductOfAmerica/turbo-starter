import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/nextjs-vite';

// Written by `storybook init` for monorepos: pnpm doesn't hoist, so addons are passed as absolute
// paths. This file is .mts because import.meta fails type-checking in this package's CommonJS-format .ts.
function getAbsolutePath(value: string) {
	return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
	stories: [
		{ directory: '../../../packages/ui/stories', titlePrefix: 'UI' },
		{ directory: '../stories/web', titlePrefix: 'Web' },
	],
	addons: [
		getAbsolutePath('@storybook/addon-vitest'),
		getAbsolutePath('@storybook/addon-a11y'),
		getAbsolutePath('@storybook/addon-docs'),
		getAbsolutePath('@storybook/addon-mcp'),
	],
	framework: getAbsolutePath('@storybook/nextjs-vite'),
	features: {
		// The components manifest feeds the Storybook MCP server's docs tools.
		componentsManifest: true,
	},
	typescript: {
		// The default react-docgen misses props typed through cva's VariantProps.
		reactDocgen: 'react-docgen-typescript',
		// @ts-expect-error Storybook 10.6's types resolve this option to `undefined` here, but the docgen
		// plugin reads it at runtime. Delete this comment when tsc reports it as unused (TS2578).
		reactDocgenTypescriptOptions: {
			// Setting this object replaces Storybook's defaults instead of merging with them, so these
			// three repeat them. Without the filter, props declared in node_modules (such as the `tw`
			// attribute that Next's OG image types add to every element) reach the components manifest.
			shouldExtractLiteralValuesFromEnum: true,
			shouldRemoveUndefinedFromOptional: true,
			// The name check drops two leaks that have no parent: Radix's internal `__scope*` props and
			// the `on*Capture` DOM handlers that Recharts' legend types carry.
			propFilter: (prop: { name: string; parent?: { fileName: string } }) =>
				(prop.parent ? !/node_modules/.test(prop.parent.fileName) : true) &&
				!/^__scope|^on\w+Capture$/.test(prop.name),
			// Props tables cover only files that match these globs and are in tsconfig.json's own
			// file list. The default, **/*.tsx under apps/web, misses every packages/ui component.
			include: ['src/**/*.tsx', '../../packages/ui/src/**/*.tsx'],
		},
	},
	staticDirs: ['../public'],
};

export default config;
