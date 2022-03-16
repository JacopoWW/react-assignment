import React, { ChangeEvent, useEffect } from "react";
import { Org, Member, Controller } from "../dataService";
import { WiredButton, WiredCard, WiredCheckBox } from "react-wired-elements";
import _ from "lodash";

export interface MemberColumn {
  label: string;
  key: keyof Member;
  className?: string;
  type?: HTMLInputElement["type"];
}

const MEMBER_COLUMNS: MemberColumn[] = [
  { label: "user name", key: "name", className: "w-40 pl-4" },
  { label: "age", key: "age", className: "w-40 pl-4" },
  { label: "activated", key: "status", className: "w-20", type: "checkbox" },
  {
    label: "representation",
    key: "representation",
    className: "w-[7rem]",
    type: "checkbox",
  },
];

export const OrgCard: React.FC<{
  data: Org;
  getMember: Controller['findOrgMember'];
  getSubOrg: Controller['findSubOrg'];
  addMember: Controller['addMember'];
}> = ({
  data,
  getMember,
  getSubOrg,
  addMember,
}) => {
  console.log(data, "注意这里");
  const [expand, setExpand] = React.useState<boolean>(false);
  const [members, setMember] = React.useState<Member[]>(getMember(data));

  const input = React.createRef<HTMLInputElement>();
  
  useEffect(() => {
    input.current?.addEventListener("input", (e) => {
      console.log("输入了", input.current?.value);
    });
  }, []);

  const subOrgs = getSubOrg(data);

  return (
    <WiredCard className="w-full pb-4" elevation={1}>
      <h4 className="my-4 pl-4">
        <span
          className="mr-2 font-bold"
        >
          org:
        </span>
        <wired-input placeholder="org-name" value={data.name} ref={input} />
      </h4>
      <section>
        <div className="flex">
          {MEMBER_COLUMNS.map((col) => (
            <div key={col.key} className={col.className}>
              {col.label}
            </div>
          ))}
        </div>
        <div>
          {members.map((member) => (
            <MemberForm key={member.id} data={member} />
          ))}
        </div>
        <div className="flex ml-4 mt-4 gap-4">
            {subOrgs.length > 0 && (
            <WiredButton
              elevation={1}
              onClick={() => setExpand(!expand)}
            >
              {expand ? "-" : "+"}
            </WiredButton>
            )}
            <WiredButton elevation={1} onClick={() => addMember(data)}>add</WiredButton>
        </div>
      </section>
      {/* {expand && child_orgs.length > 0 && (
        <div className="pl-9">
          {child_orgs.map((org) => (
            <OrgCard
              key={org.id}
              data={org}
              findChildOrg={findChildOrg}
              map2Member={map2Member}
              memberChange={memberChange}
              orgChange={orgChange}
            />
          ))}
        </div>
      )} */}
    </WiredCard>
  );
};

export const MemberForm: React.FC<{
  data: Member;
}> = ({
  data,
}) => {
  return (
    <div className="flex">
      {MEMBER_COLUMNS.map((col) => (
        <div key={col.key} className={col.className + ' justify-center flex items-center'}>
          {col.type === "checkbox" ? (
            <wired-checkbox checked={true}></wired-checkbox>
          ) : (
            <wired-input value={_.get(data, col.key)} className="w-full max-w-full h-4 p-0" />
          )}
        </div>
      ))}
    </div>
  );
};
