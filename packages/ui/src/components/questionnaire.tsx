'use client';

import { type Button, buttonVariants } from '@repo/ui/components/button';
import { Questionnaire as QuestionnairePrimitive } from '@shadcn/react/questionnaire';
import { cn } from 'cn';
import { CheckIcon } from 'lucide-react';
import type * as React from 'react';

function Questionnaire({
	className,
	...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Root> & {
	/** Name of the item shown first when the active item is uncontrolled. Falls back to the first enabled item if the name is missing or disabled. */
	defaultItem?: React.ComponentProps<typeof QuestionnairePrimitive.Root>['defaultItem'];
	/** Name of the active item, for controlled use. Pair with `onItemChange` to update it. */
	item?: React.ComponentProps<typeof QuestionnairePrimitive.Root>['item'];
	/** Ordered definitions of the questions (`name`, `required`, `disabled`, `choices`). Sets the navigation order and the choice order used for keyboard shortcuts. Each entry must match a rendered `QuestionnaireItem`; mismatches log a warning in development. */
	items?: React.ComponentProps<typeof QuestionnairePrimitive.Root>['items'];
	/** Called with the new item name whenever the active item changes, whether by navigation, skipping, reset, or a failed submit validation. */
	onItemChange?: React.ComponentProps<typeof QuestionnairePrimitive.Root>['onItemChange'];
	/** Assigns keyboard shortcuts to the active item's enabled choices: `letters` uses A to Z, `numbers` uses 1 to 9. Pressing a key selects that choice, except while typing in a text field. Off by default. */
	shortcuts?: React.ComponentProps<typeof QuestionnairePrimitive.Root>['shortcuts'];
}) {
	return (
		<QuestionnairePrimitive.Root
			data-slot="questionnaire"
			className={cn('flex w-full min-w-0 flex-col gap-6', className)}
			{...props}
		/>
	);
}

function QuestionnaireProgress({
	className,
	...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Progress> & {
	/** Replaces the default <div> with your own element, or a function `(props, state) => element` that receives the props to spread onto it. The default content reads "Question N of M". */
	render?: React.ComponentProps<typeof QuestionnairePrimitive.Progress>['render'];
}) {
	return (
		<QuestionnairePrimitive.Progress
			data-slot="questionnaire-progress"
			className={cn(
				'min-h-[1lh] w-fit min-w-[14ch] text-xs font-medium text-muted-foreground tabular-nums',
				className
			)}
			{...props}
		/>
	);
}

function QuestionnaireItem({
	className,
	...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Item> & {
	/** Forces the item into its error state, sets `aria-invalid`, and shows `QuestionnaireError`. Use for custom or server-side validation. Defaults to false. */
	invalid?: React.ComponentProps<typeof QuestionnairePrimitive.Item>['invalid'];
	/** Unique name of the item. Used to match `items` entries on `Questionnaire`, to select the active item, and as the form field name for the item's answers. */
	name: React.ComponentProps<typeof QuestionnairePrimitive.Item>['name'];
	/** Lets the user select several choices (checkboxes) instead of one (radio buttons). Defaults to false. */
	multiple?: React.ComponentProps<typeof QuestionnairePrimitive.Item>['multiple'];
	/** Called with `unanswered`, `answered` or `skipped` whenever the item's status changes. */
	onStatusChange?: React.ComponentProps<typeof QuestionnairePrimitive.Item>['onStatusChange'];
	/** Requires an answer before the user can move on, and hides `QuestionnaireSkip` for this item. Defaults to false. */
	required?: React.ComponentProps<typeof QuestionnairePrimitive.Item>['required'];
}) {
	return (
		<QuestionnairePrimitive.Item
			data-slot="questionnaire-item"
			className={cn('flex min-w-0 flex-col gap-5 border-0 p-0 outline-none', className)}
			{...props}
		/>
	);
}

function QuestionnaireTitle({
	className,
	...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Title> & {
	/** Replaces the default <legend> with your own element, or a function `(props, state) => element` that receives the props to spread onto it. */
	render?: React.ComponentProps<typeof QuestionnairePrimitive.Title>['render'];
}) {
	return (
		<QuestionnairePrimitive.Title
			data-slot="questionnaire-title"
			className={cn(
				'text-base font-semibold text-pretty [&:not(:has(~[data-slot=questionnaire-description]))]:mb-5',
				className
			)}
			{...props}
		/>
	);
}

function QuestionnaireDescription({
	className,
	...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Description> & {
	/** Replaces the default <p> with your own element, or a function `(props, state) => element` that receives the props to spread onto it. */
	render?: React.ComponentProps<typeof QuestionnairePrimitive.Description>['render'];
}) {
	return (
		<QuestionnairePrimitive.Description
			data-slot="questionnaire-description"
			className={cn('text-sm text-pretty text-muted-foreground', className)}
			{...props}
		/>
	);
}

function QuestionnaireChoices({
	className,
	...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Choices> & {
	/** Replaces the default <div> with your own element, or a function `(props, state) => element` that receives the props to spread onto it. */
	render?: React.ComponentProps<typeof QuestionnairePrimitive.Choices>['render'];
}) {
	return (
		<QuestionnairePrimitive.Choices
			data-slot="questionnaire-choices"
			className={cn('group/questionnaire-choices grid min-w-0 gap-3', className)}
			{...props}
		/>
	);
}

function QuestionnaireChoice({
	children,
	className,
	...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Choice> & {
	/** Replaces the default <label> with your own element, or a function `(props, state) => element` that receives the props to spread onto it. */
	render?: React.ComponentProps<typeof QuestionnairePrimitive.Choice>['render'];
	/** Controlled checked state. Pair with `onChange` to update it. */
	checked?: React.ComponentProps<typeof QuestionnairePrimitive.Choice>['checked'];
	/** Prevents selecting the choice and excludes it from keyboard shortcuts. Defaults to false. */
	disabled?: React.ComponentProps<typeof QuestionnairePrimitive.Choice>['disabled'];
	/** Called when the underlying input changes. Call `event.preventDefault()` to stop the questionnaire from updating its own selection state. */
	onChange?: React.ComponentProps<typeof QuestionnairePrimitive.Choice>['onChange'];
	/** Value submitted for the item's `name` when this choice is selected. Must match the `choices` entry in `items` when `items` is set. */
	value: React.ComponentProps<typeof QuestionnairePrimitive.Choice>['value'];
}) {
	return (
		<QuestionnairePrimitive.Choice
			data-slot="questionnaire-choice"
			className={cn(
				'group/questionnaire-choice relative flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-input bg-transparent px-4 py-3.5 text-start text-sm shadow-xs transition-colors outline-none select-none hover:bg-muted/50 has-[>input:focus-visible]:border-ring has-[>input:focus-visible]:ring-3 has-[>input:focus-visible]:ring-ring/50 data-invalid:border-destructive dark:bg-input/20 data-checked:border-primary/40 data-checked:bg-muted dark:data-checked:bg-muted',
				'data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50',
				className
			)}
			{...props}
		>
			<QuestionnairePrimitive.ChoiceInput
				data-slot="questionnaire-choice-input"
				className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
			/>
			<span
				aria-hidden="true"
				data-slot="questionnaire-choice-indicator"
				className="pointer-events-none relative flex size-4 shrink-0 translate-y-[--spacing(0.45)] items-center justify-center rounded-[4px] border border-input group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 group-data-[type=radio]/questionnaire-choice:rounded-full group-data-checked/questionnaire-choice:border-primary group-data-checked/questionnaire-choice:bg-primary group-data-checked/questionnaire-choice:text-primary-foreground dark:bg-input/30 dark:group-data-checked/questionnaire-choice:bg-primary"
			>
				<span
					data-slot="questionnaire-choice-indicator-dot"
					className="hidden size-2 rounded-full bg-primary-foreground group-data-[type=checkbox]/questionnaire-choice:hidden group-data-checked/questionnaire-choice:block"
				/>
				<CheckIcon
					data-slot="questionnaire-choice-indicator-check"
					className="hidden size-3.5 group-data-[type=radio]/questionnaire-choice:hidden group-data-checked/questionnaire-choice:block"
				/>
			</span>
			<QuestionnairePrimitive.ChoiceLabel
				data-slot="questionnaire-choice-label"
				className="flex min-w-0 flex-1 flex-col gap-1 leading-snug"
			>
				{children}
			</QuestionnairePrimitive.ChoiceLabel>
			<QuestionnairePrimitive.ChoiceShortcut
				data-slot="questionnaire-choice-shortcut"
				className="pointer-events-none ms-auto hidden size-5 shrink-0 translate-y-[--spacing(0.45)] items-center justify-center rounded-md border border-input bg-background font-mono text-[0.625rem] leading-none font-medium text-muted-foreground shadow-xs group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 group-data-[shortcut]/questionnaire-choice:inline-flex"
			/>
		</QuestionnairePrimitive.Choice>
	);
}

function QuestionnaireChoiceDescription({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			data-slot="questionnaire-choice-description"
			className={cn('text-muted-foreground', className)}
			{...props}
		/>
	);
}

function QuestionnaireInput({
	className,
	...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Input> & {
	/** Replaces the default <input> with your own element, or a function `(props, state) => element` that receives the props to spread onto it. */
	render?: React.ComponentProps<typeof QuestionnairePrimitive.Input>['render'];
	/** Input type for the free-text answer: `text` (default), `email`, `number`, `password`, `search`, `tel`, `url`, or a date or time type (`date`, `datetime-local`, `month`, `time`, `week`). */
	type?: React.ComponentProps<typeof QuestionnairePrimitive.Input>['type'];
}) {
	return (
		<div data-slot="questionnaire-input-wrapper" className="group/questionnaire-input relative w-full min-w-0">
			<QuestionnairePrimitive.Input
				data-slot="questionnaire-input"
				className={cn(
					'h-9 min-h-11 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 sm:min-h-0 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
					'selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground',
					className
				)}
				{...props}
			/>
		</div>
	);
}

function QuestionnaireError({
	className,
	...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Error> & {
	/** Replaces the default <p> with your own element, or a function `(props, state) => element` that receives the props to spread onto it. The default message asks the user to choose an answer or skip. */
	render?: React.ComponentProps<typeof QuestionnairePrimitive.Error>['render'];
}) {
	return (
		<QuestionnairePrimitive.Error
			data-slot="questionnaire-error"
			className={cn('text-sm text-destructive', className)}
			{...props}
		/>
	);
}

function QuestionnaireActions({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="questionnaire-actions"
			className={cn(
				'grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 sm:min-h-9',
				className
			)}
			{...props}
		/>
	);
}

function QuestionnairePrevious({
	children,
	className,
	size = 'default',
	variant = 'outline',
	...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Previous> & {
	/** Replaces the default <button> with your own element, or a function `(props, state) => element` that receives the props to spread onto it. Use to render the button as a different element, for example a link. */
	render?: React.ComponentProps<typeof QuestionnairePrimitive.Previous>['render'];
} & Pick<React.ComponentProps<typeof Button>, 'size' | 'variant'>) {
	return (
		<QuestionnairePrimitive.Previous
			data-slot="questionnaire-previous"
			data-size={size}
			data-variant={variant}
			className={cn(
				buttonVariants({ size, variant }),
				'col-start-1 row-start-1 min-h-11 justify-self-start sm:min-h-0',
				className
			)}
			{...props}
		>
			{children ?? 'Previous'}
		</QuestionnairePrimitive.Previous>
	);
}

function QuestionnaireSkip({
	children,
	className,
	size = 'default',
	variant = 'outline',
	...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Skip> & {
	/** Replaces the default <button> with your own element, or a function `(props, state) => element` that receives the props to spread onto it. Use to render the button as a different element, for example a link. */
	render?: React.ComponentProps<typeof QuestionnairePrimitive.Skip>['render'];
} & Pick<React.ComponentProps<typeof Button>, 'size' | 'variant'>) {
	return (
		<QuestionnairePrimitive.Skip
			data-slot="questionnaire-skip"
			data-size={size}
			data-variant={variant}
			className={cn(
				buttonVariants({ size, variant }),
				'col-start-2 row-start-1 min-h-11 justify-self-end sm:min-h-0',
				className
			)}
			{...props}
		>
			{children ?? 'Skip'}
		</QuestionnairePrimitive.Skip>
	);
}

function QuestionnaireNext({
	children,
	className,
	size = 'default',
	variant = 'default',
	...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Next> & {
	/** Replaces the default <button> with your own element, or a function `(props, state) => element` that receives the props to spread onto it. Use to render the button as a different element, for example a link. */
	render?: React.ComponentProps<typeof QuestionnairePrimitive.Next>['render'];
} & Pick<React.ComponentProps<typeof Button>, 'size' | 'variant'>) {
	return (
		<QuestionnairePrimitive.Next
			data-slot="questionnaire-next"
			data-size={size}
			data-variant={variant}
			className={cn(
				buttonVariants({ size, variant }),
				'col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0',
				className
			)}
			{...props}
		>
			{children ?? 'Next'}
		</QuestionnairePrimitive.Next>
	);
}

function QuestionnaireSubmit({
	children,
	className,
	size = 'default',
	variant = 'default',
	...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Submit> & {
	/** Replaces the default <button> with your own element, or a function `(props, state) => element` that receives the props to spread onto it. Use to render the button as a different element, for example a link. */
	render?: React.ComponentProps<typeof QuestionnairePrimitive.Submit>['render'];
} & Pick<React.ComponentProps<typeof Button>, 'size' | 'variant'>) {
	return (
		<QuestionnairePrimitive.Submit
			data-slot="questionnaire-submit"
			data-size={size}
			data-variant={variant}
			className={cn(
				buttonVariants({ size, variant }),
				'col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0',
				className
			)}
			{...props}
		>
			{children ?? 'Submit'}
		</QuestionnairePrimitive.Submit>
	);
}

export {
	Questionnaire,
	QuestionnaireActions,
	QuestionnaireChoice,
	QuestionnaireChoiceDescription,
	QuestionnaireChoices,
	QuestionnaireDescription,
	QuestionnaireError,
	QuestionnaireInput,
	QuestionnaireItem,
	QuestionnaireNext,
	QuestionnairePrevious,
	QuestionnaireProgress,
	QuestionnaireSkip,
	QuestionnaireSubmit,
	QuestionnaireTitle,
};
