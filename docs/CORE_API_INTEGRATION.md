# Dashboard Core API integration

The tenant dashboard must not treat preview fixtures as tenant data. Live pages call the Core API using the authenticated bearer token and tenant context. If an endpoint is unavailable or a request fails, show an explicit unavailable/error state and never substitute sample rows.

The endpoint mapping is deliberately conservative: it only maps pages to route candidates present in the API route audit or published API contract. Routes still require contract and staging verification. Pages without a safe route mapping remain unavailable until the Core API implementation is complete.

See the Core API repository's `docs/dashboard/CORE_API_PAGE_INTEGRATION_MATRIX.md` for route candidates, required safeguards, known gaps, and release gates.
