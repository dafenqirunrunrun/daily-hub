# Known Issues

Current local app warnings and build/runtime constraints.

1. Node v20.17.0 can emit an EBADENGINE warning because an ESLint transitive dependency declares `^20.19.0`.
2. Vite can emit a CJS Node API deprecation warning.
3. `better-sqlite3` needs Node ABI / Electron ABI rebuild switching between tests and the Electron app.
