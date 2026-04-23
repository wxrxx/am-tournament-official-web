export interface Group {
  id: string;
  competitionId: string;
  name: string;
  teamIds: string[];
}

export interface CompetitionForDraw {
  id: string;
  name: string;
  status: "Open" | "Closed";
  teamQuota: number;
  numberOfGroups: number;
  teamsPerGroup: number;
}
