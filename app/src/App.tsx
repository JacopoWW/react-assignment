import React from "react";
import orgData from "./data/orgs.json";
import memberData from "./data/members.json";
import { OrgCard, Org, Member } from "./components/OrgCard";
import { WiredCard, WiredButton } from "react-wired-elements";

const App: React.FC = () => {
  const [orgState, setOrgState] = React.useState<Org[]>(orgData);
  const [memberState, setMemberState] = React.useState<Member[]>(memberData);
  
  const membersMap: Map<string, Member> = new Map(
    memberState.map((member) => [member.id, member])
  );
  const orgsMap: Map<string, Org> = new Map(
    orgState.map((org) => [org.id, org])
  );

  const findChildOrg = (parent: Org) =>
    orgState.filter((org) => org.parent === parent.id);

  const map2Member = (members: string[]) =>
    members.map(membersMap.get.bind(membersMap)).filter(Boolean) as Member[];

  const memberChange = (member: Member) => {
    const id = member.id;
    const idx = memberState.findIndex((m) => m.id === id);
    const new_member_state = [...memberState];
    new_member_state[idx] = member;
    membersMap.set(id, member);
    setMemberState(new_member_state);
  };

  const orgChange = (org: Org) => {
    const id = org.id;
    const idx = orgState.findIndex((m) => m.id === id);
    console.log(orgState[idx].name, org.name);
    const new_org_state = [...orgState];
    new_org_state[idx] = org;
    orgsMap.set(id, org);
    setOrgState(new_org_state);
  };

  return (
    <WiredCard className="w-full p-4" elevation={1}>
      <h4 className="text-5xl my-5">Org Management</h4>
      <div>
        {orgState
          .filter((org) => org.parent === null)
          .map((org: Org) => (
            <OrgCard
              data={org}
              findChildOrg={findChildOrg}
              map2Member={map2Member}
              key={org.id}
              memberChange={memberChange}
              orgChange={orgChange}
            />
          ))}
      </div>
      <div>
        <WiredButton
          onClick={() => {
            const copy = [...orgState];
            copy.push({
              id: String(Date.now()),
              name: "",
              type: "organization",
              representation: "",
              parent: null,
              members: [],
            });
            setOrgState(copy);
          }}
          className="text-4xl"
        >Add
        </WiredButton>
      </div>
      <div className="flex justify-end">
        <WiredButton
          className="text-2xl mr-4"
          onClick={() => {
            setMemberState(memberData);
            setOrgState(orgState);
          }}
        >
          Cancel
        </WiredButton>
        <WiredButton
          onClick={() => {
            console.log("当前值为", memberState, orgState);
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
