import { message } from './message';

export function label(name: string): HTMLElement {
  if (name === '') {
    return <span>Anonymous</span>;
  }
  return <span>{message(name)}</span>;
}
