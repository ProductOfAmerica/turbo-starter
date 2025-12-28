'use client';
import { track } from '@vercel/analytics';
import { useEffect } from 'react';
import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
	// Send to Vercel Analytics
	track('Web Vital', {
		name: metric.name,
		value: metric.value,
		id: metric.id,
		rating: metric.rating,
	});

	// Log to console in development only
	if (process.env.NODE_ENV === 'development') {
		console.log('Web Vital:', metric);
	}
}

function reportWebVitals() {
	onCLS(sendToAnalytics);
	onINP(sendToAnalytics);
	onFCP(sendToAnalytics);
	onLCP(sendToAnalytics);
	onTTFB(sendToAnalytics);
}

export function WebVitals() {
	useEffect(() => {
		reportWebVitals();
	}, []);

	return null;
}
