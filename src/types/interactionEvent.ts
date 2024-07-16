import { Direction } from "./direction";

export enum InteractionEvent {
  Keypress = "keypress",
  Scroll = "scroll",
}

export interface EventBody {
  uid: string;
  baseURL: string;
  eventType: InteractionEvent;
}

export interface KeypressEventBody extends EventBody {
  movement:
    | {
        originalElementType: string;
        destinationElementType?: string;
      }
    | "unsuccessful";
  direction: Direction;
  key: string;
}

export interface ScrollEventBody extends EventBody {
  elementType: string;
  direction: Direction;
}
