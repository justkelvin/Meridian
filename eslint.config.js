import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      'react-refresh/only-export-components': [
        'error',
        { allowConstantExport: true, allowExportNames: ['useSidebar'] },
      ],
    },
  },
  {
    files: ['vite.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['worker/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    files: ['public/appscreen/**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.browser,
        JSZip: 'readonly',
        THREE: 'readonly',
        languageFlags: 'readonly',
        languageNames: 'readonly',
        llmProviders: 'readonly',
        state: 'writable',
        addLocalizedImage: 'readonly',
        addProjectLanguage: 'readonly',
        closeDuplicateDialog: 'readonly',
        closeExportLanguageDialog: 'readonly',
        closeScreenshotTranslationsModal: 'readonly',
        detectLanguageFromFilename: 'readonly',
        dismissMagicalTitlesTooltip: 'readonly',
        findScreenshotByBaseFilename: 'readonly',
        generateMagicalTitles: 'readonly',
        generateModelOptions: 'readonly',
        getAvailableLanguagesForScreenshot: 'readonly',
        getBackground: 'readonly',
        getScreenshotImage: 'readonly',
        getScreenshotSettings: 'readonly',
        getSelectedModel: 'readonly',
        getSelectedProvider: 'readonly',
        handleTranslationFileSelect: 'readonly',
        hideMagicalTitlesDialog: 'readonly',
        initDuplicateDialogListeners: 'readonly',
        isScreenshotComplete: 'readonly',
        loadCachedPhoneModel: 'readonly',
        openScreenshotTranslationsModal: 'readonly',
        phoneModelLoaded: 'writable',
        renderThreeJSForScreenshot: 'readonly',
        renderThreeJSToCanvas: 'readonly',
        saveState: 'readonly',
        setThreeJSRotation: 'readonly',
        showAppAlert: 'readonly',
        showDuplicateDialog: 'readonly',
        showExportLanguageDialog: 'readonly',
        showMagicalTitlesDialog: 'readonly',
        showMagicalTitlesTooltip: 'readonly',
        showThreeJS: 'readonly',
        switchPhoneModel: 'readonly',
        syncUIWithState: 'readonly',
        updateCanvas: 'readonly',
        updateScreenshotList: 'readonly',
        updateScreenTexture: 'readonly',
      },
    },
    rules: {
      // These files are loaded as ordered browser scripts and intentionally
      // expose helpers for HTML handlers and sibling scripts.
      'no-unused-vars': 'off',
      'no-redeclare': 'off',
    },
  },
])
