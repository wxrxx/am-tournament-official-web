export interface Competition {
  id: string;
  name: string;
  type: string;
  maxPlayers: number;
  maxAge: string | number;
  teamQuota: number;
  entryFee: number;
  startDate: string;
  endDate: string;
  status: "Open" | "Closed";
  numberOfGroups?: number;
  teamsPerGroup?: number;
}

export interface CompetitionFormData {
  name: string;
  type: string;
  maxPlayers: number;
  maxAge: string | number;
  teamQuota: number;
  entryFee: number;
  startDate: string;
  endDate: string;
  status: "Open" | "Closed";
  numberOfGroups: number;
  teamsPerGroup: number;
}
