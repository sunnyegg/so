import { useState, useEffect } from 'react';

import browserStorage from 'store';

export default function usePersistState(storageKey: string, initialState: any) {
  const [state, setInternalState] = useState(initialState);

  useEffect(() => {
    const storageInBrowser = browserStorage.get(storageKey) && JSON.parse(browserStorage.get(storageKey));

    if (storageInBrowser) {
      setInternalState(storageInBrowser);
    }
  }, []);

  const setState = (newState: any) => {
    browserStorage.set(storageKey, JSON.stringify(newState));
    setInternalState(newState);
  };

  return [state, setState];
};