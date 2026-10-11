import { dev } from '$app/environment';

export function log(msg: unknown) {
  if (dev) {
    console.log(msg);
  }
}
