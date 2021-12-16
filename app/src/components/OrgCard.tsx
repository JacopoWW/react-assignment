import React, { ChangeEvent, useEffect } from 'react';
import { WiredInput, WiredButton, WiredCard, WiredCheckBox } from "react-wired-elements";

const MEMBER_COLUMNS = [{ label: 'user name', key: 'name' }, { label: 'age', key: 'age' }, { label: 'activated', key: 'status' }, { label: 'represente', key: 'represente' }];

export interface OrgInterface {
    name: string,
    id: string,
    type: string,
    parent: null | string,
    representation: string,
    members?: string[] | null,
}

export const OrgCard: React.FC<{ data: OrgInterface, findChildOrg: (org: OrgInterface) => OrgInterface[], map2Member: (members: string[]) => MemberInterface[], memberChange: (member: MemberInterface) => void, orgChange: (org: OrgInterface) => void }> = ({ data, findChildOrg, map2Member, memberChange, orgChange }) => {
    const [expand_child, setExpand] = React.useState(false);
    Array.isArray(data.members) || (data.members = []);
    const child_orgs = findChildOrg(data);
    const members = map2Member(data.members);
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        /* @ts-ignore */
        //e.target.removeEventListener('change', onChange);
        const copy = {...data};
        console.log(e.target, copy.name)
        copy.name = e.target.value;
        orgChange(copy);
    }

    return <WiredCard className="w-full" elevation={1}>
        <h4><span className="mr-2 font-bold">org:</span>
            <input className='border-2' type="text" placeholder="org-name" value={data.name} onChange={onChange} />
            {/* <WiredInput placeholder="org-name" value={data.name} onChange={onChange} /> */}
        </h4>
        <section>
            <div className="flex justify-around">
                {MEMBER_COLUMNS.map(col => <div key={col.key} className="w-1/4 text-xl">{col.label}</div>)}
            </div>
            <div>
                {members.map(member => <MemberForm key={(member as MemberInterface).id} data={member as MemberInterface} memberChange={memberChange} />)}
            </div>
            {child_orgs.length > 0 && <WiredButton elevation={1} onClick={() => setExpand(!expand_child)}>{expand_child ? '-' : '+'}</WiredButton>}
            <WiredButton elevation={1} >add</WiredButton>
        </section>
        {expand_child && child_orgs.length > 0 && <div className="pl-9">
            {child_orgs.map(org => <OrgCard key={org.id} data={org} findChildOrg={findChildOrg} map2Member={map2Member} memberChange={memberChange} orgChange={orgChange} />)}
        </div>}
    </WiredCard>
}

export interface MemberInterface {
    id: string,
    name: string,
    age?: number,
    status: string,
    representation?: boolean,
}

export const MemberForm: React.FC<{ data: MemberInterface, memberChange: (member: MemberInterface) => void }> = ({ data, memberChange }) => {

    return <div className="flex justify-around">
        <div className="w-1/4">
            <input onChange={(e) => {
                        const copy = {...data};
                        /* @ts-ignore */
                        copy.name = e.target.value;
                        memberChange(copy);
            }} className='border-2' type="text" placeholder="member-name" value={data.name} />
            {/* <WiredInput value={data.name} placeholder="member-name" /> */}
        </div>
        <div className="w-1/4">
            <input onChange={(e) => {
                const copy = {...data};
                copy.age = Number(e.target.value);
                memberChange(copy);
            }} className='border-2' type="number" placeholder="member-age" value={data.age || 0} />
            {/* <WiredInput value={String(data.age)} placeholder="member-age" /> */}
        </div>
        <div className="w-1/4">
            {/* <WiredCheckBox checked={data.status === "activated"} /> */}
            <input type="checkbox" checked={data.status === 'actived'} onChange={(e) => {
                console.log(e, '这里');
                const checked = e.target.checked;
                const copy = {...data};
                copy.status = checked ? 'actived' : 'inactivated';
                memberChange(copy);
            }} />
        </div>
        <div className="w-1/4">
           <input type="checkbox" checked={data.status === 'actived'} onChange={(e) => {
                console.log(e, '这里');
                const checked = e.target.checked;
                const copy = {...data};
                copy.representation = checked;
                memberChange(copy);
           }} />
            {/* <WiredCheckBox disabled={data.status === 'activated'} /> */}
        </div>
    </div>
}