declare module "db-vendo-client" {
  export function createClient(
    profile: unknown,
    userAgent: string,
  ): {
    locations(
      query: string,
      opts?: { results?: number },
    ): Promise<Array<{ id: string; name?: string; [key: string]: unknown }>>;
    journeys(
      from: string,
      to: string,
      opts?: { results?: number },
    ): Promise<{
      journeys: Array<{
        legs: Array<{
          origin: unknown;
          destination: unknown;
          departure?: string;
          arrival?: string;
          plannedDeparture?: string;
          plannedArrival?: string;
        }>;
      }>;
    }>;
  };
}

declare module "db-vendo-client/p/db/index.js" {
  export const profile: unknown;
}
