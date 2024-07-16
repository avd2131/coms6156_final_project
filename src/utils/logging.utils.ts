import {
  CloudWatchLogs,
  InputLogEvent,
  PutLogEventsCommand,
  PutLogEventsCommandInput,
} from "@aws-sdk/client-cloudwatch-logs";
import { Direction } from "../types/direction";
import { InteractionEvent, KeypressEventBody, ScrollEventBody } from "../types/interactionEvent";

const LOG_GROUP_NAME = "Interactions";
const LOG_STREAM_NAME = "Interaction";

/**
 * This class is responsible for logging user interactions to AWS CloudWatch.
 *
 * logging functions are optionally async, but it's preferred to call them as synchronous functions so that their
 * execution doesn't slow down user navigation.
 */
export class Logger {
  /**
   * AWS SDK Configuration
   * ===
   * Bundling my (David Rios)'s AWS SDK credentials to make things temporarily easier for field tests. In the future,
   * another authentication method should be used.
   */
  cloudWatchClient: CloudWatchLogs;
  uid: string;

  constructor(uid: string) {
    this.uid = uid;

    this.cloudWatchClient = new CloudWatchLogs({
      region: "us-east-1",
      credentials: {
        accessKeyId: "AKIA5KL4R3A6BBXVWB4B",
        secretAccessKey: "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",
      },
    });
  }

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cloudwatch-logs/command/PutLogEventsCommand/
  protected logEvent = async (event: KeypressEventBody | ScrollEventBody) => {
    const eventToLog: InputLogEvent = {
      timestamp: Date.now(),
      message: JSON.stringify(event),
    };

    const input: PutLogEventsCommandInput = {
      logGroupName: LOG_GROUP_NAME,
      logStreamName: LOG_STREAM_NAME,
      logEvents: [eventToLog],
    };

    const command = new PutLogEventsCommand(input);
    await this.cloudWatchClient.send(command);
  };

  logScrollEvent = async (elementType: string, direction: Direction) => {
    const scrollEvent: ScrollEventBody = {
      uid: this.uid,
      baseURL: window.location.origin,
      eventType: InteractionEvent.Scroll,
      elementType,
      direction,
    };

    await this.logEvent(scrollEvent);
  };

  logKeypress = async (
    key: string,
    direction: Direction,
    originalElementType?: string,
    destinationElementType?: string
  ) => {
    const movement =
      originalElementType === undefined ? "unsuccessful" : { originalElementType, destinationElementType };

    const keypressEvent: KeypressEventBody = {
      uid: this.uid,
      baseURL: window.location.origin,
      eventType: InteractionEvent.Keypress,
      key,
      direction,
      movement,
    };

    await this.logEvent(keypressEvent);
  };
}
