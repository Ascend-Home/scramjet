const { ScramjetController } = $scramjetLoadController();

const scramjet = new ScramjetController({
	files: {
		wasm: "/scram/scramjet.wasm.wasm",
		all: "/scram/scramjet.all.js",
		sync: "/scram/scramjet.sync.js",
	},
	flags: {
		rewriterLogs: false,
		scramitize: false,
		cleanErrors: true,
		sourcemaps: true,
	},
});

scramjet.init();
navigator.serviceWorker.register("./sw.js");

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
const flex = css`display: flex;`;
const col  = css`flex-direction: column;`;

connection.setTransport(store.transport, [{ wisp: store.wispurl }]);

function Config() {
	this.css = `
		transition: opacity 0.4s ease;
		:modal[open] { animation: fade 0.4s ease normal; }
		:modal::backdrop { backdrop-filter: blur(3px); }

		.buttons { gap: 0.5em; }
		.buttons button {
			border: 1px solid #f5c400;
			background-color: #111;
			border-radius: 0.75em;
			color: #f5c400;
			padding: 0.45em 0.75em;
			cursor: pointer;
			font-family: "Inter", sans-serif;
			transition: background 0.15s, color 0.15s;
		}
		.buttons button:hover {
			background-color: #f5c400;
			color: #080808;
		}
		.input_row input {
			background-color: #111;
			border: 1.5px solid #333;
			border-radius: 0.75em;
			color: #fff;
			outline: none;
			padding: 0.5em 0.75em;
			font-family: "Inter", sans-serif;
			transition: border-color 0.2s;
		}
		.input_row input:focus { border-color: #f5c400; }
		.input_row { margin-bottom: 0.5em; margin-top: 0.5em; }
		.input_row input { flex-grow: 1; }
		.centered { justify-content: center; align-items: center; }
		label { color: rgba(255,255,255,0.5); font-size: 0.75rem; margin-bottom: 4px; }
	`;

	function handleModalClose(modal) {
		modal.style.opacity = 0;
		setTimeout(() => { modal.close(); modal.style.opacity = 1; }, 250);
	}

	return html`
		<dialog class="cfg" style="background-color:#0e0e0e; color:white; border-radius:12px; border:1px solid #f5c40033; padding:1.5em; min-width:320px;">
			<div style="margin-bottom:1em;">
				<div class=${[flex, "buttons"]}>
					<button on:click=${() => {
						connection.setTransport("/baremod/index.mjs", [store.bareurl]);
						store.transport = "/baremod/index.mjs";
					}}>bare server 3</button>
					<button on:click=${() => {
						connection.setTransport("/libcurl/index.mjs", [{ wisp: store.wispurl }]);
						store.transport = "/libcurl/index.mjs";
					}}>libcurl.js</button>
					<button on:click=${() => {
						connection.setTransport("/epoxy/index.mjs", [{ wisp: store.wispurl }]);
						store.transport = "/epoxy/index.mjs";
					}}>epoxy</button>
				</div>
			</div>
			<div class=${[flex, col, "input_row"]}>
				<label for="wisp_url_input">Wisp URL</label>
				<input id="wisp_url_input" bind:value=${use(store.wispurl)} spellcheck="false" />
			</div>
			<div class=${[flex, col, "input_row"]}>
				<label for="bare_url_input">Bare URL</label>
				<input id="bare_url_input" bind:value=${use(store.bareurl)} spellcheck="false" />
			</div>
			<div style="font-size:0.75rem; color:#f5c40088; margin:0.5em 0;">${use(store.transport)}</div>
			<div class=${[flex, "buttons", "centered"]} style="margin-top:1em;">
				<button on:click=${() => handleModalClose(this.root)}>close</button>
			</div>
		</dialog>
	`;
}

