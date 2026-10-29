import {
	Attachment,
	AttachmentAction,
	AttachmentActions,
	AttachmentContent,
	AttachmentDescription,
	AttachmentGroup,
	AttachmentMedia,
	AttachmentTitle,
	AttachmentTrigger,
} from '@repo/ui/components/attachment';
import type { Meta, StoryObj } from '@storybook/react';
import { FileTextIcon, XIcon } from 'lucide-react';
import { expect, fn } from 'storybook/test';

/**
 * A file attached to a chat message or form, with its upload state. Compose AttachmentMedia (an
 * icon, or `variant="image"` for a thumbnail), AttachmentContent (AttachmentTitle,
 * AttachmentDescription) and AttachmentActions holding AttachmentAction buttons (ghost, `icon-xs`;
 * give each an `aria-label`). `state` is `idle`, `uploading`, `processing`, `error` or `done`;
 * `size` is `default`, `sm` or `xs`; `orientation` is `horizontal` or `vertical`. AttachmentTrigger
 * covers the whole attachment with a button, such as one that opens a preview. AttachmentGroup
 * lays several out in a row. shadcn's chat rules use Attachment for files, not Item.
 *
 * @summary File attachment with icon or thumbnail, upload state and actions
 */
const meta = {
	component: Attachment,
	subcomponents: {
		AttachmentMedia,
		AttachmentContent,
		AttachmentTitle,
		AttachmentDescription,
		AttachmentActions,
		AttachmentAction,
		AttachmentTrigger,
		AttachmentGroup,
	},
	render: (args) => (
		<Attachment {...args}>
			<AttachmentMedia>
				<FileTextIcon />
			</AttachmentMedia>
			<AttachmentContent>
				<AttachmentTitle>release-notes.pdf</AttachmentTitle>
				<AttachmentDescription>PDF, 2.4 MB</AttachmentDescription>
			</AttachmentContent>
			<AttachmentActions>
				<AttachmentAction aria-label="Remove release-notes.pdf">
					<XIcon />
				</AttachmentAction>
			</AttachmentActions>
		</Attachment>
	),
} satisfies Meta<typeof Attachment>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Uploaded (`state="done"`, the default). */
export const Default: Story = {};

/** `state="uploading"` while the file transfers. */
export const Uploading: Story = { args: { state: 'uploading' } };

/** `state="error"` when the upload failed. */
export const ErrorState: Story = {
	args: { state: 'error' },
};

/** `size="sm"`. */
export const Small: Story = { args: { size: 'sm' } };

/** A vertical attachment with an image thumbnail. */
export const ImageThumbnail: Story = {
	args: { orientation: 'vertical' },
	render: (args) => (
		<Attachment {...args}>
			<AttachmentMedia variant="image">
				<img src="/web-app-manifest-192x192.png" alt="" width={192} height={192} />
			</AttachmentMedia>
			<AttachmentContent>
				<AttachmentTitle>icon.png</AttachmentTitle>
				<AttachmentDescription>PNG, 12 KB</AttachmentDescription>
			</AttachmentContent>
		</Attachment>
	),
};

// The trigger's handler isn't an Attachment prop, so it can't be an arg; cleared before each run.
const openPreview = fn();

/** AttachmentTrigger makes the whole attachment a button, here one that opens a preview. */
export const Openable: Story = {
	beforeEach() {
		openPreview.mockClear();
	},
	render: (args) => (
		<Attachment {...args}>
			<AttachmentTrigger aria-label="Open release-notes.pdf" onClick={openPreview} />
			<AttachmentMedia>
				<FileTextIcon />
			</AttachmentMedia>
			<AttachmentContent>
				<AttachmentTitle>release-notes.pdf</AttachmentTitle>
				<AttachmentDescription>PDF, 2.4 MB</AttachmentDescription>
			</AttachmentContent>
		</Attachment>
	),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Open release-notes.pdf' }));
		await expect(openPreview).toHaveBeenCalledOnce();
	},
};

/** AttachmentGroup lays out several attachments. */
export const Group: Story = {
	render: (args) => (
		<AttachmentGroup>
			{['brief.pdf', 'budget.xlsx', 'logo.svg'].map((name) => (
				<Attachment key={name} {...args} size="sm">
					<AttachmentMedia>
						<FileTextIcon />
					</AttachmentMedia>
					<AttachmentContent>
						<AttachmentTitle>{name}</AttachmentTitle>
					</AttachmentContent>
				</Attachment>
			))}
		</AttachmentGroup>
	),
};

/** With `asChild` the trigger renders your own element, here a link that opens the file. */
export const OpenableLink: Story = {
	render: (args) => (
		<Attachment {...args}>
			<AttachmentTrigger asChild>
				<a href="#release-notes">
					<span className="sr-only">Open release-notes.pdf</span>
				</a>
			</AttachmentTrigger>
			<AttachmentMedia>
				<FileTextIcon />
			</AttachmentMedia>
			<AttachmentContent>
				<AttachmentTitle>release-notes.pdf</AttachmentTitle>
				<AttachmentDescription>PDF, 2.4 MB</AttachmentDescription>
			</AttachmentContent>
		</Attachment>
	),
	play: async ({ canvas }) => {
		const link = canvas.getByRole('link', { name: 'Open release-notes.pdf' });
		await expect(link).toHaveAttribute('href', '#release-notes');
		await expect(link).not.toHaveAttribute('type');
	},
};
