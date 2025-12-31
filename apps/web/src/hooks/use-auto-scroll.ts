'use client';

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAutoScrollReturn {
	scrollRef: React.RefObject<HTMLDivElement | null>;
	isAtBottom: boolean;
	newCount: number;
	scrollToBottom: () => void;
	handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export function useAutoScroll(itemCount: number): UseAutoScrollReturn {
	const [isAtBottom, setIsAtBottom] = useState(true);
	const [newCount, setNewCount] = useState(0);
	const scrollRef = useRef<HTMLDivElement>(null);
	const prevItemCountRef = useRef(itemCount);

	const scrollToBottom = useCallback(() => {
		if (!scrollRef.current) return;
		const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
		if (!scrollContainer) return;
		scrollContainer.scrollTop = scrollContainer.scrollHeight;
		setNewCount(0);
		setIsAtBottom(true);
	}, []);

	useEffect(() => {
		if (itemCount <= prevItemCountRef.current) {
			prevItemCountRef.current = itemCount;
			return;
		}
		const newItemsCount = itemCount - prevItemCountRef.current;
		prevItemCountRef.current = itemCount;

		if (isAtBottom) {
			setTimeout(scrollToBottom, 0);
		} else {
			setNewCount((prev) => prev + newItemsCount);
		}
	}, [itemCount, isAtBottom, scrollToBottom]);

	const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
		const target = e.target as HTMLDivElement;
		const isBottom = Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 10;
		setIsAtBottom(isBottom);
		if (isBottom) setNewCount(0);
	}, []);

	return { scrollRef, isAtBottom, newCount, scrollToBottom, handleScroll };
}
