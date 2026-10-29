import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@repo/ui/components/input-otp';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn } from 'storybook/test';

/**
 * Entry for one-time codes, one box per character. `maxLength` sets the number of characters;
 * render one InputOTPSlot per index inside InputOTPGroup. `onComplete` fires once every slot is
 * filled. Built on the `input-otp` package, so it also takes its props such as `pattern`. Control it
 * with `value` and `onChange`: input-otp 1.5 forwards `defaultValue` to its input next to its own
 * `value`, which React warns about.
 *
 * @summary One-time code entry, one slot per character, with onComplete
 */
const meta = {
	component: InputOTP,
	subcomponents: { InputOTPGroup, InputOTPSlot, InputOTPSeparator },
	args: { maxLength: 6, 'aria-label': 'Verification code', children: null },
	render: ({ maxLength, onComplete, disabled, 'aria-label': ariaLabel }) => (
		<InputOTP maxLength={maxLength} onComplete={onComplete} disabled={disabled} aria-label={ariaLabel}>
			<InputOTPGroup>
				<InputOTPSlot index={0} />
				<InputOTPSlot index={1} />
				<InputOTPSlot index={2} />
			</InputOTPGroup>
			<InputOTPSeparator />
			<InputOTPGroup>
				<InputOTPSlot index={3} />
				<InputOTPSlot index={4} />
				<InputOTPSlot index={5} />
			</InputOTPGroup>
		</InputOTP>
	),
} satisfies Meta<typeof InputOTP>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A six-digit code split into two groups of three. Typing the last digit calls `onComplete`. */
export const Default: Story = {
	args: { onComplete: fn() },
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.type(canvas.getByRole('textbox', { name: 'Verification code' }), '123456');
		await expect(args.onComplete).toHaveBeenCalledWith('123456');
	},
};

/** A code with no separator, for short PINs. */
export const FourDigits: Story = {
	args: { maxLength: 4 },
	render: ({ maxLength, onComplete, disabled, 'aria-label': ariaLabel }) => (
		<InputOTP maxLength={maxLength} onComplete={onComplete} disabled={disabled} aria-label={ariaLabel}>
			<InputOTPGroup>
				<InputOTPSlot index={0} />
				<InputOTPSlot index={1} />
				<InputOTPSlot index={2} />
				<InputOTPSlot index={3} />
			</InputOTPGroup>
		</InputOTP>
	),
};

/** A disabled, filled code input, for example while the code is being verified. */
export const Disabled: Story = {
	args: { disabled: true },
	render: ({ maxLength, disabled, 'aria-label': ariaLabel }) => (
		<InputOTP maxLength={maxLength} disabled={disabled} value="123456" aria-label={ariaLabel}>
			<InputOTPGroup>
				<InputOTPSlot index={0} />
				<InputOTPSlot index={1} />
				<InputOTPSlot index={2} />
			</InputOTPGroup>
			<InputOTPSeparator />
			<InputOTPGroup>
				<InputOTPSlot index={3} />
				<InputOTPSlot index={4} />
				<InputOTPSlot index={5} />
			</InputOTPGroup>
		</InputOTP>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('textbox', { name: 'Verification code' })).toBeDisabled();
		await expect(canvas.getByText('6')).toBeVisible();
	},
};
