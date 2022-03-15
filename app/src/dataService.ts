import orgData from "./data/orgs.json";
import memberData from "./data/members.json";
import _ from "lodash";

export interface Member {
  id: string;
  name: string;
  age?: number;
  status: string;
  representation?: boolean;
}

export interface Org {
  name: string;
  id: string;
  type: string;
  parent: null | string;
  representation: string;
  members?: string[] | null;
}

export class Data {
  orgData: Org[];
  memberData: Member[];
  orgMap: Map<string, Org>;
  memberMap: Map<string, Member>;
  constructor() {
    this.orgData = _.cloneDeep(orgData);
    this.memberData = _.cloneDeep(memberData);
    this.orgMap = new Map(this.orgData.map((org) => [org.id, org]));
    this.memberMap = new Map(this.memberData.map((member) => [member.id, member]));
  }
  create(type: 'member' | 'org') {
    if (type === 'member') {
      const id = `member-${this.memberData.length}`;
      return {
        id,
        name: '',
      } as Org
    } else if (type === 'org') {
      const id = `org-${this.orgData.length}`;
      return {
        id,
        name: ''
      };
    }
  }
  put() {

  }
  add(type: 'member' | 'org', org?: Org) {

  }
  delete() {

  }
  get() {}
  find() {

  }
}
