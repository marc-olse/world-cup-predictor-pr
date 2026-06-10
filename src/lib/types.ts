export type MatchStatus = 'scheduled' | 'live' | 'finished';

export type Profile = {
  id: string;
  display_name: string;
  is_admin: boolean;
  created_at: string;
};

export type Match = {
  id: string;
  source_id?: string | null;
  kickoff_at: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
  created_at: string;
  updated_at: string;
};

export type Prediction = {
  id: string;
  user_id: string;
  match_id: string;
  predicted_home_score: number | null;
  predicted_away_score: number | null;
  points: number;
  created_at: string;
  updated_at: string;
};

export type TournamentPrediction = {
  user_id: string;
  winner: string | null;
  semi_finalists: string[];
  created_at: string;
  updated_at: string;
};

export type LeaderboardRow = {
  user_id: string;
  display_name: string;
  total_points: number;
  predictions_count: number;
  exact_scores_count: number;
  correct_results_count: number;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          display_name: string;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          display_name?: string;
          is_admin?: boolean;
        };
        Relationships: [];
      };
      matches: {
        Row: Match;
        Insert: {
          id?: string;
          source_id?: string | null;
          kickoff_at: string;
          home_team: string;
          away_team: string;
          home_score?: number | null;
          away_score?: number | null;
          status?: MatchStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          kickoff_at?: string;
          source_id?: string | null;
          home_team?: string;
          away_team?: string;
          home_score?: number | null;
          away_score?: number | null;
          status?: MatchStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      predictions: {
        Row: Prediction;
        Insert: {
          id?: string;
          user_id: string;
          match_id: string;
          predicted_home_score: number | null;
          predicted_away_score: number | null;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          match_id?: string;
          predicted_home_score?: number | null;
          predicted_away_score?: number | null;
          points?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'predictions_match_id_fkey';
            columns: ['match_id'];
            isOneToOne: false;
            referencedRelation: 'matches';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'predictions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      tournament_predictions: {
        Row: TournamentPrediction;
        Insert: {
          user_id: string;
          winner?: string | null;
          semi_finalists?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          winner?: string | null;
          semi_finalists?: string[];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tournament_predictions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      leaderboard: {
        Row: LeaderboardRow;
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
