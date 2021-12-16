import React from 'react';
import org_data from "./data/orgs.json";
import member_data from './data/members.json';
import { OrgCard, OrgInterface, MemberInterface } from './components/OrgCard';
import { WiredCard, WiredButton } from 'react-wired-elements';

const App: React.FC = () => {
  const [org_state, setOrgState] = React.useState(org_data as OrgInterface[]);
  const [member_state, setMemberState] = React.useState(member_data);
  const membersMap: Map<string, MemberInterface> = new Map(member_state.map((member: MemberInterface) => [member.id, member]));
  const orgsMap: Map<string, OrgInterface> = new Map(org_state.map((org: OrgInterface) => [org.id, org]))
  const findChildOrg = (parent: OrgInterface) => org_state.filter(org => org.parent === parent.id);
  const map2Member = (members: string[]) => members.map(membersMap.get.bind(membersMap)).filter(Boolean) as MemberInterface[];
  const memberChange = (member: MemberInterface) => {
    const id = member.id;
    const idx = member_state.findIndex(m => m.id === id);
    const new_member_state = [...member_state];
    new_member_state[idx] = member;
    membersMap.set(id, member);
    setMemberState(new_member_state);
  }
  const orgChange = (org: OrgInterface) => {
    const id = org.id;
    const idx = org_state.findIndex(m => m.id === id);
    console.log(org_state[idx].name, org.name)
    const new_org_state = [...org_state];
    new_org_state[idx] = org;
    orgsMap.set(id, org);
    setOrgState(new_org_state);
  }


  return (
    <WiredCard className='full' elevation={1}>
      <h1>Org Management</h1>
      <div className='w-full'>
        {org_state.filter(org => org.parent === null).map((org: OrgInterface) => <OrgCard data={org} findChildOrg={findChildOrg} map2Member={map2Member} key={org.id} memberChange={memberChange} orgChange={orgChange} />)}
      </div>
      <div>
        <WiredButton onClick={() => {
          const copy = [...org_state];
          copy.push({
            id: String(Date.now()),
            name: '',
            type: "organization",
            representation: "",
            parent: null,
            members: [],
          })
          setOrgState(copy);
        }} className='text-4xl'> + </WiredButton> 
      </div>
      <div className='flex justify-end'>
        <WiredButton className='text-2xl mr-4' onClick={() => {
          setMemberState(member_data);
          setOrgState(org_state);
        }}>Cancel</WiredButton>
        <WiredButton onClick={() => {
          console.log('当前值为', member_state, org_state)
        }} className='text-2xl'>Save</WiredButton> 
      </div>
    </WiredCard>
  );
}

export default App;
