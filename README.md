# MW-drag-to-upload

> Mediawiki gadget for allowing drag-to-upload files.

```js
mw.loader.load(
  "https://cdn.jsdelivr.net/gh/XYY-huijiwiki/MW-drag-to-upload@dist/entry.js"
);
```

> [!important]
>
> Due to Safari's security policy, the upload menu shows even if the dragged file is not an image file. So Safari users should not enable this gadget.

## TODO

- [ ] Add a btn to remove the uploaded file.
- [ ] Add a btn to display modal directly.
- [ ] Reduce the aggressiveness of the upload menu.
- [ ] Click the uploaded file to open it in a new tab.
- [ ] Avoid repeated uploads after server-side verification.
- [ ] Separate the async steps of 'displaying' and 'verifying'.
- [ ] Auto get acceptable file types from the server.
