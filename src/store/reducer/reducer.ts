import { createAction, createReducer } from "@reduxjs/toolkit";
import storeType from "../type";

interface IReducerState {
  isLoading: boolean;
}

const initialState = {
  isLoading: false,
} satisfies IReducerState as IReducerState;

export const setLoading = createAction<boolean>(storeType.setLoading);

export const loadingReducer = createReducer(initialState, (build) => {
  build.addCase(setLoading, (state, action) => {
    state.isLoading = action.payload;
  });
});
