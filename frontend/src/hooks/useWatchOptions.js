import { useCallback, useEffect, useState } from 'react';
import { fetchWatchOptions } from '../services/watchApi';

const STORAGE_KEY = 'pitchcast.country';

function readStoredCountry() {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * Loads "where to watch" for one match.
 * The visitor's chosen country is remembered in this browser; until they choose,
 * the backend picks one from the request (and the panel shows which).
 */
export function useWatchOptions(matchId) {
  const [chosenCountry, setChosenCountry] = useState(readStoredCountry);
  const [reloadTick, setReloadTick] = useState(0);
  const [state, setState] = useState({ loading: false, error: null, data: null });

  useEffect(() => {
    if (!matchId) {
      setState({ loading: false, error: null, data: null });
      return undefined;
    }
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchWatchOptions(matchId, chosenCountry, controller.signal)
      .then((data) => setState({ loading: false, error: null, data }))
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setState({ loading: false, error: err.message, data: null });
      });

    return () => controller.abort();
  }, [matchId, chosenCountry, reloadTick]);

  const setCountry = useCallback((code) => {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // storage can be blocked; the choice still applies for this session
    }
    setChosenCountry(code);
  }, []);

  const reload = useCallback(() => setReloadTick((n) => n + 1), []);

  return {
    ...state,
    country: chosenCountry || state.data?.country || null,
    setCountry,
    reload,
  };
}
