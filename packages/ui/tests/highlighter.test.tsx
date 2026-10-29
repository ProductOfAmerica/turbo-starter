import { highlightCode, loadHighlighter } from '@repo/ui/lib/highlighter';
import { expect, test } from 'vitest';

// Grammars that embed others (html embeds javascript and css) preload them, so the embedded ones
// come first to take the loader's own import path.
const languages = [
	'javascript',
	'css',
	'bash',
	'diff',
	'html',
	'json',
	'jsx',
	'markdown',
	'python',
	'sql',
	'tsx',
	'typescript',
	'yaml',
];

const aliases = ['js', 'md', 'py', 'sh', 'shell', 'shellscript', 'ts', 'yml', 'zsh'];

// Loading every grammar also catches a language entry whose import path is wrong.
test.each([...languages, ...aliases])('loads the %s grammar and highlights one line', async (language) => {
	const lines = await highlightCode('x', language);

	expect(lines).toHaveLength(1);
});

test('matches language names case-insensitively', async () => {
	expect(await highlightCode('const a = 1;', 'TypeScript')).toHaveLength(1);
});

test('returns null for a language that is not listed', async () => {
	expect(await loadHighlighter('cobol')).toBeNull();
	expect(await highlightCode('x', 'cobol')).toBeNull();
});

test('tokenizes ANSI input one line at a time', async () => {
	const highlighter = await loadHighlighter('ansi');
	const result = highlighter?.highlight('\u001b[31mred\u001b[0m\nplain');

	expect(result?.lines).toHaveLength(2);
});

test('continues from the grammar state of earlier lines', async () => {
	const highlighter = await loadHighlighter('typescript');
	const first = highlighter?.highlight('/* open');
	const second = highlighter?.highlight('still a comment */', first?.state);

	expect(second?.lines).toHaveLength(1);
});
