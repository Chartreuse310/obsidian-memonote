import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, ItemView, WorkspaceLeaf,} from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'MemoNote', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a MemoNote!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('MemoNote working.');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});

		// 替换选中文字
		this.addCommand({
			id: 'sample-replace-text',
			name: 'Replace text (sample)',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('ヾ(≧▽≦*)o');
			}
		});

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		//右键菜单扩展
		this.registerEvent(
			app.workspace.on("editor-menu", (menu, editor, view) => {
			  if (editor.somethingSelected()) {
				menu.addItem((item) => {
				  item.setTitle("Comment")
					.setIcon("comment")
					.onClick(() => {
					  // 调用后续处理函数
					  // this.createCommentCard(editor);
					  new Notice('MemoNote Created!'); //测试调用效果
					});
				});
			  }
			})
		  );

		//侧边栏面板
		this.registerView("comment-panel", (leaf) => new CommentPanel(leaf));

		//切换侧边栏显示
		this.addRibbonIcon("chat", "打开评论面板", () => {
		this.app.workspace.getRightLeaf(false).setViewState({
			type: "comment-panel",
			active: true,
		});
		});

		  
		  
	}

	

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

import { ItemView, WorkspaceLeaf, Notice } from "obsidian";

export class CommentPanel extends ItemView {
  getViewType(): string {
    return "comment-panel";
  }
  getDisplayText(): string {
    return "评论面板";
  }
  async onOpen(): Promise<void> {
    this.containerEl.empty();
    // 获取当前激活文件
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      this.containerEl.createEl("div", { text: "当前无激活文件" });
      return;
    }
    // 读取文件内容
    const content = await this.app.vault.read(activeFile);
    // 解析高亮文本和脚注，假设只处理一个评论示例
    const highlightRegex = /==([^=]+)==\s+\[\^([^\]]+)\]/;
    const match = content.match(highlightRegex);
    if (!match) {
      this.containerEl.createEl("div", { text: "未找到评论信息" });
      return;
    }
    const highlightedText = match[1].trim();
    const cardId = match[2].trim();

    // 根据cardId查找对应脚注内容
    const footnoteRegex = new RegExp(`\\[\\^${cardId}\\]:\\s*(.*)`);
    const footnoteMatch = content.match(footnoteRegex);
    let commentText = "";
    if (footnoteMatch) {
      commentText = footnoteMatch[1].trim();
    } else {
      new Notice(`未找到与 ${cardId} 对应的脚注`);
    }

    // 构建侧边栏界面，整体为一个大框，内部分为两个框
    const container = this.containerEl.createDiv("comment-container", (div) => {
      div.style.border = "1px solid #ccc";
      div.style.padding = "10px";
      div.style.margin = "10px 0";
      div.style.borderRadius = "4px";
      div.style.backgroundColor = "#f9f9f9";
    });
    // 第一个框：显示高亮文本
    const textBox = container.createDiv("comment-text", (div) => {
      div.style.fontWeight = "bold";
      div.style.marginBottom = "5px";
    });
    textBox.setText(highlightedText);

    // 第二个框：显示评论内容
    const commentBox = container.createDiv("comment-content", (div) => {
      div.style.padding = "5px";
      div.style.borderTop = "1px solid #ddd";
      div.style.marginTop = "5px";
    });
    commentBox.setText(commentText);
  }
  async onClose(): Promise<void> {
    // 可在此清理资源
  }
}



class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
