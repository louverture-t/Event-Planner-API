import { HydratedDocument, Model, Schema, model, models } from "mongoose";

export const eventCategories = [
  "Meeting",
  "Conference",
  "Personal",
  "Workshop",
  "Other",
] as const;

export type EventCategory = (typeof eventCategories)[number];

export interface EventInput {
  title: string;
  description?: string;
  date: Date;
  location?: string;
  category: EventCategory;
  attendees: string[];
}

export interface Event extends EventInput {
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<Event>;
export type EventModelType = Model<Event>;

const eventSchema = new Schema<Event, EventModelType>(
  {
    title: {
      type: String,
      required: [true, "Event title is required."],
      trim: true,
      minlength: [1, "Event title cannot be empty."],
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Event date is required."],
    },
    location: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: eventCategories,
      required: [true, "Event category is required."],
    },
    attendees: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const EventModel =
  (models.Event as EventModelType | undefined) ??
  model<Event, EventModelType>("Event", eventSchema);

export { eventSchema };
