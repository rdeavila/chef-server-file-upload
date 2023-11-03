import * as vscode from 'vscode';
import * as cp from "child_process";

export function executeCommand(command: string) {
	return cp.exec(command, {cwd: getWorkspaceRoot()}, (err, stdout, stderr) => {
		if (err) {
			vscode.window.showErrorMessage(err.message);
			return;	
		}
		if (stderr) {
			vscode.window.showErrorMessage(stderr);
			return;	
		}
		vscode.window.showInformationMessage(stdout);
	});
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
	  vscode.commands.registerCommand('chef-server-file-upload.runKnifeUpload', async () => {
		executeCommand('knife upload '+getActiveEditorRelativePath());
	  }),
	  vscode.commands.registerCommand('chef-server-file-upload.runKnifeCookbookUpload', async () => {
		executeCommand('knife cookbook upload '+getActiveEditorCookbookName());
	  })
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('chef-server-file-upload.file', () => {
			if (getActiveEditorRelativePath() === undefined ) {
				vscode.window.showErrorMessage("There's no opened file to upload.");
			} else {
				vscode.commands.executeCommand('chef-server-file-upload.runKnifeUpload');
			}
		}),
		vscode.commands.registerCommand('chef-server-file-upload.cookbook', () => {
			if (getActiveEditorCookbookName() === undefined ) {
				vscode.window.showErrorMessage("This file doesn't belong to a cookbook.");
			} else {
				vscode.commands.executeCommand('chef-server-file-upload.runKnifeCookbookUpload');
			}
		})
	);
}

function getActiveEditorRelativePath(): string | undefined {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
	  return undefined;
	}
	return vscode.workspace.asRelativePath(editor.document.fileName, false);
}

function getActiveEditorCookbookName(): string | undefined {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
	  return undefined;
	}

	const cookbookPath = vscode.workspace.asRelativePath(editor.document.fileName, false).split('/');

	if (cookbookPath[0] === 'cookbooks') {
		return cookbookPath[1];
	} else {
		return undefined;
	}
}

function getWorkspaceRoot(): string | undefined {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || !workspaceFolders.length) {
	  return undefined;
	}
	return workspaceFolders[0].uri.fsPath;
}

export function deactivate() {}
