import {Manifest} from "deno-slack-sdk/mod.ts";
import {BookTripFunction} from "./functions/book_trip.ts";
import {GenerateGanttChartFunction} from "./functions/generate_gantt_chart.ts";
import TripsDatastore, {TripTimingCustomType} from "./datastores/trips.ts";
import {CHART_API_DOMAIN} from "./constants/chart.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
    name: "Trip to Planet Tracker",
    description: "Track booking of trips and planet availability",
    icon: "assets/app-icon.png",
    functions: [BookTripFunction, GenerateGanttChartFunction],
    datastores: [TripsDatastore],
    types: [TripTimingCustomType],
    workflows: [],
    outgoingDomains: [
        CHART_API_DOMAIN,
    ],
    botScopes: [
        "commands",
        "chat:write",
        "chat:write.public",
        "datastore:read",
        "datastore:write",
    ],
});
