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

export enum DataType {
  MEMBER="member",
  ORG="org",
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
    const org = this.model.get(DataType.ORG, orgId);
    if (org && org.members && org.members.length > 0) {
      return org.members.map(m => this.model.get(DataType.MEMBER, m) as Member).filter(Boolean);
    } else {
      return [];
    }
  }
  findSubOrg(orgId: string): Org[] {
    return _.filter(this.model.orgData, ['parent', orgId]);
  }
  addMember(orgId: string): Member | undefined {
    const member = this.model.create(DataType.MEMBER);
    const o = this.model.get(DataType.ORG, orgId);
    if (o && o.members) {
      o.members = o.members.concat(member.id);
      this.model.put(DataType.ORG, o);
    } else if (o) {
      o.members = [member.id];
      this.model.put(DataType.ORG, o);
    } 
    return member;
  }
  addOrg(): Org {
    return this.model.create(DataType.ORG);
  }
}

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
  create(type: DataType.MEMBER): Member;
  create(type: DataType.ORG): Org;
  create(type: DataType): Member | Org {
    if (type === DataType.ORG) {
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
  put(type: DataType.MEMBER, data: Member): Member | undefined;
  put(type: DataType.ORG, data: Org): Org | undefined;
  put(type: DataType, data: Org | Member): Member | Org | undefined {
    const d = _.clone(data);
    if (type === DataType.MEMBER) {
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
  get(type: DataType.MEMBER, id: string): Member | undefined;
  get(type: DataType.ORG, id: string): Org | undefined;
  get(type: DataType, id: string): Member | Org | undefined {
    if (type === DataType.MEMBER) {
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
  editOrg: <T extends keyof Org>(orgId: string, key: T, val: Org[T]) => Org | void;
  addMember: (org: string) => void;
  addOrg: () => Org;
  getMembers: (orgId: string) => Member[];
  getSubOrgs: (orgId: string) => Org[];
  reset: () => void;
  save: () => void;
}
