export const sampleData = {
  groupId: '272c8bb4-ee02-473c-9a96-20c5dd31818d',

  buildings: [
    {
      name: 'Office 1',
      id: 'ddbb40ad-1f8e-4664-ba42-800c108b38da'
    },
    {
      name: 'Office 2',
      id: '813e38c3-8c31-4ee8-aed1-594ccb96aed7'
    },
    {
      name: 'Office 3',
      id: 'a4375c61-301f-415a-9840-37f26dcbfa42'
    }
  ],

  members: [

    {
      id: '1',
      name: 'Member 1',

      sites: [
      {
        site: '1',
        buildings: [
          {
            name: 'Headquarters Office',
            id: 'd4c72c85-fb2d-4263-9bc0-22ba5d04b5ae'
          },
          {
            name: 'Sales Office',
            id: '7cd1f899-07ae-49a2-87c1-d6841682d12a'
          },
          {
            name: 'Warehouse',
            id: '3e582cc2-0f95-4c8d-8a9a-5248ba3427e8'
          }
        ]
      },
      {
        site: '2',
        buildings: [
          {
            name: 'Administration',
            id: 'd4c72c85-fb2d-4263-9bc0-22ba5d04b5ae'
          },
          {
            name: 'Production Floor',
            id: '7cd1f899-07ae-49a2-87c1-d6841682d12a'
          },
          {
            name: 'Warehouse B',
            id: '3e582cc2-0f95-4c8d-8a9a-5248ba3427e8'
          }
        ]
      }]

    },
  ]
};
