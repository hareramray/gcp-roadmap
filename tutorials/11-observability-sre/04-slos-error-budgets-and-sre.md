# SLOs, error budgets, and practical SRE

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Define a measurable service objective, calculate an error budget, and use burn rate to make an operational decision. This is a local mathematics and design lab in Cloud Shell Bash with Python 3. Keep `PROJECT_ID`, `REGION`, and `ZONE` from the setup guide for documenting the service scope. No Google Cloud API or IAM role is required for the calculation. Implementing the resulting SLO in Cloud Monitoring later requires suitable telemetry, the Monitoring API, and service/SLO configuration permissions.

## Start from the user's experience

A service-level indicator (SLI) is a measurement, a service-level objective (SLO) is a target over a defined window, and a service-level agreement (SLA) is a contractual commitment with specified terms. They are related but not interchangeable. An availability SLI might count successful checkout requests divided by valid checkout requests. A latency SLI might count requests completed within 500 ms. Define valid events, good events, measurement location, window, and exclusions before choosing the target. [Implementing SLOs](https://sre.google/workbook/implementing-slos/).

Measure where user impact becomes visible. An internal health check can succeed while the public endpoint fails. A server-side metric may miss clients that could not reach the service. Excluding all dependency failures can produce an attractive number while customers still cannot purchase. Separate objectives when user journeys have substantially different behavior; a bulk export and an interactive checkout need not share one latency threshold.

The error budget is the allowed bad fraction, `1 - target`, applied to the defined population or window. Request-based availability budgets count bad events; time-based budgets count bad time. Do not convert requests into minutes without a justified traffic model. An error-budget policy defines what happens when reliability is being consumed too quickly: for example restricting risky releases while permitting urgent reliability fixes.

Burn rate is observed bad fraction divided by allowed bad fraction. A burn rate of 10 means the current error rate consumes budget ten times as fast as the target permits. Multi-window alerts combine a longer window for significance and a shorter window for confirmation. Page for urgent user impact; create a ticket for slower risks that can wait. [Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/).

## Lab: calculate and act

1. Write the contract for a fictional orders endpoint: all valid production checkout attempts, measured at the serving edge, 99.9% successful over a rolling 30-day window. Define success as the approved business result, not merely HTTP 200. Document how duplicate retries and expected client validation errors are handled.

2. Calculate a request budget:

   ```bash
   python3 - <<'PY'
   from decimal import Decimal
   total=Decimal('10000000')
   target=Decimal('0.999')
   bad=Decimal('3500')
   allowed=total*(1-target)
   print('allowed bad requests:', allowed)
   print('budget consumed percent:', 100*bad/allowed)
   print('budget remaining requests:', allowed-bad)
   print('burn rate at 1 percent errors:', Decimal('0.01')/(1-target))
   PY
   ```

   Expected results: 10,000 allowed bad requests, 35% consumed, 6,500 remaining, and burn rate 10 for a 1% observed error rate. A rolling window changes as old observations leave; remaining budget is not a permanent account balance.

3. Evaluate a hypothetical sustained burn rate of 10. Over a 30-day time-equivalent window with constant traffic, it would consume a full budget in three days. State the constant-traffic assumption. A high-volume business period can consume a request budget faster than quiet hours.

4. Draft a policy with four parts: target and owner, fast-burn paging, slow-burn ticketing, and release behavior after exhaustion. Include an exception procedure for a security patch and a requirement to record why the exception improves overall risk.

5. Identify three sources of toil: manually restarting a recurring failed worker, reviewing duplicate alerts, and repairing inconsistent configuration. Estimate frequency × time per occurrence. Choose a small automation that removes the cause or repeated action and specify how its own failures become visible.

6. Conduct a review where product requests a stricter target. List expected engineering investment, redundancy, operational staffing, and cost. A higher target is a product tradeoff; it should not be chosen simply because additional nines look impressive.

## Verification, cleanup, cost, and exercises

Acceptance requires an unambiguous SLI specification and a reproducible budget calculation. Check denominators, units, time zones, exclusions, missing telemetry, and partial rollouts. A service-provider SLA is not an end-to-end application SLO, especially when dependencies and application code add failure modes. [Google SRE book](https://sre.google/sre-book/table-of-contents/).

No cloud resources were created. Keep the policy as a portfolio artifact and delete any temporary calculation files. Real monitoring and additional redundancy can cost money. Extend the exercise to a latency SLO and a low-traffic service, then explain how a synthetic probe and request-based measurement complement each other without being averaged into a misleading single percentage.

