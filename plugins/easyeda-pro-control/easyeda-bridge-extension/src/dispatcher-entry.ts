// Entry point used only to derive the reviewed dispatcher build identity.
// The authenticated extension embeds dispatcher.ts directly; this ESM build
// Is never packaged or evaluated at runtime.
export { createDispatcher } from './dispatcher.js';
