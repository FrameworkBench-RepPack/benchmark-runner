export const MessageType = {
  Ready: 0,
  Stop: 1,
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

type DefaultMessage<T> = {
  type: MessageType;
  payload: T;
};

export type MessageStructures = {
  [MessageType.Ready]: [DefaultMessage<{ message: string }>, null];
  [MessageType.Stop]: [DefaultMessage<null>, null];
};

export type WorkerData = {
  framework: string;
  port: number;
};
