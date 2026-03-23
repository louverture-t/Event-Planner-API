import { isValidObjectId } from "mongoose";

import { eventCategories, type EventCategory } from "../models";
import { BadRequestError } from "./errors";

type QueryValue = string | string[] | undefined;

export interface EventListQueryFilters {
  category?: EventCategory;
  date?: Date;
}

function getSingleQueryValue(name: string, value: QueryValue): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    throw new BadRequestError(`${name} must be provided as a single value.`, {
      [name]: value,
    });
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
}

export function validateObjectId(
  value: string,
  fieldName = "id",
): string {
  const normalized = value.trim();

  if (!isValidObjectId(normalized)) {
    throw new BadRequestError(`Invalid ${fieldName}.`, {
      [fieldName]: value,
    }, "INVALID_OBJECT_ID");
  }

  return normalized;
}

export function parseCategoryFilter(value: QueryValue): EventCategory | undefined {
  const category = getSingleQueryValue("category", value);

  if (!category) {
    return undefined;
  }

  if (!eventCategories.includes(category as EventCategory)) {
    throw new BadRequestError("Invalid category filter.", {
      category,
      allowedValues: [...eventCategories],
    });
  }

  return category as EventCategory;
}

export function parseDateFilter(value: QueryValue): Date | undefined {
  const dateValue = getSingleQueryValue("date", value);

  if (!dateValue) {
    return undefined;
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new BadRequestError("Invalid date filter.", {
      date: dateValue,
    });
  }

  return parsedDate;
}

export function parseEventListQueryFilters(query: {
  category?: QueryValue;
  date?: QueryValue;
}): EventListQueryFilters {
  return {
    category: parseCategoryFilter(query.category),
    date: parseDateFilter(query.date),
  };
}