function HomeScreen({ onNavigate }) {
	this.css = `
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #080808;
		position: relative;
		overflow: hidden;

		.bg-grid {
			position: absolute;
			inset: 0;
			background-image: radial-gradient(circle, rgba(245,196,0,0.07) 1px, transparent 1px);
			background-size: 32px 32px;
			pointer-events: none;
		}

		.bolt {
			font-size: 56px;
			line-height: 1;
			margin-bottom: 6px;
		}

		h1 {
			font-family: "Bebas Neue", sans-serif;
			font-size: 72px;
			letter-spacing: 7px;
			color: #f5c400;
			margin: 0;
			line-height: 1;
		}

		.tagline {
			font-size: 11px;
			color: rgba(255,255,255,0.35);
			letter-spacing: 3.5px;
			text-transform: uppercase;
			margin-top: 8px;
			margin-bottom: 36px;
		}

		.search-wrap {
			position: relative;
			width: 480px;
			max-width: 90vw;
		}
		.search-icon {
			position: absolute;
			left: 18px;
			top: 50%;
			transform: translateY(-50%);
			font-size: 15px;
			opacity: 0.55;
			pointer-events: none;
		}
		input.search-bar {
			width: 100%;
			background: #111;
			font-family: "Inter", sans-serif;
			font-size: 15px;
			padding: 16px 20px 16px 46px;
			border: 1.5px solid rgba(245,196,0,0.2);
			color: #fff;
			border-radius: 12px;
			outline: none;
			box-sizing: border-box;
			transition: border-color 0.2s, box-shadow 0.2s;
		}
		input.search-bar::placeholder { color: rgba(255,255,255,0.3); }
		input.search-bar:focus {
			border-color: #f5c400;
		}

		footer {
			position: absolute;
			bottom: 0; left: 0; right: 0;
			padding: 16px 24px;
			border-top: 1px solid rgba(245,196,0,0.08);
			display: flex;
			justify-content: space-between;
			align-items: center;
			flex-wrap: wrap;
			gap: 8px;
		}
		footer a {
			color: rgba(255,255,255,0.3);
			text-decoration: none;
			font-size: 12px;
			padding: 4px 10px;
			transition: color 0.15s;
		}
		footer a:hover { color: #f5c400; }
		footer span { color: rgba(255,255,255,0.2); font-size: 12px; }
	`;

	this.query = "";

	const handleGo = () => {
		let val = this.query.trim();
		if (!val) return;
		if (!val.startsWith("http")) val = "https://" + val;
		onNavigate(val);
	};

	return html`
		<div>
			<div class="bg-grid"></div>
			<div class="bolt">⚡</div>
			<h1>SURGE HUB</h1>
			<p class="tagline">Your gateway to the free web</p>
			<div class="search-wrap">
				<span class="search-icon">⚡</span>
				<input
					class="search-bar"
					autocomplete="off"
					autocapitalize="off"
					autocorrect="off"
					placeholder="Search or enter a URL..."
					bind:value=${use(this.query)}
					on:keyup=${(e) => e.keyCode === 13 && handleGo()}
				/>
			</div>
			<footer>
				<div style="display:flex;gap:4px;flex-wrap:wrap;">
					<a href="https://github.com/titaniumnetwork-dev" target="_blank">TitaniumNetwork</a>
					<a href="https://discord.gg/unblock" target="_blank">Discord</a>
					<a href="https://github.com/MercuryWorkshop/scramjet" target="_blank">GitHub</a>
				</div>
				<span>⚡ Surge Hub</span>
			</footer>
		</div>
	`;
}

