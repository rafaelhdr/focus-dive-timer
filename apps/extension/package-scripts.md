# Extension Build Scripts

Since I cannot modify package.json directly, please add these scripts to your package.json:

```json
{
  "scripts": {
    "build:extension": "node scripts/build-extension.js",
    "dev:extension": "BUILD_TARGET=extension npm run dev"
  }
}
```

## Usage

1. **Development**: Use `npm run dev` for regular web development
2. **Extension Development**: Use `npm run dev:extension` for extension-specific development
3. **Extension Build**: Use `npm run build:extension` to create the extension package

## Loading the Extension

After running `npm run build:extension`:

1. Open Chrome/Edge and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `dist/` folder from your project
5. The extension should now appear in your browser toolbar

## File Structure

The extension build creates:
```
dist/
├── index.html          # Extension popup
├── manifest.json       # Extension manifest
├── icon16.png         # Extension icons
├── icon32.png
├── icon48.png
├── icon128.png
├── assets/            # Bundled JS/CSS
│   ├── main.js
│   └── main.css
```