import { cacheName, fixture, marker, markerKey, seed } from "./helpers/storage-marker-fixture.ts";
import { registerNamespaceCases } from "./helpers/storage-marker-fixture-namespace-cases.ts";

registerNamespaceCases({ cacheName, fixture, marker, markerKey, seed });
