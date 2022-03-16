import React, { useMemo } from "react";
import { Data, Member, Controller, Org, AppContext } from './dataService';
import { OrgCard } from "./components/OrgCard";
import { WiredCard, WiredButton } from "react-wired-elements";
import _ from "lodash";

export function useOrg(data: Data, ctr: Controller): AppContext {
  const [orgState, setOrgState] = React.useState<Org[]>(data.orgData);
  const [memberState, setMemberState] = React.useState<Member[]>(data.memberData);
  
  return {
    editMember(member, key, val) {
      const m = _.clone(member);
      m[key] = val;
      data.put('member', m);
      const newMemberData = data.memberData.slice();
      setMemberState(newMemberData);
      console.log('修改后的edit', _.find(newMemberData, ['id', m.id]))
    },
    editOrg() {

    },
    addMember(org) {
      ctr.addMember(org);
      const newMemberData = data.memberData.slice();
      const newOrgState = data.orgData.slice();
      setMemberState(newMemberData);
      setOrgState(newOrgState);
    },
    getMembers(org) {
      return ctr.findOrgMember(org);
    },
    getSubOrgs(org) {
      return ctr.findSubOrg(org);
    },
    memberState,
    orgState,
  }
}

const App: React.FC = () => {
  const config = useMemo(() => {
    const data = new Data();
    const ctr = new Controller(data);
    return {
      data,
      ctr,
    };
  }, [])
  
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
              org={org}
              key={org.id}
            />
          ))}
      </div>
      <div>
        <WiredButton
          onClick={() => {
          }}
          className="text-4xl"
        >Add
        </WiredButton>
      </div>
      <div className="flex justify-end">
        <WiredButton
          className="text-2xl mr-4"
        >
          Cancel
        </WiredButton>
        <WiredButton
          onClick={() => {

          }}
          className="text-2xl"
        >
          Save
        </WiredButton>
      </div>
    </WiredCard>
  );
};

export default App;
