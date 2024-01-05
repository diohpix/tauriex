import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebglAddon } from 'xterm-addon-webgl';
import { createEventDispatcher } from 'svelte';

class Xterm {
	term: Terminal;
	fitAddon: FitAddon;
	callback: Function;
	titleChange: Function;
	id: string = '';
	constructor(id: string, element: HTMLElement, callback: Function, callback2: Function) {
		this.term = new Terminal({});
		this.fitAddon = new FitAddon();
		this.callback = callback;
		this.titleChange = callback2;
		this.id = id;
		this.mount(element);
	}
	setMessage(id: string) {
		this.term.write(id);
	}
	mount(element: HTMLElement) {
		let _composingStart = false;
		let _fromOndata = false;

		this.term.loadAddon(this.fitAddon);
		this.term.loadAddon(new WebglAddon());
		this.term.options = {
			fontSize: 12,
			logLevel: 'debug',
			windowsMode: false,
			windowOptions: { popTitle: true, pushTitle: true, getWinTitle: true, getIconTitle: true }
		};
		this.term.open(element);
		this.term.focus();
		this.fitAddon.fit();
		/*const resizeObserver = new ResizeObserver(entries => {
			//if (autoResize) {
			  this.fitAddon.fit();
			//}
		  });
		  resizeObserver.observe(element);*/
		this.term.element?.addEventListener('input', (e: Event) => {
			if (e instanceof InputEvent) {
				const key = e.data;
				const inputType = e.inputType;
				if (key !== null) {
					const keyCode = key.charCodeAt(0);
					console.log(inputType, 'key ', key, 'start', _composingStart, keyCode);
					if ((keyCode < 12593 || keyCode > 12643) && (keyCode < 44032 || keyCode > 55203)) {
						return;
					}
					if (inputType === 'insertText') {
						if (_composingStart) {
							this.invoke('\u001b[C' + key + '\u001b[D');
						} else {
							this.invoke(key + '\u001b[D');
						}
						_composingStart = true;
					} else {
						if (inputType !== 'insertFromPaste') {
							this.invoke('\u001b[3~' + key + '\u001b[D');
						}
					}
					_fromOndata = true;
				}
			}
			return true;
		});
		this.term.element?.addEventListener('keydown', (e: KeyboardEvent) => {
			console.log(this.term.buffer);
			const key = e.key;
			console.log('down', key, 'compStart', _composingStart);
			if (_fromOndata) {
				_fromOndata = false;
			} else {
				if (!e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
					this.invoke(key);
				}
			}
			return true;
		});
		this.term.onData((data: any) => {
			_fromOndata = true;
			const keyCode = data.charCodeAt(0);
			console.log('ondata ', data, 'compStart', _composingStart, keyCode);
			if ((keyCode < 12593 || keyCode > 12643) && (keyCode < 44032 || keyCode > 55203)) {
				if (_composingStart) {
					this.invoke('\u001b[C' + data);
				} else {
					this.invoke(data);
				}
				_composingStart = false;
			}
		});
		this.term.onResize((evt: any) => {
			this.resize(evt);
		});

		this.term.onTitleChange((e) => {
			this.titleChange(e);
		});
	}
	invoke(msg: Object) {
		var obj = { id: this.id, data: msg };
		this.callback('write_pty', obj);
	}
	resize(evt: any) {
		var obj = {
			id: this.id,
			size: { rows: evt.rows, cols: evt.cols, pixel_width: 0, pixel_height: 0 }
		};
		this.callback('resize_pty', obj);
	}
}
export { Xterm };
