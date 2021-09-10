import { HomePage } from './app.po';

describe('duff-and-phelps.famis.ui App', () => {
  let page: HomePage;

  beforeEach(() => {
    page = new HomePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Hello, world!');
  });
});
