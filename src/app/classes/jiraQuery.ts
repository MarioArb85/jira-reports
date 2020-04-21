export class JiraQuery {
  id: number;
  name: string;
  query: string;

  constructor(id: number, name: string, query: string) {
    this.id = id;
    this.name = name;
    this.query = query;
  }
}