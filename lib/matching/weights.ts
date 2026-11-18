export interface ScoringWeights {
  visual: number;
  semantic: number;
  attributes: number;
  spatial: number;
  temporal: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  visual: 0.3,
  semantic: 0.25,
  attributes: 0.2,
  spatial: 0.15,
  temporal: 0.1,
};
