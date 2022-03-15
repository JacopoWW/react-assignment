import React, { ChangeEvent, useEffect } from "react";
import { Org, Member } from "../dataService";
import { WiredButton, WiredCard, WiredCheckBox } from "react-wired-elements";

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
  //   findChildOrg: (org: Org) => Org[];
  //   map2Member: (members: string[]) => Member[];
  //   memberChange: (member: Member) => void;
  //   orgChange: (org: Org) => void;
}> = ({
  data,
  // findChildOrg,
  // map2Member,
  // memberChange,
  // orgChange
}) => {
  console.log(data, "注意这里");
  const [expand, setExpand] = React.useState<boolean>(false);
  const input = React.createRef<HTMLInputElement>();
  useEffect(() => {
    input.current?.addEventListener("input", (e) => {
      console.log("输入了", input.current?.value);
    });
  }, []);

  return (
    <WiredCard className="w-full pb-4" elevation={1}>
      <h4 className="my-4 pl-4">
        <span
          onClick={() => console.log(input.current)}
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
          {data?.members?.map((member) => (
            <MemberForm key={member} />
          ))}
        </div>
        {/* {child_orgs.length > 0 && (
          <WiredButton elevation={1} onClick={() => setExpand(!expand_child)}>
            {expand_child ? "-" : "+"}
          </WiredButton>
        )} */}
        <WiredButton className="ml-4 mt-4" elevation={1}>add</WiredButton>
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
  //   data: Member;
  //   memberChange: (member: Member) => void;
}> = (
  {
    /*memberChange*/
  }
) => {
  return (
    <div className="flex">
      {MEMBER_COLUMNS.map((col) => (
        <div key={col.key} className={col.className + ' justify-center flex items-center'}>
          {col.type === "checkbox" ? (
            <wired-checkbox checked={true}></wired-checkbox>
          ) : (
            <wired-input className="w-full max-w-full h-4 p-0" />
          )}
        </div>
      ))}
    </div>
  );
};
