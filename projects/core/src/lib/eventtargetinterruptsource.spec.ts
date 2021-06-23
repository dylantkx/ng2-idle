import { fakeAsync, tick } from '@angular/core/testing';

import { EventTargetInterruptSource } from './eventtargetinterruptsource';

describe('core/EventTargetInterruptSource', () => {
  it('emits onInterrupt event when attached and event is fired', fakeAsync(() => {
    const source = new EventTargetInterruptSource(document.body, 'click');
    spyOn(source.onInterrupt, 'emit').and.callThrough();
    source.attach();

    const expected = new Event('click');
    document.body.dispatchEvent(expected);

    expect(source.onInterrupt.emit).toHaveBeenCalledTimes(1);

    source.detach();
  }));

  it('emits onInterrupt event when multiple events are specified and one is triggered', fakeAsync(() => {
    const source = new EventTargetInterruptSource(document.body, 'click touch');
    spyOn(source.onInterrupt, 'emit').and.callThrough();
    source.attach();

    const expected = new Event('click');
    document.body.dispatchEvent(expected);

    expect(source.onInterrupt.emit).toHaveBeenCalledTimes(1);

    source.detach();
  }));

  it('does not emit onInterrupt event when detached and event is fired', fakeAsync(() => {
    const source = new EventTargetInterruptSource(document.body, 'click');
    spyOn(source.onInterrupt, 'emit').and.callThrough();

    // make it interesting by attaching and detaching
    source.attach();
    source.detach();

    const expected = new Event('click');
    document.body.dispatchEvent(expected);

    expect(source.onInterrupt.emit).not.toHaveBeenCalled();
  }));

  it('does not emit onInterrupt event when ssr is true', fakeAsync(() => {
    const source = new EventTargetInterruptSource(document.body, 'click', {
      ssr: true
    });
    spyOn(source.onInterrupt, 'emit').and.callThrough();

    source.attach();

    const expected = new Event('click');
    document.body.dispatchEvent(expected);

    expect(source.onInterrupt.emit).not.toHaveBeenCalled();

    source.detach();
  }));

  it('does not emit onInterrupt event when target is null', fakeAsync(() => {
    const source = new EventTargetInterruptSource(null, 'click');
    spyOn(source.onInterrupt, 'emit').and.callThrough();

    source.attach();

    const expected = new Event('click');
    document.body.dispatchEvent(expected);

    expect(source.onInterrupt.emit).not.toHaveBeenCalled();

    source.detach();
  }));

  it('should throttle target events using the specified throttleDelay value', fakeAsync(() => {
    const source = new EventTargetInterruptSource(document.body, 'click', 500);
    spyOn(source.onInterrupt, 'emit').and.callThrough();
    source.attach();

    // two immediate calls should get throttled to only 1 call
    document.body.dispatchEvent(new Event('click'));
    expect(source.onInterrupt.emit).toHaveBeenCalledTimes(1);

    document.body.dispatchEvent(new Event('click'));
    expect(source.onInterrupt.emit).toHaveBeenCalledTimes(1);

    // call halfway through the delay should still only yield one call
    tick(250);
    document.body.dispatchEvent(new Event('click'));
    expect(source.onInterrupt.emit).toHaveBeenCalledTimes(1);

    // the throttle delay has now been met, so the next event should result in an additional
    // call
    tick(250);
    document.body.dispatchEvent(new Event('click'));
    expect(source.onInterrupt.emit).toHaveBeenCalledTimes(2);

    // another 500ms has passed so the next event should result in yet another call
    tick(500);
    document.body.dispatchEvent(new Event('click'));
    expect(source.onInterrupt.emit).toHaveBeenCalledTimes(3);

    // need to detach to remove throttle timers or test will fail
    source.detach();
  }));

  it('should not throttle target events if throttleDelay is 0', fakeAsync(() => {
    const source = new EventTargetInterruptSource(document.body, 'click', 0);
    spyOn(source.onInterrupt, 'emit').and.callThrough();
    source.attach();

    document.body.dispatchEvent(new Event('click'));
    expect(source.onInterrupt.emit).toHaveBeenCalledTimes(1);

    document.body.dispatchEvent(new Event('click'));
    expect(source.onInterrupt.emit).toHaveBeenCalledTimes(2);

    tick(250);
    document.body.dispatchEvent(new Event('click'));
    expect(source.onInterrupt.emit).toHaveBeenCalledTimes(3);

    // need to detach to remove throttle timers or test will fail
    source.detach();
  }));

  it('should set default options', () => {
    const target = {};
    const source = new EventTargetInterruptSource(target, 'click');
    const { throttleDelay, passive, ssr } = source.options;

    expect(passive).toBeFalsy();
    expect(throttleDelay).toBe(500);
    expect(ssr).toBeFalsy();
  });

  it('should set passive flag', () => {
    const target = {};
    const source = new EventTargetInterruptSource(target, 'click', {
      passive: true
    });
    const { throttleDelay, passive, ssr: isBrowser } = source.options;

    expect(passive).toBeTruthy();
    expect(throttleDelay).toBe(500);
    expect(isBrowser).toBeFalsy();
  });

  it('should set throttleDelay', () => {
    const target = {};
    const source = new EventTargetInterruptSource(target, 'click', {
      throttleDelay: 1000
    });
    const { throttleDelay, passive, ssr } = source.options;

    expect(passive).toBeFalsy();
    expect(throttleDelay).toBe(1000);
    expect(ssr).toBeFalsy();
  });

  it('should set all options', () => {
    const target = {};
    const source = new EventTargetInterruptSource(target, 'click', {
      passive: true,
      ssr: true,
      throttleDelay: 1000
    });
    const { throttleDelay, passive, ssr } = source.options;

    expect(passive).toBeTruthy();
    expect(throttleDelay).toBe(1000);
    expect(ssr).toBeTruthy();
  });
});
