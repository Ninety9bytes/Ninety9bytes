import { trigger, state, animate, transition, style } from '@angular/animations';

export const fadeInOutAnimation =
trigger(
  'fadeInOutAnimation',
  [
    transition(
      ':enter',
      [
        style({opacity: 0}),
        animate('.8s ease-in',
        style({opacity: 1}))
      ]
    ),
    transition(
      ':leave',
      [
        style({opacity: 1}),
        animate('.2s ease-in',
        style({opacity: 0}))
      ]
    )
  ]
);
