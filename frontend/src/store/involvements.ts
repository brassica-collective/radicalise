import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CollectiveInvolvement, InvolvementData, IntervalInvolvementData, CrewInvolvement, Person, PersonIntervalInvolvementData } from "../api/Api";
import { type WritableDraft } from "immer";
import type { PeopleObjectMap } from "./people";
import { compareStrings } from "../utilities/comparison";

export type InvolvementsState = InvolvementData;

function upsertCollectiveInvolvement(involvements: CollectiveInvolvement[], newInvolvement: CollectiveInvolvement): CollectiveInvolvement[] {
  const existingIndex = involvements.findIndex((inv) => inv.id === newInvolvement.id);
  if (existingIndex !== -1) {
    // Update existing involvement
    return involvements.map((inv, index) => (index === existingIndex ? newInvolvement : inv));
  } else {
    // Add new involvement
    return [...involvements, newInvolvement];
  }
}

export function getMatchingInvolvementInterval(involvements: InvolvementsState, intervalId: number): IntervalInvolvementData | null {
  if (involvements.current_interval && involvements.current_interval.interval_id === intervalId) {
    return involvements.current_interval;
  }
  if (involvements.next_interval && involvements.next_interval.interval_id === intervalId) {
    return involvements.next_interval;
  }
  return null;
}

export function forCrew(involvements: CrewInvolvement[], crewId: number): CrewInvolvement[] {
  return involvements.filter((involvement) => involvement.crew_id === crewId);
}

export function forPerson<T extends { person_id: number }>(involvements: T[], personId: number | undefined): T[] {
  if (personId === undefined) return [];
  return involvements.filter((involvement) => involvement.person_id === personId);
}

export function oneForPerson<T extends { person_id: number }>(involvements: T[], personId: number | undefined): T | undefined {
  if (personId === undefined) return undefined;
  return involvements.find((involvement) => involvement.person_id === personId);
}

export function notForPerson<T extends { person_id: number }>(involvements: T[], personId: number): T[] {
  return involvements.filter((involvement) => involvement.person_id !== personId);
}

export function asPeopleAlphaSorted<T extends { person_id: number }>(involvements: T[], people: PeopleObjectMap): Person[] {
  return involvements
    .map((involvement) => people[involvement.person_id])
    .filter(Boolean)
    .sort(compareStrings("display_name"));
}

function updateCrewInvolvementForPerson(crewInvolvements: WritableDraft<CrewInvolvement>[], personInvolvements: CrewInvolvement[], personId: number): WritableDraft<CrewInvolvement>[] {
  const withoutPerson = crewInvolvements.filter((involvement) => involvement.person_id !== personId);
  return withoutPerson.concat(personInvolvements);
}

const involvementsSlice = createSlice({
  name: "involvements",
  initialState: {
    current_interval: null,
    next_interval: null,
  } as InvolvementsState,
  reducers: {
    involvementsLoaded: (_state: InvolvementsState, action: PayloadAction<InvolvementsState>) => action.payload,
    intervalDataChanged: (state: InvolvementsState, action: PayloadAction<PersonIntervalInvolvementData>) => {
      let payload = action.payload;

      if (!state || !payload) return state;

      const involvement = payload.collective_involvement;
      if (!involvement) return state;
      const person_id = involvement.person_id;

      const interval_keys: (keyof InvolvementsState)[] = ["current_interval", "next_interval"];

      interval_keys.forEach((key) => {
        if (state && state[key] && state[key].interval_id === payload.interval_id) {
          state[key].collective_involvements = upsertCollectiveInvolvement(state[key].collective_involvements, involvement);
          state[key].crew_involvements = updateCrewInvolvementForPerson(state[key].crew_involvements, forPerson(payload.crew_involvements, person_id), person_id);
        }
      });

      return state;
    },
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { involvementsLoaded, intervalDataChanged } = involvementsSlice.actions;

// Export the slice reducer as the default export
export default involvementsSlice.reducer;
