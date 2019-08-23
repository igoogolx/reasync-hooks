import { useCallback, useMemo, useRef } from "react";
import { useSelector } from "react-redux";

type ActionState = undefined | string;

export const useAsyncStateSelector = (
  actionTypes: string[],
  asyncStateType: string,
  asyncStateReducerKey: string
) => {
  const asyncAction = useRef<{ type: string | null }>({
    type: null
  });

  const actionTypesMemo = useMemo(() => actionTypes, [...actionTypes]);
  const asyncStateReducerKeyMemo = useMemo(() => asyncStateReducerKey, [
    asyncStateReducerKey
  ]);

  const asyncStateSelector = useCallback(
    (state: any) => {
      return actionTypesMemo.map(actionType => {
        if (!state[asyncStateReducerKeyMemo])
          throw new Error(
            `You may not pass {${asyncStateReducerKeyMemo}:asyncStateReducer} to combineReducers()`
          );
        return state[asyncStateReducerKeyMemo][actionType];
      });
    },
    [actionTypesMemo, asyncStateReducerKeyMemo]
  );

  const equalityFn = (
    newStates: ActionState[],
    currentStates: ActionState[]
  ) => {
    for (let i = 0; i < currentStates.length; i++) {
      if (currentStates[i] !== newStates[i]) {
        currentStates[i] = newStates[i];
        if (newStates[i] === asyncStateType) {
          asyncAction.current = { type: actionTypes[i] };
          //Re-render
          return false;
        }
      }
    }
    return true;
  };

  useSelector<any, ActionState[]>(
    asyncStateSelector,
    //The useSelector calls equalityFn in the useEffect on the server or useLayoutEffect on the browser.(https://github.com/reduxjs/react-redux/blob/0c5f7646f600e635e1caf62863ad61350011f3e7/src/hooks/useSelector.js#L71)
    equalityFn
  );

  return asyncAction.current;
};
