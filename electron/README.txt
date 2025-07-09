# Electron Setup for Mindspire Pharmacy POS

## How to Build and Package

1. **Build your React app in the main directory:**
   ```
   npm run build
   ```
   This will generate the React build output in `dist/` at the root.

2. **Copy the React build to the Electron folder:**
   - Copy the entire `dist` folder from the root into the `electron` folder, so you have `electron/dist/index.html` and assets.

3. **Install dependencies in the Electron folder:**
   ```
   cd electron
   npm install
   ```

4. **Build the Electron installer:**
   ```
   npm run dist
   ```
   The installer `.exe` will appear in `electron/dist/`.

## Notes
- The Electron app loads `dist/index.html` by default.
- Place your `icon.ico` in the `electron` folder to customize the installer icon.
- You can run `npm start` in the `electron` folder to test the app before packaging.
