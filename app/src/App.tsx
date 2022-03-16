import React, { useMemo } from "react";
import { Data, Member, Controller, Org, AppContext } from "./dataService";
import { OrgCard } from "./components/OrgCard";
import { WiredCard, WiredButton } from "react-wired-elements";
import _ from "lodash";

export function useOrg(data: Data, ctr: Controller): AppContext {
  const [orgState, setOrgState] = React.useState<Org[]>(data.orgData);
  const [memberState, setMemberState] = React.useState<Member[]>(
    data.memberData
  );

  const context: AppContext = {
    // this解构掉后为获取对象上其他method，声明变量
    editMember(memberId, orgId, key, val) {
      const m = data.get('member', memberId);
      if (key === "representation") {
        context.editOrg(orgId, key, memberId);
      } else if (m) {
        const member = _.clone(m);
        member[key] = val;
        data.put("member", member);
        const newMemberData = data.memberData.slice();
        setMemberState(newMemberData);
      }
    },
    editOrg(orgId, key, val) {
      const o = data.get('org', orgId);
      if (o) {
        const org = _.clone(o);
        org[key] = val;
        data.put("org", org);
        const newOrgData = data.orgData.slice();
        setOrgState(newOrgData);
      }
    },
    addMember(orgId) {
      if (ctr.addMember(orgId)) {
        const newMemberData = data.memberData.slice();
        const newOrgState = data.orgData.slice();
        setMemberState(newMemberData);
        setOrgState(newOrgState);
      };
    },
    addOrg() {
      ctr.addOrg();
      const newOrgState = data.orgData.slice();
      setOrgState(newOrgState);
    },
    getMembers(orgId) {
      return ctr.findOrgMember(orgId);
    },
    getSubOrgs(orgId) {
      return ctr.findSubOrg(orgId);
    },
    reset() {
      data.reset();
      setOrgState(data.orgData);
      setMemberState(data.memberData);
      alert('数据已恢复到默认！');
    },
    save() {
      data.save();
      alert('数据已保存！');
    },
    memberState,
    orgState,
  };
  return context;
}

const App: React.FC = () => {
  const config = useMemo(() => {
    const data = new Data();
    const ctr = new Controller(data);
    return {
      data,
      ctr,
    };
  }, []);

  const context = useOrg(config.data, config.ctr);

  return (
    <WiredCard className="w-full p-4" elevation={1}>
      <h4 className="text-5xl my-5">Org Management</h4>
      <div>
        {context.orgState
          .filter((org) => org.parent === null)
          .map((org: Org) => (
            <OrgCard
              getMembers={context.getMembers}
              getSubOrgs={context.getSubOrgs}
              addMember={context.addMember}
              editMember={context.editMember}
              editOrg={context.editOrg}
              org={org}
              key={org.id}
            />
          ))}
      </div>
      <div>
        <WiredButton onClick={context.addOrg} className="text-4xl">Add</WiredButton>
      </div>
      <div className="flex justify-end">
        <WiredButton onClick={context.reset} className="text-2xl mr-4">Cancel</WiredButton>
        <WiredButton onClick={context.save} className="text-2xl">Save</WiredButton>
      </div>
    </WiredCard>
  );
};

export default App;
