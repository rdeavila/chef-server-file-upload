import * as vscode from 'vscode';
import * as cp from "child_process";

function getActiveEditorRelativePath(): string | undefined {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
	  return undefined;
	}
	return vscode.workspace.asRelativePath(editor.document.fileName, false);
}

function getWorkspaceRoot(): string | undefined {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || !workspaceFolders.length) {
	  return undefined;
	}
	return workspaceFolders[0].uri.fsPath;
}

export function activate(context: vscode.ExtensionContext) {
	const execShell = (cmd: string) =>
	  new Promise<string>((resolve, reject) => {
    	cp.exec(cmd, {cwd: getWorkspaceRoot()}, (err, out) => {
			if (err) {
				vscode.window.showErrorMessage('Error on command "' +cmd+'": '+err);
		  }
		  vscode.window.showInformationMessage(out);
		});
	  });
  
	context.subscriptions.push(
	  vscode.commands.registerCommand('chef-server-file-upload.runKnifeUpload', async () => {
		await execShell('knife upload '+getActiveEditorRelativePath());
	  })
	);

	let disposable = vscode.commands.registerCommand('chef-server-file-upload.uploadFile', () => {
		if (getActiveEditorRelativePath() === undefined ) {
			vscode.window.showErrorMessage("There's no opened file to upload.");
		} else {
			vscode.commands.executeCommand('chef-server-file-upload.runKnifeUpload');
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
