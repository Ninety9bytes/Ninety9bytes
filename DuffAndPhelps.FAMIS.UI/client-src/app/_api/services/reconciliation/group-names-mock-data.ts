import { InMemoryDbService } from 'angular-in-memory-web-api';

export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const groups =
    [
        {
          "Id": 1,
          "GroupName": "Washington Redskins"
        },
        {
          "Id": 2,
          "GroupName": "Pittsburgh Steelers"
        },
        {
          "Id": 3,
          "GroupName": "Denver Broncos"
        },
        {
          "Id": 4,
          "GroupName": "New York Jets"
        },
        {
          "Id": 5,
          "GroupName": "San Diego Chargers"
        },
        {
          "Id": 6,
          "GroupName": "St Louis Rams"
        },
        {
          "Id": 7,
          "GroupName": "San Francisco 49ers"
        },
        {
          "Id": 8,
          "GroupName": "Chicago Bears"
        },
        {
          "Id": 9,
          "GroupName": "Dallas Cowboys"
        },
        {
          "Id": 10,
          "GroupName": "Green Bay Packers"
        },
        {
          "Id": 11,
          "GroupName": "New England Patriots"
        },
        {
          "Id": 12,
          "GroupName": "Atlanta Falcons"
        },
        {
          "Id": 13,
          "GroupName": "New Orleans Saints"
        },
        {
          "Id": 14,
          "GroupName": "Tennessee Titans"
        },
        {
          "Id": 15,
          "GroupName": "Baltimore Ravens"
        },
        {
          "Id": 16,
          "GroupName": "Indianapolis Colts"
        },
        {
          "Id": 17,
          "GroupName": "Houston Texans"
        },
        {
          "Id": 18,
          "GroupName": "New York Giants"
        },
        {
          "Id": 19,
          "GroupName": "Buffalo Bills"
        },
        {
          "Id": 20,
          "GroupName": "Cincinnati Bengals"
        },
        {
          "Id": 21,
          "GroupName": "Arizona Cardinals"
        },
        {
          "Id": 22,
          "GroupName": "Detroit Lions"
        },
        {
          "Id": 23,
          "GroupName": "Tampa Bay Bucs"
        },
        {
          "Id": 24,
          "GroupName": "Cleveland Browns"
        },
        {
          "Id": 25,
          "GroupName": "Miami Dolphins"
        },
        {
          "Id": 26,
          "GroupName": "Carolina Panthers"
        },
        {
          "Id": 27,
          "GroupName": "Philadelphia Eagles"
        },
        {
          "Id": 28,
          "GroupName": "Oakland Raiders"
        },
        {
          "Id": 29,
          "GroupName": "Minnesota Vikings"
        },
        {
          "Id": 30,
          "GroupName": "Jacksonville Jaguars"
        },
        {
          "Id": 31,
          "GroupName": "Seattle Seahawks"
        },
        {
          "Id": 32,
          "GroupName": "Kansas City Chiefs"
        }
      ];
    return groups;
  }
}