function BrowserApp() {
	this.css = `
		width: 100%;
		height: 100%;
		color: #fff;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;

		iframe {
			background-color: #fff;
			border: none;
			flex: 1;
			width: 100%;
		}

		.nav {
			display: flex;
			align-items: center;
			gap: 6px;
			padding: 6px 8px;
			background: #0e0e0e;
			border-bottom: 1px solid #1a1a1a;
		}

		.nav button {
			color: #fff;
			outline: none;
			border: 1px solid #2a2a2a;
			border-radius: 6px;
			background-color: #151515;
			padding: 4px 10px;
			font-family: "Inter", sans-serif;
			font-size: 13px;
			cursor: pointer;
			transition: border-color 0.15s, color 0.15s;
			white-space: nowrap;
		}
		.nav button:hover {
			border-color: #f5c400;
			color: #f5c400;
		}

		input.bar {
			font-family: "Inter", sans-serif;
			font-size: 13px;
			padding: 5px 10px;
			border: 1px solid #2a2a2a;
			outline: none;
			color: #fff;
			border-radius: 6px;
			flex: 1;
			background-color: #111;
			transition: border-color 0.2s;
		}
		input.bar:focus { border-color: #f5c400; }

		.version {
			font-size: 11px;
			color: rgba(255,255,255,0.3);
			white-space: nowrap;
		}
		.version a { color: rgba(245,196,0,0.6); text-decoration: none; }
		.version a:hover { color: #f5c400; }
		.logo-btn {
			font-family: "Bebas Neue", sans-serif;
			font-size: 18px;
			letter-spacing: 2px;
			color: #f5c400 !important;
			border-color: rgba(245,196,0,0.3) !important;
		}
		.logo-btn:hover {
			background: rgba(245,196,0,0.1) !important;
		}
	`;

	this.url = store.url;
	this.showHome = true;

	const frame = scramjet.createFrame();

	const navigateTo = (url) => {
		this.url = url;
		this.showHome = false;
		store.url = url;
		frame.go(url);
	};

	frame.addEventListener("urlchange", (e) => {
		if (!e.url) return;
		this.url = e.url;
		store.url = e.url;
	});

	const handleSubmit = () => {
		let val = this.url.trim();
		if (!val) return;
		if (!val.startsWith("http")) val = "https://" + val;
		this.url = val;
		this.showHome = false;
		store.url = val;
		frame.go(val);
	};

	const cfg = h(Config);
	document.body.appendChild(cfg);

	this.githubURL = `https://github.com/MercuryWorkshop/scramjet/commit/${$scramjetVersion.build}`;

	return html`
		<div>
			<div class="nav">
				<button class="logo-btn" on:click=${() => { this.showHome = true; }}>⚡ SURGE</button>
				<button on:click=${() => cfg.showModal()}>config</button>
				<button on:click=${() => frame.back()}>&#8592;</button>
				<button on:click=${() => frame.forward()}>&#8594;</button>
				<button on:click=${() => frame.reload()}>&#x21bb;</button>
				<input
					class="bar"
					autocomplete="off"
					autocapitalize="off"
					autocorrect="off"
					bind:value=${use(this.url)}
					on:input=${(e) => { this.url = e.target.value; }}
					on:keyup=${(e) => e.keyCode === 13 && (store.url = this.url) && handleSubmit()}
				/>
				<button on:click=${() => window.open(scramjet.encodeUrl(this.url))}>open</button>
				<p class="version">
					<b>scramjet</b> ${$scramjetVersion.version}
					<a href=${use(this.githubURL)}>${$scramjetVersion.build}</a>
				</p>
			</div>

			${use(this.showHome, (show) => show
				? h(HomeScreen, { onNavigate: navigateTo })
				: frame.frame
			)}
		</div>
	`;
}

window.addEventListener("load", async () => {
	const root = document.getElementById("app");
	try {
		root.replaceWith(h(BrowserApp));
	} catch (e) {
		root.replaceWith(document.createTextNode("" + e));
		throw e;
	}
});const { ScramjetController } = $scramjetLoadController();

const scramjet = new ScramjetController({
	files: {
		wasm: "/scram/scramjet.wasm.wasm",
		all: "/scram/scramjet.all.js",
		sync: "/scram/scramjet.sync.js",
	},
	flags: {
		rewriterLogs: false,
		scramitize: false,
		cleanErrors: true,
		sourcemaps: true,
	},
});

scramjet.init();
navigator.serviceWorker.register("./sw.js");

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
const flex = css`display: flex;`;
const col  = css`flex-direction: column;`;

connection.setTransport(store.transport, [{ wisp: store.wispurl }]);

function Config() {
	this.css = `
		transition: opacity 0.4s ease;
		:modal[open] { animation: fade 0.4s ease normal; }
		:modal::backdrop { backdrop-filter: blur(3px); }

		.buttons { gap: 0.5em; }
		.buttons button {
			border: 1px solid #f5c400;
			background-color: #111;
			border-radius: 0.75em;
			color: #f5c400;
			padding: 0.45em 0.75em;
			cursor: pointer;
			font-family: "Inter", sans-serif;
			transition: background 0.15s, color 0.15s;
		}
		.buttons button:hover {
			background-color: #f5c400;
			color: #080808;
		}
		.input_row input {
			background-color: #111;
			border: 1.5px solid #333;
			border-radius: 0.75em;
			color: #fff;
			outline: none;
			padding: 0.5em 0.75em;
			font-family: "Inter", sans-serif;
			transition: border-color 0.2s;
		}
		.input_row input:focus { border-color: #f5c400; }
		.input_row { margin-bottom: 0.5em; margin-top: 0.5em; }
		.input_row input { flex-grow: 1; }
		.centered { justify-content: center; align-items: center; }
		label { color: rgba(255,255,255,0.5); font-size: 0.75rem; margin-bottom: 4px; }
	`;

	function handleModalClose(modal) {
		modal.style.opacity = 0;
		setTimeout(() => { modal.close(); modal.style.opacity = 1; }, 250);
	}

	return html`
		<dialog class="cfg" style="background-color:#0e0e0e; color:white; border-radius:12px; border:1px solid #f5c40033; padding:1.5em; min-width:320px;">
			<div style="margin-bottom:1em;">
				<div class=${[flex, "buttons"]}>
					<button on:click=${() => {
						connection.setTransport("/baremod/index.mjs", [store.bareurl]);
						store.transport = "/baremod/index.mjs";
					}}>bare server 3</button>
					<button on:click=${() => {
						connection.setTransport("/libcurl/index.mjs", [{ wisp: store.wispurl }]);
						store.transport = "/libcurl/index.mjs";
					}}>libcurl.js</button>
					<button on:click=${() => {
						connection.setTransport("/epoxy/index.mjs", [{ wisp: store.wispurl }]);
						store.transport = "/epoxy/index.mjs";
					}}>epoxy</button>
				</div>
			</div>
			<div class=${[flex, col, "input_row"]}>
				<label for="wisp_url_input">Wisp URL</label>
				<input id="wisp_url_input" bind:value=${use(store.wispurl)} spellcheck="false" />
			</div>
			<div class=${[flex, col, "input_row"]}>
				<label for="bare_url_input">Bare URL</label>
				<input id="bare_url_input" bind:value=${use(store.bareurl)} spellcheck="false" />
			</div>
			<div style="font-size:0.75rem; color:#f5c40088; margin:0.5em 0;">${use(store.transport)}</div>
			<div class=${[flex, "buttons", "centered"]} style="margin-top:1em;">
				<button on:click=${() => handleModalClose(this.root)}>close</button>
			</div>
		</dialog>
	`;
}

