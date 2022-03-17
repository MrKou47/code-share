import * as vscode from 'vscode';
import * as path from 'path';

import gitRemoteUrl from './utils/gitRemoteUrl';

// eslint-disable-next-line @typescript-eslint/naming-convention
const { env, window, workspace, Uri } = vscode;

const gitFilePath = (rootPath: string, prefix: string) => path.join(rootPath, '.git', prefix);

const readFileContent = async (filePath: string) => {
  const content: Uint8Array | string = await workspace.fs.readFile(Uri.parse(filePath));
  return content.toString();
};

/**
 * generate git HEAD position. like branchName or commitId
 * @param rootPath string
 */
const genGitHEAD = async (rootPath: string): Promise<string> => {
  const content = await readFileContent(gitFilePath(rootPath, 'HEAD'));
  if (content.indexOf('ref') > -1) {
    return content.match(/(?<=ref\:\srefs\/heads\/).+/)?.[0] || '';
  }
  return content;
};

/**
 * generate #{startLineNumber}-{endLineNumber} style's string
 * @param select Selection
 * @param platform string
 */
const genLineNumber = (select: vscode.Selection, useSubPrefix: boolean = false): string => {
  if (!select) return '';
  let {
    start: { line: startLine },
    end: { line: endLine, character: endChar }
  } = select;

  startLine = startLine + 1;
  if (endChar !== 0) endLine = endLine + 1;
  if (startLine === endLine) return `#L${startLine}`;
  
  return `#L${startLine}-${useSubPrefix ? 'L' : ''}${endLine}`;
};

const genGitRemoteUrl = async (rootPath: string): Promise<string> => {
  let content = await readFileContent(gitFilePath(rootPath, 'config'));
  const url = await gitRemoteUrl(content);
  return url;
};

async function genLink() {
  const rootPath = workspace!.rootPath as string;

  const filePath = path.relative(rootPath, window.activeTextEditor!.document.fileName);

  const headPosition = await genGitHEAD(rootPath);

  const remoteUrl = await genGitRemoteUrl(rootPath);

  const lineNumber = genLineNumber(
    window.activeTextEditor!.selection,
    remoteUrl.indexOf('github') > -1 // github link use `#L{startLineNumber}-L{endLineNumber}` form
  );

  // use https protocol as default
  let link = `https://${remoteUrl}/blob/${headPosition}/${filePath}${lineNumber}`;

  // const fastLink = 'https://alex.alipay.com#' + `https://${remoteUrl}/blob/${headPosition}/${filePath}${lineNumber}`;

  await env.clipboard.writeText(link);

  window.showInformationMessage('Git link has been copied.Open your browser and paste on the address bar.');

  return link;
}

export default genLink;