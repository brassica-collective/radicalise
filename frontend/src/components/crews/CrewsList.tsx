import { Stack } from "@mantine/core";
import type { CrewInvolvement } from "../../api/Api";
import { hashByNumber } from "../../utilities/hashing";
import type { PeopleObjectMap } from "../../store/people";

import CrewCard from "./CrewCard/CrewCard";
import type { CrewWithLinks } from "../../store/crews";

interface CrewsTableProps {
  crews: CrewWithLinks[];
  involvements: CrewInvolvement[];
  people: PeopleObjectMap;
  highlightPersonId?: number;
}

export default function CrewsList({ crews, involvements, people, highlightPersonId }: CrewsTableProps) {
  const involvementsHash = hashByNumber<CrewInvolvement>(involvements, "crew_id");

  return (
    <Stack>
      {crews.map((crew) => (
        <CrewCard key={crew.id} crew={crew} involvements={involvementsHash.get(crew.id) || []} people={people} highlightPersonId={highlightPersonId} />
      ))}
    </Stack>
  );
}
