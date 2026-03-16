import { cityConfigs } from "../data/cities";
import { createRouteRequests } from "./random";

describe("createRouteRequests", () => {
  it("returns one valid origin and unique business and residential destinations", () => {
    const city = cityConfigs[0];
    const result = createRouteRequests(city);

    expect(city.origins.map((origin) => origin.label)).toContain(
      result.selectedOrigin.label
    );
    expect(new Set(result.businessRequests.map((item) => item.destination.label)).size).toBe(3);
    expect(new Set(result.residentialRequests.map((item) => item.destination.label)).size).toBe(3);
  });

  it("does not mix destination pools", () => {
    const city = cityConfigs[1];
    const result = createRouteRequests(city);
    const businessLabels = city.businessDestinations.map((place) => place.label);
    const residentialLabels = city.residentialDestinations.map((place) => place.label);

    result.businessRequests.forEach((request) => {
      expect(businessLabels).toContain(request.destination.label);
      expect(residentialLabels).not.toContain(request.destination.label);
    });

    result.residentialRequests.forEach((request) => {
      expect(residentialLabels).toContain(request.destination.label);
      expect(businessLabels).not.toContain(request.destination.label);
    });
  });
});
