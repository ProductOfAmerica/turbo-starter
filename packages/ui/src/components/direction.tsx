'use client';

import { Direction } from 'radix-ui';
import type * as React from 'react';

function DirectionProvider({
	dir,
	direction,
	children,
}: React.ComponentProps<typeof Direction.DirectionProvider> & {
	/** Reading direction ('ltr' or 'rtl') for Radix components inside the provider. Alias for `dir`; takes precedence when both are set. */
	direction?: React.ComponentProps<typeof Direction.DirectionProvider>['dir'];
}) {
	return <Direction.DirectionProvider dir={direction ?? dir}>{children}</Direction.DirectionProvider>;
}

const useDirection = Direction.useDirection;

export { DirectionProvider, useDirection };
