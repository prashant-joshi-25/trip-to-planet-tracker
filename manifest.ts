import {Manifest} from "deno-slack-sdk/mod.ts";
import TripsDatastore, {TripTimingCustomType} from "./datastores/trips.ts";
import {CHART_API_DOMAIN} from "./constants/chart.ts";
import {TripToPlanetWorkflow} from "./workflows/trip_to_planet.ts";
import {BookingModalFunction} from "./functions/booking_modal.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
    name: "Trip to Planet Tracker",
    description: "Track booking of trips and planet availability",
    icon: "assets/app-icon.png",
    functions: [
        BookingModalFunction,
        // GenerateGanttChartFunction,
        // BookTripFunction,
    ],
    datastores: [TripsDatastore],
    types: [TripTimingCustomType],
    workflows: [
        TripToPlanetWorkflow,
    ],
    outgoingDomains: [
        CHART_API_DOMAIN,
    ],
    botScopes: [
        "commands",
        "datastore:read",
        "datastore:write",
        // "chat:write",
    ],
});
