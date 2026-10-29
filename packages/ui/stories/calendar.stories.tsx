import { Calendar } from '@repo/ui/components/calendar';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { expect } from 'storybook/test';

// Fixed dates keep the stories identical whenever they run.
const JANUARY = new Date(2026, 0, 1);
const TODAY = new Date(2026, 0, 14);

/**
 * A month grid for picking a date or a date range (react-day-picker 10). Set `mode` to `single`,
 * `multiple` or `range`, and control the value with `selected` and `onSelect`. `captionLayout` is
 * `label` (default) or `dropdown` (month and year selects, bounded by `startMonth`/`endMonth`).
 * `buttonVariant` styles the arrows; `showOutsideDays` is on by default. Takes every DayPicker prop.
 *
 * @summary Date or date-range picker grid (react-day-picker)
 */
const meta = {
	component: Calendar,
	args: { defaultMonth: JANUARY, today: TODAY, className: 'rounded-md border' },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

function SingleDate() {
	const [date, setDate] = useState<Date | undefined>(new Date(2026, 0, 20));
	return (
		<Calendar
			mode="single"
			selected={date}
			onSelect={setDate}
			defaultMonth={JANUARY}
			today={TODAY}
			className="rounded-md border"
		/>
	);
}

/** One date. Clicking a day selects it. */
export const Single: Story = {
	render: () => <SingleDate />,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: /January 22, 2026/ }));
		await expect(canvas.getByRole('button', { name: /January 22, 2026, selected/ })).toHaveAttribute(
			'data-selected-single',
			'true'
		);
	},
};

function DateRangePicker() {
	const [range, setRange] = useState<DateRange | undefined>({
		from: new Date(2026, 0, 12),
		to: new Date(2026, 0, 16),
	});
	return (
		<Calendar
			mode="range"
			selected={range}
			onSelect={setRange}
			numberOfMonths={2}
			defaultMonth={JANUARY}
			today={TODAY}
			className="rounded-md border"
		/>
	);
}

/** A range across two months, such as a booking. */
export const Range: Story = {
	render: () => <DateRangePicker />,
};

/** Month and year dropdowns for jumping far, such as a birth date. */
export const DropdownCaption: Story = {
	args: { captionLayout: 'dropdown', startMonth: new Date(1950, 0), endMonth: new Date(2030, 11) },
};

/** Navigating with the arrow buttons changes the month. */
export const MonthNavigation: Story = {
	tags: ['!manifest'],
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: /next month/i }));
		await expect(canvas.getByText('February 2026')).toBeVisible();
	},
};

/** `showWeekNumber` adds a leading column with the week of the year. */
export const WeekNumbers: Story = {
	args: { mode: 'single', showWeekNumber: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('rowheader', { name: 'Week 1' })).toBeVisible();
	},
};
