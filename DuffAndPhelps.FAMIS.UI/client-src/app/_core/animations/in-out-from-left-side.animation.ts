import { trigger, state, animate, transition, style } from '@angular/animations';

export const inOutFromLeftSideAnimation =
trigger(
  'inOutFromLeftSideAnimation',
  [
    transition(
      ':enter',
      [
        style({ opacity: .75 }),
        animate('.5s ease-in',
        style({ opacity: 1, left: '0px'}))
      ]
    ),
    transition(
      ':leave',
      [
        style({ opacity: 1 }),
        animate('1s ease-in',
        style({ opacity: 0, left: '-400%' }))
      ]
    )
  ]
);
