import * as vscode from 'vscode';
import genLink from './genLink';

const { commands } = vscode;

export function activate(context: vscode.ExtensionContext) {

	let genLinkRegister = commands.registerCommand('code-share.genLink', genLink);

	context.subscriptions.push(genLinkRegister);

}

export function deactivate() {}
