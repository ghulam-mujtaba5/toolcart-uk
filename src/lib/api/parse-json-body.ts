import { NextResponse } from 'next/server';
import { z } from 'zod';

export interface ParseJsonBodySuccess<T> {
  success: true;
  data: T;
}

export interface ParseJsonBodyFailure {
  success: false;
  response: NextResponse;
}

export type ParseJsonBodyResult<T> = ParseJsonBodySuccess<T> | ParseJsonBodyFailure;

/**
 * Centrally and safely parses JSON request bodies.
 * Returns structured HTTP 400 Bad Request if the body is empty,
 * malformed, or fails Zod schema validation.
 */
export async function parseJsonBody<T = any>(
  request: Request,
  schema?: z.ZodType<T>
): Promise<ParseJsonBodyResult<T>> {
  try {
    const text = await request.text();
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Request body must not be empty',
            code: 'MALFORMED_JSON',
          },
          { status: 400 }
        ),
      };
    }

    let rawData: unknown;
    try {
      rawData = JSON.parse(text);
    } catch (parseErr: unknown) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Invalid or malformed JSON payload in request body',
            code: 'MALFORMED_JSON',
            details: parseErr instanceof Error ? parseErr.message : String(parseErr),
          },
          { status: 400 }
        ),
      };
    }

    if (schema) {
      const parsed = schema.safeParse(rawData);
      if (!parsed.success) {
        return {
          success: false,
          response: NextResponse.json(
            {
              error: 'Validation failed',
              code: 'INVALID_INPUT',
              issues: parsed.error.flatten().fieldErrors,
              details: parsed.error.issues,
            },
            { status: 400 }
          ),
        };
      }
      return { success: true, data: parsed.data };
    }

    return { success: true, data: rawData as T };
  } catch (err: unknown) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Failed to read request body',
          code: 'MALFORMED_JSON',
          details: err instanceof Error ? err.message : String(err),
        },
        { status: 400 }
      ),
    };
  }
}
