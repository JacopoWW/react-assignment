import { Data, Controller, Member, Org } from "./dataService";
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
  data.create("org");
  data.create("member");

  expect(data.memberData.length).toBe(memberData.length + 1);
  expect(data.orgData.length).toBe(orgData.length + 1);
  expect(_.last(data.memberData)?.id).toBe(`member-${data.memberData.length}`);
  expect(_.last(data.orgData)?.id).toBe(`org-${data.orgData.length}`);

  // search - put
  const mres = _.sample(memberData) as Member;
  const ores = _.sample(orgData) as Org;
  expect(data.get("member", mres.id)).toEqual(mres);
  expect(data.get("org", ores.id)).toEqual(ores);
  expect(_.map(memberData, "id").map((id) => data.get("member", id))).toEqual(
    memberData
  );
  expect(_.map(orgData, "id").map((id) => data.get("org", id))).toEqual(
    orgData
  );

  const modifyMres = _.clone(mres);
  modifyMres.age = 30;
  modifyMres.name = "xxxx";
  modifyMres.status = "inactivated";
  const modifyOres = _.clone(ores);
  modifyOres.name = "Alibaba";
  expect(data.put("member", modifyMres)).toEqual(modifyMres);
  expect(data.put("org", modifyOres)).toEqual(modifyOres);
});

test("Controller function", () => {
  const data = new Data();
  const ctr = new Controller(data);
  const rndOrg = _.sample(data.orgData) as Org;
  expect(ctr.findOrgMember(rndOrg.id))
    .toEqual(_.map(rndOrg?.members, (id) => data.get("member", id)).filter(Boolean)
    
    );
  const preVLength = data.memberData.length;
  ctr.addMember(rndOrg.id);
  const afterAddedOrg = data.get('org', rndOrg.id);
  expect(data.memberData.length).toBe(preVLength + 1);
  expect(afterAddedOrg?.members).toContain(_.last(data.memberData)?.id);

  const childOrg = data.orgData.filter(o => o.parent === rndOrg.id);
  expect(ctr.findSubOrg(rndOrg.id).length).toBe(childOrg.length);


});
export {};
