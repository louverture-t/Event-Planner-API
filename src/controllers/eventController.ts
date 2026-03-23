import type { RequestHandler, Response } from "express";

import {
  BadRequestError,
  NotFoundError,
  createSuccessResponse,
  parseEventListQueryFilters,
  toErrorResponse,
  validateObjectId,
} from "../contracts";
import { EventModel, type EventCategory } from "../models";

type QueryValue = string | string[] | undefined;

function sendErrorResponse(response: Response, error: unknown): void {
  const { statusCode, body } = toErrorResponse(error);

  response.status(statusCode).json(body);
}

function getQueryValue(name: string, value: unknown): QueryValue {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.every((entry) => typeof entry === "string")) {
    return value;
  }

  throw new BadRequestError(`${name} must be a string value.`, {
    [name]: value,
  });
}

function getRouteParam(name: string, value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  throw new BadRequestError(`${name} must be a string value.`, {
    [name]: value,
  });
}

export const listEvents: RequestHandler = async (request, response) => {
  try {
    const filters = parseEventListQueryFilters({
      category: getQueryValue("category", request.query.category),
      date: getQueryValue("date", request.query.date),
    });
    const query: {
      category?: EventCategory;
      date?: { $gte: Date };
    } = {};

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.date) {
      query.date = { $gte: filters.date };
    }

    const events = await EventModel.find(query)
      .sort({ date: 1, createdAt: 1 })
      .exec();

    response.status(200).json(createSuccessResponse(events));
  } catch (error) {
    sendErrorResponse(response, error);
  }
};

export const getEventById: RequestHandler = async (request, response) => {
  try {
    const eventId = validateObjectId(getRouteParam("id", request.params.id));
    const event = await EventModel.findById(eventId).exec();

    if (!event) {
      throw new NotFoundError("Event not found.", { id: eventId });
    }

    response.status(200).json(createSuccessResponse(event));
  } catch (error) {
    sendErrorResponse(response, error);
  }
};

export const createEvent: RequestHandler = async (request, response) => {
  try {
    const event = await EventModel.create(request.body);

    response
      .status(201)
      .json(createSuccessResponse(event, "Event created successfully."));
  } catch (error) {
    sendErrorResponse(response, error);
  }
};

export const updateEvent: RequestHandler = async (request, response) => {
  try {
    const eventId = validateObjectId(getRouteParam("id", request.params.id));
    const updatedEvent = await EventModel.findByIdAndUpdate(eventId, request.body, {
      returnDocument: "after",
      runValidators: true,
    }).exec();

    if (!updatedEvent) {
      throw new NotFoundError("Event not found.", { id: eventId });
    }

    response
      .status(200)
      .json(createSuccessResponse(updatedEvent, "Event updated successfully."));
  } catch (error) {
    sendErrorResponse(response, error);
  }
};

export const deleteEvent: RequestHandler = async (request, response) => {
  try {
    const eventId = validateObjectId(getRouteParam("id", request.params.id));
    const deletedEvent = await EventModel.findByIdAndDelete(eventId).exec();

    if (!deletedEvent) {
      throw new NotFoundError("Event not found.", { id: eventId });
    }

    response
      .status(200)
      .json(createSuccessResponse(deletedEvent, "Event deleted successfully."));
  } catch (error) {
    sendErrorResponse(response, error);
  }
};