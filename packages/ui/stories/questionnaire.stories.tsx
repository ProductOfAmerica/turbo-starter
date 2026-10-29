import {
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
} from '@repo/ui/components/questionnaire';
import type { Meta, StoryObj } from '@storybook/react';
import type { FormEvent } from 'react';
import { expect, fn } from 'storybook/test';

const questions = [
	{
		name: 'framework',
		required: true,
		multiple: false,
		prompt: 'Which framework does the app use?',
		description: 'Pick one.',
		choices: [
			{ value: 'next', label: 'Next.js', description: 'The App Router, in apps/web.' },
			{ value: 'vite', label: 'Vite', description: 'A single-page app.' },
		],
	},
	{
		name: 'extras',
		required: false,
		multiple: true,
		prompt: 'What else should it include?',
		description: 'Pick any, or skip this question.',
		choices: [
			{ value: 'storybook', label: 'Storybook', description: 'Stories and story tests.' },
			{ value: 'docker', label: 'Docker', description: 'A production image.' },
		],
	},
];

/**
 * A short form that asks one question at a time, as an assistant does before it starts work.
 * Questionnaire is a `<form>`: pass the question list as `items` and handle `onSubmit` (read the
 * answers with FormData, and call `preventDefault()` to stay on the page). For each question,
 * QuestionnaireItem (a fieldset; `name`, `required`, `multiple` for checkboxes) holds
 * QuestionnaireTitle, QuestionnaireDescription, QuestionnaireChoices of QuestionnaireChoice
 * (`value`; QuestionnaireChoiceDescription adds a second line), an optional QuestionnaireInput for
 * a free answer, and QuestionnaireError. QuestionnaireProgress shows the position, and
 * QuestionnaireActions lays out QuestionnairePrevious, QuestionnaireSkip, QuestionnaireNext and
 * QuestionnaireSubmit, which show themselves only when they apply. `shortcuts` (`letters` or
 * `numbers`) adds key shortcuts for the choices. Built on `@shadcn/react/questionnaire`.
 *
 * @summary One-question-at-a-time form with choices, validation and navigation
 */
const meta = {
	component: Questionnaire,
	subcomponents: {
		QuestionnaireProgress,
		QuestionnaireItem,
		QuestionnaireTitle,
		QuestionnaireDescription,
		QuestionnaireChoices,
		QuestionnaireChoice,
		QuestionnaireChoiceDescription,
		QuestionnaireInput,
		QuestionnaireError,
		QuestionnaireActions,
		QuestionnairePrevious,
		QuestionnaireSkip,
		QuestionnaireNext,
		QuestionnaireSubmit,
	},
	render: (args) => (
		<Questionnaire {...args} items={questions} className="w-96">
			<QuestionnaireProgress />
			{questions.map((question) => (
				<QuestionnaireItem
					key={question.name}
					name={question.name}
					required={question.required}
					multiple={question.multiple}
				>
					<QuestionnaireTitle>{question.prompt}</QuestionnaireTitle>
					<QuestionnaireDescription>{question.description}</QuestionnaireDescription>
					<QuestionnaireChoices>
						{question.choices.map((choice) => (
							<QuestionnaireChoice key={choice.value} value={choice.value}>
								{choice.label}
								<QuestionnaireChoiceDescription>{choice.description}</QuestionnaireChoiceDescription>
							</QuestionnaireChoice>
						))}
					</QuestionnaireChoices>
					<QuestionnaireError />
				</QuestionnaireItem>
			))}
			<QuestionnaireActions>
				<QuestionnairePrevious />
				<QuestionnaireSkip />
				<QuestionnaireNext />
				<QuestionnaireSubmit />
			</QuestionnaireActions>
		</Questionnaire>
	),
} satisfies Meta<typeof Questionnaire>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A required question blocks Next until it's answered; the last question submits the form.
 */
export const Default: Story = {
	args: { onSubmit: fn((event: FormEvent<HTMLFormElement>) => event.preventDefault()) },
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
		await expect(await canvas.findByText('Choose an answer to continue.')).toBeVisible();
		await userEvent.click(canvas.getByRole('radio', { name: /Next\.js/ }));
		await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
		await expect(await canvas.findByRole('group', { name: 'What else should it include?' })).toBeVisible();
		await userEvent.click(canvas.getByRole('checkbox', { name: /Docker/ }));
		await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
		await expect(args.onSubmit).toHaveBeenCalledOnce();
	},
};

/** `shortcuts="numbers"` labels each choice with a number key that selects it. */
export const Shortcuts: Story = {
	args: { shortcuts: 'numbers' },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('radio', { name: /Next\.js/ }));
		await userEvent.keyboard('2');
		await expect(canvas.getByRole('radio', { name: /Vite/ })).toBeChecked();
	},
};

/** QuestionnaireInput takes a free-text answer, here as an alternative to the listed choices. */
export const FreeText: Story = {
	args: { items: [{ name: 'other', required: true }] },
	render: (args) => (
		<Questionnaire {...args} className="w-96">
			<QuestionnaireItem name="other" required>
				<QuestionnaireTitle>What should we build?</QuestionnaireTitle>
				<QuestionnaireInput aria-label="Your answer" placeholder="Describe it" />
				<QuestionnaireError />
			</QuestionnaireItem>
			<QuestionnaireActions>
				<QuestionnaireSubmit />
			</QuestionnaireActions>
		</Questionnaire>
	),
	play: async ({ canvas, userEvent }) => {
		await userEvent.type(canvas.getByRole('textbox', { name: 'Your answer' }), 'A dashboard');
		await expect(canvas.getByRole('textbox', { name: 'Your answer' })).toHaveValue('A dashboard');
	},
};
