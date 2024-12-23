import { dev } from '$app/environment';

export function log(msg: any) {
    if (dev) {
        console.log(msg);
    }
}
