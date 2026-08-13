import { createCommandRouter } from './commands.ts';

const state = {
  thinkingMode: "off",
  saveModeState: () => {},
  lastThinkingDecision: null
};

let logged = [];
const ctx = {
  hasUI: true,
  ui: {
    notify: (msg) => logged.push(msg)
  }
};

const dispatch = createCommandRouter(state);
await dispatch("thinking advisory", ctx);
console.log("thinkingMode:", state.thinkingMode);
console.log("logged:", logged);
