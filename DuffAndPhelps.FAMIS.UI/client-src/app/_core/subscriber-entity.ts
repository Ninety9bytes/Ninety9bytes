import { first, filter, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { OnDestroy } from '@angular/core';

type SubscribeFunction<TIn, TOut> = (data: TIn) => TOut|void;

export class Subscriber {
    protected subscribe<TIn, TOut>(
        observable: Observable<TIn>,
        work: SubscribeFunction<TIn, TOut| Observable<TOut>>
    ): Observable<TOut> {
        const result = new Subject<TOut>();
        observable.subscribe((input: TIn) => {
            setTimeout(() => { // Guarantee async
                const output = work(input);
                if (output instanceof Observable) {
                    output.subscribe((outputValue: TOut) => {
                        result.next(outputValue);
                        result.complete();
                    });
                } else {
                    if (output) {
                        result.next(output);
                        result.complete();
                    } else {
                        result.next();
                        result.complete();
                    }
                }
            });
        });
        return result;
    }

    protected subscribeDefined<TIn, TOut>(
        observable: Observable<TIn | undefined>,
        work: SubscribeFunction<TIn, TOut| Observable<TOut>>
    ): Observable<TOut> {
        const defined = this.getDefined(observable);

        return this.subscribe(defined, work);
    }

    protected subscribeDefinedOnce<TIn, TOut>(
        observable: Observable<TIn | undefined>,
        work: SubscribeFunction<TIn, TOut| Observable<TOut>>
    ): Observable<TOut> {
        const firstDefined = this.getDefined(observable).pipe(first());

        return this.subscribe(firstDefined, work);
    }

    protected getDefined<TIn>(observable: Observable<TIn | undefined>): Observable<TIn> {
        return <Observable<TIn>>observable.pipe(filter((item: TIn | undefined) => item !== undefined));
    }
}

export class SubscriberEntity extends Subscriber implements OnDestroy {
    protected destroyed = new Subject();

    public ngOnDestroy(): void {
        this.destroyed.next();
    }

    protected subscribe<TIn, TOut>(
        observable: Observable<TIn>,
        work: SubscribeFunction<TIn, TOut| Observable<TOut>>
    ): Observable<TOut> {
        const untilDestroyed = observable.pipe(takeUntil(this.destroyed));

        return super.subscribe(untilDestroyed, work);
    }

    protected subscribeDefined<TIn, TOut>(
        observable: Observable<TIn | undefined>,
        work: SubscribeFunction<TIn, TOut| Observable<TOut>>
    ): Observable<TOut> {
        const definedUntilDestroyed = this.getDefined(observable).pipe(takeUntil(this.destroyed));

        return this.subscribe(definedUntilDestroyed, work);
    }

    protected subscribeDefinedOnce<TIn, TOut>(
        observable: Observable<TIn | undefined>,
        work: SubscribeFunction<TIn, TOut| Observable<TOut>>
    ): Observable<TOut> {
        const firstDefinedUntilDestroyed = this.getDefined(observable).pipe(takeUntil(this.destroyed)).pipe(first());

        return this.subscribe(firstDefinedUntilDestroyed, work);
    }
}
