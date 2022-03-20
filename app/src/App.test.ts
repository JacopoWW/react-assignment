import { Data, Controller, Member, Org, DataType } from "./dataService";
import memberData from "./data/members.json";
import orgData from "./data/orgs.json";
import _ from "lodash";

test("DataService init Data", () => {
  const data = new Data();

  expect(data.memberData).toEqual(memberData);
  expect(data.orgData).toEqual(orgData);
});

test("DataService crud", () => {
  const data = new Data();
  data.create(DataType.ORG);
  data.create(DataType.MEMBER);

  expect(data.memberData.length).toBe(memberData.length + 1);
  expect(data.orgData.length).toBe(orgData.length + 1);
  expect(_.last(data.memberData)?.id).toBe(`MEMBER-${data.memberData.length}`);
  expect(_.last(data.orgData)?.id).toBe(`ORG-${data.orgData.length}`);

  // search - put
  const mres = _.sample(memberData) as Member;
  const ores = _.sample(orgData) as Org;
  expect(data.get(DataType.MEMBER, mres.id)).toEqual(mres);
  expect(data.get(DataType.ORG, ores.id)).toEqual(ores);
  expect(_.map(memberData, "id").map((id) => data.get(DataType.MEMBER, id))).toEqual(
    memberData
  );
  expect(_.map(orgData, "id").map((id) => data.get(DataType.ORG, id))).toEqual(
    orgData
  );

  const modifyMres = _.clone(mres);
  modifyMres.age = 30;
  modifyMres.name = "xxxx";
  modifyMres.status = "inactivated";
  const modifyOres = _.clone(ores);
  modifyOres.name = "Alibaba";
  expect(data.put(DataType.MEMBER, modifyMres)).toEqual(modifyMres);
  expect(data.put(DataType.ORG, modifyOres)).toEqual(modifyOres);
});

test("Controller function", () => {
  const data = new Data();
  const ctr = new Controller(data);
  const rndOrg = _.sample(data.orgData) as Org;
  expect(ctr.findOrgMember(rndOrg.id))
    .toEqual(_.map(rndOrg?.members, (id) => data.get(DataType.MEMBER, id)).filter(Boolean)
    
    );
  const preVLength = data.memberData.length;
  ctr.addMember(rndOrg.id);
  const afterAddedOrg = data.get(DataType.ORG, rndOrg.id);
  expect(data.memberData.length).toBe(preVLength + 1);
  expect(afterAddedOrg?.members).toContain(_.last(data.memberData)?.id);

  const childOrg = data.orgData.filter(o => o.parent === rndOrg.id);
  expect(ctr.findSubOrg(rndOrg.id).length).toBe(childOrg.length);


});
export {};
