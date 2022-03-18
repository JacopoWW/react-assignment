import React, { useMemo, useState } from "react";
import { Data, Member, Controller, Org, AppContext, DataType } from "./dataService";
import { MemberForm, OrgCard, OrgCardProps } from "./components/OrgCard";
import { WiredCard, WiredButton } from "react-wired-elements";
import _ from "lodash";
import { DragDropContext, DropResult, DragStart } from "react-beautiful-dnd";
import { renderWithDroppable, withDraggable } from "./components/DragTool";
import classNames from "classnames";

export function useOrg(data: Data, ctr: Controller): AppContext {
  const [orgState, setOrgState] = React.useState<Org[]>(data.orgData);
  const [memberState, setMemberState] = React.useState<Member[]>(
    data.memberData
  );

  const context: AppContext = {
    // this解构掉后为获取对象上其他method，声明变量
    editMember(memberId, orgId, key, val) {
      console.log('编辑了Member')
      const m = data.get("member", memberId);
      if (key === "representation") {
        context.editOrg(orgId, key, memberId);
      } else if (m) {
        const member = _.clone(m);
        member[key] = val;
        data.put("member", member);
        const newMemberData = data.memberData.slice();
        setMemberState(newMemberData);
        console.log('修改后', member.name)
      }
    },
    editOrg(orgId, key, val) {
      console.log('编辑了org')
      const o = data.get("org", orgId);
      if (o) {
        const org = _.clone(o);
        org[key] = val;
        data.put("org", org);
        const newOrgData = data.orgData.slice();
        setOrgState(newOrgData);
      }
    },
    addMember(orgId) {
      if (ctr.addMember(orgId)) {
        const newMemberData = data.memberData.slice();
        const newOrgState = data.orgData.slice();
        setMemberState(newMemberData);
        setOrgState(newOrgState);
      }
    },
    addOrg() {
      const org = ctr.addOrg();
      const newOrgState = data.orgData.slice();
      setOrgState(newOrgState);
      return org;
    },
    getMembers(orgId) {
      return ctr.findOrgMember(orgId);
    },
    getSubOrgs(orgId) {
      return ctr.findSubOrg(orgId);
    },
    reset() {
      data.reset();
      setOrgState(data.orgData);
      setMemberState(data.memberData);
      alert("数据已恢复到默认！");
    },
    save() {
      data.save();
      alert("数据已保存！");
    },
    memberState,
    orgState,
  };
  return context;
}

const DraggableOrgCard = withDraggable(OrgCard);
const DraggableMemberForm = withDraggable(MemberForm);

const App: React.FC = () => {
  const config = useMemo(() => {
    const data = new Data();
    const ctr = new Controller(data);
    return {
      data,
      ctr,
    };
  }, []);
  const context = useOrg(config.data, config.ctr);
  const [rootOrgList, setRootOrgList] = useState(context.orgState.filter((org) => org.parent === null).map(org => org.id));
  const [draggingState, setDragSate] = useState({
    member: false,
    org: false,
  });


  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    console.log(result, '这里是目标', destination, '这里是七点', source, 'draggableId', draggableId);
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    if (source.droppableId === 'main-1' && source.droppableId === destination.droppableId) {
      const newRootList = rootOrgList.slice();
      const sourceItem = newRootList[source.index];
      newRootList.splice(source.index, 1);
      newRootList.splice(destination.index, 0, sourceItem);
      setRootOrgList(newRootList);
    }


    setDragSate({
      member: false,
      org: false,
    });
  };

  const onBeforeDragStart = (info: DragStart) => {
    const [type, idx] = info.draggableId?.split('-');
    const newDragState = _.clone(draggingState);
    newDragState[type as DataType] = true;
    console.log('拖动之前', info, type, newDragState);
    requestAnimationFrame(() => setDragSate(newDragState));
  }

  // const check = React.useRef<HTMLInputElement>();
  // React.useEffect(() => {
  //   check.current && (check.current.checked = lockDraggle);
  //   check.current?.addEventListener("change", (e) => {
  //     const checkbox = e.target as HTMLInputElement;
  //     toggleDraggle(checkbox?.checked || false);
  //   });
  // }, []);
  console.log('app重新渲染了', JSON.stringify(draggingState))
  return (
    <WiredCard className="w-full p-4 relative" elevation={1}>
      <h4 className="flex items-center text-5xl my-5">Org Management</h4>
      <DragDropContext onDragEnd={onDragEnd} onBeforeDragStart={onBeforeDragStart}>
        <div className="flex flex-col">
          {renderWithDroppable({
            droppableId:"main-1",
            direction:"vertical",
            isDropDisabled: draggingState.member,
          }, () => rootOrgList.map((orgId: string, index) => {
            const org = config.data.get('org', orgId) as Org;
            const renderChildCards: OrgCardProps['renderChildCards'] = renderWithDroppable({
              droppableId: `${org.id}-org-drop`,
              direction: 'vertical',
              isDropDisabled: draggingState.member,
            }, (provided, snapshot, p, orgs) => {
              return orgs.map((sub, index) => <DraggableOrgCard
                compProps={{
                  ...p,
                  org: sub,
                }}
                key={sub.id}
                draggableId={sub.id}
                index={index}
                handler={{
                  className: 'absolute w-10 h-10 top-7 left-5 bg-orange-300 rounded-lg',
                }}
              />);
            })
            const renderChildFields: OrgCardProps['renderChildFields'] = renderWithDroppable({
              droppableId: `${org.id}-member-drop`,
              direction: 'vertical',
              isDropDisabled: draggingState.org,
            }, (provide, snap, p, members) => {
              return members.map((member, index) => <DraggableMemberForm
                key={member.id}
                compProps={{
                  member,
                  org: p.org,
                  onEdit: p.editMember,
                }}
                handler={{
                  className: classNames('w-8 h-8 rounded-lg bg-red-300'),
                }}
                draggableId={member.id}
                index={index}
              />)
            })
            return (
              <DraggableOrgCard
                compProps={{
                  getMembers:context.getMembers,
                  getSubOrgs:context.getSubOrgs,
                  addMember:context.addMember,
                  editMember:context.editMember,
                  editOrg:context.editOrg,
                  org: org,
                  renderChildCards,
                  renderChildFields,
                }}
                isDragDisabled={draggingState.member}
                handler={{
                  className: 'absolute w-10 h-10 top-7 left-5 bg-orange-300 rounded-lg',
                }}
                key={orgId}
                draggableId={orgId}
                index={index}
              />
            )
          })
          )()}
        </div>
      </DragDropContext>

      <div>
        <WiredButton onClick={() => {
          const org = context.addOrg();
          const newOrgList = rootOrgList.concat(org.id);
          setRootOrgList(newOrgList)
        }} className="text-4xl">
          Add
        </WiredButton>
      </div>
      <div className="flex justify-end">
        <WiredButton onClick={context.reset} className="text-2xl mr-4">
          Cancel
        </WiredButton>
        <WiredButton onClick={context.save} className="text-2xl">
          Save
        </WiredButton>
      </div>
    </WiredCard>
  );
};

export default App;
