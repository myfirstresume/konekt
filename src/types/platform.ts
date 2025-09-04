export interface PlatformStep {
  title: string;
  description: string;
  backgroundImage: string;
  type: "mentor" | "student";
  position: "left" | "middle" | "right";
  link: string;
}
