interface CookieStoreSetOptions {
	name: string;
	value: string;
	path?: string;
	expires?: number | string | Date;
	maxAge?: number;
	domain?: string;
	secure?: boolean;
	sameSite?: 'Strict' | 'Lax' | 'None';
}

interface CookieStore {
	get(name: string): Promise<{ name: string; value: string } | undefined>;
	set(options: CookieStoreSetOptions): Promise<void>;
	delete(name: string): Promise<void>;
}

interface Window {
	cookieStore?: CookieStore;
}