function HomeScreen({ onNavigate }) {
	this.css = `
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #080808;
		position: relative;
		overflow: hidden;

		.bg-grid {
			position: absolute;
			inset: 0;
			background-image: radial-gradient(circle, rgba(245,196,0,0.07) 1px, transparent 1px);
			background-size: 32px 32px;
			pointer-events: none;
		}

		.bolt {
			font-size: 56px;
			line-height: 1;
			margin-bottom: 6px;
		}

		h1 {
			font-family: "Bebas Neue", sans-serif;
			font-size: 72px;
			letter-spacing: 7px;
			color: #f5c400;
			margin: 0;
			line-height: 1;
		}

		.tagline {
			font-size: 11px;
			color: rgba(255,255,255,0.35);
			letter-spacing: 3.5px;
			text-transform: uppercase;
			margin-top: 8px;
			margin-bottom: 36px;
		}

		.search-wrap {
			position: relative;
			width: 480px;
			max-width: 90vw;
		}
		.search-icon {
			position: absolute;
			left: 18px;
			top: 50%;
			transform: translateY(-50%);
			font-size: 15px;
			opacity: 0.55;
			pointer-events: none;
		}
		input.search-bar {
			width: 100%;
			background: #111;
			font-family: "Inter", sans-serif;
			font-size: 15px;
			padding: 16px 20px 16px 46px;
			border: 1.5px solid rgba(245,196,0,0.2);
			color: #fff;
			border-radius: 12px;
			outline: none;
			box-sizing: border-box;
			transition: border-color 0.2s, box-shadow 0.2s;
		}
		input.search-bar::placeholder { color: rgba(255,255,255,0.3); }
		input.search-bar:focus {
			border-color: #f5c400;
		}

		footer {
			position: absolute;
			bottom: 0; left: 0; right: 0;
			padding: 16px 24px;
			border-top: 1px solid rgba(245,196,0,0.08);
			display: flex;
			justify-content: space-between;
			align-items: center;
			flex-wrap: wrap;
			gap: 8px;
		}
		footer a {
			color: rgba(255,255,255,0.3);
			text-decoration: none;
			font-size: 12px;
			padding: 4px 10px;
			transition: color 0.15s;
		}
		footer a:hover { color: #f5c400; }
		footer span { color: rgba(255,255,255,0.2); font-size: 12px; }
	`;

	this.query = "";

	const handleGo = () => {
		let val = this.query.trim();
		if (!val) return;
		if (!val.startsWith("http")) val = "https://" + val;
		onNavigate(val);
	};

	return html`
		<div>
			<div class="bg-grid"></div>
			<div class="bolt">⚡</div>
			<h1>SURGE HUB</h1>
			<p class="tagline">Your gateway to the free web</p>
			<div class="search-wrap">
				<span class="search-icon">⚡</span>
				<input
					class="search-bar"
					autocomplete="off"
					autocapitalize="off"
					autocorrect="off"
					placeholder="Search or enter a URL..."
					bind:value=${use(this.query)}
					on:keyup=${(e) => e.keyCode === 13 && handleGo()}
				/>
			</div>
			<footer>
				<div style="display:flex;gap:4px;flex-wrap:wrap;">
					<a href="https://github.com/titaniumnetwork-dev" target="_blank">TitaniumNetwork</a>
					<a href="https://discord.gg/unblock" target="_blank">Discord</a>
					<a href="https://github.com/MercuryWorkshop/scramjet" target="_blank">GitHub</a>
				</div>
				<span>⚡ Surge Hub</span>
			</footer>
		</div>
	`;
}

