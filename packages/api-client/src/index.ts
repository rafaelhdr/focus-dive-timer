import { apiNewUrl } from "@focusdive/config";
import createClient from "openapi-fetch";
import type { paths, components } from "./__generated__/openapi";

export const client = createClient<paths>({ baseUrl: apiNewUrl });

// Schema Obj
type MyType = components["schemas"]["MyType"];

// Path params
type EndpointParams = paths["/my/endpoint"]["parameters"];

// Response obj
type SuccessResponse =
  paths["/my/endpoint"]["get"]["responses"][200]["content"]["application/json"]["schema"];
type ErrorResponse =
  paths["/my/endpoint"]["get"]["responses"][500]["content"]["application/json"]["schema"];
