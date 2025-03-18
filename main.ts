import { Plugin } from "obsidian"

export default class MyStatusBar extends Plugin { 
	statusBarTextElement: HTMLElement; //container of the text element

	async onload() {
		console.log("MyStatusBar now running"); //log when start

		this.statusBarTextElement = this.addStatusBarItem().createEl("span"); //"span" should be CHANGE later
		this.statusBarTextElement.textContent = "MemoNote now running!";

		this.app.workspace.on("active-leaf-change", async() => { //get content value when open new page
			this.readActiveFileAndUpdateStatusBar();
		})

		this.app.workspace.on("editor-change", editor => { //get content value when editor change
			const content = editor.getDoc().getValue();
			this.updateLineCount(content);
		})

	}

	//get file content and update status bar
	private async readActiveFileAndUpdateStatusBar(){
		const file = this.app.workspace.getActiveFile() 
		if (file){ //if file is opened, get the content
			const content = await this.app.vault.read(file);
			this.updateLineCount(content);
			this.updateHighlightCount();
			this.updateFootnoteCount();
		}else{ //reset when change file or closed
			this.statusBarTextElement.textContent = "MemoNote waiting for the next file 👾";
		}
	}

	//count for line amount, e.g. 3 lines
	private updateLineCount(fileContent?: string){ 
		const count = fileContent ? fileContent.split(/\r\n|\r|\n/).length: 0; //if content exist, split by line break
		const linesWord = count === 1 ? "line" : "lines"; //if 1 line use "line", else use "lines"
		this.statusBarTextElement.textContent = `${count} ${linesWord}`;
	}

	//count for highlight
	private updateHighlightCount(){

	}
	
	//count for footnote
	private updateFootnoteCount(){

	}
}