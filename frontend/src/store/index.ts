import { useDispatch, useSelector, useStore } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import collectiveReducer, { collectiveLoaded } from "./collective";
import peopleReducer, { peopleLoaded } from "./people";
import intervalsReducer, { intervalsLoaded } from "./intervals";
import involvementsReducer, { involvementsLoaded } from "./involvements";
import groupsReducer, { groupsLoaded } from "./groups";
import { getApi } from "../api";

const store = configureStore({
  reducer: {
    collective: collectiveReducer,
    people: peopleReducer,
    intervals: intervalsReducer,
    involvements: involvementsReducer,
    groups: groupsReducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

// const initialDataLoaded = (data: any) => ({
//   type: "initialDataLoaded",
//   payload: data,
// });

export async function loadInitialData(store: AppStore) {
  const api = getApi();

  const dataHasLoaded = store.getState().collective;

  if (!dataHasLoaded) {
    console.log("Loading initial data from API...");
    api.api.getState().then((response) => {
      store.dispatch(peopleLoaded(response.data.people));
      store.dispatch(groupsLoaded(response.data.groups));
      store.dispatch(intervalsLoaded({ allIntervals: response.data.intervals, currentInterval: response.data.current_interval }));
      store.dispatch(involvementsLoaded(response.data.involvements));
      store.dispatch(collectiveLoaded(response.data.collective));
    });
  }
}

export default store;
