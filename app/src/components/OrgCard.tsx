import React, { useEffect, useMemo } from "react";
import { Org, Member, AppContext } from "../dataService";
import { WiredButton, WiredCard } from "react-wired-elements";
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
  {
    label: "user name",
    key: "name",
    props(member) {
      const p = {
        value: _.get(member, this.key, ""),
      } as Partial<HTMLInputElement>;
      return p;
    },
    className: "w-40 pl-4",
  },
  {
    label: "age",
    key: "age",
    className: "w-40 pl-4",
    props(member) {
      const p = {
        type: "number",
        min: '0',
        value: _.get(member, this.key, ""),
      } as Partial<HTMLInputElement>;
      return p;
    },
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
      if (member.status === "activated") {
        p.checked = true;
      }
      if (org.representation === member.id) {
        p.disabled = true;
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
      member.status === "inactivated" &&
        (p.disabled = member.status === "inactivated");
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
  editOrg: AppContext["editOrg"];
}> = (props) => {
  const { org, getMembers, getSubOrgs, addMember, editMember, editOrg } = props;
  const [expand, setExpand] = React.useState<boolean>(false);
  const members = getMembers(org.id);

  const input = React.createRef<HTMLInputElement>();

  useEffect(() => { // 这里的状态都是在didMount时的， 只能用索引，不能用指针。
    input.current?.addEventListener("input", (e) => {
      const input = e.target as HTMLInputElement;
      const orgId = org.id;
      requestAnimationFrame(() => {
        editOrg(orgId, "name", input.value);
      });
    });
  }, [org.id]);
  useEffect(() => {
    // 可能shadowElement 不响应react setAttribute， 手动赋值强制状态统一
    _.set(input.current as HTMLInputElement, "value", org.name);
  }, [org]);

  const subOrgs = useMemo(() => getSubOrgs(org.id), [org.id, getSubOrgs]);

  return (
    <WiredCard className="w-full pb-4" elevation={1}>
      <h4 className="my-4 pl-4">
        <span className="mr-2 font-bold">org:</span>
        <wired-input class="mr-5" placeholder="org-name" ref={input} />
        <WiredButton no-caps elevation={1} onClick={() => addMember(org.id)}>
          add Member
        </WiredButton>
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
        </div>
      </section>
      {expand && subOrgs.length > 0 && (
        <div className="pl-9">
          {subOrgs.map((subOrg) => (
            <OrgCard key={org.id} {...props} org={subOrg} />
          ))}
        </div>
      )}
    </WiredCard>
  );
};

export const MemberForm: React.FC<{
  member: Member;
  org: Org;
  onEdit: AppContext["editMember"];
}> = (props) => {
  const { member, org, onEdit } = props;
  const inputRefs = MEMBER_COLUMNS.map(() =>
    React.createRef<HTMLInputElement>()
  );
  useEffect(() => { // 这里的状态都是在didMount时的， 只能用索引，不能用指针。
    inputRefs.forEach((ref, idx) => {
      const col = MEMBER_COLUMNS[idx];
      const memberId = member.id;
      const orgId = org.id;
      ref.current?.addEventListener("input", (e) => {
        requestAnimationFrame(() => {
          const input = e.target as HTMLInputElement;
          const value = col.convertor
            ? col.convertor(input.value, input)
            : input.value;
          onEdit(memberId, orgId, col.key, value);
        });
      });
    });
  }, [member.id, org.id]);
  useEffect(() => {
    // 可能shadowElement 不响应react setAttribute， 手动赋值强制状态统一
    inputRefs.forEach((ref, idx) => {
      const ele = ref.current;
      const col = MEMBER_COLUMNS[idx];
      if (ele) {
        const mapProps =
          typeof col.props === "function" ? col.props(member, org) : col.props;
        Object.assign(ele, mapProps);
      }
    });
  }, [org, member]);
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
                className="w-full max-w-full h-4 p-0"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
