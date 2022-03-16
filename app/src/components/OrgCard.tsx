import React, { ChangeEvent, useEffect } from "react";
import { Org, Member, AppContext } from "../dataService";
import { WiredButton, WiredCard, WiredCheckBox } from "react-wired-elements";
import _ from "lodash";

export interface MemberColumn {
  label: string;
  key: keyof Member;
  className?: string;
  props?:
    | Partial<HTMLInputElement>
    | ((m: Member, org: Org) => Partial<HTMLInputElement>);
  convertor?: (val: unknown, input: HTMLInputElement) => string | number;
  type?: HTMLInputElement["type"];
}

const MEMBER_COLUMNS: MemberColumn[] = [
  { label: "user name", key: "name", className: "w-40 pl-4" },
  {
    label: "age",
    key: "age",
    className: "w-40 pl-4",
    props: { type: "number" },
    convertor: Number,
  },
  {
    label: "activated",
    key: "status",
    className: "w-20",
    type: "checkbox",
    convertor(val, input) {
      return input.checked ? "activated" : "inactivated";
    },
    props(member, org) {
      const p = {} as Partial<HTMLInputElement>;
      if (member.status === 'activated') {
        p.checked = true;
      }
      return p;
    },
  },
  {
    label: "representation",
    key: "representation",
    className: "w-[7rem]",
    type: "checkbox",
    props(member, org) {
      const p = {} as Partial<HTMLInputElement>;
      if (org.representation === member.id) {
        p.checked = true;
      }
      return p;
    },
  },
];

export const OrgCard: React.FC<{
  org: Org;
  getMembers: AppContext["getMembers"];
  getSubOrgs: AppContext["getSubOrgs"];
  addMember: AppContext["addMember"];
  editMember: AppContext["editMember"];
}> = ({ org, getMembers, getSubOrgs, addMember, editMember }) => {
  const [expand, setExpand] = React.useState<boolean>(false);
  const members = getMembers(org);

  const input = React.createRef<HTMLInputElement>();

  useEffect(() => {
    input.current?.addEventListener("input", (e) => {
      console.log("输入了", input.current?.value);
    });
  }, []);

  const subOrgs = getSubOrgs(org);

  return (
    <WiredCard className="w-full pb-4" elevation={1}>
      <h4 className="my-4 pl-4">
        <span className="mr-2 font-bold">org:</span>
        <wired-input placeholder="org-name" value={org.name} ref={input} />
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
            <MemberForm
              key={member.id}
              member={member}
              org={org}
              onEdit={editMember}
            />
          ))}
        </div>
        <div className="flex ml-4 mt-4 gap-4">
          {subOrgs.length > 0 && (
            <WiredButton elevation={1} onClick={() => setExpand(!expand)}>
              {expand ? "-" : "+"}
            </WiredButton>
          )}
          <WiredButton elevation={1} onClick={() => addMember(org)}>
            add
          </WiredButton>
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
  member: Member;
  org: Org;
  onEdit: AppContext["editMember"];
}> = ({ member, org, onEdit }) => {
  const inputRefs = MEMBER_COLUMNS.map(() =>
    React.createRef<HTMLInputElement>()
  );

  useEffect(() => {
    inputRefs.forEach((ref, idx) => {
      const col = MEMBER_COLUMNS[idx];
      ref.current?.addEventListener("input", (e) => {
        requestAnimationFrame(() => {
            const input = e.target as HTMLInputElement;
            const value = col.convertor
              ? col.convertor(input.value, input)
              : input.value;
            onEdit(member, col.key, value);
        })
      });
    });
  }, []);
  return (
    <div className="flex">
      {MEMBER_COLUMNS.map((col, idx) => {
        const mapProps =
          typeof col.props === "function" ? col.props(member, org) : col.props;
        return (
          <div
            key={col.key}
            className={col.className + " justify-center flex items-center"}
          >
            {col.type === "checkbox" ? (
              <wired-checkbox
                {...mapProps}
                name={col.key}
                ref={inputRefs[idx]}
              ></wired-checkbox>
            ) : (
              <wired-input
                {...mapProps}
                name={col.key}
                ref={inputRefs[idx]}
                value={_.get(member, col.key)}
                className="w-full max-w-full h-4 p-0"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
