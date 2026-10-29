'use client';

import { cn } from 'cn';
import { OTPInput, OTPInputContext } from 'input-otp';
import { MinusIcon } from 'lucide-react';
import * as React from 'react';

function InputOTP({
	className,
	containerClassName,
	...props
}: React.ComponentProps<typeof OTPInput> & {
	/** Controlled value: the characters entered so far. Pair it with `onChange`. */
	value?: React.ComponentProps<typeof OTPInput>['value'];
	/** Called with the new value as a string (not an event) whenever it changes. */
	onChange?: React.ComponentProps<typeof OTPInput>['onChange'];
	/** Number of characters the code holds. Match it to the number of `InputOTPSlot` components rendered. */
	maxLength: React.ComponentProps<typeof OTPInput>['maxLength'];
	/** Alignment of the text inside the underlying input: 'left', 'center' or 'right'. Defaults to 'left'. */
	textAlign?: React.ComponentProps<typeof OTPInput>['textAlign'];
	/** Called once when every slot becomes filled, with the full value. */
	onComplete?: React.ComponentProps<typeof OTPInput>['onComplete'];
	/** How to handle password-manager badges that inject an icon into the input: 'increase-width' widens the input so the badge sits outside the slots, 'none' disables that. Defaults to 'increase-width'. */
	pushPasswordManagerStrategy?: React.ComponentProps<typeof OTPInput>['pushPasswordManagerStrategy'];
	/** Maps pasted text to the string that is actually entered, for example to strip dashes or spaces from a copied code. */
	pasteTransformer?: React.ComponentProps<typeof OTPInput>['pasteTransformer'];
	/** Class name for the visible wrapper around the slots. `className` goes to the hidden input instead. */
	containerClassName?: string;
	/** CSS placed in a `noscript` tag as a fallback when JavaScript is disabled. Pass null to omit the tag. Defaults to the library's built-in rule. */
	noScriptCSSFallback?: React.ComponentProps<typeof OTPInput>['noScriptCSSFallback'];
	/** CSP nonce applied to the style tag the component injects. Set it when your Content Security Policy restricts `style-src`. */
	nonce?: React.ComponentProps<typeof OTPInput>['nonce'];
	/** Render function that receives the slot state (`slots`, `isFocused`, `isHovering`) and returns the slots. Use it instead of `children`; the two are mutually exclusive. */
	render?: React.ComponentProps<typeof OTPInput>['render'];
}) {
	return (
		<OTPInput
			data-slot="input-otp"
			containerClassName={cn('cn-input-otp flex items-center has-disabled:opacity-50', containerClassName)}
			spellCheck={false}
			className={cn('disabled:cursor-not-allowed', className)}
			{...props}
		/>
	);
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="input-otp-group"
			className={cn(
				'flex items-center rounded-md has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40',
				className
			)}
			{...props}
		/>
	);
}

function InputOTPSlot({
	index,
	className,
	...props
}: React.ComponentProps<'div'> & {
	/** Zero-based position of this slot in the code. It decides which character the slot shows and when it is active. */
	index: number;
}) {
	const inputOTPContext = React.useContext(OTPInputContext);
	const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

	return (
		<div
			data-slot="input-otp-slot"
			data-active={isActive}
			className={cn(
				'relative flex size-9 items-center justify-center border-y border-r border-input text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-3 data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40',
				className
			)}
			{...props}
		>
			{char}
			{hasFakeCaret && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
				</div>
			)}
		</div>
	);
}

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="input-otp-separator"
			className="flex items-center [&_svg:not([class*='size-'])]:size-4"
			role="separator"
			{...props}
		>
			<MinusIcon />
		</div>
	);
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
