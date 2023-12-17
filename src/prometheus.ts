import client, { Counter, Gauge } from "prom-client";

export const registry = new client.Registry();

export async function metrics() {
  const headers = new Headers();
  headers.set("Content-Type", registry.contentType);
  return new Response(await registry.metrics(), { status: 200, headers });
}

export function registerCounter<T extends string = string>(name: string, help: string, labels?: T[]) {
  try {
    registry.registerMetric(new client.Counter({ name, help, labelNames: labels ?? [] }));
    return registry.getSingleMetric(name) as Counter<T>;
  } catch (error) {}
}

export function registerGauge(name: string, help: string) {
  try {
    registry.registerMetric(new client.Gauge({ name, help }));
    return registry.getSingleMetric(name) as Gauge;
  } catch (error) {}
}

export const requests = registerCounter("requests", "Total requests")!;
export const request_errors = registerCounter("request_errors", "Total failed requests")!;
export const operations_inserted = registerCounter("operations_inserted", "Total inscriptions operations inserted");