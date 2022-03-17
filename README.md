# code-share

ALL-IN-ONE code share extension. Inspired by Github code share link.

## Features

- Generate link with line number
- Generate unique CodeShare snippets
- Auto clone repositry[WIP]
- Auto open workspace and file[WIP]
- Auto jump to the current line number/block[WIP]

### Generate link with line number

1. Select code in your editor. You can select single line code or a range of code
2. `cmd+shift+p`, enter `CodeShare: Generate link`. And then the link will be copied.
3. Open your brower, paste on the address bar.

### Vscode keyboard shortcuts config

I usually use `cmd+k g` to call _code-share_.

**vscode keybindings.json**
```json
{
  "key": "cmd+k g",
  "command": "code-share.genLink"
}
```

## Requirements

None.

## Known Issues
https://github.com/MrKou47/code-share/issues

## Release Notes

### 0.0.1

First release

### 0.0.2

- Add right click menu
