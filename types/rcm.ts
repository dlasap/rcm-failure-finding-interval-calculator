export type FailureType = "Evident" | "Hidden";
export type FailureLeg = "Safety" | "Financial";

export interface Asset {
  name: string;
  failureModes: string[];
}

export interface Question {
  id: string;
  header: string;
  mainText: string;
  yesNextStep: string;
  noNextStep: string;
  info: string;
}

export interface Answer {
  id: string;
  recommendation: string;
  explanation: string;
}

export interface RCMState {
  currentStep?: string;
  failureType?: FailureType | null;
  failureLeg?: FailureLeg | null;
  asset?: string;
  failureMode?: string;
  progress?: number;
  history?: string[];
  totalSteps?: number;
  newAsset?: string;
  isNewAsset?: boolean;
}
