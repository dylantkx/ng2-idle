import { fakeAsync } from '@angular/core/testing';

import { WindowInterruptSource } from './windowinterruptsource';

describe('core/WindowInterruptSource', () => {
  it('emits onInterrupt event when attached and event is fired', fakeAsync(() => {
    const source = new WindowInterruptSource('focus');
    spyOn(source.onInterrupt, 'emit').and.callThrough();
    source.attach();

    const expected = new Event('focus');
    window.dispatchEvent(expected);

    expect(source.onInterrupt.emit).toHaveBeenCalledTimes(1);

    source.detach();
  }));

  it('does not emit onInterrupt event when detached and event is fired', fakeAsync(() => {
    const source = new WindowInterruptSource('focus');
    spyOn(source.onInterrupt, 'emit').and.callThrough();

    // make it interesting by attaching and detaching
    source.attach();
    source.detach();

    const expected = new Event('focus');
    window.dispatchEvent(expected);

    expect(source.onInterrupt.emit).not.toHaveBeenCalled();
  }));

  it('does not emit onInterrupt event when ssr is true', fakeAsync(() => {
    const source = new WindowInterruptSource('focus', { ssr: true });
    spyOn(source.onInterrupt, 'emit').and.callThrough();

    source.attach();

    const expected = new Event('focus');
    window.dispatchEvent(expected);

    expect(source.onInterrupt.emit).not.toHaveBeenCalled();

    source.detach();
  }));
});
