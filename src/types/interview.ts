export interface InterviewCard {
  id: string;
  position: string; // e.g. business analyst, investment banking associate
  company: string;
  tenure: number;
  signUpLink: string; // will be a calendly link
  thumbnail?: string;
}
