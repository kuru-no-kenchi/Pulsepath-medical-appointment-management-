export type FieldType =
  | "text"
  | "email"
  | "image"
  | "number"
  | "textarea"
  | "date"
  | "time"
  | "select";

export interface Field {
  label: string;
  name: string;
  type?: FieldType;
  options?: {
    value: string;
    label: string;
  }[];
  readOnly?: boolean;
}
