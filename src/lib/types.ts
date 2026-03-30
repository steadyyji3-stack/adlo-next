export type SubmissionStatus = 'new' | 'contacted' | 'done';

export interface Submission {
  id: number;
  name: string;
  phone: string;
  lineId: string;
  website: string;
  challenges: string[];
  notes: string;
  submittedAt: string;
  status: SubmissionStatus;
}
