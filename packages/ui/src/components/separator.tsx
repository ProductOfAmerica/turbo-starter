'use client';

import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@repo/ui/lib/utils';
import * as React from 'react';

const Separator = React.forwardRef<
	React.ElementRef<typeof SeparatorPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
	<SeparatorPrimitive.Root
		ref={ref}
		decorative={decorative}
		orientation={orientation}
		className={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
		{...props}
	/>
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
