import * as ini from 'ini';
import * as GitUrlParse from 'git-url-parse';

const expandKeys = (config: any) => {
  for (let key of Object.keys(config)) {
    let m = /(\S+) "(.*)"/.exec(key);
    if (!m) continue;
    let prop = m[1];
    config[prop] = config[prop] || {};
    config[prop][m[2]] = config[key];
    delete config[key];
  }
  return config;
};

const parseIni = (str: string, options?: any) => {
  let opts = Object.assign({}, options);

  str = str.replace(/\[(\S+) "(.*)"\]/g, (m, $1, $2) => {
    return $1 && $2 ? `[${$1} "${$2.split('.').join('\\.')}"]` : m;
  });

  let config = ini.parse(str);
  if (opts?.expandKeys === true) {
    return expandKeys(config);
  }
  return config;
};

function gitRemoteUrl(content: string) {
  const config = parseIni(content);
  const url = config['remote "origin"']?.url;
  const parsedUrl = GitUrlParse(url);
  return `${parsedUrl.resource}/${parsedUrl.full_name}`;
}

export default gitRemoteUrl;