function BrowserApp() {
	this.css = `
		width: 100%;
		height: 100%;
		color: #fff;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;

		iframe {
			background-color: #fff;
			border: none;
			flex: 1;
			width: 100%;
		}

		.nav {
			display: flex;
			align-items: center;
			gap: 6px;
			padding: 6px 8px;
			background: #0e0e0e;
			border-bottom: 1px solid #1a1a1a;
		}

		.nav button {
			color: #fff;
			outline: none;
			border: 1px solid #2a2a2a;
			border-radius: 6px;
			background-color: #151515;
			padding: 4px 10px;
			font-family: "Inter", sans-serif;
			font-size: 13px;
			cursor: pointer;
			transition: border-color 0.15s, color 0.15s;
			white-space: nowrap;
		}
		.nav button:hover {
			border-color: #f5c400;
			color: #f5c400;
		}

		input.bar {
			font-family: "Inter", sans-serif;
			font-size: 13px;
			padding: 5px 10px;
			border: 1px solid #2a2a2a;
			outline: none;
			color: #fff;
			border-radius: 6px;
			flex: 1;
			background-color: #111;
			transition: border-color 0.2s;
		}
		input.bar:focus { border-color: #f5c400; }

		.version {
			font-size: 11px;
			color: rgba(255,255,255,0.3);
			white-space: nowrap;
		}
		.version a { color: rgba(245,196,0,0.6); text-decoration: none; }
		.version a:hover { color: #f5c400; }
		.logo-btn {
			font-family: "Bebas Neue", sans-serif;
			font-size: 18px;
			letter-spacing: 2px;
			color: #f5c400 !important;
			border-color: rgba(245,196,0,0.3) !important;
		}
		.logo-btn:hover {
			background: rgba(245,196,0,0.1) !important;
		}
	`;

	this.url = store.url;
	this.showHome = true;

	const frame = scramjet.createFrame();

	const navigateTo = (url) => {
		this.url = url;
		this.showHome = false;
		store.url = url;
		frame.go(url);
	};

	frame.addEventListener("urlchange", (e) => {
		if (!e.url) return;
		this.url = e.url;
		store.url = e.url;
	});

	const handleSubmit = () => {
		let val = this.url.trim();
		if (!val) return;
		if (!val.startsWith("http")) val = "https://" + val;
		this.url = val;
		this.showHome = false;
		store.url = val;
		frame.go(val);
	};

	const cfg = h(Config);
	document.body.appendChild(cfg);

	this.githubURL = `https://github.com/MercuryWorkshop/scramjet/commit/${$scramjetVersion.build}`;

	return html`
		<div>
			<div class="nav">
				<button class="logo-btn" on:click=${() => { this.showHome = true; }}>⚡ SURGE</button>
				<button on:click=${() => cfg.showModal()}>config</button>
				<button on:click=${() => frame.back()}>&#8592;</button>
				<button on:click=${() => frame.forward()}>&#8594;</button>
				<button on:click=${() => frame.reload()}>&#x21bb;</button>
				<input
					class="bar"
					autocomplete="off"
					autocapitalize="off"
					autocorrect="off"
					bind:value=${use(this.url)}
					on:input=${(e) => { this.url = e.target.value; }}
					on:keyup=${(e) => e.keyCode === 13 && (store.url = this.url) && handleSubmit()}
				/>
				<button on:click=${() => window.open(scramjet.encodeUrl(this.url))}>open</button>
				<p class="version">
					<b>scramjet</b> ${$scramjetVersion.version}
					<a href=${use(this.githubURL)}>${$scramjetVersion.build}</a>
				</p>
			</div>

			${use(this.showHome, (show) => show
				? h(HomeScreen, { onNavigate: navigateTo })
				: frame.frame
			)}
		</div>
	`;
}

window.addEventListener("load", async () => {
	const root = document.getElementById("app");
	try {
		root.replaceWith(h(BrowserApp));
	} catch (e) {
		root.replaceWith(document.createTextNode("" + e));
		throw e;
	}
});
