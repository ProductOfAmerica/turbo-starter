import {
	CodeBlock,
	CodeBlockActions,
	CodeBlockContent,
	CodeBlockCopyButton,
	CodeBlockFooter,
	CodeBlockHeader,
	CodeBlockLine,
	CodeBlockTitle,
} from '@repo/ui/components/code-block';
import { useHighlightedCode } from '@repo/ui/hooks/use-highlighted-code';
import type { Meta, StoryObj } from '@storybook/react';
import { FileCodeIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { expect, spyOn, waitFor } from 'storybook/test';

const SOURCE = `import { Button } from '@repo/ui/components/button';

export function Save() {
	return <Button>Save</Button>;
}
`;

function HighlightedBlock({
	code,
	language,
	...props
}: ComponentProps<typeof CodeBlock> & { code: string; language: string }) {
	const lines = useHighlightedCode(code, language);
	return (
		<CodeBlock {...props}>
			<CodeBlockHeader>
				<CodeBlockTitle>
					<FileCodeIcon />
					save.tsx
				</CodeBlockTitle>
				<CodeBlockActions>
					<CodeBlockCopyButton value={code} />
				</CodeBlockActions>
			</CodeBlockHeader>
			<CodeBlockContent>
				{lines.map((line, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: a line has no identity beyond its position
					<CodeBlockLine key={index}>{line}</CodeBlockLine>
				))}
			</CodeBlockContent>
		</CodeBlock>
	);
}

/**
 * Shows source code, with optional syntax highlighting, line numbers and a copy button. Compose
 * CodeBlockHeader (CodeBlockTitle, CodeBlockActions with a CodeBlockCopyButton given the `value`
 * to copy), CodeBlockContent and an optional CodeBlockFooter. To highlight, pass the code and a
 * language to the `useHighlightedCode` hook (`@repo/ui/hooks/use-highlighted-code`) and render
 * each returned line in a CodeBlockLine; until the grammar loads, lines arrive as plain text.
 * Languages are listed in `@repo/ui/lib/highlighter`. CodeBlockContent takes `lineNumbers`,
 * `startLine` and `wrap`; CodeBlockLine takes `variant` (`added`, `removed`, `highlighted`). CodeBlock
 * takes `variant` (`default` or `destructive`) and `size` (`default` or `sm`).
 *
 * @summary Source code block with highlighting, line numbers and copy button
 */
const meta = {
	component: CodeBlock,
	subcomponents: {
		CodeBlockHeader,
		CodeBlockTitle,
		CodeBlockActions,
		CodeBlockCopyButton,
		CodeBlockContent,
		CodeBlockLine,
		CodeBlockFooter,
	},
	args: { className: 'w-[32rem]' },
	render: (args) => <HighlightedBlock {...args} code={SOURCE} language="tsx" />,
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Highlighted once the TSX grammar loads; the copy button copies the source. */
export const Highlighted: Story = {
	beforeEach() {
		const writeText = spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
		return () => writeText.mockRestore();
	},
	play: async ({ canvas, canvasElement, userEvent }) => {
		// The highlighter and the TSX grammar load on first use; allow longer than waitFor's
		// one-second default.
		await waitFor(() => expect(canvasElement.querySelector('[style*="--shiki-light"]')).not.toBeNull(), {
			timeout: 5000,
		});
		await userEvent.click(canvas.getByRole('button', { name: 'Copy' }));
		await expect(navigator.clipboard.writeText).toHaveBeenCalledWith(SOURCE);
		await expect(await canvas.findByRole('button', { name: 'Copied' })).toBeVisible();
	},
};

/** The copy button confirms with "Copied", then goes back to "Copy" after two seconds. */
export const CopiedConfirmation: Story = {
	tags: ['!manifest'],
	beforeEach() {
		const writeText = spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
		return () => writeText.mockRestore();
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Copy' }));
		await expect(await canvas.findByRole('button', { name: 'Copied' })).toBeVisible();
		await expect(await canvas.findByRole('button', { name: 'Copy' }, { timeout: 4000 })).toBeVisible();
	},
};

/** When the browser refuses the clipboard write, the button stays on "Copy" and nothing is thrown. */
export const CopyRejected: Story = {
	tags: ['!manifest'],
	beforeEach() {
		const writeText = spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
		return () => writeText.mockRestore();
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Copy' }));
		await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(SOURCE));
		await expect(canvas.getByRole('button', { name: 'Copy' })).toBeVisible();
	},
};

/** `lineNumbers` with plain-string children numbers each line; `startLine` sets the first. */
export const LineNumbers: Story = {
	render: (args) => (
		<CodeBlock {...args}>
			<CodeBlockContent lineNumbers startLine={10}>
				{SOURCE}
			</CodeBlockContent>
		</CodeBlock>
	),
};

/** CodeBlockLine's `variant` marks lines added, removed or highlighted, as in a diff. */
export const Diff: Story = {
	render: (args) => (
		<CodeBlock {...args}>
			<CodeBlockContent>
				<CodeBlockLine>{'<Button'}</CodeBlockLine>
				<CodeBlockLine variant="removed">{'  variant="default"'}</CodeBlockLine>
				<CodeBlockLine variant="added">{'  variant="outline"'}</CodeBlockLine>
				<CodeBlockLine variant="highlighted">{'  size="sm"'}</CodeBlockLine>
				<CodeBlockLine>{'>'}</CodeBlockLine>
			</CodeBlockContent>
		</CodeBlock>
	),
};

/** `variant="destructive"` for error output, with a footer note. */
export const Destructive: Story = {
	args: { variant: 'destructive' },
	render: (args) => (
		<CodeBlock {...args}>
			<CodeBlockContent>{'Error: Cannot find module "@repo/ui/components/buton"'}</CodeBlockContent>
			<CodeBlockFooter>Exit code 1</CodeBlockFooter>
		</CodeBlock>
	),
};
