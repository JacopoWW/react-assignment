import React, { useEffect, useMemo } from "react";
import { Org, Member, AppContext } from "../dataService";
import { WiredButton, WiredCard } from "react-wired-elements";
import _ from "lodash";
import classNames from "classnames";

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
        min: "0",
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

export interface OrgCardProps {
  org: Org;
  getMembers: AppContext["getMembers"];
  getSubOrgs: AppContext["getSubOrgs"];
  addMember: AppContext["addMember"];
  editMember: AppContext["editMember"];
  editOrg: AppContext["editOrg"];
  renderChildCards?: (p: OrgCardProps, orgs: Org[]) => React.ReactNode;
  renderChildFields?: (p: OrgCardProps, members: Member[]) => React.ReactNode;
}

export const OrgCard: React.FC<OrgCardProps> = (props) => {

  const {
    org,
    getMembers,
    getSubOrgs,
    addMember,
    editOrg,
    editMember,
  } = props;
  const defaultChildCardsRender = React.useCallback((p, orgs: Org[]) => (
    <div className="grow">
      {orgs.map((sub) => (
        <OrgCard key={sub.id} org={sub} {...{getMembers, getSubOrgs, addMember, editOrg, editMember}} />
      ))}
    </div>
  ), [getMembers, getSubOrgs, addMember, editOrg, editMember]);
  const defaultChildFieldsRender = React.useCallback((p, members: Member[]) => (
    <div className="grow">
      {members.map((member) => (
        <MemberForm
          key={member.id}
          member={member}
          org={p.org}
          onEdit={p.editMember}
        />
      ))}
    </div>
  ), [])
  const {
    renderChildCards = defaultChildCardsRender,
    renderChildFields = defaultChildFieldsRender,
  } = props;


  const [expand, setExpand] = React.useState<boolean>(false);
  const members = getMembers(org.id);

  const nameInput = React.useRef<HTMLInputElement>();

  useEffect(() => {
    // 这里的状态都是在didMount时的， 只能用索引，不能用指针。
    nameInput.current?.addEventListener("input", (e) => {
      const input = e.target as HTMLInputElement;
      const orgId = org.id;
      requestAnimationFrame(() => {
        editOrg(orgId, "name", input.value);
      });
    });
  }, [org.id, editOrg]);
  useEffect(() => {
    // 可能shadowElement 不响应react setAttribute， 手动赋值强制状态统一
    _.set(nameInput.current as HTMLInputElement, "value", org.name);
  }, [org]);
  console.log('重新运行了', '这里是sub')
  const subOrgs = useMemo(() => getSubOrgs(org.id), [org.id, getSubOrgs]);

  return (
    <WiredCard className="w-full pb-4" elevation={1}>
      <h4 className="my-4 ml-20">
        <span className="mr-2 font-bold">org:</span>
        <wired-input class="mr-5" placeholder="org-name" ref={nameInput} />
        <WiredButton no-caps elevation={1} onClick={() => addMember(org.id)}>
          add Member
        </WiredButton>
      </h4>
      <section>
        <div className={classNames("flex", {
          hidden: !members.length,
        })}>
          {MEMBER_COLUMNS.map((col) => (
            <div key={col.key} className={col.className}>
              {col.label}
            </div>
          ))}
        </div>
        {renderChildFields(props, members)}
        <div className="flex pl-4 mt-4 gap-4 items-start overflow-x-hidden">
          {subOrgs.length > 0 && (
            <WiredButton elevation={1} onClick={() => setExpand(!expand)}>
              <span className="px-4">{expand ? "-" : "+"}</span>
            </WiredButton>
          )}
          <div className="grow">
            {expand && subOrgs.length > 0 && renderChildCards(props, subOrgs)}
          </div>
        </div>
      </section>
    </WiredCard>
  );
};

export interface MemberFormProps {
  member: Member;
  org: Org;
  onEdit: AppContext["editMember"];
}

export const MemberForm: React.FC<MemberFormProps> = (props) => {
  const { member, org, onEdit } = props;
  const inputRefs = useMemo(() => MEMBER_COLUMNS.map(() =>
    React.createRef<HTMLInputElement>()
  ), []);
  useEffect(() => {
    // 这里的状态都是在didMount时的， 只能用索引，不能用指针。
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
  }, [member.id, org.id, inputRefs, onEdit]);
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
  }, [org, member, inputRefs]);
  return (
    <div className="flex">
      {MEMBER_COLUMNS.map((col, idx) => {
        const mapProps =
          typeof col.props === "function" ? col.props(member, org) : col.props;
        return (
          <div
            key={col.key}
            className={classNames(col.className , "justify-center flex items-center overflow-x-visible")}
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
