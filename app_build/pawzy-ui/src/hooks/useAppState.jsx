/**
 * src/hooks/useAppState.js
 *
 * Central React context that subscribes to all pawzy-core events via
 * the preload bridge and makes state available to all components.
 */

import { createContext, useContext, useEffect, useReducer } from 'react';

const initialState = {
  state: 'idle',        // idle | warning | lock | break | happy
  elapsed: 0,
  limit: 3600,
  breakRemaining: null,
  stats: { today_used: 0, breaks_taken: 0, streak: 0 },
};

function reducer(state, action) {
  switch (action.type) {
    case 'STATE_CHANGE':
      return { ...state, state: action.payload.state };
    case 'TIMER_TICK':
      return {
        ...state,
        elapsed: action.payload.elapsed,
        limit: action.payload.limit,
      };
    case 'BREAK_START':
      return { ...state, state: 'break', breakRemaining: action.payload.duration };
    case 'BREAK_TICK':
      return { ...state, breakRemaining: action.payload.remaining };
    case 'BREAK_END':
      return { ...state, state: 'idle', breakRemaining: null };
    case 'STATS':
      return { ...state, stats: action.payload };
    default:
      return state;
  }
}

const AppStateContext = createContext(initialState);

export function AppStateProvider({ children }) {
  const [appState, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!window.pawzy) return; // Not in Electron context (dev browser)

    const unsubs = [
      window.pawzy.on('state_change',  (d) => dispatch({ type: 'STATE_CHANGE',  payload: d })),
      window.pawzy.on('timer_tick',    (d) => dispatch({ type: 'TIMER_TICK',    payload: d })),
      window.pawzy.on('break_start',   (d) => dispatch({ type: 'BREAK_START',   payload: d })),
      window.pawzy.on('break_tick',    (d) => dispatch({ type: 'BREAK_TICK',    payload: d })),
      window.pawzy.on('break_end',     (_) => dispatch({ type: 'BREAK_END'                })),
      window.pawzy.on('stats',         (d) => dispatch({ type: 'STATS',         payload: d })),
    ];

    return () => unsubs.forEach(fn => fn && fn());
  }, []);

  return (
    <AppStateContext.Provider value={appState}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  return useContext(AppStateContext);
}
