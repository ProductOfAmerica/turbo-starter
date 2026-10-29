import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxCollection,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxInput,
	ComboboxItem,
	ComboboxLabel,
	ComboboxList,
	ComboboxSeparator,
	ComboboxValue,
	useComboboxAnchor,
} from '@repo/ui/components/combobox';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen } from 'storybook/test';

const frameworks = ['Next.js', 'SvelteKit', 'Nuxt', 'Remix', 'Astro'];

/**
 * A searchable picker: typing filters the list. Pass the options as `items`, render ComboboxInput
 * (give it an `aria-label` or a Label), and inside ComboboxContent render ComboboxList (it needs an `aria-label`)
 * with a function child that returns a ComboboxItem per item, plus ComboboxEmpty for no matches. Set
 * `multiple` and use ComboboxChips for multi-select. For grouped options, pass `items` as groups
 * (`{ value, items }`) and render a ComboboxGroup with a ComboboxLabel and a ComboboxCollection per group. Built on Base UI Combobox, so it takes Base UI's
 * root props: `value`/`defaultValue`, `onValueChange`, `multiple`, `autoHighlight`.
 *
 * @summary Searchable single or multi-select (Base UI), with chips for multiple values
 */
const meta = {
	component: Combobox,
	subcomponents: {
		ComboboxInput,
		ComboboxContent,
		ComboboxList,
		ComboboxItem,
		ComboboxEmpty,
		ComboboxChips,
		ComboboxChip,
		ComboboxChipsInput,
		ComboboxValue,
		ComboboxGroup,
		ComboboxLabel,
		ComboboxCollection,
		ComboboxSeparator,
	},
	args: { items: frameworks },
	render: (args) => (
		<Combobox {...args}>
			<ComboboxInput aria-label="Framework" placeholder="Search frameworks" />
			<ComboboxContent>
				<ComboboxEmpty>No framework found.</ComboboxEmpty>
				<ComboboxList aria-label="Frameworks">
					{(item: string) => (
						<ComboboxItem key={item} value={item}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	),
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Typing narrows the list; picking an option fills the input. */
export const Default: Story = {
	play: async ({ canvas, userEvent }) => {
		const input = canvas.getByRole('combobox', { name: 'Framework' });
		await userEvent.type(input, 'sv');
		await userEvent.click(await screen.findByRole('option', { name: 'SvelteKit' }));
		await expect(input).toHaveValue('SvelteKit');
	},
};

/** No match shows the ComboboxEmpty message. */
export const NoResults: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.type(canvas.getByRole('combobox', { name: 'Framework' }), 'zzz');
		await expect(await screen.findByText('No framework found.')).toBeVisible();
	},
};

function MultipleFrameworks() {
	const anchor = useComboboxAnchor();
	return (
		<Combobox multiple autoHighlight items={frameworks} defaultValue={['Next.js']}>
			<ComboboxChips ref={anchor} className="w-80">
				<ComboboxValue>
					{(values: string[]) => (
						<>
							{values.map((value) => (
								<ComboboxChip key={value}>{value}</ComboboxChip>
							))}
							<ComboboxChipsInput aria-label="Frameworks" placeholder="Add framework" />
						</>
					)}
				</ComboboxValue>
			</ComboboxChips>
			<ComboboxContent anchor={anchor}>
				<ComboboxEmpty>No framework found.</ComboboxEmpty>
				<ComboboxList aria-label="Frameworks">
					{(item: string) => (
						<ComboboxItem key={item} value={item}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}

/**
 * `multiple` with ComboboxChips: each value becomes a removable chip. Anchor the popup to the chips
 * with `useComboboxAnchor()`, passing the ref to ComboboxChips and `anchor` to ComboboxContent.
 */
export const Multiple: Story = {
	render: () => <MultipleFrameworks />,
	play: async ({ canvas, userEvent }) => {
		await userEvent.type(canvas.getByRole('combobox', { name: 'Frameworks' }), 'astro');
		await userEvent.click(await screen.findByRole('option', { name: 'Astro' }));
		await expect(canvas.getByText('Astro')).toBeVisible();
		await expect(canvas.getByText('Next.js')).toBeVisible();
	},
};

const groupedFrameworks = [
	{ value: 'React', items: ['Next.js', 'Remix'] },
	{ value: 'Other', items: ['SvelteKit', 'Nuxt', 'Astro'] },
];

/**
 * Grouped options: `items` is a list of `{ value, items }` groups. The list renders each group in a
 * ComboboxGroup with a ComboboxLabel and a ComboboxCollection of its items, and ComboboxSeparator
 * divides the groups.
 *
 * @summary `items` as `{ value, items }` groups, each with a label, divided by separators
 */
export const Grouped: Story = {
	args: { items: groupedFrameworks },
	render: (args) => (
		<Combobox {...args}>
			<ComboboxInput aria-label="Framework" placeholder="Search frameworks" />
			<ComboboxContent>
				<ComboboxEmpty>No framework found.</ComboboxEmpty>
				<ComboboxList aria-label="Frameworks">
					{(group: (typeof groupedFrameworks)[number]) => (
						<ComboboxGroup key={group.value} items={group.items}>
							<ComboboxLabel>{group.value}</ComboboxLabel>
							<ComboboxCollection>
								{(item: string) => (
									<ComboboxItem key={item} value={item}>
										{item}
									</ComboboxItem>
								)}
							</ComboboxCollection>
							<ComboboxSeparator />
						</ComboboxGroup>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('combobox', { name: 'Framework' }));
		await expect(await screen.findByText('React')).toBeVisible();
		await expect(screen.getByText('Other')).toBeVisible();
		await userEvent.click(await screen.findByRole('option', { name: 'Nuxt' }));
		await expect(canvas.getByRole('combobox', { name: 'Framework' })).toHaveValue('Nuxt');
	},
};

/**
 * `showClear` on ComboboxInput adds a clear button, shown while a value is selected, that empties the
 * input and the selection.
 *
 * @summary `showClear` on ComboboxInput adds a button that clears the selection
 */
export const Clearable: Story = {
	args: { defaultValue: 'Astro' },
	render: (args) => (
		<Combobox {...args}>
			<ComboboxInput aria-label="Framework" placeholder="Search frameworks" showClear />
			<ComboboxContent>
				<ComboboxEmpty>No framework found.</ComboboxEmpty>
				<ComboboxList aria-label="Frameworks">
					{(item: string) => (
						<ComboboxItem key={item} value={item}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const input = canvas.getByRole('combobox', { name: 'Framework' });
		await expect(input).toHaveValue('Astro');
		// The CLI-written clear button is icon-only with no accessible name, so query it by slot.
		const clear = canvasElement.querySelector('[data-slot="combobox-clear"]');
		await userEvent.click(clear as HTMLElement);
		await expect(input).toHaveValue('');
	},
};
