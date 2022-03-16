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

export class Controller {
  model: Data;
  constructor(model: Data) {
    this.model = model;
    this.findOrgMember = this.findOrgMember.bind(this);
    this.findSubOrg = this.findSubOrg.bind(this);
    this.addMember = this.addMember.bind(this);
  }
  findOrgMember(org: Org): Member[] {
    const members = org.members;
    if (members && members.length > 0) {
      return members.map(m => this.model.get('member', m) as Member).filter(Boolean);
    } else {
      return [];
    }
  }
  findSubOrg(org: Org): Org[] {
    return _.filter(this.model.orgData, ['parent', org.id]);
  }
  addMember(org: Org): Member {
    const member = this.model.create('member');
    if (org.members) {
      org.members.push(member.id);
    } else {
      org.members = [member.id];
    }
    return member;
  }
}

export type DataType = "member" | "org";

export class Data {
  orgData: Org[];
  memberData: Member[];
  orgMap: Map<string, Org>;
  memberMap: Map<string, Member>;
  constructor() {
    this.orgData = _.cloneDeep(orgData);
    this.memberData = _.cloneDeep(memberData);
    this.orgMap = new Map(this.orgData.map((org) => [org.id, org]));
    this.memberMap = new Map(
      this.memberData.map((member) => [member.id, member])
    );
  }
  create(type: "member"): Member;
  create(type: "org"): Org;
  create(type: DataType): Member | Org {
    if (type === "org") {
      const id = `${type}-${this.orgData.length}`;
      const org = {
        id,
        name: "",
        type: "",
        parent: "",
        representation: "",
      };
      this.orgData.push(org);
      return org;
    } else {
      const id = `${type}-${this.memberData.length}`;
      const member = {
        id,
        name: "",
        status: "",
        representation: false,
      };
      this.memberData.push(member);
      return member;
    }
  }
  put() {}
  delete() {}
  get(type: "member", id: string): Member | undefined;
  get(type: "org", id: string): Org | undefined;
  get(type: DataType, id: string): Member | Org | undefined {
    if (type === "member") {
      return this.memberMap.get(id);
    } else {
      return this.orgMap.get(id);
    }
  }
  save() {}
}
