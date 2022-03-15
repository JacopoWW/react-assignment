import React from "react";
import { Data, Org, Member } from './dataService';
import { OrgCard } from "./components/OrgCard";
import { WiredCard, WiredButton } from "react-wired-elements";
const App: React.FC = () => {
  const data = new Data();
  const [orgState, setOrgState] = React.useState<Org[]>(data.orgData);
  const [memberState, setMemberState] = React.useState<Member[]>(data.memberData);

  return (
    <WiredCard className="w-full p-4" elevation={1}>
      <h4 className="text-5xl my-5">Org Management</h4>
      <div>
        {orgState
          .filter((org) => org.parent === null)
          .map((org: Org) => (
            <OrgCard
              data={org}
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
