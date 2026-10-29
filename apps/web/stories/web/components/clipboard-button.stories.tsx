import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, spyOn, waitFor } from 'storybook/test';
import { ClipboardButton } from '@/components/clipboard-button';

/**
 * An icon button that copies a command to the clipboard and shows a check mark for two seconds.
 * Pass the text in `cmd`; the button's accessible name is "Copy <cmd> to clipboard". QuickStartSection
 * puts one beside each command.
 *
 * @summary Icon button that copies a command, then confirms with a check mark
 */
const meta = {
	component: ClipboardButton,
	args: { cmd: 'pnpm dev' },
} satisfies Meta<typeof ClipboardButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Clicking copies `cmd`. */
export const Default: Story = {
	beforeEach() {
		const writeText = spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
		return () => writeText.mockRestore();
	},
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: `Copy ${args.cmd} to clipboard` }));
		await expect(navigator.clipboard.writeText).toHaveBeenCalledWith(args.cmd);
	},
};

/** After a successful copy the check mark shows for two seconds, then the copy icon returns. */
export const CopiedConfirmation: Story = {
	tags: ['!manifest'],
	beforeEach() {
		const writeText = spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
		return () => writeText.mockRestore();
	},
	play: async ({ args, canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: `Copy ${args.cmd} to clipboard` }));
		await waitFor(() => expect(canvasElement.querySelector('svg.lucide-check')).not.toBeNull());
		await waitFor(() => expect(canvasElement.querySelector('svg.lucide-copy')).not.toBeNull(), { timeout: 4000 });
	},
};

/** If the browser refuses the write, the button logs the error and keeps showing the copy icon. */
export const CopyRejected: Story = {
	tags: ['!manifest'],
	beforeEach() {
		const writeText = spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
		const error = spyOn(console, 'error').mockImplementation(() => {});
		return () => {
			writeText.mockRestore();
			error.mockRestore();
		};
	},
	play: async ({ args, canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: `Copy ${args.cmd} to clipboard` }));
		await waitFor(() => expect(console.error).toHaveBeenCalledWith('Failed to copy: ', expect.any(Error)));
		await expect(canvasElement.querySelector('svg.lucide-copy')).not.toBeNull();
	},
};
