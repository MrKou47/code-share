import * as vscode from 'vscode';
import * as path from 'path';

import gitRemoteUrl from './utils/gitRemoteUrl';

enum GitHost {
  github,
  gitlab,
  bitbucket
};

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
 * @param gitHost platform
 */
const genLineNumber = (select: vscode.Selection, gitHost: GitHost): string => {
  if (!select) return '';
  let {
    start: { line: startLine },
    end: { line: endLine, character: endChar }
  } = select;

  startLine = startLine + 1;
  if (endChar !== 0) endLine = endLine + 1;
  if (startLine === endLine) {
    // Only highlight 1 line
    switch (gitHost) {
      case GitHost.bitbucket:
        return `#lines-${startLine}`;

      default:
        return `#L${startLine}`;
    }
  } else {
    // Highlight multiple lines
    switch (gitHost) {
      case GitHost.bitbucket:
        return `#lines-${startLine}:${endLine}`;

      default:
        return `#L${startLine}-L${endLine}`;
    }
  }
};

/**
 * generate git host remote URL from the git config URL
 * @param rootPath path to repository
 */
const genGitRemoteUrl = async (rootPath: string): Promise<string> => {
  let content = await readFileContent(gitFilePath(rootPath, 'config'));
  const url = await gitRemoteUrl(content);
  return url;
};

/**
 * get a git host for our repo to leverage for specific platforms' URL styles
 * @param remoteUrl git platform URL
 */
const getGitHost = (remoteUrl: string): GitHost => {
  if (remoteUrl.includes('bitbucket')) {
    return GitHost.bitbucket;
  } else if (remoteUrl.includes('gitlab')) {
    return GitHost.gitlab;
  } else {
    // Default to Github
    return GitHost.github;
  }
};

/**
 * generate URL path for 'glue' between platform and HEAD and file
 * @param gitHost git platform we're working with
 */
const getBlobPath = (gitHost: GitHost): string => {
  switch(gitHost) {
    case GitHost.bitbucket:
      return 'src';

    case GitHost.gitlab:
      return '-/blob';

    case GitHost.github:
    default:
      return 'blob';
  }
};

async function genLink() {
  const rootPath = workspace!.rootPath as string;

  const filePath = path.relative(rootPath, window.activeTextEditor!.document.fileName);

  const headPosition = await genGitHEAD(rootPath);

  const remoteUrl = await genGitRemoteUrl(rootPath);

  const gitHost = getGitHost(remoteUrl);

  const blobPath = getBlobPath(gitHost);

  const lineNumber = genLineNumber(
    window.activeTextEditor!.selection,
    gitHost
  );

  // use https protocol as default
  let link = `https://${remoteUrl}/${blobPath}/${headPosition}/${filePath}${lineNumber}`;

  await env.clipboard.writeText(link);

  window.showInformationMessage('Git link has been copied. Open your browser and paste on the address bar.');

  return link;
}

export default genLink;