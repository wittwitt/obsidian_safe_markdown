import { App, Editor, Menu, MarkdownView, Modal, Notice, Plugin, Setting, TFile, getLanguage } from 'obsidian';

import { GetRsaPriKeyPem } from 'key';
import { DecryptMarkdown } from 'encrypt';
import { EncryptAndFormat, GetEncryptedKeyBody } from 'format';

import i18n from './lang/i18n';
import { KeyGenSettingTab } from './setting'

export default class SafeMarkdownPlugin extends Plugin {
	async onload() {
		const language = getLanguage();
		// console.log(language);
		i18n.setLanguage(language);

		this.addSettingTab(new KeyGenSettingTab(this.app, this));

		this.addCommand({// 命令方式
			id: 'encrypt-selection',
			name: i18n.t('main.DecryptSelection'),
			editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {
				if (checking) {
					return editor.getSelection().length > 0; // Check if text is selected
				}
				// Execute when command is triggered
				console.log("Selected text:", editor.getSelection());

				this.encryptSelection(editor);
			}
		});

		this.addCommand({// 命令方式
			id: 'decrypt-selection',
			name: i18n.t('main.EncryptSelection'),
			editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {
				if (checking) {
					return editor.getSelection().length > 0; // Check if text is selected
				}
				this.decryptSelection(editor);
			}
		});

		this.registerEvent( // 文件右击菜单
			this.app.workspace.on('file-menu', (menu: Menu, file: TFile) => {
				if (file.extension === 'md') {
					menu.addItem((item) => {
						item
							.setTitle(i18n.t('main.EncryptFile'))
							.setIcon('lock')
							.onClick(async () => {
								await this.encryptFile(file);
							});
					});
					menu.addItem((item) => {
						item
							.setTitle(i18n.t('main.DecryptFile'))
							.setIcon('unlock')
							.onClick(async () => {
								await this.decryptFile(file);
							});
					});
				}
			})
		);

		this.registerEvent(// 上下文右击菜单
			this.app.workspace.on('editor-menu', (menu: Menu, editor: Editor, view: MarkdownView) => {
				if (editor.getSelection().length > 0) {
					menu.addItem((item) => {
						item
							.setTitle(i18n.t('main.EncryptSelection'))
							.setIcon('lock')
							.onClick(() => {
								this.encryptSelection(editor);
							});
					});
					menu.addItem((item) => {
						item
							.setTitle(i18n.t('main.DecryptSelection'))
							.setIcon('unlock')
							.onClick(() => {
								this.decryptSelection(editor);
							});
					});
				}


			})
		);
	}

	// 加密选中内容
	async encryptSelection(editor: Editor) {
		const selectedText = editor.getSelection();
		if (!selectedText) {
			new Notice(i18n.t('main.tip1'));
			return;
		}

		new KeyInputModal(this.app, false, async (keyContent: string, password: string) => {
			try {
				const encryptedText = EncryptAndFormat(keyContent, selectedText);
				editor.replaceSelection(encryptedText);
				new Notice(i18n.t('main.tip2'));
			} catch (error) {
				new Notice(i18n.t('main.tip3') + ` ${error.message}`);
			}
		}).open();
	}

	// 解密选中内容
	async decryptSelection(editor: Editor) {
		const selectedText = editor.getSelection();
		if (!selectedText) {
			new Notice(i18n.t('main.dtip1'));
			return;
		}

		let encryptedKey: string;
		let encryptedBody: string;
		try {
			({ encryptedKey, encryptedBody } = GetEncryptedKeyBody(selectedText));
		} catch (err) {
			new Notice(err.message);
			return;
		}

		new KeyInputModal(this.app, true, async (keyContent: string, password: string) => {
			try {
				const privateKeyPem = GetRsaPriKeyPem(keyContent, password);
				const decryptedText = DecryptMarkdown(encryptedKey, encryptedBody, privateKeyPem);
				editor.replaceSelection(decryptedText);
				new Notice(i18n.t('main.dtip2'));
			} catch (error) {
				new Notice(i18n.t('main.dtip3') + ` ${error.message}`);
			}
		}).open();
	}

	// 加密整个文件
	async encryptFile(file: TFile) {
		const content = await this.app.vault.read(file);
		if (!content) {
			new Notice(i18n.t('main.ftip1'));
			return;
		}

		new KeyInputModal(this.app, false, async (keyContent: string, password: string) => {
			try {
				const encryptedText = await EncryptAndFormat(keyContent, content);
				await this.app.vault.modify(file, encryptedText);
				new Notice(i18n.t('main.ftip2'));
			} catch (error) {
				new Notice(i18n.t('main.ftip3') + ` ${error.message}`);
			}
		}).open();
	}

	// 解密整个文件
	async decryptFile(file: TFile) {
		const content = await this.app.vault.read(file);
		if (!content) {
			new Notice(i18n.t('main.fdtip1'));
			return;
		}

		let encryptedKey: string;
		let encryptedBody: string;
		try {
			({ encryptedKey, encryptedBody } = GetEncryptedKeyBody(content));
		} catch (err) {
			new Notice(err.message);
			return;
		}

		new KeyInputModal(this.app, true, async (keyContent: string, password: string) => {
			try {
				const privateKeyPem = await GetRsaPriKeyPem(keyContent, password);
				const decryptedText = await DecryptMarkdown(encryptedKey, encryptedBody, privateKeyPem);
				await this.app.vault.modify(file, decryptedText);
				new Notice(i18n.t('main.fdtip2'));
			} catch (error) {
				new Notice(i18n.t('main.fdtip3') + ` ${error.message}`);
			}
		}).open();
	}
}

// 密钥输入模态框
class KeyInputModal extends Modal {
	private keyContent = '';
	private password = '';
	private isPriv = false;// 是否需要私钥
	private onSubmit: (keyContent: string, password: string) => void;

	constructor(app: App, isPriv: boolean, onSubmit: (keyContent: string, password: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
		this.isPriv = isPriv;
	}

	onOpen() {
		const { contentEl } = this;

		let btnLabel = i18n.t('common.encrypt');
		if (this.isPriv) {
			btnLabel = i18n.t('common.decrypt');
		}

		// 创建文件选择器
		const fileInputContainer = contentEl.createDiv();
		const fileInput = fileInputContainer.createEl('input', {
			type: 'file',
		});
		fileInputContainer.createEl('p', {
			text: i18n.t('main.intip1'),
		});

		fileInput.addEventListener('change', async (event) => {
			const target = event.target as HTMLInputElement;
			if (target.files && target.files.length > 0) {
				const file = target.files[0];
				this.keyContent = await file.text();
			}
		});

		if (this.isPriv) {
			new Setting(contentEl)
				.setName(i18n.t('common.password'))
				.addText(text => {
					text.inputEl.type = 'password';
					text.setPlaceholder(i18n.t('common.passTip'))
						.setValue(this.password)
						.onChange(async (value) => {
							this.password = value;
						});
				});
		}

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText(btnLabel)
				.setCta()
				.onClick(() => {
					if (!this.keyContent) {
						new Notice(i18n.t('main.intip2'));
						return;
					}
					if (this.isPriv) {
						if (!this.password.trim()) {
							new Notice(i18n.t('main.intip3'));
							return;
						}
					}
					this.close();
					this.onSubmit(this.keyContent, this.password);
				}))
			.addButton(btn => btn
				.setButtonText(i18n.t('common.cancel'))
				.onClick(() => {
					this.close();
				}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
