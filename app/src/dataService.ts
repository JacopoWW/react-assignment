import orgData from "./data/orgs.json";
import memberData from "./data/members.json";
import _ from "lodash";

let curOrgDataState = _.cloneDeep(orgData as Org[]);
let curMemberDataState = _.cloneDeep(memberData as Member[]);

export interface Member {
  id: string;
  name: string;
  age?: number;
  status: 'inactivated' | 'activated';
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
    // this.findOrgMember = this.findOrgMember.bind(this);
    // this.findSubOrg = this.findSubOrg.bind(this);
    // this.addMember = this.addMember.bind(this);
  }
  findOrgMember(orgId: string): Member[] {
    const org = this.model.get('org', orgId);
    if (org && org.members && org.members.length > 0) {
      return org.members.map(m => this.model.get('member', m) as Member).filter(Boolean);
    } else {
      return [];
    }
  }
  findSubOrg(orgId: string): Org[] {
    return _.filter(this.model.orgData, ['parent', orgId]);
  }
  addMember(orgId: string): Member | undefined {
    const member = this.model.create('member');
    const o = this.model.get('org', orgId);
    if (o && o.members) {
      o.members = o.members.concat(member.id);
      this.model.put('org', o);
    } else if (o) {
      o.members = [member.id];
      this.model.put('org', o);
    } 
    return member;
  }
  addOrg(): Org {
    return this.model.create('org');
  }
}

export type DataType = "member" | "org";
export class Data {
  orgData: Org[];
  memberData: Member[];
  orgMap: Map<string, Org>;
  memberMap: Map<string, Member>;
  constructor() {
    this.orgData = _.cloneDeep(curOrgDataState);
    this.memberData = _.cloneDeep(curMemberDataState as unknown as Member[]);
    this.orgMap = new Map(this.orgData.map((org) => [org.id, org]));
    this.memberMap = new Map(
      this.memberData.map((member) => [member.id, member])
    );
  }
  create(type: "member"): Member;
  create(type: "org"): Org;
  create(type: DataType): Member | Org {
    if (type === "org") {
      const id = `${type}-${this.orgData.length + 1}`;
      const org = {
        id,
        name: id,
        type: "",
        parent: null,
        representation: "",
      };
      this.orgData.push(org);
      this.orgMap.set(id, org);
      return org;
    } else {
      const id = `${type}-${this.memberData.length + 1}`;
      const member = {
        id,
        name: id,
        status: 'inactivated',
        representation: false,
      } as Member;
      this.memberData.push(member);
      this.memberMap.set(id, member);
      return member;
    }
  }
  put(type: "member", data: Member): Member | undefined;
  put(type: "org", data: Org): Org | undefined;
  put(type: DataType, data: Org | Member): Member | Org | undefined {
    const d = _.clone(data);
    if (type === 'member') {
      const idx = _.findIndex(this.memberData, ['id', d.id]);
      this.memberData[idx] = d as Member;
      this.memberMap.set(d.id, d as Member);
      return d;
    } else {
      const idx = _.findIndex(this.orgData, ['id', d.id]);
      this.orgData[idx] = d as Org;
      this.orgMap.set(d.id, d as Org);
      return d;
    }
  }
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

  reset() {
    this.orgData = _.cloneDeep(curOrgDataState);
    this.memberData = _.cloneDeep(curMemberDataState as unknown as Member[]);
    this.orgMap = new Map(this.orgData.map((org) => [org.id, org]));
    this.memberMap = new Map(
      this.memberData.map((member) => [member.id, member])
    );
  }

  save() {
    curOrgDataState = _.cloneDeep(this.orgData);
    curMemberDataState = _.cloneDeep(this.memberData);
  }
}


export interface AppContext {
  memberState: Member[];
  orgState: Org[];
  editMember: <T extends keyof Member>(memberId: string, orgId: string, key:T, val: Member[T]) => void;
  editOrg: <T extends keyof Org>(orgId: string, key: T, val: Org[T]) => void;
  addMember: (org: string) => void;
  addOrg: () => void;
  getMembers: (orgId: string) => Member[];
  getSubOrgs: (orgId: string) => Org[];
  reset: () => void;
  save: () => void;
}
